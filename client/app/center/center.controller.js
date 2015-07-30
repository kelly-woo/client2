'use strict';

var app = angular.module('jandiApp');

app.controller('centerpanelController', function($scope, $rootScope, $state, $filter, $timeout, $q, $sce, $modal,
                                                 entityheaderAPIservice, messageAPIservice, fileAPIservice, entityAPIservice,
                                                 userAPIservice, analyticsService, leftpanelAPIservice, memberService,
                                                 publicService, MessageQuery, currentSessionHelper, logger,
                                                 centerService, markerService, TextBuffer, modalHelper, NetInterceptor,
                                                 Sticker, jndPubSub, jndKeyCode, DeskTopNotificationBanner,
                                                 MessageCollection, AnalyticsHelper, Announcement, TopicMessageCache) {

  //console.info('::[enter] centerpanelController', $state.params.entityId);
  var TEXTAREA_MAX_LENGTH = 40000;
  var CURRENT_ENTITY_ARCHIVED = 2002;
  var INVALID_SECURITY_TOKEN  = 2000;

  var entityType = $state.params.entityType;
  var entityId = $state.params.entityId;

  // cache 할 메세지의 숫자
  var _cachedListLength = 50;

  // 처음에 center에 진입할 때, 현재 entityId가 가지고 있는 마지막으로 읽은 message marker를 불러온다.
  // message marker는 link id와 동일하다. message id 아님.
  var _lastReadMessageMarker;

  // 북마크를 보여줘야할지 말아야 할지
  var _shouldDisplayBookmarkFlag = false;
  $scope.shouldDisplayBookmarkFlag = _shouldDisplayBookmarkFlag;

  // 북마크로 스크롤을 해야할지 말아야 할지
  var _shouldUpdateScrollToBookmark = false;

  var _isFromCache = false;

  // 북마크까지 가는데 걸리는 에니메이션 시간
  var _bookmarkAnimationDuration = 428;

  var isLogEnabled = true;

  var getMessageDeferredObject;

  var firstMessageId;             // 현재 엔티티(토픽, DM)의 가장 위 메세지 아이디.
  var lastMessageId;              // 현재 엔티티(토픽, DM)의 가장 아래 메세지 아이디.
  var loadedFirstMessageId;      // 스크롤 위로 한 후 새로운 메세지를 불러온 후 스크롤 백 투 해야할 메세지 아이디. 새로운 메세지 로드 전 가장 위 메세지.
  var loadedLastMessageId;        // 스크롤 다운 해서 새로운 메세지를 불러온 후 스크롤 백 투 해야할 메세지 아이디.  새로운 메세지 로든 전 가장 아래 메세지.

  // 주기적으로 업데이트 메세지 리스트 얻기 (polling)
  var globalLastLinkId = -1;      // 전체 엔티티(토픽, DM)의 가장 마지막 ID
  var systemMessageCount;         // system event message의 갯수를 keep track 한다.
  var hasRetryGetRoomInfo;        // Indicates that whether current entity has failed getting room info once.

  // _scrollToBottom fn timer variable
  var scrollToBottomTimer;
  var showContentTimer;

  var messages = {};
  var _jqContainer;
  var _stickerType = 'chat';
  var _sticker = null;
  var _isUpdateListLock = false;

  //todo: 초기화 함수에 대한 리펙토링이 필요함.
  $rootScope.isIE9 = false;
  $scope.hasScrollToBottom = false;
  $scope.hasNewMsg = false;

  // To be used in directive('centerHelpMessageContainer')
  $scope.emptyMessageStateHelper = '';

  $scope.entityId = entityId;
  $scope.entityType = entityType;

  $scope.messages = MessageCollection.list;
  $scope.message = {};          // Message to post.
  $scope.isInitialLoadingCompleted = false;
  $scope.hasLastMessageRendered = false;

  //todo: $scope property 수가 너무 많아질 경우, object 형태로 관리하는 방안을 고려해 보아야 함.
  $scope.onClickUnshare = onClickUnshare;
  $scope.onFileListClick = onFileListClick;
  $scope.onShareClick = onShareClick;
  $scope.isDisabledMember = publicService.isDisabledMember;

  $scope.onKeyDown = onKeyDown;
  $scope.onKeyUp = onKeyUp;
  $scope.onTextChange = _cutTextareaMaxLength;

  $scope.setCommentFocus = setCommentFocus;
  $scope.loadMore = loadMore;
  $scope.loadNewMessages = loadNewMessages;
  $scope.loadOldMessages = loadOldMessages;
  $scope.clearNewMessageAlerts = clearNewMessageAlerts;

  $scope.postMessage = postMessage;
  $scope.editMessage = editMessage;

  $scope.openModal = openModal;
  $scope.hasMoreNewMessageToLoad = hasMoreNewMessageToLoad;

  $scope.isTextType = isTextType;
  $scope.isCommentType = isCommentType;
  $scope.isNewDate = MessageCollection.isNewDate;
  $scope.hasLinkPreview = MessageCollection.hasLinkPreview;

  $scope.isChildText = MessageCollection.isChildText;
  $scope.isChildComment = MessageCollection.isChildComment;
  $scope.isTitleComment = MessageCollection.isTitleComment;

  $scope.onScrollToBottomIconClicked = onScrollToBottomIconClicked;
  $scope.onHasNewMessageAlertClicked = onHasNewMessageAlertClicked;
  $scope.onHasNewMessageAlertCloseClicked = onHasNewMessageAlertCloseClicked;

  $scope.onRepeatDone = onRepeatDone;

  $scope.isLastReadMarker = isLastReadMarker;

  _init();

  var _testCounter = 0;
  /**
   * 생성자 함수
   * @private
   */
  function _init() {
    centerService.preventChatWithMyself(entityId);
    $rootScope.isIE9 = centerService.isIE9();

    _initializeListeners();
    _reset();
    _initializeView();
  }

  /**
   * 어떠한 메세지 리스트를 보여줄지 결정한다.
   * @private
   */
  function _initializeView() {
    if(MessageQuery.hasSearchLinkId()) {
      _jumpToMessage();
    } else {
      if (TopicMessageCache.contains(_getEntityId())) {
        _displayCache();
      } else {
        loadMore();
      }
    }
  }

  /**
   * 내부 변수를 초기화한다.
   * @private
   */
  function _reset() {
    $('#msgs-container')[0].scrollTop = 0;
    MessageQuery.reset();
    MessageCollection.reset();

    $scope.messages = MessageCollection.list;
    $scope.isPolling = false;
    // configuration for message loading
    $scope.msgLoadStatus = {
      loading: false
    };
    $scope.message.content = TextBuffer.get();

    $scope.isInitialLoadingCompleted = false;
    $scope.currentEntity = currentSessionHelper.getCurrentEntity();

    centerService.setEntityId(centerService.isChat() ? currentSessionHelper.getCurrentEntity().entityId : entityId);
    _lastReadMessageMarker = memberService.getLastReadMessageMarker(_getEntityId());

    _initLocalVariables();
  }

  /**
   * scope listener 를 초기화한다.
   * @private
   */
  function _initializeListeners() {
    //viewContent load 시 이벤트 핸들러 바인딩
    $scope.$on('$destroy', _onDestroy);
    $scope.$on('$viewContentLoaded', _onViewContentLoaded);
    $scope.$on('connected', _onConnected);
    $scope.$on('refreshCurrentTopic',_refreshCurrentTopic);
    $scope.$on('newMessageArrived', _onNewMessageArrived);
    $scope.$on('newSystemMessageArrived', _onNewSystemMessageArrived);

    $scope.$on('jumpToMessageId', _jumpToMessage);
    $scope.$on('elastic:resize', _onElasticResize);
    $scope.$on('setChatInputFocus', _setChatInputFocus);
    $scope.$on('onInitLeftListDone', _checkEntityMessageStatus);
    $scope.$on('centerUpdateChatList', updateList);
    $scope.$on('centerOnMarkerUpdated', _onCenterMarkerUpdated);
    $scope.$on('centerOnTopicLeave',_onCenterOnTopicLeave);
    $scope.$on('centerOnFileDeleted', _onCenterFileDeleted);
    $scope.$on('centerOnFileCommentDeleted', onCenterOnFileCommentDeleted);
    $scope.$on('attachMessagePreview', _onAttachMessagePreview);
    $scope.$on('onChangeSticker:' + _stickerType, _onChangeSticker);
    $scope.$on('updateMemberProfile', _onUpdateMemberProfile);
    $scope.$on('onStageLoadedToCenter', function() {
      $('#file-detail-comment-input').focus();
    });
    $scope.$on('showUserFileList', function(event, param) {
      onFileListClick(param);
    });
  }

  /**
   * updateMemberProfile 이벤트 발생시 이벤트 핸들러
   * @param {object} event
   * @param {{event: object, member: object}} data
   * @private
   */
  function _onUpdateMemberProfile(event, data) {
    var list = $scope.messages;
    var member = data.member;
    var id = member.id;

    _.forEach(list, function(msg) {
      if (msg.fromEntity === id) {
        msg.exProfileImg = $filter('getSmallThumbnail')(member);
      }
    });
  }

  /**
   * 새 메세지를 조회하고 있는지를 반환한다.
   * @returns {boolean}
   * @private
   */
  function _isLoadingNewMessages() {
    return MessageQuery.get('type') === 'new';
  }

  /**
   * 이전 메세지를 조회하고 있는지를 반환한다.
   * @returns {boolean}
   * @private
   */
  function _isLoadingOldMessages() {
    return MessageQuery.get('type') === 'old';
  }

  /**
   * 변수를 초기화한다.
   * @private
   */
  function _initLocalVariables() {
    firstMessageId = -1;
    lastMessageId = -1;
    loadedFirstMessageId = -1;
    systemMessageCount = 0;

    _isFromCache = false;

    _resetUnreadCounters();
    _resetNewMsgHelpers();
    _cancelHttpRequest();
  }

  /**
   * 현재 topic 을 새로고침한다.
   * @private
   */
  function _refreshCurrentTopic() {
    _reset();
    loadMore();
  }

  /**
   * 컨트롤러의 view content 가 load 되었을 시 이벤트 핸들러 ($viewContentLoaded 이벤트 핸들러)
   * @private
   */
  function _onViewContentLoaded() {
    _jqContainer = $('.msgs');
    $timeout(function() {
      $('#message-input').val(TextBuffer.get()).trigger('change');
    });
    _attachEvents();
  }

  /**
   * scope 의 $destroy 이벤트 발생 시 이벤트 핸들러
   * @private
   */
  function _onDestroy() {
    _cancelHttpRequest();
    _detachEvents();
    _updateCache();
  }

  /**
   * 새로운 param을 만들어서 value 로 사용하고 현재 entity의 id(혹은 entityId, chat일 경우) 를 key로 사용하여 Cache를 업데이트한다.
   * @private
   */
  function _updateCache() {
    var _listToBeCached = MessageCollection.getList();

    if (_cachedListLength > 0 ) {
      // 리스트 뒤에서부터 _cachedListLength만큼 가져온다.
      _listToBeCached = _listToBeCached.slice(0 - _cachedListLength);
    }

    var param = {
      list: _listToBeCached,
      lastMessageId: lastMessageId,
      globalLastLinkId: globalLastLinkId,
      lastLinkId: MessageCollection.getLastLinkId(),
      hasProcessed: true
    };

    console.log(param);

    TopicMessageCache.put(_getEntityId(), param);
  }

  /**
   * 캐쉬를 업데이트해야하는 상황인가? 조건은
   *   1. 현재 토픽의 마지막 메세지를 캐싀가 가지고 있지 않아야한다.
   *   2. 현재 토픽의 마지막 메세지를 가지고 있어야 한다.
   * 7/27/2015 시점에는 사용되지않는다.
   * @returns {*}
   * @private
   */
  function _shouldUpdateCache() {
    var _hasLastInCache = false;
    if (TopicMessageCache.contains(_getEntityId())) {
      var param = TopicMessageCache.get(_getEntityId());
      _hasLastInCache = lastMessageId === param.lastMessageId;
    }
    return _hasLastMessage() && !_hasLastInCache;
  }

  /**
   * dom 이벤트를 바인딩한다.
   * @private
   */
  function _attachEvents() {
    $(window).on('focus', _onWindowFocus);
    $(window).on('blur', _onWindowBlur);
    $('body').on('dragstart', _onDragStart);
  }

  /**
   * dom 이벤트 바인딩을 해제 한다.
   * @private
   */
  function _detachEvents() {
    $(window).off('focus', _onWindowFocus);
    $(window).off('blur', _onWindowBlur);
    $('body').on('dragstart', _onDragStart);
  }

  /**
   * 현재 작동하고 있는 getMessages call을 resolve한다.
   * @private
   */
  function _cancelHttpRequest() {
    if (!_.isUndefined(getMessageDeferredObject)) {
      getMessageDeferredObject.resolve();
    }
  }

  /**
   * 윈도우 focus 시 이벤트 핸들러
   * @private
   */
  function _onWindowFocus() {
    centerService.setBrowserFocus();
    if (centerService.hasBottomReached()) {
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

  /**
   * center에 drag&drop 으로 file upload시 window 내에서 발생하는
   * drag&drop 이벤트 에서도 file upload sequence 시작되기 때문에
   * window의 drag start event cancel
   */
  function _onDragStart(dragEvent) {
    dragEvent.preventDefault();
    dragEvent.stopPropagation();
    return false;
  }

  /**
   * 해당 메세지로 이동한다.
   * @private
   */
  function _jumpToMessage() {
    _hideContents();
    _reset();
    loadMore();
  }

  /**
   * 해당 index 가 TextType 인지 여부를 반환한다.
   * @param index
   * @returns {*|boolean}
   */
  function isTextType(index) {
    return centerService.isTextType(MessageCollection.getContentType(index));
  }

  /**
   * 해당 index 가 CommentType 인지 여부를 반환한다.
   * @param index
   * @returns {*|boolean}
   */
  function isCommentType(index) {
    return centerService.isCommentType(MessageCollection.getContentType(index));
  }

  function loadNewMessages() {
    if (hasMoreNewMessageToLoad() && NetInterceptor.isConnected()) {
      MessageQuery.set({
        type: 'new',
        linkId: MessageCollection.getLastLinkId()
      });
      loadMore();
    }
  }

  function loadOldMessages() {
    if (_hasMoreOldMessageToLoad() && NetInterceptor.isConnected()){
      MessageQuery.set({
        type: 'old',
        linkId: MessageCollection.getFirstLinkId()
      });
      loadMore();
    }
  }

  /**
   * 현재 topic에 해당하는 cache 가 있으므로 우선 cache 된 data를 보여준다.
   * @private
   */
  function _displayCache() {
    console.log(_testCounter++, '::_displayCache');
    var _cachedItem = TopicMessageCache.get(_getEntityId());

    $scope.messages = [];
    _isFromCache = true;

    if (!_cachedItem.hasProcessed) {
      MessageCollection.append(_cachedItem.list);
      lastMessageId = MessageCollection.getLastLinkId();
    } else {
      MessageCollection.setList(_cachedItem.list);
      lastMessageId = _cachedItem.lastMessageId;
    }

    console.log('::', lastMessageId)
    globalLastLinkId = _cachedItem.globalLastLinkId || lastMessageId;

    $scope.isInitialLoadingCompleted = true;

    TopicMessageCache.addValue(_getEntityId(), 'hasProcessed', true);

    _getUpdatedList();
  }

  /**
   * 캐쉬된 이후로 업데이트된 것이 있는지 물어본다.
   * @private
   */
  function _getUpdatedList() {
    console.log(_testCounter++, '::_getUpdatedList');
    messageAPIservice.getUpdatedList(_getEntityId(), lastMessageId)
      .success(_onUpdatedMessagesSuccess)
      .error(function(err) {
        console.log(err);
        _setMessagesAfterCache();
      });
  }

  /**
   * 업데이트 api가 정상적으로 들어왔을 경우
   * @param {object} response - server로부터 들어온 정보
   * @private
   */
  function _onUpdatedMessagesSuccess(response) {
    console.log(_testCounter++, '::_onUpdatedMessagesSuccess', response);

    if (response.updateInfo.messageCount > 0) {
      console.log(_testCounter++, '::_update messages');

      _shouldDisplayBookmarkFlag = true;
      _shouldUpdateScrollToBookmark = true;

      _onUpdateListSuccess(response);
    } else {
      console.log(_testCounter++, '::no messages to update');
      //response.updateInfo가 없어도 response 가 200일 경우에 messageMarker를 업데이트해야한다.
      updateMessageMarker();
      _setMessagesAfterCache();
    }
  }

  /**
   * cache를 보여줄 때 더이상 messages list에 변화가 없을때 이 함수를 호출해서
   * ng-repeat을 시작하게끔한다.
   * @private
   */
  function _setMessagesAfterCache() {
    $scope.messages = MessageCollection.getList();
    _updateUnreadBookmarkFlag();
  }

  function loadMore() {
    console.log('::loadMore');
    if (!$scope.msgLoadStatus.loading) {
      loadedFirstMessageId = MessageCollection.getFirstLinkId();
      loadedLastMessageId = MessageCollection.getLastLinkId();

      // loadMoreCounter가 0 이고 isInitialLoadingCompleted가 true 이면 center controller가
      // load 된 후 scrolling을 통한 message load 라고 판단하여 상단에 loading gif를 출력한다.
      // dom element bindingd으로 class 수정시 ie서 깜빡임 보이므로 class 바로 수정
      if (!MessageQuery.hasSearchLinkId() && _hasMoreOldMessageToLoad() && $scope.isInitialLoadingCompleted) {
        $('.msgs__loading').addClass('load-more-top');
      } else {
        $('.msgs__loading').removeClass('load-more-top');
      }

      // TODO: come up with function and name.
      $scope.msgLoadStatus.loading = true;
      $scope.isPolling = false;

      if (!$scope.isInitialLoadingCompleted) {
        _hideContents();
      }
      getMessageDeferredObject = $q.defer();
      // 엔티티 메세지 리스트 목록 얻기

      messageAPIservice.getMessages(entityType, entityId, MessageQuery.get(), getMessageDeferredObject)
        .success(function(response) {
          console.log('::getMessageSuccess');
          console.log(response)

          // Save entityId of current entity.
          centerService.setEntityId(response.entityId);

          firstMessageId = response.firstLinkId;
          lastMessageId = response.lastLinkId;
          globalLastLinkId = response.globalLastLinkId;

          var messagesList = response.records;

          // When there are messages to update.
          if (messagesList.length) {
            _messageProcessor(messagesList);
            //groupByDate();
          }

          //  marker 설정
          updateMessageMarker();
          _getCurrentRoomInfo();

          // 추후 로딩을 위한 status 설정
          $scope.msgLoadStatus.loading = false;

          // auto focus to textarea - CURRENTLY NOT USED.
          _setChatInputFocus();
          $scope.isInitialLoadingCompleted = true;


          // isReady 가 false 이면 아무런 컨텐트가 보이지 않는다.
          // 이 부분은 center 의 initial load 가 guarantee 되는 공간이기때문에 처음에 불려졌을 때,
          // isReady flag 를 true 로 바꿔준다!
          publicService.hideTransitionLoading();

          _checkEntityMessageStatus();

          if (_.isEmpty(messagesList)) {
            // 모든 과정이 끝난 후, 메시지가 없으면 그냥 보여준다.
            _showContents();
          }

        })
        .error(function(response) {
          onHttpResponseError(response);
        });

    } else {
    }
  }


  /**
   * Process each element in array handling every cases.
   * @param messageList
   * @private
   */
  function _messageProcessor(messageList) {
    if (_isLoadingNewMessages()) {
      MessageCollection.append(messageList);
    } else {
      MessageCollection.prepend(messageList);
    }
  }

  /**
   * 초기 load 되었는지 여부
   */
  function _isInitialLoad() {
    return loadedFirstMessageId < 0;
  }

  /**
   * Checks if there is no old messages to load.
   * Meaning all previous messages has been loaded and display on web.
   * @returns {boolean}
   * @private
   */
  function _hasMoreOldMessageToLoad() {
    if (MessageCollection.getFirstLinkId() == -1 ||
      MessageCollection.getFirstLinkId() !== firstMessageId) {
      return true;
    } else {
      return false;
    }
  }

  function hasMoreNewMessageToLoad() {
    //log('localLastMessageId: ', localLastMessageId, 'lastMessageId: ', lastMessageId, 'Has more newer message: ', localLastMessageId < lastMessageId)
    return MessageCollection.getLastLinkId() < lastMessageId;
  }

  function _hasLastMessage() {
    return MessageCollection.getLastLinkId() == lastMessageId;
  }

  function _updateScroll() {
    console.log('::updateScroll')
    if (MessageQuery.hasSearchLinkId()) {
      _findMessageDomElementById(MessageQuery.get('linkId'), true);
      MessageQuery.clearSearchLinkId();
    } else if(_isInitialLoad()) {
      _onInitialLoad();
    } else if (_isLoadingNewMessages()) {
      _animateBackgroundColor($('#' + MessageCollection.getFirstLinkId()));
    } else if (_isLoadingOldMessages()) {
      _disableScroll();
      _findMessageDomElementById(loadedFirstMessageId);
    } else if (MessageCollection.getQueue().length > 0) {
      _scrollToBottom();
    }
    MessageQuery.reset();
  }

  function _onInitialLoad() {
    console.log(_testCounter++, '::_onInitialLoad')

    if (_shouldDisplayBookmarkFlag) {
      console.log(_testCounter++, '::_shouldDisplayBookmarkFlag');
      $timeout(function() {
      //bookmark 바로 위 단계에서 생길 수 있으니 이후 코드는 $timeout 에 묶었음.
      _findMessageDomElementById('unread-bookmark', true);
      });
    } else {
      console.log(_testCounter++, '::_no bookmark to show. scroll to bottom', document.getElementById('msgs-container').scrollHeight);
      _scrollToBottom();
    }

    _isFromCache = false;

    loadedFirstMessageId = MessageCollection.getFirstLinkId();
    loadedLastMessageId = MessageCollection.getLastLinkId();
  }

  function _findMessageDomElementById(id, withOffset) {
    console.log('::_findMessageDomElementById', id);

    var jqTarget = $('#'+id);
    var jqContainer = $('#msgs-container');
    var targetScrollTop = jqContainer.scrollTop();

    if (_.isUndefined(jqTarget.offset())) {
      console.log('::_no jqTarget')
      _scrollToBottom(true);
    } else {
      console.log('::Yes jqTarget', targetScrollTop);

      targetScrollTop += jqTarget.offset().top;
      targetScrollTop -= jqContainer.offset().top;

      if (Announcement.isOpened()) {
        targetScrollTop -= $('announcement:first > div:first').outerHeight();
      }

      if (withOffset) {
        targetScrollTop -= jqContainer.height()/3;
      }

      console.log('::Scroll to ', targetScrollTop);
      _scrollTo(targetScrollTop);

      _animateBackgroundColor(jqTarget);

      // _scrollTo 가 다 끝날때까지 기다린 후 _showcontent 를 한다.
      $timeout(function() {
        _showContents();
      }, 10);
    }
  }

  function _scrollTo(scrollHeight) {
    document.getElementById('msgs-container').scrollTop = scrollHeight;
  }

  function _scrollToBottom(isPromptly) {
    console.log('::_scrollToBottom ');

    var toBottom = function() {
      document.getElementById('msgs-container').scrollTop = document.getElementById('msgs-container').scrollHeight;
    };

    if (isPromptly) {
      toBottom();
    }

    $timeout.cancel(scrollToBottomTimer);
    scrollToBottomTimer = $timeout(function() {
      toBottom();
    }, 0);

    $timeout.cancel(showContentTimer);
    showContentTimer = $timeout(function() {
      _showContents();
    }, 0);
  }

  function _scrollToBottomWithAnimate(duration) {
    duration = duration || 500;
    var height = document.getElementById('msgs-container').scrollHeight;
    $('#msgs-container').animate({scrollTop: height}, duration, 'swing', function() {
      _resetNewMsgHelpers();
    });
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
  function clearNewMessageAlerts() {
    _clearBadgeCount($scope.currentEntity);
    _resetNewMsgHelpers();
  }

  function _animateBackgroundColor(element) {
    console.log('::_animateBackgroundColor');
    element.addClass('last');

    $timeout(function() {
      element.addClass('last-out');
      $timeout(function() {
        element.removeClass('last');
        element.removeClass('last-out');
      }, 517)
    }, 500);
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

    $timeout(function() { _enableScroll(); }, 1000);
  }

  function _enableScroll() {
    $('body').unbind('mousewheel');
  }

  function updateList() {
    //  when 'updateList' gets called, there may be a situation where 'getMessages' is still in progress.
    //  In such case, don't update list and just return it.
    console.log('updatelist')
    if ($scope.msgLoadStatus.loading || _isUpdateListLock) {
      return;
    }
    _isUpdateListLock = true;
    $scope.isPolling = true;
    //todo: deprecated 되었으므로 해당 API 제거해야함
    messageAPIservice.getUpdatedMessages(entityType, entityId, globalLastLinkId)
      .success(_onUpdateListSuccess)
      .error(function (response) {
        onHttpResponseError(response);
      })
      .finally(function() {
        _isUpdateListLock = false;
      });

    // TODO: async 호출이 보다 안정적이므로 callback에서 추후 처리 필요
    //$scope.promise = $timeout(updateList, updateInterval);
  }

  /**
   * 메세지 success 핸들러
   * @param {object} response 서버 응답
   * @private
   */
  function _onUpdateListSuccess(response) {

    var updateInfo = response.updateInfo;
    if (!_.isUndefined(updateInfo)) {

      globalLastLinkId = response.lastLinkId;
      updateInfo.messages = _.sortBy(updateInfo.messages, 'id');

      if (updateInfo.messageCount) {
        // 업데이트 된 메세지 처리
        _updateMessages(updateInfo.messages, hasMoreNewMessageToLoad());
        MessageCollection.updateUnreadCount();
        lastMessageId = updateInfo.messages[updateInfo.messages.length - 1].id;
        console.log('::_onUpdateListSuccess', lastMessageId);
        jndPubSub.pub('onMessageDeleted');
        //  marker 설정
        updateMessageMarker();
        _checkEntityMessageStatus();
      }
    }

    if (_isFromCache) {
      _setMessagesAfterCache();
    }
  }

  /**
   * messages 를 loop 돌며 업데이트 한다.
   * @param {array} messages 처리할 메세지 리스트
   * @private
   */
  function _updateMessages(messages, isSkipAppend) {
    var length = messages.length;
    var msg;
    // Prevent duplicate messages in center panel.
    if (length && MessageCollection.getLastLinkId() < messages[0].id) {
      MessageCollection.removeAllSendingMessages();
      MessageCollection.update(messages, isSkipAppend);
      // auto focus to textarea
      _setChatInputFocus();
    }
  }

  function onHttpResponseError(response) {
    console.log('::response', response)
    $scope.msgLoadStatus.loading = false;
    //  SOMEONE OR ME FROM OTHER DEVICE DELETED CURRENT ENTITY.
    if (response && response.code == CURRENT_ENTITY_ARCHIVED) {
      //log('okay channel archived');
      $scope.updateLeftPanelCaller();
      publicService.goToDefaultTopic();
      return;
    }

    if (response && response.code == INVALID_SECURITY_TOKEN) {
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
    console.log('::updateMessageMarker', lastMessageId);
    messageAPIservice.updateMessageMarker(entityId, entityType, lastMessageId)
      .success(function(response) {
        memberService.setLastReadMessageMarker(_getEntityId(), lastMessageId);
        //log('----------- successfully updated message marker for entity name ' + $scope.currentEntity.name + ' to ' + lastMessageId);
      })
      .error(function(response) {
        log('message marker not updated for ' + $scope.currentEntity.id);
      });
  }


  /**
   * hide sticker
   * @private
   */
  function _hideSticker() {
    jndPubSub.pub('deselectSticker:' +_stickerType);
  }

  /**
   * 네트워크 연결 되었을때 콜백
   * @private
   */
  function _onConnected() {
    var queue = MessageCollection.getQueue();
    if (queue.length) {
      _postMessages();
    } else {
      updateList();
    }
  }

  /**
   * input 박스에서 메세지를 포스팅 한다.
   */
  function postMessage() {
    var jqInput = $('#message-input');
    var msg = $.trim(jqInput.val());
    if (msg || _sticker) {
      MessageCollection.enqueue(msg, _sticker);
      _scrollToBottom(true);
      if (NetInterceptor.isConnected()) {
        _postMessages();
      }
    }
    $scope.message.content = "";
    jqInput.val('');
    _hideSticker();
  }

  /**
   * queue 에 있는 메세지들을 전부 posting 한다.
   * @private
   */
  function _postMessages() {
    var promise;
    var queue = MessageCollection.getQueue();
    var length = queue.length;

    if (!$scope.isPosting && length) {
      $scope.isPosting = true;
      //_isUpdateListLock = true;
      _.forEach(queue, function (msg) {
        if (!promise) {
          promise = _getPostPromise(msg, true);
        } else {
          promise = promise.then(
            _.bind(_getPostPromise, null, msg, true),
            _.bind(_getPostPromise, null, msg, false));
        }
      });

      if (promise) {
        promise.then(
          _.bind(_onSuccessPostMessages, null, length),
          _.bind(_onFailedPostMessages, null, length));
      } else {
        $scope.isPosting = false;
        //_isUpdateListLock = false;
      }
    }
  }

  /**
   * post promise 를 반환한다.
   * @param {object} msg
   * @param {boolean} isSuccess
   * @returns {*}
   * @private
   */
  function _getPostPromise(msg, isSuccess) {
    isSuccess = _.isBoolean(isSuccess) ? isSuccess : true;
    if (!isSuccess && !NetInterceptor.isConnected()) {
      MessageCollection.enqueue(msg.content, msg.sticker, true);
    } else {
      try {
        //analytics
        AnalyticsHelper.track(AnalyticsHelper.EVENT.MESSAGE_POST, {
          'RESPONSE_SUCCESS': true
        });
      } catch (e) {
      }
    }
    return messageAPIservice.postMessage(entityType, entityId, msg.content, msg.sticker);
  }

  /**
   * post message fail 핸들러
   * @param {number} length
   * @private
   */
  function _onFailedPostMessages(length) {
    //_isUpdateListLock = false;
    $scope.isPosting = false;
    var queue = MessageCollection.getQueue();
    var msg = queue[length - 1];
    MessageCollection.spliceQueue(0, length);
    if (!NetInterceptor.isConnected()) {
      MessageCollection.enqueue(msg.content, msg.sticker, true);
    }
    _onPostMessagesDone();
  }

  /**
   * post message 전부 성공시 핸들러
   * @param {number} length
   * @private
   */
  function _onSuccessPostMessages(length) {
    //_isUpdateListLock = false;
    $scope.isPosting = false;
    var queue = MessageCollection.getQueue();
    MessageCollection.spliceQueue(0, length);
    if (queue.length > 0) {
      _postMessages();
    } else {
      _onPostMessagesDone();
    }
  }

  /**
   * post 메세지가 완료된 후 콜백
   * @private
   */
  function _onPostMessagesDone() {
    if (!_hasLastMessage()) {
      _refreshCurrentTopic();
    }
    updateList();
    _scrollToBottom(true);
  }

  function editMessage(messageId, updateContent) {
    if (updateContent === "") return "";

    var message = {"content": updateContent};
    messageAPIservice.editMessage(entityType, entityId, messageId, message)
      .success(function(response) {
      })
      .error(function(response) {
        $state.go('error', {code: response.code, msg: response.msg, referrer: "messageAPIservice.editMessage"});
      });
  }


  function openModal(selector) {
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
  }

  function onClickUnshare(message, entity) {
    var property = {};
    var PROPERTY_CONSTANT = AnalyticsHelper.PROPERTY;
    fileAPIservice.unShareEntity(message.id, entity.id)
      .success(function() {
        //곧지워짐
        var entityType = $scope.currentEntity.type;

        var file_meta = (message.content.type).split("/");
        var share_data = {
          "entity type"   : entityType,
          "category"      : file_meta[0],
          "extension"     : message.content.ext,
          "mime type"     : message.content.type,
          "size"          : message.content.size
        };
        analyticsService.mixpanelTrack( "File Unshare", share_data );

        try {
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UNSHARE, {
            'RESPONSE_SUCCESS': true,
            'FILE_ID': message.id,
            'TOPIC_ID': entity.id
          });
        } catch (e) {
        }


      })
      .error(function(err) {
        try {
          AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UNSHARE, {
            'RESPONSE_SUCCESS': false,
            'ERROR_CODE': error.code
          });
        } catch (e) {
        }

        alert(err.msg);
      });
  }

  //  right controller is listening to 'updateFileWriterId'.
  function onFileListClick(userId) {
    if ($state.current.name != 'messages.detail.files')
      $state.go('messages.detail.files');
    $scope.$emit('updateFileWriterId', userId);
  }


  function log(string) {
    if (isLogEnabled) logger.log(string);
  }



  /**
   * keyUp 이벤트 핸들러
   * @param {event} keyUpEvent 키 업 이벤트
   */
  function onKeyUp(keyUpEvent) {
    var text = $(keyUpEvent.target).val();
    TextBuffer.set(text);
  }

  /**
   * keyDown 이벤트 핸들러
   * @param {event} keyDownEvent
   */
  function onKeyDown(keyDownEvent) {
    var keyCode = keyDownEvent.keyCode;
    if (jndKeyCode.match('ESC', keyCode)) {
      _hideSticker();
    }
  }

  function setCommentFocus(file) {
    if ($state.params.itemId != file.id) {
      $rootScope.setFileDetailCommentFocus = true;

      $state.go('files', {
        userName    : file.writer.name,
        itemId      : file.id
      });
    } else {
      fileAPIservice.broadcastCommentFocus();
    }
  }


  /**
   * max length 만큼 textarea 의 내용을 자른다.
   * @private
   */
  function _cutTextareaMaxLength() {
    var text = $('#message-input').val();
    if (text.length > TEXTAREA_MAX_LENGTH) {
      text = text.substring(0, TEXTAREA_MAX_LENGTH);
      $('#message-input').val(text);
      TextBuffer.set(text);
    }
  }

  function onShareClick(file) {
    fileAPIservice.openFileShareModal($scope, file);
  }

  function _hasBrowserFocus() {
    return !centerService.isBrowserHidden();
  }


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
    _hideNewMessageAlertBanner();
  }

  function _resetHasScrollToBottom() {
    $timeout(function() {
      $scope.hasScrollToBottom = false;
    });
  }


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
    if (hasMoreNewMessageToLoad()) {
      // Has more messages to load
      _refreshCurrentTopic();
    } else {
      // Already have latest message of current entity, just scroll down to it.
      _scrollToBottomWithAnimate();
    }
  }

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
    _showNewMessageAlertBanner();
    entityAPIservice.updateBadgeValue($scope.currentEntity, -1);
  }


  function _getEntityId() {
    return centerService.getEntityId();
  }



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
  function _onNewMessageArrived(angularEvent, msg) {
    console.log('::_onNewMessageArrived');

    if (!_isFromCache) {
      // If message is from me -> I just wrote a message -> Just scroll to bottom.
      if (centerService.isMessageFromMe(msg)) {
        _scrollToBottom(true);
        return;
      }

      // Message is not from me -> Someone just wrote a message.
      if (centerService.hasBottomReached()) {
        //log('window with focus')
        if (_hasBrowserFocus()) {
          _scrollToBottom(true);
          return;
        }
      }
      _gotNewMessage();
    }
  }

  /**
   * on new system message arrived
   * @private
   */
  function _onNewSystemMessageArrived() {
    //if (_hasLastMessage() && centerService.hasBottomReached()) {
    if (centerService.hasBottomReached()) {
      _scrollToBottomWithAnimate();
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
      markerService.putNewMarker(marker.memberId, marker.lastLinkId, MessageCollection.getLastLinkId());
    });

    MessageCollection.updateUnreadCount();
  }

  /**
   * Get room info.
   * If failed to get room info due to undefined 'currentRoomId', try once again. *only again
   *
   * + The same as Update unread count
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

  /**
   * chat 스크롤이 최 하단에 닿아있는지 여부를 반환한다.
   * @returns {boolean} 최 하단에 닿아있는지 여부
   * @private
   */
  function _isBottomReached() {
    return $('#msgs-container')[0].scrollTop + $('#msgs-container').height() >= $('#msgs-holder').outerHeight();
  }

  /**
   * 랜더링 repeat 가 끝났을 때 호출되는 함수
   */
  function onRepeatDone() {
    console.log('::onRepeatDone');
    jndPubSub.pub('onRepeatDone');

    _updateScroll();
  }

  /**
   * file comment delete handler.
   * Loop through messages list and find matching file comment.
   *
   * File comment delete -> Hide corresponding comment for now.
   *
   * TODO: this is still o(n). make it o(1)!!!!!
   */
  function onCenterOnFileCommentDeleted(event, param) {
    MessageCollection.remove(param.comment.id);
  }

  /**
   * Someone left current topic -> update markers
   * @param event
   * @param param
   * @private
   */
  function _onCenterOnTopicLeave(event, param) {
    // Someone left current topic -> update markers
    markerService.removeMarker(param.writer);
  }

  /**
   * Callback function for marker updated socket event.
   * @param event
   * @param param
   * @private
   */
  function _onCenterMarkerUpdated(event, param) {
    log('centerOnMarkerUpdated');
    markerService.updateMarker(param.marker.memberId, param.marker.lastLinkId);
    MessageCollection.updateUnreadCount();
  }

  /**
   * sticker change 시 이벤트 핸들러
   * @param {object} event
   * @param {object} item 스티커
   * @private
   */
  function _onChangeSticker(event, item) {
    _sticker = item;
    _setChatInputFocus();
  }

  /**
   * center file delete 시 이벤트 핸들러
   *
   * Listen to file delete event.
   * Find deleted file id from current list($scope.messages).
   * If current list contains deleted file, change its status to 'archived'.
   * TODO: Still o(n) algorithm.  too bad!! very bad!!! make it o(1) by using map.
   * @param event
   * @param param
   * @private
   */
  function _onCenterFileDeleted(event, param) {
    var deletedFileId = param.file.id;
    var isTitle;
    MessageCollection.forEach(function(message) {
      isTitle = !!(message.message && message.message.commentOption && message.message.commentOption.isTitle);
      if (centerService.isCommentType(message.message.contentType) && isTitle) {
        if (message.message.feedbackId === deletedFileId) {
          message.feedback.status = 'archived';
        }
      }
      if (message.message.id === deletedFileId) {
        message.message.status = 'archived';
      }
    });
  }

  /**
   * elastic resize 시 이벤트 핸들러
   *
   * when textarea gets resized, msd-elastic -> adjust function emits 'elastic:resize'.
   * listening to 'elastic:resize' and move msg-holder to right position.
   * @private
   */
  function _onElasticResize() {
    var jqInput = $('#message-input');
    // center controller의 content load가 완료 된 상태이고 chat 스크롤이 최 하단에 닿아있을때 scroll도 같이 수정
    if ($scope.isInitialLoadingCompleted && _isBottomReached()) {
      //_scrollToBottom();
    }
    _jqContainer.css('margin-bottom', jqInput.outerHeight() - 27);
  }

  /**
   * 입력된 text가 preview(social snippets)를 제공하는 경우 center controller에서의 handling
   *
   * 'attachMessagePreview' event에서 content가 attach되는 message의 식별자를 전달 받아
   * 해당 식별자로 특정 message를 다시 조회 하여 생성된 content data로 view를 생성하여 text element 자식 element로 append 함
   * @param event
   * @param data
   * @private
   */
  function _onAttachMessagePreview(event, data) {
    messageAPIservice
      .getMessage(memberService.getTeamId(), data.message.id)
      .success(function(response) {
        var messageId = response.id;
        var linkPreview = response.linkPreview;
        var message = MessageCollection.get(messageId, true);

        if (message) {
          message.message.linkPreview = linkPreview;
          if (centerService.isMessageFromMe(message) && _isBottomReached()) {
            _scrollToBottom();
          }
        }

        jndPubSub.pub('toggleLinkPreview', data.message.id);

      })
      .error(function(error) {
        console.log('link preview error', error);
      });
  }

  /**
   * 마지막으로 읽은 마커와 같은지 안 같은지 확인 후 unread bookmark를 보여줘야할지와 함께 연산해서 결과값을 리턴한다.
   * @param {number} linkId - 체크하고싶은 link id
   * @returns {boolean}
   */
  function isLastReadMarker(linkId) {
    linkId = parseInt(linkId, 10);
    return linkId === _lastReadMessageMarker && shouldDisplayUnreadMarker(linkId);
  }

  /**
   * unread bookmark를 보여줘야할지 말지 결정한다.
   * 1. 현재의 link아이디가 리스트가 가지고 있는 마지막 아이디어야 한다.
   * 2. _shouldDisplayBookmarkFlage 가 true 로 올러와야한다.
   * @param {number} linkId - link id to check
   * @returns {boolean}
   */
  function shouldDisplayUnreadMarker(linkId) {
    return linkId !== MessageCollection.getLastLinkId() && _shouldDisplayBookmarkFlag;
  }

  /**
   * _shouldDisplayBookmarkFlag의 값을 다시 체크한다.
   * _lastReadMessageMarker 가 현재 리스트의 마지막 링크아이디와 같은지 체크한다.
   * @private
   */
  function _updateUnreadBookmarkFlag() {
    console.log('::_updateUnreadBookmarkFlag', _lastReadMessageMarker, MessageCollection.getLastLinkId());

    if (_lastReadMessageMarker !== MessageCollection.getLastLinkId()) {
      _shouldDisplayBookmarkFlag = true;
    } else {
      _shouldDisplayBookmarkFlag = false;
    }
  }

  /**
   * 채팅 입력창 바로 위에 검은색 배너를 노출시킨다.
   * @private
   */
  function _showNewMessageAlertBanner() {
    $('#has-new-msg-banner').addClass('show');
  }

  /**
   * 채팅 입력창 바로 위에 검은색 배너를 숨킨다.
   * @private
   */
  function _hideNewMessageAlertBanner() {
    $('#has-new-msg-banner').removeClass('show');
  }
});
