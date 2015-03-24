'use strict';

var app = angular.module('jandiApp');

app.controller('centerpanelController', function($scope, $rootScope, $state, $filter, $timeout, $q, $sce, $modal, entityheaderAPIservice, messageAPIservice, fileAPIservice, entityAPIservice, userAPIservice, analyticsService, leftpanelAPIservice, memberService, publicService, desktopNotificationService, messageSearchHelper) {

  //console.info('[enter] centerpanelController', $scope.currentEntity);

  var CURRENT_ENTITY_ARCHIVED = 2002;
  var INVALID_SECURITY_TOKEN  = 2000;
  var DEFAULT_MESSAGE_UPDATE_COUNT = 20;

  var entityType = $state.params.entityType;
  var entityId = $state.params.entityId;

  var SCROLL_BOTTOM_THRESHOLD = 60;

  var updateInterval = 2000;

  $scope.hasFocus = true;
  $scope.isInitialLoadingCompleted = false;
  $rootScope.isIE9 = false;
  $scope.isPosting = false;
  $scope.isPolling = false;

  $scope.lastMessage = null;


  // To be used in directive.
  $scope.loadMoreCounter = 0;

  $scope.entityId = entityId;
  $scope.entityType = entityType;
  $scope.messages = [];

  $scope.promise = null;        // Polling object.

  $scope.message = {};          // Message to post.

  var firstMessageId,           // 현재 엔티티가 가지고 있는 가장 위 메세지 아이디.
    lastMessageId,              // 현재 엔티티가 가지고 있는 가장 아래 메세지 아이디.
    localFirstMessageId,        // 메세지들 중 가장 위에 있는 메세지 아이디.
    localLastMessageId,         // 메세지들 중 가낭 아래에 있는 메세지 아이디.
    loadedFirstMessagedId, // 스크롤 위로 한 후 새로운 메세지를 불러온 후 스크롤 백 투 해야할 메세지 아이디. 새로운 메세지 로드 전 가장 위 메세지.
    loadedLastMessageId;        // 스크롤 다운 해서 새로운 메세지를 불러온 후 스크롤 백 투 해야할 메세지 아이디.  새로운 메세지 로든 전 가장 아래 메세지.

  $scope.isMessageSearchJumping = false;

  // configuration for message loading
  $scope.msgLoadStatus = {
    loading: false,
    loadingTimer : true
  };


  $scope.isOwner = function() {
    return ($rootScope.currentEntity.ch_creatorId || $rootScope.currentEntity.pg_creatorId) == memberService.getMemberId();
  };
  $scope.isDefaultTopic = function() {
    return $rootScope.team.t_defaultChannelId == $rootScope.currentEntity.id;
  };
  $scope.onLeaveClick = function() {
    log('-- leaving')

    entityheaderAPIservice.leaveEntity($scope.currentEntity.type, $scope.currentEntity.id)
      .success(function(response) {
        log('-- good')
        // analytics
        var entity_type = analyticsService.getEntityType($scope.currentEntity.type);

        analyticsService.mixpanelTrack( "Entity Leave" , { "type": entity_type } );
        updateLeftPanel();
      })
      .error(function(error) {
        alert(error.msg);
      })
  };
  $scope.onDeleteClick = function() {
    entityheaderAPIservice.deleteEntity($scope.currentEntity.type, $scope.currentEntity.id)
      .success(function() {
        // analytics
        var entity_type = analyticsService.getEntityType($scope.currentEntity.type);
        analyticsService.mixpanelTrack( "Entity Delete", { "type": entity_type } );

        updateLeftPanel();
        fileAPIservice.broadcastChangeShared();
      })
      .error(function(error) {
        alert(error.msg);
      });
  };
  $scope.onMeesageLeaveClick = function(entityId) {
    $rootScope.$broadcast('leaveCurrentChat', entityId);
  };
  function updateLeftPanel() {
    $scope.updateLeftPanelCaller();
    $rootScope.toDefault = true;
  }

  //  END OF PANEL HEADER FUNCTIONS

  (function() {
    _onStartUpCheckList();

    _init();

    if(_hasMessageIdToSearch()) {
      _jumpToMessage();
    } else {

      loadMore();
    }

    $scope.promise = $timeout(updateList, updateInterval);

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
    _hasCorrectEntityType();
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
    if (entityId == $rootScope.member.id) {
      $rootScope.toDefault = true;
    }
  }

  function _setDefaultLoadingScreen() {
    //  default loadingTimer
    $timeout(function() {
      $scope.msgLoadStatus.loadingTimer = false;
    }, 1000);
  }

  function _initMsgSearchQuery() {
    //console.log('initing msgSearchQuery')
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
  }

  function _resetLoadMoreCounter() {
    $scope.loadMoreCounter = 0;
    $scope.isInitialLoadingCompleted = false;
  }
  function _resetMessages() {
    $scope.groupMsgs = [];
    $scope.messages = [];
    $scope.isMessageSearchJumping = false;
  }

  $scope.$on('jumpToMessageId', function(event, params) {
    _initLocalVariables();
    _jumpToMessage();
  });

  function _jumpToMessage() {
    var toMessageId = messageSearchHelper.getLinkId();
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
    // 중복 메세지 제거 (TODO 매번 모든 리스트를 다 돌리는게 비효율적이지만 일단...)
    $scope.messages = _.uniq($scope.messages);

    //console.log($scope.messages)
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

      log('-- loadMore');

      // simulate an ajax request
      $timeout(function() {

        //console.log($scope.msgSearchQuery)

        // 엔티티 메세지 리스트 목록 얻기
        messageAPIservice.getMessages(entityType, entityId, $scope.msgSearchQuery)
          .success(function(response) {
            log('  -- loadMore success');

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

            // 추후 로딩을 위한 status 설정
            $scope.msgLoadStatus.loading = false;

            // auto focus to textarea - CURRENTLY NOT USED.
            $scope.focusPostMessage = true;

            $scope.loadMoreCounter++;

            // If code gets to this point, 'getMessages' has been executed at least once.
            $scope.isInitialLoadingCompleted = true;
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
        msg = eventMsgHandler(msg);
        $scope.messages.unshift(msg);
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
        safeBody = $filter('parseUrl')(safeBody);
      }
      msg.message.content.body = $sce.trustAsHtml(safeBody);

      $scope.messages.unshift(msg);

    }
  }

  function _isInitialLoad() {
    return loadedFirstMessagedId < 0;
  }
  function _hasMoreOldMessageToLoad() {
    if (localFirstMessageId == -1) return true;

    return localFirstMessageId != firstMessageId;
  }
  function _hasMoreNewMessageToLoad() {
    //console.log('localLastMessageId: ', localLastMessageId, 'lastMessageId: ', lastMessageId, 'Has more newer message: ', localLastMessageId < lastMessageId)
    return localLastMessageId < lastMessageId;
  }
  function _isLoadingNewMessages() {
    return $scope.msgSearchQuery.type == 'new';
  }

  $scope.updateScroll = function() {
    if (_isSearchMode()) {
      //console.log('-- updateScroll: search', messageSearchHelper.getLinkId())
      _disableScroll();
      _findMessageDomElementById(messageSearchHelper.getLinkId());
      _resetSearchMode();

      return;
    }

    if (_isInitialLoad()) {
      //console.log('-- updateScroll: initial')

      _scrollToBottom();
      return;
    }

    if (_isLoadingNewMessages()) {
      //console.log('-- updateScroll: load new message')

      var temp = angular.element(document.getElementById(localFirstMessageId));
      _animateBackgroundColor(temp);
      return;
    }

    if (loadedFirstMessagedId == -1) return;

    //console.log('-- updateScroll: load old message')

    _disableScroll();

    _findMessageDomElementById(loadedFirstMessagedId);

  };
  function _findMessageDomElementById(id) {
    var lastMsg;

    // $timeout inside of $timeout????
    $timeout(function() {

      lastMsg = angular.element(document.getElementById(id));
      var positionTop = lastMsg.position().top;

      _animateBackgroundColor(lastMsg);
      //console.log('moving scroll', positionTop)
      if (_isInitialLoad()) {
        //console.log('initial load')
        positionTop -= 60;
      }
      document.getElementById('msgs-container').scrollTop = positionTop;

    }, 5);
  }

  function _scrollToBottom() {
    //console.log('scrolling to bottom')
    $timeout(function() {
      document.getElementById('msgs-container').scrollTop = document.getElementById('msgs-container').scrollHeight;
    }, 10);
  }

  $scope.isAtBottom = function() {
    //console.log('isAtBottom')
    _clearBadgeCount($scope.currentEntity);
  };

  function _animateBackgroundColor(element) {
    element.addClass('last');
    $timeout(function() {
      element.removeClass('last');
    }, 1000)
  }

  function _hasLastMessage() {
    //console.log('hasLastMessage: ', localLastMessageId == lastMessageId);
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
  // TODO: [건의사항] 웹에서는 polling 보다는 websocket이 더 효과적일듯


  var lastUpdatedLinkId = -1;
  function updateList () {

    //console.log('-- updateList');

    //  when 'updateList' gets called, there may be a situation where 'getMessages' is still in progress.
    //  In such case, don't update list and just return it.
    if ($scope.msgLoadStatus.loading) {
      $scope.promise = $timeout(updateList, updateInterval);
      return;
    }


    //console.log('  -- calling getUpdatedMessages');

    $scope.isPolling = true;

    messageAPIservice.getUpdatedMessages(entityType, entityId, lastUpdatedLinkId)
      .success(function (response) {

        //console.log('  -- getUpdatedMessages success');
        // jihoon
        if (response.alarm.alarmCount != 0) updateAlarmHandler(response.alarm);
        if (response.event.eventCount != 0) updateEventHandler(response.event);

        // lastUpdatedId 갱신 --> lastMessageId
        lastUpdatedLinkId = response.lastLinkId;

        response = response.updateInfo;

        if (response.messageCount) {
          localLastMessageId = lastUpdatedLinkId;
          loadedLastMessageId = localLastMessageId;
          lastMessageId = localLastMessageId;

          //  marker 설정
          updateMessageMarker();

          // Update message marker first and the update message list!!
          // Update message list
          $rootScope.$broadcast('updateMessageList');


          // 업데이트 된 메세지 처리
          if (response.messages.length > 0) {
            for (var i in response.messages) {
              var msg = response.messages[i];
//                        console.log("[ updated", msg.id, " and last at ", currentLast,  "]");

              if ($scope.isPosting)
                $scope.isPosting = false;

              // auto focus to textarea
              $scope.focusPostMessage = true;

              if ( msg.status == 'event' ) {
                msg = eventMsgHandler(msg);
                $scope.messages.push(msg);
                continue;
              }

              var safeBody = msg.message.content.body;
              if (safeBody != undefined && safeBody !== "") {
                safeBody = $filter('parseUrl')(safeBody);
              }

              msg.message.content.body = $sce.trustAsHtml(safeBody);

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
            }

            groupByDate();
          }

          if (_hasBrowserFocus()) {
            if (_hasBottomReached()) {
              //console.log('bottom reached and scrolling to bottom');
              _scrollToBottom();
            }
            else {
              console.log('updating current entity and badge count');
              entityAPIservice.updateBadgeValue($scope.currentEntity, -1);
            }
          }
        }

      })
      .error(function (response) {
        onHttpRequestError(response);
      });

    // TODO: async 호출이 보다 안정적이므로 callback에서 추후 처리 필요
    $scope.promise = $timeout(updateList, updateInterval);
  }

  function onHttpRequestError(response) {
    //  SOMEONE OR ME FROM OTHER DEVICE DELETED CURRENT ENTITY.
    if (response.code == CURRENT_ENTITY_ARCHIVED) {
      //console.log('okay channel archived');
      $scope.updateLeftPanelCaller();
      $rootScope.toDefault = true;
      return;
    }

    if (response.code == INVALID_SECURITY_TOKEN) {
      //console.debug('INVALID SECURITY TOKEN.');
      $state.go('signin');
      return;
    }

    if (response === 'Unauthorized') {
      //console.debug('logged out');
      leftpanelAPIservice.toSignin();
    }
  }

  //  Updating message marker for current entity.
  function updateMessageMarker() {
    messageAPIservice.updateMessageMarker(entityId, entityType, lastMessageId)
      .success(function(response) {
          //console.log('----------- successfully updated message marker for entity name ' + $scope.currentEntity.name + ' to ' + lastMessageId);
      })
      .error(function(response) {
        console.log('message marker not updated for ' + $scope.currentEntity.id);
      });
  }


  $scope.postMessage = function() {
    if (!$scope.message.content) return;

    log('-- posting message');

    // prevent duplicate request
//        $scope.msgLoadStatus.loading = true;
    $scope.isPosting = true;
    var msg = $scope.message.content;
    $scope.message.content = "";

    //if (msg === 'stop') {
    //    console.log('stoping polling')
    //    $timeout.cancel($scope.promise);
    //    return;
    //}
    $timeout.cancel($scope.promise);

    messageAPIservice.postMessage(entityType, entityId, {'content': msg})
      .success(function(response) {
        $scope.isPosting = false;

        log('-- posting message success');
        //  reseting position of msgs
        $('.msgs').css('margin-bottom', 0);

        if (_hasLastMessage()) {
          //console.log('posting - regular')
          updateList();
        } else {
          console.log('posing - search mode')
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
        $timeout.cancel($scope.promise);
        updateList();
      })
      .error(function(response) {
        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.editMessage"});
      });
  };

  $scope.deleteMessage = function(message) {
    //console.log("delete: ", message.messageId);
    messageAPIservice.deleteMessage(entityType, entityId, message.messageId)
      .success(function(response) {
        $timeout.cancel($scope.promise);
        updateList();
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
        templateUrl : 'app/modal/upload.html',
        controller  : 'fileUploadModalCtrl',
        size        : 'lg'
      });
    }
    else if (selector == 'rename') {
      $modal.open({
        scope       :   $scope,
        templateUrl :   'app/modal/rename.html',
        controller  :   'renameModalCtrl',
        size        :   'lg'
      });
    }
    else if (selector == 'invite') {
      publicService.openInviteToCurrentEntityModal($scope);
    }
    else if (selector == 'inviteUserToChannel') {
      publicService.openInviteToJoinedEntityModal($scope);
    }
    else if (select == 'share') {

    }
  };


  /*
   *  $scope.messages 중 shared entity 변화가 일어난 경우 추가/삭제 처리
   */
  $scope.$on('onChangeShared', function(event, data) {
    // 파일업로드인 경우엔 어차피 polling시 패널을 갱신하기 때문에 예외 처리
    if (_.isNull(data)) return;
    // share / unshare 경우
    _.each($scope.messages, function(msg) {
      if (msg.messageId === data.messageId) {
        // TODO 변경된 shareEntities를 얻기 위해 일단 파일 상세정보를 모두 가져옴
        fileAPIservice.getFileDetail(msg.messageId).success(function(response) {
          for (var i in response.messageDetails) {
            var item = response.messageDetails[i];
            if (item.contentType === 'file') {
              msg.message.shared = fileAPIservice.getSharedEntities(item);
            }
          }
        });
      }
    });
  });

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
  $scope.$on('onFileDeleted', function(event, deletedFileId) {
    _.forEach($scope.messages, function(message) {
      var file;
      console.log('hi', deletedFileId);
      console.log(message.message);

      //msg.message.contentType === 'systemEvent
      //msg.message.commentOption.isTitle }}
      //<div ng-if="!msg.message.commentOption.isTitle">
      //{{ msg.feedback.status}}


      // Is it file?
      if (message.message.contentType == 'file')
        file = message.message;
      else if (message.message.contentType == 'comment') {
        file = message.feedback;
      }

      // If not, continue to next message.
      if (angular.isUndefined(file)) return;

      // If this file deleted?
      if (file.id == deletedFileId) {
        file.status = 'archived';
      }
    });

  });

  $scope.onSmallThumbnailClick = function($event, message) {

    //  checking type first.
    //  file upload but not image -> return
    if (message.message.contentType === 'file')
      if (message.message.content.type.indexOf('image') < 0)
        return;

    // comment but not to image file -> return
    if (message.message.contentType === 'comment'){
      //if (message.feedback.content.type.indexOf('image') < 0 || message.feedback.status == 'archived') {
      return;
      //}
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
  // and pick correct 'transform' arrtibute.
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

  // SYSTEM EVENT.
  //  'event' field if not empty when,
  //      1. create channel
  //      2. leave channel
  //      3. archive(delete) channel
  //      4. invite someone to channel
  function updateEventHandler(event) {
    if (event.eventCount == 0) return;

    //console.log('event count: ', event.eventCount);

    var eventTable = event.eventTable;

    //  true, if left panel must be updated.
    //  otherwise, false.
    var mustUpdateLeftPanel = false;

//        console.log('There are some system events');
//        console.log('There are ' + event.eventCount)
//        console.log(eventTable);

    _.find(eventTable, function(event, index, list) {
//            console.log(event);
      if (event.info.eventType == 'invite') {
        //  'INVITE' event.
        //  ASSUMPTION 1. YOU CAN ONLY INVITE TO ONE CHANNEL. -> toEntity can have only one element.
        //  ASSUMPTION 2. YOU CAN'T INVITE SOMEONE TO DIRECT MESSAGE.  -> toEntity must be id of either channel or privateGroup.

        //  someone invited 'ME' to some channel.
        if (_.contains(event.info.inviteUsers, $scope.member.id)) {
//                    console.log('someone invited me')
          mustUpdateLeftPanel = true;
          return;
        }

        //  I invited someone.
        //  If I invited someone on web, it doesn't really matter.
        //  But if I invited someone from different device(mobile), I need to update leftPanel on web.
        if (event.info.invitorId == $scope.member.id) {
//                    console.log('I invited someone')
          mustUpdateLeftPanel = true;
          return;
        }

        var updateEntity = entityAPIservice.getEntityFromListById($rootScope.joinedEntities, event.toEntity[0]);

        if (updateEntity) {
//                    console.log('someone invited someone to some channel that I am in');
          mustUpdateLeftPanel = true;
          return;
        }
      }
      else if (event.info.eventType == 'join' || event.info.eventType == 'leave') {
        //  'JOIN' event
        var isJoin = event.info.eventType == 'join' ? true : false;

        //  I joined some channel from mobile.  Web needs to UPDATE left Panel.
        if (event.fromEntity == $scope.member.id) {

          //  leave event of myself cannot get here!
//                    console.log('I joined something');

          mustUpdateLeftPanel = true;
          return;
        }

        var updateEntity = entityAPIservice.getEntityFromListById($rootScope.joinedEntities, event.toEntity[0]);
        if (updateEntity) {
          //if (isJoin) console.log('Someone joined to related entity')
          //else console.log('Someone left related entity')

          mustUpdateLeftPanel = true;
          return;
        }
      }
      else if (event.info.eventType == 'create') {
        //  'CREATE' event
        //  Someone created channel 'a',
        //  I should be able to see channel 'a' as one of available channels
        //  when attempting to join other channel.
        //  No matter who created what, just update left panel.

//                console.log('create')
        if (event.fromEntity == $scope.member.id) {
//                    console.log('I created channel')
        }
        else {
//                    console.log('someone created channel')
        }
        mustUpdateLeftPanel = true;
        return;
      }
      else if (event.info.eventType == 'archive') {
        //  'ARCHIVE' event
        //  ASSUMPTION 1. YOU CAN ARCHIVE ONLY ONE ENTITY AT A TIME.
        //  Same reason as 'archive' situation, just update left panel.
        //  TODO: HANDLE SITUATION WHEN SOMEONE ARCHIVED CURRENT ENTITY
        //  TODO: ERROR HANDLER WILL HANDLE ABOVE SITUATION.

        mustUpdateLeftPanel = true;

        if (event.toEntity[0] == $scope.currentEntity.id) {
//                    $timeout.cancel($scope.promise);
//
//                    console.log('someone archived current channel')
//                    $state.go('messages');
          return;
        }
        else {
//                    console.log('someone archived some channel')
        }
        return;
      }
      else {
        console.error(event);
      }

      return mustUpdateLeftPanel;
    });

    if (mustUpdateLeftPanel) {
      $scope.$emit('updateLeftPanelCaller');
    }

  }

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


  // scope 소멸시(전환시) update polling 해제
  $scope.$on('$destroy', function(){
    $timeout.cancel($scope.promise);
  });

  function log(string) {
    //console.log(string);
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

  // NEW MESSAGE
  //  if 'alarm' field in response from update call is not empty,
  //  we need to handle alarm(s).
  //  'alarm' field is not empty when
  //      1. someone posts new messages in any channel.  Channel includes
  //        a. joined channel.
  //        b. not joined channel.
  //        c. 1:1 direct message.
  //      2. someone shares/comment on file.
  function updateAlarmHandler(alarm) {

    //console.log(alarm)

    if (alarm.alarmCount == 0) return;

    var alarmTable = alarm.alarmTable;

    _.each(alarmTable, function(element, index, list) {
      // Alarm is from me.  Don't worry about this.
      if (element.fromEntity == $scope.member.id) return;

      var updateEntity;

      //  'toEntity' may be an array.
      _.each(element.toEntity, function(toEntityElement, index, list) {
        // updateEntity is not undefined in case of either public or private topic.
        updateEntity = entityAPIservice.getEntityFromListById($scope.joinEntities, toEntityElement);

        if (angular.isUndefined(updateEntity)) {
          // updateEntity is not undefined in case of member.
          updateEntity = entityAPIservice.getEntityFromListByEntityId($scope.memberList, toEntityElement);
        }

        // if updateEntity is still undefined, don't worry about it.
        if (angular.isUndefined(updateEntity)) { return; }

        if (updateEntity.type == 'users') {
          $rootScope.$broadcast('updateMessageList')
        }
        //  If 'toEntity' is an entity that I'm currently looking at, check browser's visibility state.

        if (updateEntity == $scope.currentEntity && _hasBrowserFocus()) return;

        var toEntity = entityAPIservice.getEntityFromListById($scope.totalEntities, element.fromEntity);

        desktopNotificationService.addNotification(toEntity, updateEntity);
        entityAPIservice.updateBadgeValue(updateEntity, -1);
      });
    });
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
    //_clearBadgeCount($scope.currentEntity);
  };

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
});
