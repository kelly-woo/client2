'use strict';

var app = angular.module('jandiApp');

app.controller('centerpanelController', function($scope, $rootScope, $state, $filter, $timeout, $q, $sce, $modal,
                                                 entityheaderAPIservice, messageAPIservice, fileAPIservice, entityAPIservice,
                                                 userAPIservice, analyticsService, leftpanelAPIservice, memberService,
                                                 publicService, messageSearchHelper, currentSessionHelper, logger,
                                                 centerService, markerService, TextBuffer, modalHelper, NetInterceptor,
                                                 Sticker, jndPubSub, jndKeyCode) {

  //console.info('[enter] centerpanelController', $scope.currentEntity);
  var MAX_MSG_ELAPSED_MINUTES = 5;    //텍스트 메세지를 하나로 묶을 때 기준이 되는 시간 값
  var CURRENT_ENTITY_ARCHIVED = 2002;
  var INVALID_SECURITY_TOKEN  = 2000;
  var DEFAULT_MESSAGE_UPDATE_COUNT = 50;
  var DEFAULT_MESSAGE_SEARCH_COUNT = 100;

  var entityType = $state.params.entityType;
  var entityId = $state.params.entityId;

  var isLogEnabled = true;

  var firstMessageId;             // 현재 엔티티가 가지고 있는 가장 위 메세지 아이디.
  var lastMessageId;              // 현재 엔티티가 가지고 있는 가장 아래 메세지 아이디.
  var localFirstMessageId;        // 로드 된 메세지들 중 가장 위에 있는 메세지 아이디.
  var localLastMessageId;         // 로드 된 메세지들 중 가낭 아래에 있는 메세지 아이디.
  var loadedFirstMessagedId;      // 스크롤 위로 한 후 새로운 메세지를 불러온 후 스크롤 백 투 해야할 메세지 아이디. 새로운 메세지 로드 전 가장 위 메세지.
  var loadedLastMessageId;        // 스크롤 다운 해서 새로운 메세지를 불러온 후 스크롤 백 투 해야할 메세지 아이디.  새로운 메세지 로든 전 가장 아래 메세지.

  var systemMessageCount;         // system event message의 갯수를 keep track 한다.

  var hasRetryGetRoomInfo;        // Indicates that whether current entity has failed getting room info once.

  // _scrollToBottom fn timer variable
  var scrollToBottomTimer;
  var showContentTimer;

  var messages = {};
  var _sticker = null;
  var _stickerType = 'chat';

  //todo: 초기화 함수에 대한 리펙토링이 필요함.
  $rootScope.isIE9 = false;

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
  $scope.isMessageSearchJumping = false;
  $scope.isInitialLoadingCompleted = false;
  $scope.hasLastMessageRendered = false;


  //viewContent load 시 이벤트 핸들러 바인딩
  $scope.$on('$viewContentLoaded', _onViewContentLoaded);

  //viewContent unload 시 이벤트 핸들러 바인딩
  $scope.$on('$destroy', _onDestroy);

  $scope.$on('connected', _onConnected);
  $scope.$on('refreshCurrentTopic',_refreshCurrentTopic);
  $scope.$on('onChangeSticker:' + _stickerType, function(angularEvent, item) {
    _sticker = item;
    _setChatInputFocus();
  });

  $scope.repostMessage = repostMessage;
  $scope.deleteUnsentMessage = deleteUnsentMessage;
  $scope.postMessage = postMessage;

  (function() {
    _onStartUpCheckList();
    _init();

    if(_hasMessageIdToSearch()) {
      _jumpToMessage();
    } else {
      loadMore();
    }
  })();

  /**
   * 초기화 함수
   * @private
   */
  function _init() {
    _initScopeProperties();
    _resetMessages();
    _resetLoadMoreCounter();
    _setDefaultLoadingScreen();
    _initMsgSearchQuery();
    _initLocalVariables();
  }

  /**
   * $scope 의 프로퍼티들을 초기화한다.
   * @private
   */
  function _initScopeProperties() {
    $scope.isPosting = false;
    $scope.isPolling = false;
    // configuration for message loading
    $scope.msgLoadStatus = {
      loading: false,
      loadingTimer : false // no longer using.
    };
  }

  function _refreshCurrentTopic() {
    _init();
    loadMore();
  }
  /**
   * If there is anything to be checked before loading message, do it here!
   * @private
   */
  function _onStartUpCheckList() {
    centerService.preventChatWithMyself(entityId);
    _checkIE9();
  }

  function _checkIE9() {
    $rootScope.isIE9 = centerService.isIE9();
  }

  function _setDefaultLoadingScreen() {
    //  default loadingTimer
    $timeout(function() {
      $scope.msgLoadStatus.loadingTimer = false;
    }, 1000);
  }

  /**
   * search query 를 초기화한다.
   * @private
   */
  function _initMsgSearchQuery() {
    //log('initing msgSearchQuery')
    $scope.msgSearchQuery = {
      count: _getUpdateCount()
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

  /**
   * search query 를 생성 시 update count 값을 반환한다.
   * @returns {number}
   * @private
   */
  function _getUpdateCount() {
    return _isSearchMode() ? DEFAULT_MESSAGE_SEARCH_COUNT : DEFAULT_MESSAGE_UPDATE_COUNT;
  }

  function _resetLoadMoreCounter() {
    $scope.loadMoreCounter = 0;
    $scope.isInitialLoadingCompleted = false;
  }

  function _resetMessages() {
    $scope.groupMsgs = [];
    $scope.messages = [];
    $scope.isMessageSearchJumping = false;
    $scope.message.content = TextBuffer.get();
    messages = {};
  }

  $scope.$on('jumpToMessageId', function(event, params) {
    _initLocalVariables();
    _jumpToMessage();
  });

  /**
   * 컨트롤러의 view content 가 load 되었을 시 이벤트 핸들러 ($viewContentLoaded 이벤트 핸들러)
   * @private
   */
  function _onViewContentLoaded() {
    _attachEvents();
  }

  /**
   * scope 의 $destroy 이벤트 발생 시 이벤트 핸들러
   * @private
   */
  function _onDestroy() {
    _detachEvents();
  }

  /**
   * dom 이벤트를 바인딩한다.
   * @private
   */
  function _attachEvents() {
    $(window).on('focus', _onWindowFocus);
    $(window).on('blur', _onWindowBlur);
  }

  /**
   * dom 이벤트 바인딩을 해제 한다.
   * @private
   */
  function _detachEvents() {
    $(window).off('focus', _onWindowFocus);
    $(window).off('blur', _onWindowBlur);
  }

  /**
   * 윈도우 focus 시 이벤트 핸들러
   * @private
   */
  function _onWindowFocus() {
    centerService.setBrowserFocus();
    if (_hasBottomReached()) {
      _clearBadgeCount($scope.currentEntity);
    }
  }

  /**
   * 윈도우 blur 시 이벤트 핸들러
   * @private
   */
  function _onWindowBlur() {
    centerService.resetBrowserFocus();
  }



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
      count: _getUpdateCount()
    };
  }
  function _setMsgSearchQueryType(type) {
    $scope.msgSearchQuery.type = type;
  }
  /**
   * 메세지를 날짜로 묶는다.
   */
  function groupByDate() {
    _setMessageFlag($scope.messages);
    $scope.groupMsgs = [];
    $scope.groupMsgs = _.groupBy($scope.messages, function(msg) {
      return $filter('ordinalDate')(msg.time, "yyyyMMddEEEE, MMMM doo, yyyy");
    });
    _.each($scope.groupMsgs, function(messages) {
      _setMessageDetail(messages);
    });
  }

  /**
   * 메세지에 세부 데이터를 할당한다.
   * @param {Array} messages
   * @private
   */
  function _setMessageDetail(messages) {
    var contentType;
    _.each(messages, function(data, index) {
      contentType = _getContentType(index, messages);
      if (_isTextType(contentType)) {
        data.message.hasLinkPreview = _hasLinkPreview(index, messages);
        data.message.isChildText = _isChildTextMsg(index, messages);
        data.message.hasChildText = _hasChildTextMsg(index, messages);
      } else if (_isCommentType(contentType)) {
        data.message.commentOption = _getCommentOption(messages[index], messages[index - 1]);
      }
    });
  }

  /**
   * 자식 text message 가 존재하는지 여부를 반환한다.
   * @param index 확인할 대상 메세지 인덱스
   * @param messages 전체 메세지 리스트
   * @returns {boolean}
   * @private
   */
  function _hasChildTextMsg(index, messages) {
    return _isChildTextMsg(index + 1, messages);
  }

  /**
   * 해당 메세지의 content type 을 확인한다.
   * @param index 확인할 대상 메세지 인덱스
   * @param messages 전체 메세지 리스트
   * @returns {string} 메세지의 contentType
   * @private
   */

  function _getContentType(index, messages) {
    var data = messages[index];
    return data && data.message && data.message.contentType;
  }

  /**
   * 메세지가 child text 인지 여부를 반환한다.
   * @param {number} index 확인할 대상 메세지 인덱스
   * @param {array} messages 전체 메세지 리스트
   * @returns {boolean} child text 인지 여부
   * @private
   */
  function _isChildTextMsg(index, messages) {
    if (messages[index]) {
      var msg = messages[index].message;
      var prevMsg = messages[index - 1] && messages[index - 1].message;

      if (prevMsg) {
        if (_isSameWriterTextMsg(msg, prevMsg) && !_isElapsed(messages[index - 1].time, messages[index].time))  {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 메세지에 link preview data를 가지고 있는지 여부
   * @param {number} index - 확인할 대상 메세지 index
   * @param {array} messages - 전체 메세지 리스트
   * @returns {boolean}
   * @private
   */
  function _hasLinkPreview(index, messages) {
    return !!(messages[index] && !_.isEmpty(messages[index].message.linkPreview));
  }

  /**
   * 연속된 메세지로 간주할 시간 허용 범위를 초과하였는지 여부
   * @param {number} startTime 시작 시간
   * @param {number} endTime  끝 시간
   * @returns {boolean} 초과했는지 여부
   * @private
   */
  function _isElapsed(startTime, endTime) {
    var elapsedMin = Math.floor((endTime - startTime) / 60000);
    return elapsedMin > MAX_MSG_ELAPSED_MINUTES;
  }

  /**
   * 같은 사람이 보낸 메세지인지 여부를 반환한다
   * @param {object} msg 메세지
   * @param {object} prevMsg 이전 메세지
   * @returns {boolean}
   * @private
   */
  function _isSameWriterTextMsg(msg, prevMsg) {
    if (_isTextType(msg.contentType) && _isTextType(prevMsg.contentType) &&
      msg.writerId  === prevMsg.writerId) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * message 의 기본 flag를 설정한다.
   * @param {array} messages 포멧팅할 메세지 리스트
   * @private
   */
  function _setMessageFlag(messages) {
    var msg;
    var contentType;

    _.each(messages, function(data, i) {
      msg = data.message;
      contentType = msg.contentType;
      if (contentType === 'file') {
        msg.isFile = true;
      } else if (_isTextType(contentType)) {
        msg.isText = true;
      } else if (_isCommentType(contentType)) {
        msg.isComment = true;
      }
    });
  }

  /**
   * content type 이 text type 인지 확인한다.
   * @param {string} contentType
   * @returns {boolean}
   * @private
   */
  function _isTextType(contentType) {
    return centerService.isTextType(contentType);

  }

  /**
   * content type 이 코멘트인지 확인한다.
   * @param {string} contentType
   * @returns {boolean}
   * @private
   */
  function _isCommentType(contentType) {
    return centerService.isCommentType(contentType);
  }
  /**
   * comment 메세지에 할당할 comment option 객체를 생성하여 반환한다.
   * @param {object} message 메세지
   * @param {object} prevMessage 이전 메세지
   * @returns {{isSticker: boolean, isChild: boolean, isTitle: boolean, isContinue: boolean}} comment option 객체
   * @private
   */
  function _getCommentOption(message, prevMessage) {
    var isTitle = true;
    var isChild = false;
    var isSticker = (message.message.contentType === 'comment_sticker');
    var feedbackId = message.feedbackId;
    var writerId = message.message.writerId;

    if (prevMessage &&
        (prevMessage.messageId == feedbackId || prevMessage.feedbackId === feedbackId)) {
      isTitle = false;
    }

    if (!isTitle &&
        prevMessage.message.writerId === writerId &&
        !_isElapsed(prevMessage.time, message.time)) {
      isChild = true;
    }

    return {
      isSticker: isSticker,
      isChild: isChild,
      isTitle: isTitle,
      isContinue: !isTitle
    };
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
    if (_hasMoreOldMessageToLoad() && NetInterceptor.isConnected()){
      _setMsgSearchQueryLinkId(localFirstMessageId);
      _setMsgSearchQueryType('old');
      loadMore();
    }
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

      if (!$scope.isInitialLoadingCompleted) {
        _hideContents();
      }
      //log('-- loadMore');

      // simulate an ajax request
      $timeout(function() {

        //log($scope.msgSearchQuery)

        // 엔티티 메세지 리스트 목록 얻기
        messageAPIservice.getMessages(entityType, entityId, $scope.msgSearchQuery)
          .success(function(response) {
            // Save entityId of current entity.
            centerService.setEntityId(response.entityId);

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


            // isReady 가 false 이면 아무런 컨텐트가 보이지 않는다.
            // 이 부분은 center 의 initial load 가 guarantee 되는 공간이기때문에 처음에 불려졌을 때,
            // isReady flag 를 true 로 바꿔준다!
            publicService.hideTransitionLoading();

            _checkEntityMessageStatus();
          })
          .error(function(response) {
            onHttpResponseError(response);
          });
        deferred.resolve();
      });
    } else {
      deferred.reject();
    }
    return deferred.promise;
  }


  /**
   * Process each element in array handling every cases.
   * @param messagesList
   * @private
   */
  function _messageProcessor(messagesList) {
    messagesList = _.sortBy(messagesList, 'id');

    if (_isLoadingNewMessages()) {
      _.forEach(messagesList, function(msg) {
        _formatMessage(msg);
      });
    } else {
      _.forEachRight(messagesList, function(msg) {
        _formatMessage(msg);
      });
    }
    localFirstMessageId = $scope.messages[0].id;
    localLastMessageId = $scope.messages[$scope.messages.length - 1].id;
  }

  /**
   * 공유 관련된 메세지인지 여부를 반환한다.
   * @param {object} msg 메세지
   * @returns {boolean}
   * @private
   */
  function _isSharingStatusMassage(msg) {
    if (msg && (msg.status === 'shared' || msg.status === 'unshared') &&
      msg.message &&
      msg.message.shareEntities &&
      msg.message.shareEntities.length) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 초기 load 되었는지 여부
   */
  function _isInitialLoad() {
    return loadedFirstMessagedId < 0;
  }

  /**
   * 메세지를 포멧팅 한다.
   * @param {object} msg 메세지
   * @rivate
   */
  function _formatMessage(msg) {
    if (msg.status == 'event') {
      // System Message.
      msg = eventMsgHandler(msg);
      _updateSystemEventMessageCounter();
    } else {
      if (_isSharingStatusMassage(msg))  {
        /*
         shareEntities 중복 제거 & 각각 상세 entity 정보 주입
         center.controller.js 에서 _messageProcessor 실행 시점에 msg.message.shared에 할당되는 값을
         msg.message를 가지고 알 수 없으므로(msg.message.shareEntites의 값이 room ID와 user id 혼용으로 인한)
         meg.message가 확장되는 시점인 messages.controller에 _generateMessageList 실행에 수행하기 위해
         임시로 process를 가지고 있다 전달하는 역활을 하는 method를 만들어 처리하려고 하였으나, messages.controller가 수행되지 않는
         경우가 발견(jandi page가 load된 상태에서 DM이나 topic으로 접속시)되어 불완전한 timeout을 사용하여 처리함.

         - by Mark
         */
        $timeout((function(msg) {
          return function() {
            msg.message.shared = fileAPIservice.updateShared(msg.message);
          };
        }(msg)));
      }
      // parse HTML, URL code
      msg.message.content._body = msg.message.content.body;
      _filterContentBody(msg);
    }

    if (_isLoadingNewMessages()) {
      $scope.messages.push(msg);
    } else {
      $scope.messages.unshift(msg);
    }
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
    var targetScrollTop;

    // $timeout inside of $timeout????
    $timeout(function() {
      lastMsg = angular.element('#'+ id);
      targetScrollTop = lastMsg.offset().top - angular.element('#msgs-container').offset().top;
      _animateBackgroundColor(lastMsg);
      document.getElementById('msgs-container').scrollTop = targetScrollTop;
      _showContents();
    }, 150);
  }

  function _scrollToBottom() {
    $timeout.cancel(scrollToBottomTimer);
    scrollToBottomTimer = $timeout(function() {
      document.getElementById('msgs-container').scrollTop = document.getElementById('msgs-container').scrollHeight;
    }, 10);
    $timeout.cancel(showContentTimer);
    showContentTimer = $timeout(function() {
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
    if ($scope.isInitialLoadingCompleted) {
      $('#msgs-holder').addClass('opac-in-fast');
      $scope.hasLastMessageRendered = true;
    }
  }
  function _hideContents() {
    $('#msgs-holder').removeClass('opac-in-fast');
  }

  // TODO: NOT A GOOD NAME. WHEN FUNCTION NAME STARTS WITH 'is' EXPECT IT TO RETURN BOOLEAN VALUE.
  // Current 'isAtBottom' function is not returning boolean. PLEASE CHANGE THE NAME!!
  $scope.clearNewMessageAlerts = function() {
    //console.log('this is isAtBottom')
    _clearBadgeCount($scope.currentEntity);
    _resetNewMsgHelpers();
  };

  function _animateBackgroundColor(element) {
    element.addClass('last');
    $timeout(function() {
      element.removeClass('last');
    }, 1000);
  }

  function _hasLastMessage() {
    //log('localLastMessageId: ', localLastMessageId );
    //log('lastMessageId: ',  lastMessageId);
    //log('hasLastMessage: ', localLastMessageId == lastMessageId);
    return localLastMessageId == lastMessageId;
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

  /**
   * message serach를 통하여 center가 rendering 되었는지 여부
   */
  function _hasMessageSearch() {
    return $scope.msgSearchQuery && $scope.msgSearchQuery.linkId != null;
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
    //todo: deprecated 되었으므로 해당 API 제거해야함
    messageAPIservice.getUpdatedMessages(entityType, entityId, lastUpdatedLinkId)
      .success(_onUpdatedMessagesSuccess)
      .error(function (response) {
        onHttpResponseError(response);
      });

    // TODO: async 호출이 보다 안정적이므로 callback에서 추후 처리 필요
    //$scope.promise = $timeout(updateList, updateInterval);
  }

  /**
   * 메세지 success 핸들러
   * @param {object} response 서버 응답
   * @private
   */
  function _onUpdatedMessagesSuccess(response) {
    // lastUpdatedId 갱신 --> lastMessageId
    lastUpdatedLinkId = response.lastLinkId;
    response = response.updateInfo;
    response.messages = _.sortBy(response.messages, 'id');
    if (response.messageCount) {
      if (!_hasLastMessage()) {
        _gotNewMessage();
      } else {
        // 업데이트 된 메세지 처리
        _updateMessages(response.messages);
        //  marker 설정
        updateMessageMarker();
        _checkEntityMessageStatus();
        _updateUnreadCount();
      }
    }
  }

  /**
   * messages 를 loop 돌며 업데이트 한다.
   * @param {array} messages 처리할 메세지 리스트
   * @private
   */
  function _updateMessages(messages) {
    var length = messages.length;
    var msg;
    // Prevent duplicate messages in center panel.
    if (length && localLastMessageId < messages[0].id) {
      $scope.isPosting = $scope.isPosting ? false : $scope.isPosting;
      // auto focus to textarea
      $scope.focusPostMessage = true;

      for (var i = 0; i < length; i++) {
        msg = messages[i];
        if (_isSystemMessage(msg)) {
          _updateSystemMessage(msg);
        } else {
          _updateUserMessage(msg);
        }
        _filterContentBody(msg);
      }
      groupByDate();
    }
  }

  /**
   * 메세지를 노출하기 알맞게 가공한다.
   * @param {object} msg 메세지
   * @private
   */
  function _filterContentBody(msg) {
    var safeBody = msg.message.content.body;
    if (safeBody != undefined && safeBody !== "") {
      safeBody = $filter('parseAnchor')(safeBody);
    }
    msg.message.content.body = $sce.trustAsHtml(safeBody);
  }

  /**
   * 단일 시스템 메세지를 처리한다.
   * @param {object} msg 메세지
   * @private
   */
  function _updateSystemMessage(msg) {
    switch (msg.status) {
      case 'event':
        $scope.messages.push(eventMsgHandler(msg));
        _handleSystemEventMessage();
        break;
      default:
        console.error("!!! unfiltered system message", msg);
        break;
    }
  }

  /**
   * 단일 사용자 메세지를 처리한다.
   * @param {object} msg 메세지
   * @private
   */
  function _updateUserMessage(msg) {
    var isArchived = false;
    switch (msg.status) {
      // text writed
      case 'created':
        $scope.messages.push(msg);
        break;
      case 'edited':
        if (_spliceMessage(msg)) {
          $scope.messages.push(msg);
        }
        break;
      // text deleted
      case 'archived':
        isArchived = _spliceMessage(msg);
        break;
      // file shared
      case 'shared':
        msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
        $scope.messages.push(msg);
        break;
      // file unshared
      case 'unshared':
        if (_spliceMessage(msg)) {
          msg.message.shared = fileAPIservice.getSharedEntities(msg.message);
          $scope.messages.push(msg);
        }
        break;
      default:
        console.error("!!! unfiltered message", msg);
        break;
    }

    if (!isArchived) {
      // When there is a message to update on current topic.
      lastMessageId = loadedLastMessageId = localLastMessageId = lastUpdatedLinkId;
      _newMessageAlertChecker(msg);
    }
  }

  /**
   * 시스템 메세지 여부를 반환한다.
   * @param {object} msg 메세지
   * @returns {boolean} 시스템 메세지 여부
   * @private
   */
  function _isSystemMessage(msg) {
    var sysMap = {
      'event': true
    };
    return !!(msg && sysMap[msg.status]);
  }

  /**
   * 메세지를 splice 한다.
   * @param msg
   * @returns {boolean} splice 수행 여부
   * @private
   */
  function _spliceMessage(msg) {
    var targetIdx = _getTargetIndex(msg);
    if (targetIdx !== -1) {
      $scope.messages.splice(targetIdx, 1);
    }
    return targetIdx !== -1;
  }

  /**
   * msg 의 index 를 반환한다.
   * @param {object} msg index를 확인할 메세지
   * @returns {number} 인덱스. 찾지 못할 경우 -1 반환
   * @private
   */
  function _getTargetIndex(msg) {
    var target = _.find($scope.messages, function(m) {
      return m.messageId === msg.messageId;
    });
    return _.isUndefined(target) ? -1 : $scope.messages.indexOf(target);
  }

  function onHttpResponseError(response) {
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

    if (NetInterceptor.isConnected()){
      publicService.goToDefaultTopic();
    }
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

  /**
   * 네트워크 연결 되었을때 콜백
   * @private
   */
  function _onConnected() {
    if ($scope.unsentMsgs.length) {
      _postAllOfflineMessages();
    } else {
      _refreshCurrentTopic();
    }
  }
  /**
   * offline 메세지를 모두 posting 한다.
   * @private
   */
  function _postAllOfflineMessages() {
    var failedMsgs = [];
    var promise;
    var pushFailedMsg = function(response) {
      var config = response.config;
      var hasLoading = (response.status === 0);
      failedMsgs.push(_createUnsentMessage(config.data.content, config.data.sticker, hasLoading));
    };
    var finalCallback = function() {
      if (!_hasLastMessage()) {
        _refreshCurrentTopic();
      }
      _scrollToBottom();
      $scope.unsentMsgs = failedMsgs;
    };

    _.forEach($scope.unsentMsgs, function(msg, index) {
      if (msg.hasLoading) {
        if (!promise) {
          promise = messageAPIservice.postMessage(entityType, entityId, msg.content, msg.sticker);
        } else {
          promise = promise.then(function(response) {
              return messageAPIservice.postMessage(entityType, entityId, msg.content, msg.sticker);
            }, function() {
              pushFailedMsg();
              return messageAPIservice.postMessage(entityType, entityId, msg.content, msg.sticker);
          });
        }
      }
    });

    if (promise) {
      promise.then(function() {
        finalCallback();
      }, function() {
        pushFailedMsg();
        finalCallback();
      });
    }
  }

  /**
   * offline 메세지 queue 에 전송되지 않은 메세지를 담는다.
   * @param {string} content 메세지 내용
   * @param {object} [sticker=undefined]
   * @param {boolean} hasLoading 로딩
   * @private
   */
  function _enqueueUnsentMessage(content, sticker, hasLoading) {
    $scope.unsentMsgs.push(_createUnsentMessage(content, sticker, hasLoading));
    _scrollToBottom();
  }

  /**
   * unsent message 객체를 생성한다.
   * @param {object} content
   * @param {object} [sticker=undefined]
   * @param {boolean} [hasLoading=false]
   * @returns {{fromEntity: *, hasLoading: boolean, content: *, time: number}}
   * @private
   */
  function _createUnsentMessage(content, sticker, hasLoading) {
    var id = $rootScope.member.id;

    return {
      fromEntity: id,
      hasLoading: !!hasLoading,
      content: content,
      sticker: sticker,
      time: (new Date()).getTime()
    };
  }

  /**
   * message posting 오류 핸들러
   * @param {string} content
   * @param {number} status
   * @param {object} headers
   * @param {object} config
   * @private
   */
  function _onPostMessageError(content, status, headers, config) {
    var data = config.data;
    var hasLoading = (status === 0);
    var hasSticker = !!(data.stickerId && data.groupId);
    var sticker;

    if (hasSticker) {
      sticker = {
        id: data.stickerId,
        groupId: data.groupId
      };
    }
    $scope.isPosting = false;

    _enqueueUnsentMessage(data.content, sticker, hasLoading);
  }

  /**
   * message posting 성공 핸들러
   * @private
   */
  function _onPostMessageSuccess() {
    $scope.isPosting = false;
    log('-- posting message success');
    //  reseting position of msgs

    if (!_hasLastMessage()) {
      log('posting - search mode');
      _refreshCurrentTopic();
    }
  }

  /**
   * hide sticker
   * @private
   */
  function _hideSticker() {
    jndPubSub.pub('deselectSticker:' +_stickerType);
  }
  /**
   * 보내지지 않음 메세지를 삭제한다.
   * @param {number} index
   */
  function deleteUnsentMessage(index) {
    $scope.unsentMsgs.splice(index, 1);
  }

  /**
   * 메세지 post 를 재시도 한다.
   * @param {number} index 재시도 할 unsent message list index
   */
  function repostMessage(index) {
    var unsentMsg = $scope.unsentMsgs[index];
    unsentMsg.hasLoading = true;
    messageAPIservice.postMessage(entityType, entityId, unsentMsg.content, unsentMsg.sticker)
      .success(function() {
        deleteUnsentMessage(index);
        _onPostMessageSuccess();
      })
      .error(function() {
        unsentMsg.hasLoading = false;
      });
  }

  /**
   * input 박스에서 메세지를 포스팅 한다.
   */
  function postMessage() {
    var msg = $.trim($('#message-input').val());

    // prevent duplicate request
    if (msg || _sticker) {
      $scope.isPosting = true;
      if (NetInterceptor.isConnected()) {
        log('-- posting message');
        messageAPIservice.postMessage(entityType, entityId, msg, _sticker)
          .success(_onPostMessageSuccess)
          .error(_onPostMessageError);
      } else {
        _enqueueUnsentMessage(msg, _sticker, true);
        $scope.isPosting = false;
      }
    }
    $scope.message.content = "";
    _hideSticker();
  }


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
    //console.log("delete: ", message.messageId);
    if (confirm($filter('translate')('@web-notification-body-messages-confirm-delete'))) {
      if (message.message.contentType === 'sticker') {
        messageAPIservice.deleteSticker(message.messageId)
          .error(function (response) {
            updateList();
          });
      } else {
        messageAPIservice.deleteMessage(entityType, entityId, message.messageId)
          .error(function (response) {
            updateList();
          });
      }
    }
  };
  $scope.openModal = function(selector) {
    // OPENING JOIN MODAL VIEW
    if (selector === 'rename') {
      // Why is center controller calling this function??
      // TODO: REFACTOR TO ENTITY HEADER CONTROLLER.
      modalHelper.openTopicRenameModal($scope);
    } else if (selector === 'invite') {
      modalHelper.openTopicInviteModal($scope);
    } else if (selector === 'inviteUserToChannel') {
      modalHelper.openTopicInviteFromDmModal($scope);
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
      })
      .error(function(err) {
        alert(err.msg);
      });
  };

  //  right controller is listening to 'updateFileWriterId'.
  $scope.onFileListClick = function(userId) {
    if ($state.current.name != 'messages.detail.files')
      $state.go('messages.detail.files');
    $scope.$emit('updateFileWriterId', userId);
  };

  function eventMsgHandler(msg) {
    var newMsg = msg;
    var action = '';
    var entity;

    newMsg.eventType = '/' + msg.info.eventType;
    newMsg.message = {};
    newMsg.message.contentType = 'systemEvent';
    newMsg.message.content = {};
    newMsg.message.writer = entityAPIservice.getEntityFromListById($scope.memberList, msg.fromEntity);

    switch(msg.info.eventType) {
      case 'invite':
        action = $filter('translate')('@msg-invited');
        newMsg.message.invites = [];
        _.each(msg.info.inviteUsers, function(element, index, list) {
          entity = entityAPIservice.getEntityFromListById($rootScope.memberList, element);
          if (!_.isUndefined(entity)) {
            newMsg.message.invites.push(entity);
          }
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
    // center controller의 content load가 완료 된 상태이고 chat 스크롤이 최 하단에 닿아있을때 scroll도 같이 수정
    if ($scope.isInitialLoadingCompleted && _isBottomReached()) {
      _scrollToBottom();
    }
    $('.msgs').css('margin-bottom', $('#message-input').outerHeight() - 20);
  });

  /**
   * keyUp 이벤트 핸들러
   * @param {event} keyUpEvent 키 업 이벤트
   */
  $scope.onKeyUp = function(keyUpEvent) {
    var text = $(keyUpEvent.target).val();
    TextBuffer.set(text);
  };

  /**
   * input scroll 이 노출되는 여부를 trigger 한다.
   * keyDown 이후 정확히 scroll 이 노출되었는지 여부를 확인하기 위해 timeout 을 사용한다.
   * @private
   */
  function _setStickerPosition() {
    $timeout(function() {
      jndPubSub.pub('isStickerPosShift:' + _stickerType, _hasInputScroll());
    }, 50);
  }

  /**
   * input scroll 이 존재하는지 반환한다.
   * @returns {boolean}
   * @private
   */
  function _hasInputScroll() {
    var input = $('#message-input')[0];
    return input.scrollHeight > input.clientHeight;
  }

  /**
   * keyDown 이벤트 핸들러
   * @param {event} keyDownEvent
   */
  $scope.onKeyDown = function(keyDownEvent) {
    _setStickerPosition();
    if (jndKeyCode.match('ESC', keyDownEvent.keyCode)) {
      _hideSticker();
    }
  };

  $scope.setCommentFocus = function(file) {
    if ($state.params.itemId != file.id) {
      $rootScope.setFileDetailCommentFocus = true;

      $state.go('files', {
        userName    : file.writer.name,
        itemId      : file.id
      });
    } else {
      fileAPIservice.broadcastCommentFocus();
    }
  };

  $scope.$on('onStageLoadedToCenter', function() {
    $('#file-detail-comment-input').focus();
  });


  $scope.onShareClick = function(file) {
    fileAPIservice.openFileShareModal($scope, file);
  };

  $scope.isDisabledMember = function(member) {
    return publicService.isDisabledMember(member);
  };

  /**
   * Check whether msg is from myself.
   * True msg is written by me.
   *
   * @param msg
   * @returns {boolean}
   * @private
   */
  function _isMessageFromMe(msg) {
    return centerService.isMessageFromMe(msg);
  }
  function _hasBrowserFocus() {
    return !centerService.isBrowserHidden();
  }

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

    // For entity whose type is 'users' (1:1 direct message), there is no default message.
    // While there is a default message for private/public topic.  default for public/private topic is a system event.
    var numberOfDefaultMessage = entityType === 'users' ? 0 : 1;

    if (!_hasMoreOldMessageToLoad() && (messageLength == systemMessageCount || messageLength <= numberOfDefaultMessage)) return true;


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

  /**
   * Reset both new message alert & scroll to bottom icon.
   * @private
   */
  function _resetNewMsgHelpers() {
    _resetNewMsgAlert();
    _resetHasScrollToBottom();
  }
  function _resetNewMsgAlert() {
    $timeout(function() {
      $scope.hasNewMsg = false;
    });
  }
  function _resetHasScrollToBottom() {
    $timeout(function() {
      $scope.hasScrollToBottom = false;
    });
  }

  $scope.onHasNewMessageAlertClicked = onHasNewMessageAlertClicked;
  function onHasNewMessageAlertClicked() {
    _clearBadgeCount($scope.currentEntity);
    _newMsgHelper();
    _resetNewMsgHelpers();
  }

  /**
   * Decide what to do with current scroll.
   *
   * If most recent message has been already loaded, then just scroll to very bottom with animation.
   * Or just jump to most recent message by refresh current topic.
   * @private
   */
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
    return centerService.getEntityId();
  }

  $scope.$on('centerUpdateChatList', function() {
    updateList();
  });

  /**
   * Decide to whether display badge or not.
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
    hasRetryGetRoomInfo = false;
    markerService.init();
  }

  /**
   * Iterate through markers list from server and put marker.
   *
   * @param markers
   * @private
   */
  function _initMarkers(markers) {
    //console.log('start initializing markers', markers);

    markerService.resetMarkerOffset();
    _.forEach(markers, function(marker) {
      markerService.putNewMarker(marker.memberId, marker.lastLinkId, localLastMessageId);
    });

    _updateUnreadCount();
  }

  function _updateUnreadCount() {
    var globalUnreadCount;
    var lastLinkIdToCount = markerService.getLastLinkIdToCountMap();
    var markerOffset = markerService.getMarkerOffset();


    if (centerService.isChat()) {
      globalUnreadCount = 1;
    } else {
      globalUnreadCount = entityAPIservice.getMemberLength(currentSessionHelper.getCurrentEntity()) - 1;
    }
    globalUnreadCount = globalUnreadCount - markerOffset;

    _.forEachRight($scope.messages, function(message, index) {
      if (!!lastLinkIdToCount[message.id]) {
        var currentObj = lastLinkIdToCount[message.id];
        var currentObjCount = currentObj.count;

        globalUnreadCount = globalUnreadCount - currentObjCount;
      }

      if (message.unreadCount === '') {
        // if message.unreadCount is an 'empty string', then globalUnreadCount for current message has reached ZERO!!!
        // There is no need to increment unread count for any type of message.
        // So just leave as it is. as ZERO.
        globalUnreadCount = 0;
      } else if (message.unreadCount < globalUnreadCount) {
        globalUnreadCount = message.unreadCount;
      }

      if (globalUnreadCount < 0) globalUnreadCount = 0;
      if (globalUnreadCount === 0) {
        message.unreadCount = '';
      } else {
        message.unreadCount = globalUnreadCount;
      }
      //message.unreadCount = globalUnreadCount === 0 ? '' : globalUnreadCount;
      $scope.messages[index] = message;

    });

  }

  /**
   * Callback function for marker updated socket event.
   *
   */
  $scope.$on('centerOnMarkerUpdated', function(event, param) {
    log('centerOnMarkerUpdated');

    markerService.updateMarker(param.marker.memberId, param.marker.lastLinkId);

    _updateUnreadCount();
  });

  $scope.$on('centerOnTopicLeave', function(event, param) {
    // Someone left current topic -> update markers
    markerService.removeMarker(param.writer);
  });

  /**
   * Update unread count
   */
  function _setUnreadCount() {
    _getCurrentRoomInfo();
  }

  /**
   * Get room info.
   * If failed to get room info due to undefined 'currentRoomId', try once again. *only again
   *
   * @private
   */
  function _getCurrentRoomInfo() {
    var currentRoomId = _getEntityId();

    messageAPIservice.getRoomInformation(currentRoomId)
      .success(function(response) {
        _initMarkers(response.markers);
        hasRetryGetRoomInfo = false;
        //console.log('success')
      })
      .error(function(err) {
        if (!hasRetryGetRoomInfo && publicService.isNullOrUndefined(currentRoomId)) {
          //console.log('me')
          _getCurrentRoomInfo();
          hasRetryGetRoomInfo = true;
        }
      });
  }

  // Listen to file delete event.
  // Find deleted file id from current list($scope.messages).
  // If current list contains deleted file, change its status to 'archived'.
  // TODO: Still o(n) algorithm.  too bad!! very bad!!! make it o(1) by using map.
  $scope.$on('centerOnFileDeleted', function(event, param) {
    var deletedFileId = param.file.id;

    _.forEach($scope.messages, function(message) {

      if (_isCommentType(message.message.contentType) && message.message.commentOption.isTitle) {
        if (message.message.feedbackId === deletedFileId) {
          message.feedback.status = 'archived';
        }
      }

      if (message.message.id === deletedFileId) {
        message.message.status = 'archived';
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
    var isFound = false;
    _.forEach($scope.messages, function(message, index) {
      if (message && message.message && (message.message.id === param.comment.id)) {
        isFound = true;
        $scope.messages.splice(index, 1);
      }
    });
    if (isFound) {
      groupByDate();
    }
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



  function _hasBottomReached() {
    return centerService.hasBottomReached();
  }

  /**
   * chat 스크롤이 최 하단에 닿아있는지 여부를 반환한다.
   * @returns {boolean} 최 하단에 닿아있는지 여부
   * @private
   */
  function _isBottomReached() {
    return $('#msgs-container')[0].scrollTop + $('#msgs-container').height() >= $('#msgs-holder').outerHeight();
  }

  /**
   * 입력된 text가 preview(social snippets)를 제공하는 경우 center controller에서의 handling
   *
   * 'attachMessagePreview' event에서 content가 attach되는 message의 식별자를 전달 받아
   * 해당 식별자로 특정 message를 다시 조회 하여 생성된 content data로 view를 생성하여 text element 자식 element로 append 함
   */
  $scope.$on('attachMessagePreview', function(event, data) {
    messageAPIservice
      .getMessage(memberService.getTeamId(), data.message.id)
      .success(function(message) {
        var msg;
        var i;
        for (i = $scope.messages.length - 1; i > -1; --i) {
          msg = $scope.messages[i];
          if (msg.messageId === message.id) {
            msg.message.hasLinkPreview = true;

            msg.message.linkPreview = message.linkPreview;
            break;
          }
        }

        if (_isMessageFromMe(message) && _isBottomReached()) {
          _scrollToBottom();
        }
      })
      .error(function(error) {
        console.log('link preview error', error);
      });
  });
});

