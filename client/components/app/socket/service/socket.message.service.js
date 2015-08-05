(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('jndWebSocketMessage', jndWebSocketMessage);

  /* @ngInject */
  function jndWebSocketMessage(logger, jndWebSocketCommon, jndPubSub,
                               memberService, currentSessionHelper, DesktopNotification) {

    var MESSAGE = 'message';
    this.attachSocketEvent = attachSocketEvent;

    function attachSocketEvent(socket) {
      socket.on(MESSAGE, _onMessage);
    }

    function _onMessage(data) {
      var messageType = data.messageType || 'new_message';

      switch (messageType) {
        case 'file_comment':
          _onFileComment(data);
          break;
        case 'topic_leave':
          _onTopicLeave(data);
          break;
        case 'topic_join':
          _onTopicJoin(data);
          break;
        case 'file_share':
        case 'file_unshare':
          _onTopicFileShareStatusChange(data);
          break;
        case 'message_delete':
          _onTopicMessageDelete(data);
          break;
        case 'new_message':
        default:
          _onNewMessage(data);
          break;
      }

      //if (messageType === MESSAGE_FILE_COMMENT) {
      //  // File comment event is handled in different handler since its 'rooms' attribute is an array.
      //  jndWebSocketHelper.socketEventLogger(messageType, data, false);
      //  jndWebSocketHelper.messageEventFileCommentHandler(data);
      //} else if (messageType === MESSAGE_TOPIC_LEAVE) {
      //  jndWebSocketHelper.socketEventLogger(messageType, data, false);
      //  jndWebSocketHelper.messageEventTopicLeaveHandler(data);
      //} else if (messageType === MESSAGE_TOPIC_JOIN && currentSessionHelper.getDefaultTopicId() === data.room.id) {
      //  // Someone joined 'default topic' -> new member just joined team!!
      //  jndWebSocketHelper.newMemberHandler(data);
      //} else {
      //  if (messageType === MESSAGE_FILE_SHARE || messageType === MESSAGE_FILE_UNSHARE) {
      //    jndWebSocketHelper.messageEventFileShareUnshareHandler(data);
      //  }
      //
      //  messageType = messageType || _APP_GOT_NEW_MESSAGE;
      //
      //  jndWebSocketHelper.socketEventLogger(messageType, data, false);
      //  jndWebSocketHelper.eventStatusLogger(messageType, data);
      //
      //  jndWebSocketHelper.messageEventHandler(messageType, data);
      //}

    }

    /**
     * message -> file_comment event handler.
     * 코멘트가 달린 파일이 공유된 방중에 현재 보고있는 엔티티가 있다면 center만 업데이트한다.
     * right panel update는 file_comment_created 에서.
     * @param data
     * @private
     */
    function _onFileComment(data) {
      logger.socketEventLogger(data.event, data);

      var _hasNotificationOn = false;
      var _currentRoom;

      _.forEach(data.rooms, function(room) {
        _hasNotificationOn = _hasNotificationOn || memberService.isTopicNotificationOn(room.id);

        if (jndWebSocketCommon.isCurrentEntity(room)) {
          _currentRoom = room;
          jndPubSub.updateCenterPanel();
        }
      });

      // badge count를 올리기 위함이요.
      jndPubSub.updateLeftPanel();

      if (_hasNotificationOn) {
        if (_.isUndefined(_currentRoom)) {
          _currentRoom = data.rooms[0];
        }
        data.room = _currentRoom;
        _sendBrowserNotification(data, true);
      }
    }

    /**
     * message -> topic_leave event handler.
     * 누군가가 현재 topic을 나갔다면 센터를 업데이트한다.
     * 누군가가 어떤 topic을 나갔든지 left를 업데이트해서 해당하는 토픽의 정보를 갱신한다.
     * @param data
     * @private
     */
    function _onTopicLeave(data) {
      logger.socketEventLogger(data.event, data);
      _updateCenterPanelFromOthers(data);
    }

    /**
     * message -> topic_join event handler
     * @param data
     * @private
     */
    function _onTopicJoin(data) {
      logger.socketEventLogger(data.event, data);
      _updateCenterPanelFromOthers(data);
    }

    /**
     * 현재 보고 있는 토픽에 일어난 이벤트에만 센터를 업데이트한다.
     * @param data
     * @private
     */
    function _onTopicFileShareStatusChange(data) {
      logger.socketEventLogger(data.event, data);
      _updateCenterForCurrentEntity(data);
      _updateRight(data);
    }

    /**
     * message가 삭제되었을 때 현재 토픽이면 업데이트한다.
     * @param data
     * @private
     */
    function _onTopicMessageDelete(data) {
      logger.socketEventLogger(data.event, data);
      _updateCenterForCurrentEntity(data);
    }

    /**
     * 새로운 메세지가 작성되었을 경우
     * @param data
     * @private
     */
    function _onNewMessage(data) {
      logger.socketEventLogger(data.event, data);
      if (_isDmToMe(data)) {
        _onDm(data);
      } else {
        _onTopic(data);
      }
    }

    /**
     * 1:1 direct message가 왔을 경우
     * @param data
     * @private
     */
    function _onDm(data) {
      if (jndWebSocketCommon.isCurrentEntity(data.room)) {
        jndPubSub.updateCenterPanel();
      } else {
        jndPubSub.updateLeftChatList();
      }
      _sendBrowserNotification(data);
    }

    /**
     * 토픽으로 새로운 메세지가 왔을 경우
     * @param data
     * @private
     */
    function _onTopic(data) {
      if (jndWebSocketCommon.isCurrentEntity(data.room)) {
        jndPubSub.updateCenterPanel();
      } else {
        jndPubSub.updateLeftPanel();
      }

      if (memberService.isTopicNotificationOn(data.room.id)) {
        _sendBrowserNotification(data);
      }
    }

    /**
     * 나에게서로부터 온 이벤트가 아니라면 우선 왼쪽을 업데이트한다.
     * 현재 보고 있는 토픽에 관련된 이벤트라면 센터도 업데이트한다.
     * @param data
     * @private
     */
    function _updateCenterPanelFromOthers(data) {
      if (!jndWebSocketCommon.isActionFromMe(data.writer)) {
        _updateCenterForCurrentEntity(data);

        // TODO: left를 업데이트하는 이유는 해당토픽의 가장 최신 정보를 얻기귀함이다.
        // TODO: 만약 해당 토픽하나에 해당하는 정보를 얻을 수 있는 API가 있다면 그걸로 대체하는 것이 좋을 것같다.
        // - JIHOON
        jndPubSub.updateLeftPanel();
      }
    }

    /**
     * data.room이 현재 보고 있는 토픽일때만 센터를 업데이트한다.
     * @param data
     * @private
     */
    function _updateCenterForCurrentEntity(data) {
      if (jndWebSocketCommon.isCurrentEntity(data.room)) {
        jndPubSub.updateCenterPanel();
      }
    }

    /**
     * right panel에 update 정보를 전달한다.
     * @param data
     * @private
     */
    function _updateRight(data) {
      jndPubSub.updateRightPanel(data);
    }

    /**
     * 나에게 1:1 메세지가 온 것인지 아닌지 확인한다.
     * @param data
     * @returns {boolean}
     * @private
     */
    function _isDmToMe(data) {
      var room = data.room;
      var myId = memberService.getMemberId();
      var foundMyself = false;
      var memberList;

      if (room.type === 'chat') {
        memberList = room.members;
        if (!!memberList && memberList.length > 0) {
          _.forEach(memberList, function(memberId) {
            if (memberId === myId) {
              foundMyself = true;
              return false;
            }
          });
        }
      }
      return foundMyself;
    }

    /**
     * browser notification을 보낸다.
     * @param data
     * @private
     */
    function _sendBrowserNotification(data, isFileComment) {
      if (_shouldSendNotification(data)) {
        DesktopNotification.addNotification(data, jndWebSocketCommon.getActionOwner(data.writer), jndWebSocketCommon.getRoom(data.room), !!isFileComment);
      }
    }

    /**
     * 노티피케이션을 보내야하는 상황인지 아닌지 확인한다.
     * @param {object} writer - 노티를 보낸 사람
     * @param {boolean} isCurrentEntity - 현재 엔티티인지 아닌지 알려주는 flag
     * @returns {boolean}
     * @private
     */
    function _shouldSendNotification(data) {
      var returnVal = true;
      if (jndWebSocketCommon.isActionFromMe(data.writer)) {
        // 내가 보낸 노티일 경우
        returnVal = false;
      }

      if (jndWebSocketCommon.isCurrentEntity(data.room) && !currentSessionHelper.isBrowserHidden()) {
        // 현재 보고있는 토픽에 노티가 왔는데 브라우져가 focus를 가지고 있을 때
        returnVal = false;
      }
      return returnVal;
    }
  }
})();
