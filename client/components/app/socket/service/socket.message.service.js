(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketMessage', jndWebSocketMessage);

  /* @ngInject */
  function jndWebSocketMessage(jndWebSocketCommon, jndPubSub, entityAPIservice, TopicInvitedNotification,
                               memberService, currentSessionHelper, DesktopNotification, FileShareDesktopNotification) {

    var MESSAGE = 'message';

    var MESSAGE_STARRED = 'message_starred';
    var MESSAGE_UNSTARRED = 'message_unstarred';

    var events = [
      {
        name: MESSAGE,
        version: 1,
        handler: _onMessage
      },
      {
        name: MESSAGE_STARRED,
        version: 1,
        handler: _onMessageStarred
      },
      {
        name: MESSAGE_UNSTARRED,
        version: 1,
        handler: _onMessageUnStarred
      }
    ];

    this.getEvents = getEvents;

    function getEvents() {
      return events;
    }

    /**
     * starred message 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onMessageStarred(socketEvent) {
      var data = socketEvent.data;

      if (parseInt(memberService.getMemberId(), 10) === parseInt(data.memberId, 10)) {
        jndPubSub.pub('message:starred', data);
      }
    }

    /**
     * unStarred message 이벤트 핸들러
     * @param {object} socketEvent
     * @private
     */
    function _onMessageUnStarred(socketEvent) {
      var data = socketEvent.data;
      if (parseInt(memberService.getMemberId(), 10) === parseInt(data.memberId, 10)) {
        jndPubSub.pub('message:unStarred', data);
      }
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
          _onFileShared(data);
          _onTopicFileShareStatusChange(data);
          break;
        case 'file_unshare':
          _onTopicFileShareStatusChange(data);
          break;
        case 'message_delete':
          _onTopicMessageDelete(data);
          break;
        case 'topic_invite':
          _onTopicInvited(data);
          _onNewMessage(data);
          break;
        case 'new_message':
        default:
          _onNewMessage(data);
          break;
      }
    }

    /**
     * message -> file_comment event handler.
     * 코멘트가 달린 파일이 공유된 방중에 현재 보고있는 엔티티가 있다면 center만 업데이트한다.
     * right panel update는 file_comment_created 에서.
     * @param data
     * @private
     */
    function _onFileComment(data) {
      var room;

      _.forEach(data.rooms, function(room) {
        if (jndWebSocketCommon.isCurrentEntity(room)) {
          // 현재 해당 room을 보고 있는경우
          jndPubSub.updateCenterPanel();
        }
      });

      if (room = jndWebSocketCommon.getNotificationRoom(data.rooms)) {
        // badge count를 올리기 위함이요.
        jndPubSub.updateLeftPanel();
        data.room = room;
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
      _updateCenterPanelFromOthers(data);

      jndPubSub.pub('topicLeave', data);
    }

    /**
     * message -> topic_join event handler
     * @param data
     * @private
     */
    function _onTopicJoin(data) {
      _updateCenterPanelFromOthers(data);
    }

    /**
     * message -> file_share 일때
     * @param {object} data - socket event parameter
     * @private
     */
    function _onFileShared(data) {
      var room = data.room;

      if (jndWebSocketCommon.isChatType(room)) {
        // 1:1 dm일 경우에는 _onDm이 handle하게 놔둔다.
        _onDm(data);
      } else if (_shouldSendNotification(data)) {
        if (memberService.isTopicNotificationOn(room.id)) {
          FileShareDesktopNotification.addNotification(data);
        }
      }
    }

    /**
     * 현재 보고 있는 토픽에 일어난 이벤트에만 센터를 업데이트한다.
     * @param data
     * @private
     */
    function _onTopicFileShareStatusChange(data) {

      // 현재 토픽이라면 센터를 업데이트하고 아니라면 왼쪽을 업데이트한다
      if (jndWebSocketCommon.isCurrentEntity(data.room)) {
        jndPubSub.updateCenterPanel();
      } else {
        jndPubSub.updateLeftPanel();
      }

      _updateRight(data);
    }

    /**
     * 누군가가 누군가를 토픽에 초대했을 경우 발생된다.
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _onTopicInvited(socketEvent) {
      if (jndWebSocketCommon.hasMyId(socketEvent.inviter)) {
        if (_shouldSendNotification(socketEvent)) {
          TopicInvitedNotification.addNotification(socketEvent);
        }
      }

      jndPubSub.pub('topicInvite', socketEvent);
    }

    /**
     * message가 삭제되었을 때 현재 토픽이면 업데이트한다.
     * @param data
     * @private
     */
    function _onTopicMessageDelete(data) {
      if (jndWebSocketCommon.isCurrentEntity(data.room)) {
        jndPubSub.updateCenterPanel();
      }

      // 뱃지를 업데이트하기 위함이요.
      jndPubSub.updateLeftPanel();

      jndPubSub.pub('topicMessageDelete', data);
    }

    /**
     * 새로운 메세지가 작성되었을 경우
     * @param data
     * @private
     */
    function _onNewMessage(data) {
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
      data.room.extWriterId = data.writer;

      if (jndWebSocketCommon.isCurrentEntity(data.room)) {
        jndPubSub.updateCenterPanel();
      }

      jndPubSub.pub('updateChatList');

      if (data.messageType === 'file_share') {
        // file_share일 경우
        if (!jndWebSocketCommon.isActionFromMe(data.room.extWriterId)) {
          // 내가 보낸 file_share가 아닌 경우에만 노티를 보낸다.
          FileShareDesktopNotification.addNotification(data);
        }
      } else {
        _sendBrowserNotification(data);
      }
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
        jndPubSub.updateLeftBadgeCount();
      }

      if (_hasMention(data)) {
        _sendMentionNotification(data);
      } else if (memberService.isTopicNotificationOn(data.room.id)) {
        _sendBrowserNotification(data);
      }
    }

    /**
     * 나에대한 mention이 있는지 없는지 확인한다.
     * @param data
     * @returns {boolean}
     * @private
     */
    function _hasMention(data) {
      var mentionList = data.mentions;
      var foundMentionToMe = false;
      _.each(mentionList, function(mentionObj) {
        if (mentionObj.id === memberService.getMemberId()) {
          foundMentionToMe = true;
          return false;
        }
      });
      return foundMentionToMe;
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
      jndPubSub.pub('onChangeShared', data);
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
     * mention용 browser notification을 보낸다.
     * @param {object} data - message socket event를 통해서 들어온 data
     * @private
     */
    function _sendMentionNotification(data) {
      if (_shouldSendNotification(data)) {
        DesktopNotification.sendMentionNotification(data, jndWebSocketCommon.getActionOwner(data.writer), jndWebSocketCommon.getRoom(data.room));
      }
    }

    /**
     * 노티피케이션을 보내야하는 상황인지 아닌지 확인한다.
     * @param {object} data - socket event parameter
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
