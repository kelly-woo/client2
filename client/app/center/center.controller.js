'use strict';

var app = angular.module('jandiApp');

app.controller('centerpanelController', function($scope, $rootScope, $state, $filter, $timeout, $q, $sce, $modal, entityheaderAPIservice, messageAPIservice, fileAPIservice, entityAPIservice, userAPIservice, analyticsService, leftpanelAPIservice, memberService, publicService, desktopNotificationService, messageSearchHelper, currentSessionHelper, logger, integrationService) {

  //console.info('[enter] centerpanelController', $scope.currentEntity);

  var CURRENT_ENTITY_ARCHIVED = 2002;
  var INVALID_SECURITY_TOKEN  = 2000;
  var DEFAULT_MESSAGE_UPDATE_COUNT = 20;

  var entityType = $state.params.entityType;
  var entityId = $state.params.entityId;

  var SCROLL_BOTTOM_THRESHOLD = 700;

  var isLogEnabled = true;


  $scope.isInitialLoadingCompleted = false;
  $rootScope.isIE9 = false;
  $scope.isPosting = false;
  $scope.isPolling = false;

  $scope.lastMessage = null;

  $scope.hasFocus = true;
  $scope.hasScrollToBottom = false;
  $scope.hasNewMsg = false;


  // To be used in directive('lastDetector')
  $scope.loadMoreCounter = 0;

  // To be used in directive('centerHelpMessageContainer')
  $scope.emptyMessageStateHelper = '';


  $scope.entityId = entityId;
  $scope.entityType = entityType;
  $scope.messages = [];


  $scope.message = {};          // Message to post.

  var firstMessageId;             // 현재 엔티티가 가지고 있는 가장 위 메세지 아이디.
  var lastMessageId;              // 현재 엔티티가 가지고 있는 가장 아래 메세지 아이디.
  var localFirstMessageId;        // 메세지들 중 가장 위에 있는 메세지 아이디.
  var localLastMessageId;         // 메세지들 중 가낭 아래에 있는 메세지 아이디.
  var loadedFirstMessagedId;      // 스크롤 위로 한 후 새로운 메세지를 불러온 후 스크롤 백 투 해야할 메세지 아이디. 새로운 메세지 로드 전 가장 위 메세지.
  var loadedLastMessageId;        // 스크롤 다운 해서 새로운 메세지를 불러온 후 스크롤 백 투 해야할 메세지 아이디.  새로운 메세지 로든 전 가장 아래 메세지.

  var systemMessageCount;         // system event message의 갯수를 keep track 한다.

  var globalUnreadCount;
  var hasRetryGetRoomInfo;        // Indicates that whether current entity has failed getting room info once.
  var localMarkersList;           // Has most up-to-date information on marker-marker.owner.
  var roomMemberLength;


  var messages = {};

  $scope.isMessageSearchJumping = false;

  // configuration for message loading
  $scope.msgLoadStatus = {
    loading: false,
    loadingTimer : false // no longer using.
  };

  (function() {
    _onStartUpCheckList();


    _init();

    if(_hasMessageIdToSearch()) {
      _jumpToMessage();
    } else {

      loadMore();
    }

    //$scope.promise = $timeout(updateList, updateInterval);
  })();

  function _init() {

    _resetMessages();
    _resetLoadMoreCounter();
    _setDefaultLoadingScreen();
    _initMsgSearchQuery();
    _initLocalVariables();
  }

  $scope.$on('refreshCurrentTopic', function() {
    _refreshCurrentTopic();
  });

  function _refreshCurrentTopic() {
    _init();

    loadMore();
  }
  /**
   * If there is anything to be checked before loading message, do it here!
   * @private
   */
  function _onStartUpCheckList() {
    _checkIE9();
    //_hasCorrectEntityType();
    _isMyself();
  }

  function _checkIE9() {
    if (angular.isDefined(FileAPI.support)) {
      if (!FileAPI.support.html5)
        $rootScope.isIE9 = true;
    }
  }
  function _hasCorrectEntityType() {
    // TODO: REFACTOR | TO entityAPIservice - WHOLE BLOCK WITH MEANINGFUL NAME.
    // CALL FUNCTION INSTEAD OF LINES OF CODE
    // Check entityType first.
    if (entityType.slice(-1) != 's') {
      // If entitytype doesn't contain 's' at the end, do nothing about it.
      // Let router handle this case.
      // Router will redirect user to same entityType with 's' at the end.
      return;
    }
  }
  function _isMyself() {

    if (!$rootScope.member) return;
    if (entityId == $rootScope.member.id) {
      // Go to default Topic.
      publicService.goToDefaultTopic();
    }
  }

  function _setDefaultLoadingScreen() {
    //  default loadingTimer
    $timeout(function() {
      $scope.msgLoadStatus.loadingTimer = false;
    }, 1000);
  }

  function _initMsgSearchQuery() {
    //log('initing msgSearchQuery')
    $scope.msgSearchQuery = {
      count: DEFAULT_MESSAGE_UPDATE_COUNT
    };
  }
  function _initLocalVariables() {
    firstMessageId = -1;
    lastMessageId = -1;
    localFirstMessageId = -1;
    localLastMessageId = -1;
    loadedFirstMessagedId = -1;

    systemMessageCount = 0;

    _resetUnreadCounters();

    _resetNewMsgHelpers();
  }

  function _resetLoadMoreCounter() {
    $scope.loadMoreCounter = 0;
    $scope.isInitialLoadingCompleted = false;
  }
  function _resetMessages() {
    $scope.groupMsgs = [];
    $scope.messages = [];
    $scope.isMessageSearchJumping = false;
    messages = {};
  }

  $scope.$on('jumpToMessageId', function(event, params) {
    _initLocalVariables();
    _jumpToMessage();
  });

  function _jumpToMessage() {
    var toMessageId = messageSearchHelper.getLinkId();

    _hideContents();

    _init();

    _setSearchMode();

    _setMsgSearchQueryLinkId(toMessageId);
    loadMore();
  }

  function _setMsgSearchQueryLinkId(linkId) {
    $scope.msgSearchQuery = {
      linkId: linkId,
      count: DEFAULT_MESSAGE_UPDATE_COUNT
    };
  }
  function _setMsgSearchQueryType(type) {
    $scope.msgSearchQuery.type = type;
  }

  function groupByDate() {
    for (var i in $scope.messages) {
      var msg = $scope.messages[i];

      var prev = (i == 0) ? null : $scope.messages[i-1];
      // comment continuous check
      if ( msg.message.contentType === 'comment' ) {

        msg.message.commentOption = { isTitle: false, isContinue: false };

        if (i == 0) {
          msg.message.commentOption.isTitle = true;
        }
        else {
          // 파일 아래 바로 해당 파일의 코멘트
          // 같은 파일에 대한 연속 코멘트
          if (prev.messageId == msg.feedbackId || prev.feedbackId === msg.feedbackId) {
            msg.message.commentOption.isContinue = true;
          }
          else {
            msg.message.commentOption.isTitle = true;

          }
        }
      } else if (msg.message.contentType === 'file') {
        msg.message.isFile = true;
      } else if (msg.message.contentType === 'text') {
        msg.message.isText = true;
      }

      messages[msg.id] = {
        index: i,
        message: msg
      };

    }

    $scope.groupMsgs = [];
    $scope.groupMsgs = _.groupBy($scope.messages, function(msg) {
      return $filter('ordinalDate')(msg.time, "yyyyMMddEEEE, MMMM doo, yyyy");
    });
  }

  $scope.loadNewMessages = loadNewMessages;
  function loadNewMessages() {
    if (!_hasMoreNewMessageToLoad()) return;

    _setMsgSearchQueryLinkId(localLastMessageId);
    _setMsgSearchQueryType('new');
    loadMore();
  }

  $scope.loadOldMessages = loadOldMessages;
  function loadOldMessages() {
    if (!_hasMoreOldMessageToLoad()) return;

    _setMsgSearchQueryLinkId(localFirstMessageId);
    _setMsgSearchQueryType('old');
    loadMore();
  }

  $scope.loadMore = loadMore;
  function loadMore() {
    var deferred = $q.defer();

    if (!$scope.msgLoadStatus.loading && !$scope.isPosting) {

      loadedFirstMessagedId = localFirstMessageId;
      loadedLastMessageId = localLastMessageId;

      // TODO: come up with function and name.
      $scope.msgLoadStatus.loading = true;
      $scope.isPolling = false;

      //log('-- loadMore');

      // simulate an ajax request
      $timeout(function() {

        //log($scope.msgSearchQuery)

        // 엔티티 메세지 리스트 목록 얻기
        messageAPIservice.getMessages(entityType, entityId, $scope.msgSearchQuery)
          .success(function(response) {
            //log('  -- loadMore success');

            firstMessageId = response.firstLinkId;
            lastMessageId = response.lastLinkId;
            lastUpdatedLinkId = response.globalLastLinkId;

            var messagesList = response.records;


            // When there are messages to update.
            if (messagesList.length) {
              _messageProcessor(messagesList);
              groupByDate();
            }

            //  marker 설정
            updateMessageMarker();
            _setUnreadCount();

            // 추후 로딩을 위한 status 설정
            $scope.msgLoadStatus.loading = false;

            // auto focus to textarea - CURRENTLY NOT USED.
            $scope.focusPostMessage = true;

            $scope.loadMoreCounter++;
            $scope.isInitialLoadingCompleted = true;

            _checkEntityMessageStatus();
          })
          .error(function(response) {
            onHttpRequestError(response);
          });
        deferred.resolve();
      });
    } else {
      deferred.reject();
    }
    return deferred.promise;


  }

  function _updateMessageIds(messagesList) {
    if (_isLoadingNewMessages()) {
      _updateLoadedLastMessageId(messagesList[0]);
    } else {
      _updateLoadedFirstMessageId(messagesList[messagesList.length - 1]);
    }
  }
  function _updateLoadedFirstMessageId(msg) {
    localFirstMessageId = msg.id;
  }
  function _updateLoadedLastMessageId(msg) {
    localLastMessageId = msg.id;
  }
  /**
   * Process each element in array handling every cases.
   * @param messagesList
   * @private
   */
  function _messageProcessor(messagesList) {

    messagesList = messagesList.reverse();

    if (_isInitialLoad()) {
      _updateLoadedLastMessageId(messagesList[0]);
      _updateLoadedFirstMessageId(messagesList[messagesList.length - 1]);
    } else {
      _updateMessageIds(messagesList);
    }



    for (var i in messagesList) {
      var msg = messagesList[i];
      // jihoon
      if (msg.status == 'event') {
        // System Message.
        msg = eventMsgHandler(msg);
        $scope.messages.unshift(msg);
        _updateSystemEventMessageCounter();
        continue;
      }

      // shared entities 가 있을 경우
      if ( (msg.status === 'shared' || msg.status === 'unshared') && msg.message.shareEntities.length) {
        // shareEntities 중복 제거 & 각각 상세 entity 정보 주입
        msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
      }

      // parse HTML, URL code
      var safeBody = msg.message.content.body;
      if (safeBody != undefined && safeBody != "") {
        safeBody = $filter('parseAnchor')(safeBody);
      }
      msg.message.content.body = $sce.trustAsHtml(safeBody);

      $scope.messages.unshift(msg);

    }
  }

  function _isInitialLoad() {
    return loadedFirstMessagedId < 0;
  }

  /**
   * Checks if there is no old messages to load.
   * Meaning all previous messages has been loaded and display on web.
   * @returns {boolean}
   * @private
   */
  function _hasMoreOldMessageToLoad() {
    //log(localFirstMessageId)
    //log(firstMessageId)
    //log(lastMessageId)

    if (lastMessageId == -1) {
      //log('new team first topic welcome')
      return false;
    }

    if (localFirstMessageId == -1) { return true; }

    return localFirstMessageId != firstMessageId;
  }
  function _hasMoreNewMessageToLoad() {
    //log('localLastMessageId: ', localLastMessageId, 'lastMessageId: ', lastMessageId, 'Has more newer message: ', localLastMessageId < lastMessageId)
    return localLastMessageId < lastMessageId;
  }
  function _isLoadingNewMessages() {
    return $scope.msgSearchQuery.type == 'new';
  }

  $scope.onLastMessageRendered = function () {
    _updateScroll();
  };

  function _updateScroll() {
    if (_isSearchMode()) {
      _disableScroll();
      _findMessageDomElementById(messageSearchHelper.getLinkId());
      _resetSearchMode();
      return;
    }

    if (_isInitialLoad()) {
      _scrollToBottom();
      return;
    }

    if (_isLoadingNewMessages()) {
      //log('-- updateScroll: load new message')

      var temp = angular.element(document.getElementById(localFirstMessageId));
      _animateBackgroundColor(temp);
      return;
    }

    if (loadedFirstMessagedId == -1) return;

    //log('-- updateScroll: load old message')

    _disableScroll();

    _findMessageDomElementById(loadedFirstMessagedId);

  }
  function _findMessageDomElementById(id) {
    var lastMsg;

    // $timeout inside of $timeout????
    $timeout(function() {

      lastMsg = angular.element(document.getElementById(id));
      var positionTop = lastMsg.position().top;

      _animateBackgroundColor(lastMsg);
      document.getElementById('msgs-container').scrollTop = positionTop;

      _showContents();
    }, 100);
  }

  function _scrollToBottom() {
    $timeout(function() {
      document.getElementById('msgs-container').scrollTop = document.getElementById('msgs-container').scrollHeight;
    }, 10);
    $timeout(function() {
      _showContents();
    }, 100);
  }
  function _scrollToBottomWithAnimate() {
    var height = document.getElementById('msgs-container').scrollHeight;
    $('#msgs-container').animate({scrollTop: height}, '500', 'swing', function() {
      _resetNewMsgHelpers();
    });
    //$('#msgs-container').scrollTop(height);
  }

  function _showContents() {
    $('#msgs-holder').addClass('opac-in-fast');
  }
  function _hideContents() {
    $('#msgs-holder').removeClass('opac-in-fast');
  }

  // TODO: NOT A GOOD NAME. WHEN FUNCTION NAME STARTS WITH 'is' EXPECT IT TO RETURN BOOLEAN VALUE.
  // Current 'isAtBottom' function is not returning boolean. PLEASE CHANGE THE NAME!!
  $scope.isAtBottom = function() {
    _clearBadgeCount($scope.currentEntity);
    _resetNewMsgHelpers();
  };

  function _animateBackgroundColor(element) {
    element.addClass('last');
    $timeout(function() {
      element.removeClass('last');
    }, 1000)
  }

  function _hasLastMessage() {
    //log('localLastMessageId: ', localLastMessageId );
    //log('lastMessageId: ',  lastMessageId);
    //log('hasLastMessage: ', localLastMessageId == lastMessageId);
    return localLastMessageId == lastMessageId;
  }
  function _hasBottomReached() {
    var element = document.getElementById('msgs-container');
    var scrollHeight = element.scrollHeight;
    element = angular.element(element);

    return scrollHeight - (element.outerHeight() + element.scrollTop()) < SCROLL_BOTTOM_THRESHOLD;
  }

  /**
   * Bind an event to 'mousewheel' and prevent web page from scrolling.
   * But make sure to enable scrolling after 1 second.
   */
  function _disableScroll() {
    $('body').bind('mousewheel', function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    $timeout(function() { _enableScroll(); }, 1000)
  }
  function _enableScroll() {
    $('body').unbind('mousewheel');
  }

  /**
   * center에 drag&drop 으로 file upload시 window 내에서 발생하는
   * drag&drop 이벤트 에서도 file upload sequence 시작되기 때문에
   * window의 drag start event cancel
   */
  (function _disableDrag() {
    $('body').on('dragstart', function(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    });
  }());

  function _hasMessageIdToSearch() {
    return messageSearchHelper.hasMessageToSearch();
  }
  function _setSearchMode() {
    $scope.isMessageSearchJumping = true;
  }
  function _resetSearchMode() {
    $scope.isMessageSearchJumping = false;

    messageSearchHelper.resetMessageSearch();
  }
  function _isSearchMode() {
    return $scope.isMessageSearchJumping;
  }

  // 주기적으로 업데이트 메세지 리스트 얻기 (polling)
  var lastUpdatedLinkId = -1;
  function updateList() {
    //  when 'updateList' gets called, there may be a situation where 'getMessages' is still in progress.
    //  In such case, don't update list and just return it.
    if ($scope.msgLoadStatus.loading) {
      return;
    }

    $scope.isPolling = true;

    messageAPIservice.getUpdatedMessages(entityType, entityId, lastUpdatedLinkId)
      .success(function (response) {

        // lastUpdatedId 갱신 --> lastMessageId
        lastUpdatedLinkId = response.lastLinkId;

        response = response.updateInfo;

        if (response.messageCount) {

          if (!_hasLastMessage()) {
            _gotNewMessage();
            return;
          }


          // 업데이트 된 메세지 처리
          if (response.messages.length > 0) {
            for (var i in response.messages) {
              var msg = response.messages[i];

              if (localLastMessageId >= msg.id) {
                // Prevent duplicate messages in center panel.
                return;
              }

              if ($scope.isPosting)
                $scope.isPosting = false;

              // auto focus to textarea
              $scope.focusPostMessage = true;

              if (msg.status == 'event') {
                // System Event Message.
                msg = eventMsgHandler(msg);
                $scope.messages.push(msg);
                _handleSystemEventMessage();
                continue;
              } else {
                log('not a system event message ');
                // Non System Event Message.
                switch (msg.status) {
                  case 'created':
                    $scope.messages.push(msg);
                    break;
                  case 'edited':
                    var target = _.find($scope.messages, function(m) {
                      return m.messageId === msg.messageId;
                    });
                    if (!_.isUndefined(target)) {
                      var targetIdx = $scope.messages.indexOf(target);
                      $scope.messages.splice(targetIdx, 1);
                      $scope.messages.push(msg);
                    }
                    break;
                  case 'archived':
                    var target = _.find($scope.messages, function(m) {
                      return m.messageId === msg.messageId;
                    });
                    if (!_.isUndefined(target)) {
                      var targetIdx = $scope.messages.indexOf(target);
                      $scope.messages.splice(targetIdx, 1);
                    }
                    break;
                  case 'shared':
                    msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
                    $scope.messages.push(msg);
                    break;
                  case 'unshared':
                    var target = _.find($scope.messages.reverse(), function(m) {
                      return m.messageId === msg.messageId;
                    });
                    if (!_.isUndefined(target)) {
                      // 기존 shared message 제거
                      var targetIdx = $scope.messages.indexOf(target);
                      $scope.messages.splice(targetIdx, 1);
                      // shareEntities 중복 제거 & 각각 상세 entity 정보 주입
                      msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
                      $scope.messages.push(msg);
                    }
                    break;
                  default:
                    console.error("!!! unfiltered message", msg);
                    break;
                }
                _newMessageAlertChecker(msg);
              }

              var safeBody = msg.message.content.body;
              if (safeBody != undefined && safeBody !== "") {
                safeBody = $filter('parseAnchor')(safeBody);
              }
              msg.message.content.body = $sce.trustAsHtml(safeBody);
            }

            groupByDate();
          }

          //  marker 설정
          updateMessageMarker();

          // When there is a message to update on current topic.
          localLastMessageId = lastUpdatedLinkId;
          loadedLastMessageId = localLastMessageId;
          lastMessageId = localLastMessageId;

          _checkEntityMessageStatus();

          if (_hasMarkersToBeMarked()) {
            console.log('message arrived late updaing unread message count.')
            _setUnreadCount();
          }
        }

      })
      .error(function (response) {
        onHttpRequestError(response);
      });

    // TODO: async 호출이 보다 안정적이므로 callback에서 추후 처리 필요
    //$scope.promise = $timeout(updateList, updateInterval);
  }

  function onHttpRequestError(response) {
    //  SOMEONE OR ME FROM OTHER DEVICE DELETED CURRENT ENTITY.
    if (response.code == CURRENT_ENTITY_ARCHIVED) {
      //log('okay channel archived');
      $scope.updateLeftPanelCaller();
      publicService.goToDefaultTopic();
      return;
    }

    if (response.code == INVALID_SECURITY_TOKEN) {
      //console.debug('INVALID SECURITY TOKEN.');
      $state.go('signin');
      return;
    }

    if (response === 'Unauthorized') {
      // It is 401 error.
      // 401 error should be handled in 'auth.service'.
      // Let go of 401 error.
      // Catch and handle 403 error instead.
      return;
    }

    publicService.goToDefaultTopic();

  }

  //  Updating message marker for current entity.
  function updateMessageMarker() {
    messageAPIservice.updateMessageMarker(entityId, entityType, lastMessageId)
      .success(function(response) {
        //log('----------- successfully updated message marker for entity name ' + $scope.currentEntity.name + ' to ' + lastMessageId);
      })
      .error(function(response) {
        log('message marker not updated for ' + $scope.currentEntity.id);
      });
  }


  $scope.postMessage = function() {
    if (!$scope.message.content) return;

    log('-- posting message');

    // prevent duplicate request
    $scope.isPosting = true;
    var msg = $scope.message.content;
    $scope.message.content = "";

    messageAPIservice.postMessage(entityType, entityId, {'content': msg})
      .success(function(response) {
        $scope.isPosting = false;

        log('-- posting message success');

        //  reseting position of msgs
        $('.msgs').css('margin-bottom', 0);

        if (!_hasLastMessage()) {
          log('posting - search mode')
          _refreshCurrentTopic();
        }
      })
      .error(function(response) {
        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.postMessage"});
        $scope.isPosting = false;
      });
  };
  $scope.editMessage = function(messageId, updateContent) {
    if (updateContent === "") return "";

    var message = {"content": updateContent};
    messageAPIservice.editMessage(entityType, entityId, messageId, message)
      .success(function(response) {
      })
      .error(function(response) {
        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.editMessage"});
      });
  };
  $scope.deleteMessage = function(message) {
    //log("delete: ", message.messageId);
    messageAPIservice.deleteMessage(entityType, entityId, message.messageId)
      .success(function(response) {
      })
      .error(function(response) {
        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.deleteMessage"});
      });
  };
  $scope.openModal = function(selector) {
    // OPENING JOIN MODAL VIEW
    if (selector == 'file') {
      $modal.open({
        scope       : $scope,
        templateUrl : 'app/modal/upload/upload.html',
        controller  : 'fileUploadModalCtrl',
        size        : 'lg',
        backdrop    : 'static'
      });
    } else if (selector == 'rename') {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/rename.html',
        controller  :   'renameModalCtrl',
        size        :   'lg'
      });
    } else if (selector == 'invite') {
      publicService.openInviteToCurrentEntityModal($scope);
    } else if (selector == 'inviteUserToChannel') {
      publicService.openInviteToJoinedEntityModal($scope);
    } else if (selector == 'share') {

    }
  };

  // TODO rightpanelController 로직 중복 해결 필요
  $scope.onClickSharedEntity = function(entityId) {
    var targetEntity = entityAPIservice.getEntityFromListById($scope.joinedEntities, entityId);

    // If 'targetEntity' is defined, it means I had it on my 'joinedEntities'.  So just go!
    if (angular.isDefined(targetEntity)) {
      $state.go('archives', { entityType: targetEntity.type, entityId: targetEntity.id });
    }
    else {
      // Undefined targetEntity means it's an entity that I'm joined.
      // Join topic first and go!
      entityheaderAPIservice.joinChannel(entityId)
        .success(function(response) {
          analyticsService.mixpanelTrack( "topic Join" );
          $rootScope.$emit('updateLeftPanelCaller');
          $state.go('archives', {entityType: 'channels',  entityId: entityId });
        })
        .error(function(err) {
          alert(err.msg);
        });
    }
  };

  $scope.onClickUnshare = function(message, entity) {
    fileAPIservice.unShareEntity(message.id, entity.id)
      .success(function() {
        var share_target = analyticsService.getEntityType($scope.currentEntity.type);

        var file_meta = (message.content.type).split("/");
        var share_data = {
          "entity type"   : share_target,
          "category"      : file_meta[0],
          "extension"     : message.content.ext,
          "mime type"     : message.content.type,
          "size"          : message.content.size
        };
        analyticsService.mixpanelTrack( "File Unshare", share_data );

        fileAPIservice.broadcastChangeShared(message.id);
      })
      .error(function(err) {
        alert(err.msg);
      });
  };


  // Listen to file delete event.
  // Find deleted file id from current list($scope.messages).
  // If current list contains deleted file, change its status to 'archived'.
  // TODO: Still o(n) algorithm.  too bad!! very bad!!! make it o(1) by using map.
  $scope.$on('centerOnFileDeleted', function(event, param) {
    var deletedFileId = param.file.id;
    _.forEach($scope.messages, function(message) {
      if (message.message.id === deletedFileId) {
        message.message.status = 'archived';
        return false;
      }
    });
  });

  /**
   * file comment delete handler.
   * Loop through messages list and find matching file comment.
   *
   * File comment delete -> Hide corresponding comment for now.
   *
   * TODO: this is still o(n). make it o(1)!!!!!
   */
  $scope.$on('centerOnFileCommentDeleted', function(event, param) {
    _.forEach($scope.messages, function(message) {
      if (message.message.id === param.comment.id) {
        var commentLinkId = message.id;
        var angularDomElement = angular.element(document.getElementById(commentLinkId));
        angularDomElement.addClass('hidden');
      }
    });
  });

  /**
   * Shared entity is changed to file.
   *  1. get updated info from server by calling getFileDetail api
   *  2. Update shared Entity information.
   *
   */
  $scope.$on('updateCenterForRelatedFile', function(event, file) {
    _.forEach($scope.messages, function (message) {
      if (message.message.id === file.id) {
        fileAPIservice.getFileDetail(message.message.id)
          .success(function (response) {
            for (var i in response.messageDetails) {

              var item = response.messageDetails[i];
              if (item.contentType === 'file') {
                message.message.shared = fileAPIservice.getSharedEntities(item);
              }
            }

          });
      }
    });
  });

  $scope.onSmallThumbnailClick = function($event, message) {

    //  checking type first.
    //  file upload but not image -> return
    if (message.message.contentType === 'file') {
      if (message.message.content.filterType.indexOf('image') < 0) {
        return;
      }
    }

    // comment but not to image file -> return
    if (message.message.contentType === 'comment'){
      return;
    }

    // Image is long but not wide. There may be a white space on each side of an image.
    // When user clicks on white(blank) space of image, it will do nothing and return.
    if (angular.isDefined(angular.element($event.target).children('#large-thumbnail-' + message.id).attr('id'))) {
      return;
    }

    // checking where event came from.
    var targetDom;                                      //  Will be small image thumbnail dom element.
    var tempTarget = angular.element($event.target);    //  dom element that just sent an event.

    var tempTargetClass = tempTarget.attr('class');

    if (tempTargetClass.indexOf('msg-file-body__img') > -1) {
      //  Small thumbnail of file type clicked.
      targetDom = tempTarget;
    }
    else if (tempTargetClass.indexOf('msg-file-body-float') > -1 ) {
      //  Small image thumbnail clicked but its parent(.msg-file-body-float) is sending event.
      //  Its parent is sending an event because of opac overlay layer on top of small thumbnail.
      targetDom = tempTarget.children('.msg-file-body__img');
    }
    else if (tempTargetClass.indexOf('image_wrapper') > -1) {
      targetDom = tempTarget.children('.msg-file-body__img');
    }
    else if (tempTargetClass.indexOf('fa-comment') > -1) {
      //  Comment image clicked on small image thumbnail.
      targetDom = tempTarget.siblings('.image_wrapper').children('.msg-file-body__img');
    }
    else {
      return;
    }

    //if (angular.isUndefined(targetDom)) {
    //    return;
    //}

    var newThumbnail;   // large thumbnail address
    var fullUrl;        // it could be file, too.

    if (message.message.contentType === 'comment') {
      newThumbnail = $scope.server_uploaded + message.feedback.content.extraInfo.largeThumbnailUrl;
      fullUrl = $scope.server_uploaded + message.feedback.content.fileUrl;
    }
    else {
      newThumbnail = $scope.server_uploaded + message.message.content.extraInfo.largeThumbnailUrl;
      fullUrl = $scope.server_uploaded + message.message.content.fileUrl;
    }

    //  new DOM element for full screen image toggler.
    // TODO: CONTROLLER IS NOT SUPPOSED TO MANIPULATE DOM ELEMENTS. FIND BETTER WAY TO ADD DOM ELEMENT!!!!!
    var fullScreenToggler = angular.element('<div class="large-thumbnail-full-screen"><i class="fa fa-arrows-alt"></i></i></div>');

    //  bind click event handler to full screen toggler.
    fullScreenToggler.bind('click', function() {
      //  opening full image modal used in file controller.
      //  passing photo url of image that needs to be displayed in full screen.
      $modal.open({
        scope       :   $scope,
        controller  :   'fullImageCtrl',
        templateUrl :   'app/modal/fullimage.html',
        windowClass :   'modal-full',
        resolve     :   {
          photoUrl    : function() {
            return fullUrl;
          }
        }
      });
    });

    // get transform information from original image.
    // if image was rotated according to its orientation from exif data, there must be transform value.
    //
    // issue : JND-974, by ysyun 2015.2.25
    //   - if click fa-comment icon, must not working (cause occured error)
    //   - change id="large-thumbnail" to id="large-thumbnail-' + message.id + '"
    var transform = getTransformValue(targetDom[0] ? targetDom[0].style: undefined);
    //  new DOM element for large thumbnail image.
    var mirrorDom = angular.element('<img id="large-thumbnail-' + message.id + '" class="large-thumbnail cursor_pointer image-background" src="'+newThumbnail+'"/>');

    // copy and paste of old 'transform' css property from small to large thumbnail.
    mirrorDom[0].setAttribute('style', transform);

    //  bind click event handler to large thumbnail image.
    mirrorDom.bind('click', function() {
      // opening full screen image modal.
      onLargeThumbnailClick(fullScreenToggler, mirrorDom, targetDom);
    });

    //  hide small thumbnail image.
    targetDom.css('display', 'none');

    //  append new dom elements to parent of small thumbnail(original dom).
    var parent = targetDom.parent().parent();

    // issue : JND-974, by ysyun 2015.2.25
    //   - change id="large-thumbnail" to id="large-thumbnail-' + message.id + '"
    if (angular.isDefined(parent.children('#large-thumbnail-' + message.id).attr('id'))) {
      //  preventing adding multiple large thumbnail dom element to parent.
      //  if parent already has a child whose id is 'large-thumbnail' which is 'mirrorDom', don't append it and just return.
      return;
    }

    parent.append(mirrorDom);
    parent.append(fullScreenToggler);

    //  change parent's css properties.
    parent.addClass('large-thumbnail-parent').removeClass('pull-left');
    parent.parent().addClass('large-thumbnail-grand-parent');
  };

  // get all style attributes of targetDom
  // and pick correct 'transform' attribute.
  // and return exact same property.
  function getTransformValue(targetDomStyle) {

    if(!targetDomStyle) { return ''; }

    var transform;

    if (targetDomStyle.getPropertyValue('-webkit-transform')) {
      // webkit
      transform = '-webkit-transform:' + targetDomStyle.getPropertyValue('-webkit-transform');
    }
    else if (targetDomStyle.getPropertyValue('-moz-transform')) {
      // firefox
      transform = '-moz-transform:' + targetDomStyle.getPropertyValue('-moz-transform');
    }
    else if (targetDomStyle.getPropertyValue('-o-transform')) {
      // safari
      transform = '-o-transform:' + targetDomStyle.getPropertyValue('-o-transform');
    }
    else {
      // ie
      transform = '-ms-transform:' + targetDomStyle.getPropertyValue('-ms-transform');
    }

    return transform;
  }

  //  when large thumbnail image is clicked, delete large thumbnail and show original(small thumbnail image).
  function onLargeThumbnailClick(fullScreenToggler, mirrorDom, originalDom) {
    originalDom.css('display', 'block');
    mirrorDom.parent().removeClass('large-thumbnail-parent').addClass('pull-left');
    mirrorDom.parent().parent().removeClass('large-thumbnail-grand-parent');
    mirrorDom.remove();
    fullScreenToggler.remove();
  }


  //  right controller is listening to 'updateFileWriterId'.
  $scope.onFileListClick = function(userId) {
    if ($state.current.name != 'messages.detail.files')
      $state.go('messages.detail.files');
    $scope.$emit('updateFileWriterId', userId);
  };

  function eventMsgHandler(msg) {
    var newMsg = msg;
    newMsg.eventType = '/' + msg.info.eventType;

    newMsg.message = {};
    newMsg.message.contentType = 'systemEvent';
    newMsg.message.content = {};
    newMsg.message.writer = entityAPIservice.getEntityFromListById($scope.memberList, msg.fromEntity);
    var action = '';

    switch(msg.info.eventType) {
      case 'invite':
        action = $filter('translate')('@msg-invited');
        newMsg.message.invites = [];
        _.each(msg.info.inviteUsers, function(element, index, list) {
          var entity = entityAPIservice.getEntityFromListById($rootScope.memberList, element);
          newMsg.message.invites.push(entity)
        });
        break;
      case 'join' :
        action = $filter('translate')('@msg-joined');
        break;
      case 'leave' :
        action = $filter('translate')('@msg-left');
        break;
      case 'create' :
        if (msg.info.entityType == 'channel') {
          action = $filter('translate')('@msg-create-ch');
        } else {
          action = $filter('translate')('@msg-create-pg');
        }
        break;
    }

    newMsg.message.content.actionOwner = memberService.getNameById(msg.fromEntity);
    newMsg.message.content.body = action;

    return newMsg;
  }

  function log(string) {
    if (isLogEnabled) logger.log(string)
  }

  //  when textarea gets resized, msd-elastic -> adjust function emits 'elastic:resize'.
  //  listening to 'elastic:resize' and move msg-holder to right position.
  $scope.$on('elastic:resize', function() {
    $('.msgs').css('margin-bottom', $('#message-input').outerHeight() - 30);
  });

  $scope.setCommentFocus = function(file) {
    if ($state.params.itemId != file.id) {
      $rootScope.setFileDetailCommentFocus = true;

      $state.go('files', {
        userName    : file.writer.name,
        itemId      : file.id
      });
    }
    else {
      fileAPIservice.broadcastCommentFocus();
    }
  };

  $scope.$on('onStageLoadedToCenter', function() {
    $('#file-detail-comment-input').focus();
  });


  $scope.onShareClick = function(file) {
    fileAPIservice.broadcastFileShare(file);
  };

  $scope.isDisabledMember = function(member) {
    return publicService.isDisabledMember(member);
  };


  $scope.gdClick = function(event) {
    integrationService.createGoogleDrive($scope, event.target);
  };

  $scope.dbClick = function(event) {
    integrationService.createDropBox($scope, event.target);
  }

  /**
   * Check whether msg is from myself.
   * True msg is written by me.
   *
   * @param msg
   * @returns {boolean}
   * @private
   */
  function _isMessageFromMe(msg) {
    return msg.fromEntity === memberService.getMemberId();
  }
  function _hasBrowserFocus() {
    return !_isBrowserHidden();
  }
  function _isBrowserHidden() {
    return document.hidden || !$scope.hasFocus;
  }
  // Callback when window loses its focus.
  window.onblur = function() {
    $scope.hasFocus = false;
  };

  // Callback when window gets focused.
  window.onfocus = function() {
    $scope.hasFocus = true;
    if (_hasBottomReached())
      _clearBadgeCount($scope.currentEntity);
  };

  $scope.$on('setChatInputFocus', function() {
    _setChatInputFocus();
  });
  function _setChatInputFocus() {
    $('#message-input').focus();
  }

  /**
   * If badge count was incremented while un-focused state,
   * still keep track of badge counts and display on left side.
   *
   * However, when user comes back to JANDI, clear badge count of currently looking entity.
   *
   * @param entity
   * @private
   */
  function _clearBadgeCount(entity) {
    if (!entity || !entity.alarmCnt) return;

    entityAPIservice.updateBadgeValue(entity, '');
  }


  /********************************************

   EMPTY MESSAGE.

   ********************************************/
  $scope.$on('onInitLeftListDone', function() {
    _checkEntityMessageStatus();
  });

  function _checkEntityMessageStatus() {
    $scope.hasNoMessage = _hasNoMessage();

    // Current topic has messages going on. NO NEED TO DISPLAY ANY TYPE OF HELP MESSAGES.
    if (!$scope.hasNoMessage) { return; }

    var emptyMessageStateHelper = 'NO_CONVERSATION_IN_TOPIC';

    // I am only member in current topic.
    if (_isSoloTeam()) {
      emptyMessageStateHelper = 'NO_MEMBER_IN_TEAM';
    } else if (_isFullRoom()) {
      if (!_isDefaultTopic()) {
        emptyMessageStateHelper = 'EVERYONE_IN_THE_BUILDING';
      }
    } else if (_amIAlone()) {
      emptyMessageStateHelper = 'NO_MEMBER_IN_TOPIC';
    }

    //log(emptyMessageStateHelper)
    $scope.emptyMessageStateHelper = emptyMessageStateHelper;
    $rootScope.$broadcast('onEntityMessageStatusChanged', emptyMessageStateHelper);
  }

  function _amIAlone() {
    var memberCount = entityAPIservice.getMemberLength($rootScope.currentEntity);

    //log('this is _alIAlone ', memberCount, ' returning ', memberCount == 1)

    return memberCount == 1;
  }

  function _hasNoMessage() {
    var messageLength = $scope.messages.length;

    //log(messageLength, systemMessageCount, !_hasMoreOldMessageToLoad())
    if (!_hasMoreOldMessageToLoad() && (messageLength == systemMessageCount || messageLength <= 1)) return true;

    return false;
  }

  function _updateSystemEventMessageCounter() {
    systemMessageCount++;
  }

  function _isSoloTeam() {
    var activeMemberCount = currentSessionHelper.getCurrentTeamMemberCount();
    //log('this is _isSoloTeam ', activeMemberCount, ' returning ', activeMemberCount == 0);

    return activeMemberCount == 0;
  }

  function _isFullRoom() {

    var currentEntityMemberCount = entityAPIservice.getMemberLength($rootScope.currentEntity);

    // $scope.memberList does not include myself.
    var totalTeamMemberCount = currentSessionHelper.getCurrentTeamMemberCount() + 1;

    //log('this is _isFullRoom ', totalTeamMemberCount,' and ', currentEntityMemberCount, ' returning ', currentEntityMemberCount == totalTeamMemberCount);
    return currentEntityMemberCount == totalTeamMemberCount;
  }

  function _isDefaultTopic() {
    return currentSessionHelper.isDefaultTopic($rootScope.currentEntity);
  }

  /********************************************

   NEW MESSAGE ALERT.

   ********************************************/

  $scope.onScrollToBottomIconClicked = onScrollToBottomIconClicked;
  function onScrollToBottomIconClicked() {
    // Remove icon first.
    _resetHasScrollToBottom();

    _newMsgHelper();
  }

  function _resetNewMsgHelpers() {
    _resetNewMsgAlert();
    _resetHasScrollToBottom();
  }
  function _resetNewMsgAlert() {
    $scope.hasNewMsg = false;
  }
  function _resetHasScrollToBottom() {
    $scope.hasScrollToBottom = false;
  }

  $scope.onHasNewMessageAlertClicked = onHasNewMessageAlertClicked;
  function onHasNewMessageAlertClicked() {
    _clearBadgeCount($scope.currentEntity);
    _newMsgHelper();
    _resetNewMsgHelpers();
  }

  function _newMsgHelper() {
    if (_hasMoreNewMessageToLoad()) {
      // Has more messages to load
      _refreshCurrentTopic();
    } else {
      // Already have latest message of current entity, just scroll down to it.
      _scrollToBottomWithAnimate();
    }
  }
  $scope.onHasNewMessageAlertCloseClicked = onHasNewMessageAlertCloseClicked;
  function onHasNewMessageAlertCloseClicked() {
    _resetNewMsgAlert();
  }


  /**
   * Handle a case when I receive a message while
   *   1.  I'm looking at somewhere else(probably older messages through search)
   *       without having most recent message.
   *   2.  I'm looking at somewhere else with latest message with me.
   *
   *   이 엔티티의 마지막 메세지가 없는 상태에서 새로운 메세지가 들어왔을 때.
   *   이 엔티티의 마지막 메세지가 있는 상태에서 새로운 메세지가 들어왔을 때.
   *   둘 다.
   *
   *  @private
   */
  function _gotNewMessage() {
    log('_gotNewMessage')
    $scope.hasNewMsg = true;
    entityAPIservice.updateBadgeValue($scope.currentEntity, -1);
  }


  function _getEntityId() {
    var id;
    if (entityType === 'users') {
      id = currentSessionHelper.getCurrentEntity().entityId;
      console.log()
    } else {
      id = currentSessionHelper.getCurrentEntity().id;
    }

    return id;
  }

  $scope.$on('centerUpdateChatList', function() {
    updateList();
  });

  /**
   * Decide to wehter display badge or not.
   *
   * Display badge and new message alert bar only when
   *  1. message is not written by me AND
   *  2. scroll is not currently at the bottom AND
   *  3. window doesn't have focus state.
   *
   * @param msg
   * @private
   */
  function _newMessageAlertChecker(msg) {
    // If message is from me -> I just wrote a message -> Just scroll to bottom.
    if (_isMessageFromMe(msg)) {
      _scrollToBottom();
      return;
    }

    // Message is not from me -> Someone just wrote a message.
    if (_hasBottomReached()) {
      //log('window with focus')
      if (_hasBrowserFocus()) {
        //log('bottom reached and scrolling to bottom');
        _scrollToBottom();
        return;
      }
    }
    _gotNewMessage();
  }

  /**
   * Decide whether to scroll to bottom on system event message.
   *
   * @private
   */
  function _handleSystemEventMessage() {
    _updateSystemEventMessageCounter();

    if (_hasLastMessage() && _hasBottomReached()) {
      _scrollToBottom();
    }
  }






  function _resetUnreadCounters() {
    globalUnreadCount = -1;
    hasRetryGetRoomInfo = false;
    localMarkersList = {};    // Has most up-to-date information on marker-marker.owner.
    roomMemberLength = 0;
  }

  /**
   * Update unread count
   */
  function _setUnreadCount() {
    _getCurrentRoomInfo();
  }

  /**
   *
   * @private
   */
  function _getCurrentRoomInfo() {
    var currentRoomId = _getEntityId();
    messageAPIservice.getRoomInformation(currentRoomId)
      .success(function(response) {
        _calculateUnReadCount(response);
        hasRetryGetRoomInfo = false;
      })
      .error(function(err) {
        if (!hasRetryGetRoomInfo && publicService.isNullOrUndefined(currentRoomId)) {
          _getCurrentRoomInfo();
          hasRetryGetRoomInfo = true;
        }
      });
  }

  $scope.$on('centerOnMarkerUpdated', function(event, param) {
    //log('centerOnMarkerUpdated');
    log(param);

    if (param.marker.memberId != memberService.getMemberId()) {
      //log('updating individual marker')
      _updateIndividualMarker(param.marker);
    }

    _updateUnreadCount();
  });

  /**
   *  1. Loop through markers list in response of room api.
   *  2. Find corresponding message in messages obj and set 'readCount'
   *  3. Update message object in $scope.messages.
   *
   * @param data
   * @private
   */
  function _calculateUnReadCount(data) {
    _markMarkers(data.markers);
    _updateUnreadCount();
  }

  /**
   *
   * @param markersList
   * @private
   */
  function _markMarkers(markersList) {
    _.forEach(markersList, function(marker) {
      var lastLinkId = marker.lastLinkId;

      // If it's my own information, skip it.
      if (marker.memberId === memberService.getMemberId()) return;

      _setNewMarker(lastLinkId, marker.memberId);
    });
  }

  function _updateIndividualMarker(marker) {
    //console.log('updating individual marker for ', marker)
    var memberId = marker.memberId;

    _removeOldMarker(memberId);
    _setNewMarker(marker.lastLinkId, memberId)
  }

  function _setNewMarker(lastLinkId, markerOwner) {
    //console.log('setting new marker for ', markerOwner, ' at ', lastLinkId);
    var obj = messages[lastLinkId];

    if (publicService.isNullOrUndefined(obj)) {
      //console.log('setting new marker but message is not here yet');
      return;
    }

    var msg = obj.message;

    msg.readCount = msg.readCount ? msg.readCount++ : 1;
    msg.markerOwner = markerOwner;

    $scope.messages[obj.index] = msg;
    localMarkersList[markerOwner] = lastLinkId;
  }

  function _removeOldMarker(memberId) {

    var oldMarker = -1;

    // Get old lastLinkId of memberId and remove old information.
    if (!!localMarkersList[memberId]) {
      oldMarker = localMarkersList[memberId];
      localMarkersList[memberId] = false;
      //console.log('old marker was at ', oldMarker);
    }

    if (oldMarker < 0) {
      // No need to remove remove previous marker.
      return;
    }

    // Remove marker from a message whose link is oldMarker.
    if (messages[oldMarker]) {
      //console.log('removing marker for ', memberId, ' at ' , oldMarker);
      var obj = messages[oldMarker];
      var msg = obj.message;
      if (!!msg.readCount) {
        msg.readCount--;
      }
      //msg.readCount = msg.readCount ? --msg.readCount : '';
      msg.markerOwner = '';
      $scope.messages[obj.index] = msg;

    }
  }


  function _updateUnreadCount() {

    roomMemberLength = entityAPIservice.getMemberLength(currentSessionHelper.getCurrentEntity()) - 1;


    if (_isTopic()) {
      globalUnreadCount = roomMemberLength;
    } else {
      globalUnreadCount = 1;
    }

    //console.log('iterating messages starting from ', globalUnreadCount)

    _.forEachRight($scope.messages, function(message, index) {

      if (!!message.readCount) {
        if (localMarkersList[message.markerOwner] != message.id) {
          // un-synchronized marker information on message. -> remove it!
          message.markerOwner = '';
          message.readCount--;
          return;
        }
        globalUnreadCount = globalUnreadCount - message.readCount;
      }

      if (globalUnreadCount <= 0)
        message.unreadCount = '';
      else if (!!message.unreadCount) {
        message.unreadCount = Math.min(message.unreadCount, globalUnreadCount)
      } else {
        message.unreadCount = globalUnreadCount;
      }



    });
  }

  $scope.$on('centerOnTopicLeave', function(event, param) {
    // Someone left current topic -> update markers
    _removeOldMarker(param.writer);
  });
  function _hasMarkersToBeMarked() {
    return _.size(localMarkersList) < roomMemberLength;
  }
  function _isTopic() {
    return currentSessionHelper.getCurrentEntityType() != 'users';
  }
});
