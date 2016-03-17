/**
 * @fileoverview 다른 팀에 들어온 소켓이벤트를 처리하는 곳
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketOtherTeamManager', jndWebSocketOtherTeamManager);

  /* @ngInject */
  function jndWebSocketOtherTeamManager($timeout, accountService, OtherTeamNotification, jndPubSub, jndWebSocketCommon,
                                        EntityMapManager, memberService, jndWebSocketOtherTeamManagerHelper,
                                        DesktopNotificationUtil) {
    var VERSION = 1;

    var OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP = 'other_team_topic_status';
    var ROOM_SUBSCRIPTION_UPDATED = 'room_subscription_updated';

    var MESSAGE = 'message';
    var MESSAGE_TYPE_FILE_SHARE = 'file_share';
    var MESSAGE_TYPE_FILE_COMMENT = 'file_comment';
    var MESSAGE_TYPE_MESSAGE_DELETED = 'message_delete';
    var FILE_COMMENT_DELETED = 'file_comment_deleted';

    var TIMEOUT_CALLER = 'timeout_caller';
    var IS_WAITING = 'is_waiting';
    var MEMBER_ID = 'member_id';
    var LAST_LINK_ID = 'last_link_id';

    // 연속된 api call를 방지하기위해 기다리는 시간
    //var paddingTime = 5000;
    var paddingTime = 3000;

    var _markerMap = {};

    this.onSocketEvent = onSocketEvent;

    /**
     * 다른 팀에 소켓이벤트가 왔을 때.
     * @param socketEvent
     */
    function onSocketEvent(socketEvent) {
      //TODO: 다른 핸들러와 동일하게 각각 이벤트에 구독할 version 정보를 설정할 수 있도록 리펙토링 필요
      if (socketEvent.version === VERSION) {
        _setLastLinkId(socketEvent);

        if (_isRoomMarkerUpdatedByMe(socketEvent)) {
          //타팀의 marker 변경시
          _updateOtherTeamUnreadAlert();
        } else if (_isRoomSubscriptionUpdated(socketEvent)) {
          //타팀의 모든 알림 설정 변경 시
          _onRoomSubscriptionUpdated(socketEvent);
        } else if (_shouldUpdateBadgeCountOnly(socketEvent)) {
          //뱃지 카운트 변경 발생하는 모든 소켓 이벤트
          _updateBadgeCountOnly(socketEvent);
        } else if (_shouldBeNotified(socketEvent) && !!socketEvent.teamId) {
          // 처리하려는 소켓이벤트는 무조건 팀아이디와 방의 정보가 있어야한다.
          _notificationSender(socketEvent);
        }
        //todo: team domain 변경 및 team name 변경에 대한 소켓 이벤트 필요.
      }
    }

    /**
     * 노티피케이션을 보내기 전에 확인해야할 것들과 추가해야하는 부분들을 추가한다.
     * @param {object} socketEvent - socket event parameter
     * @private
     */
    function _notificationSender(socketEvent) {
      if (_.isUndefined(socketEvent.extHasProcessedOnce)) {
        // 한 번 처리한 소켓이벤트를 다시 처리하지 않기위함이다.
        socketEvent.extHasProcessedOnce = false;
      }

      // file_comment 일 경우 방의 정보가 rooms로 넘어오기때문에 처리한다.
      _getNotificationOnRoom(socketEvent);

      if (socketEvent.extFoundRoom || _hasMention(socketEvent)) {
        // 방의 정보가 있다는 것, 노티를 보내도 된다는 것.
        _sendBrowserNotification(socketEvent);
      }
    }

    /**
     * 다른 팀의 토픽들중 하나의 subscription status가 변경되었을 때 호출된다.
     * socketEvent에 해당하는 방의 notification status를 업데이트한다.
     * @param {object} socketEvent - socket event로 들어온 parameter
     * @private
     */
    function _onRoomSubscriptionUpdated(socketEvent) {
      var messageMarkersMap;

      var data = socketEvent.data;
      var teamId = data.teamId;
      var roomId = data.roomId;
      var newValue = data.subscribe;

      var tempMessageMarkerObj;


      if (_hasTeamMessageMarkers(teamId)) {
        // 팀에 대한 정보가 있을때
        messageMarkersMap = _markerMap[teamId];
        //messageMarkersMap = EntityMapManager.get(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId);
        var roomInfo = messageMarkersMap[roomId];

        if (_.isUndefined(roomInfo)) {
          // 방에 대한 정보가 없을때 새로 만듬
          roomInfo = {
            subscribe: newValue
          }
        } else {
          // 방에 대한 정보가 있을 때에는, 기존 정보를 업데이트
          roomInfo['subscribe'] = newValue;
        }

        messageMarkersMap[roomId] = roomInfo;
      } else {
        // 해당 팀의 정보가 전혀 없을 때
        //EntityMapManager.create(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP);

        tempMessageMarkerObj = {
          roomId: {
            subscribe: newValue
          }
        };

        // 새로 만든다
        _markerMap[teamId] = tempMessageMarkerObj;
        //EntityMapManager.set(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId, tempMessageMarkerObj);
        // todo: 아니면 그냥 그 팀 정보를 다 가져올까요?
        //_getTeamMessageMarkers(teamId, socketEvent);

      }
    }

    /**
     * 방의 정보가 어레이로 넘어올때, 그 중 노티가 켜져있는 방이 있는지 없는지 확인한다.
     * @param rooms
     * @param teamId
     * @returns {*}
     * @private
     */
    function _getNotificationOnRoom(socketEvent) {
      var rooms = socketEvent.rooms || [socketEvent.room];

      socketEvent.extFoundRoom = false;

      _.forEach(rooms, function(room) {
        socketEvent.room = room;
        if (_hasNotificationOn(socketEvent)) {
          socketEvent.extFoundRoom = true;
          return false;
        }
      });
    }

    /**
     * socketEvent가 속한 방의 노티피케이션 상태가 켜져있는지 꺼져있는지 확인한다.
     * @param socketEvent
     * @private
     */
    function _hasNotificationOn(socketEvent) {
      var teamId = _getTeamId(socketEvent);

      if (!_hasTeamMessageMarkers(teamId)) {
        // 해당 팀의 정보가 전혀 없을 때
        _getTeamMessageMarkers(teamId, socketEvent);
        return false;
      }

      return _isSubscriptionOn(teamId, socketEvent);
    }

    /**
     * local에 팀의 message markers를 들고 있는지 없는지 확인한다.
     * @param {number} teamId - 알고 싶은 팀의 아이디
     * @returns {*}
     * @private
     */
    function _hasTeamMessageMarkers(teamId) {
      return !!_markerMap[teamId];
      //return EntityMapManager.contains(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId);
    }

    /**
     * 서버에 해당팀의 message markers를 요청한 후 roomId를 찾는다.
     * @param {number} teamId - message markers를 가지고 싶은 팀의 아이디
     * @param {object} socketEvent - socket event parameter
     * @param socketEvent
     * @private
     */
    function _getTeamMessageMarkers(teamId, socketEvent) {

      if (!_isWaitingOnTeamId(teamId) && !socketEvent.extHasProcessedOnce) {

        // 여러번 호출 되는 것을 방지
        _setWaiting(teamId, true);

        var memberId;

        // 해당 팀의 정보가 전혀 없을 때
        //EntityMapManager.create(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP);

        memberId = _getMemberId((teamId));

        memberService.getMemberInfo(memberId, 'socket_team_marker')
          .success(function(response) {
            _markerMap[teamId] = _getMessageMarkersMap(response.u_messageMarkers);
            //EntityMapManager.set(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId, _getMessageMarkersMap(response.u_messageMarkers));

            _setWaiting(teamId, false);

            //같은 소켓이벤트로 계속 불리는 것을 방지하기 위함이다.
            socketEvent.extHasProcessedOnce = true;
            onSocketEvent(socketEvent);
          });
      }
    }

    /**
     * teamId에 해당하는 팀에 있는 방들 중 roomId를 가진 방의 subscibe 값을 리턴한다.
     * @param {number} teamId - 알고 싶은 팀의 아이디
     * @param {object} socketEvent - socket event parameter
     * @returns {.data.subscribe|*}
     * @private
     */
    function _isSubscriptionOn(teamId, socketEvent) {
      //var messageMarkersMap = EntityMapManager.get(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId);
      var messageMarkersMap = _markerMap[teamId];
      var roomId = socketEvent.room.id;

      if (_.isUndefined(messageMarkersMap[roomId])) {
        if (socketEvent.room.type !== 'channel') {
          // 방에대한 정보가 없을 때. 방의 타입이 channel이라면 그 것은 조인되어있지 않는 채널! 그럴땐 무시한다.
          // 방의 타입이 채널이 아닐 경우는 1. privateGroup 혹은 2. direct message 일때이다.
          _getTeamMessageMarkers(teamId, socketEvent);
        }
        return false;
      }

      return messageMarkersMap[roomId].subscribe;

    }

    /**
     * socketEvent으로 browser notification를 날린다.
     * @param {object} socketEvent - socket event
     * @private
     */
    function _sendBrowserNotification(socketEvent) {
      var teamId = socketEvent.teamId;
      var timeoutCaller;

      if (jndWebSocketOtherTeamManagerHelper.has(teamId, TIMEOUT_CALLER)) {
        timeoutCaller = _getTimeoutCaller(teamId);
        $timeout.cancel(timeoutCaller);
      }

      timeoutCaller = $timeout(function() {

        if (DesktopNotificationUtil.isAllowSendNotification()) {
          OtherTeamNotification.show(socketEvent);
        }

        _afterNotificationSent(teamId, socketEvent);
      }, paddingTime);

      jndWebSocketOtherTeamManagerHelper.set(teamId, TIMEOUT_CALLER, timeoutCaller);
    }

    /**
     * 해당 팀에 대한 browser notification을 보낸 후 처리해야할 일들의 모음이다.
     * @param {number} teamId - browser notification을 보낸 팀의 아이디
     * @param {object} socketEvent - socket event로 들어온 paramter
     * @private
     */
    function _afterNotificationSent(teamId, socketEvent) {

      _updateOtherTeamUnreadAlert();

      jndPubSub.pub('jndWebSocketOtherTeam:afterNotificationSend');

      // 혹시 모르니 $timeout을 cancel 시킨다.
      var timeout = _getTimeoutCaller(teamId);
      $timeout.cancel(timeout);
    }

    /**
     * entityId를 key로 하는 맵을 새로 만든다.
     * @param {array} messageMarkers - server로부터 내려온 member model에 있는 u_messageMarkers와 동일
     * @returns {{}}
     * @private
     */
    function _getMessageMarkersMap(messageMarkers) {
      var _messageMarkers = {};

      _.forEach(messageMarkers, function(messageMarker) {
        _messageMarkers[messageMarker.entityId] = messageMarker;
      });

      return _messageMarkers;
    }

    /**
     * socket event 가 나를 향한 멘션을 들고 있는지 없는지 확인한다.
     * @param {object} socketEvent - socket event param
     * @returns {boolean}
     * @private
     */
    function _hasMention(socketEvent) {
      var _foundMentionToMe = false;
      var _teamId = _getTeamId(socketEvent);
      var _myId = _getMemberId(_teamId);

      if (!!socketEvent.mentions) {
        _.forEach(socketEvent.mentions, function(mention) {
          if (mention.id === _myId) {
            _foundMentionToMe = true;
            return false;
          }
        });
      }
      return _foundMentionToMe;
    }

    /**
     * badge count만 업데이트한다.
     * @param {object} socketEvent - socket event param
     * @private
     */
    function _updateBadgeCountOnly(socketEvent) {
      _updateOtherTeamUnreadAlert();
    }

    /**
     * 해당 팀아이디의 정보를 호출하고 있는지 확인한다.
     * @param {number} teamId - 확인해보고 싶은 팀의 아이디
     * @returns {boolean}
     * @private
     */
    function _isWaitingOnTeamId(teamId) {
      return jndWebSocketOtherTeamManagerHelper.isWaitingOnTeamId(teamId, IS_WAITING);
    }

    /**
     * 해당 팀의 정보를 얻고있다는 flag를 설정한다.
     * @param {number} teamId - 설정하려는 플래그의 팀의 아이디
     * @param {boolean} value - 설정하려는 값
     * @private
     */
    function _setWaiting(teamId, value) {
      jndWebSocketOtherTeamManagerHelper.set(teamId, IS_WAITING, value);
    }

    /**
     * 해당 teamId로 실행되어지고 있는 timeout을 가져온다.
     * @param {number} teamId - timeout을 실행시키고 있는 팀의 아이디
     * @returns {*}
     * @private
     */
    function _getTimeoutCaller(teamId) {
      return jndWebSocketOtherTeamManagerHelper.get(teamId, TIMEOUT_CALLER);
    }

    /**
     * teamId에 해당하는 팀을 찾아 나의 memberId를 리턴한다.
     * @param {number} teamId - 찾고 싶은 팀의 아이디
     * @returns {*}
     * @private
     */
    function _getMemberId(teamId) {

      var memberId;

      if (!jndWebSocketOtherTeamManagerHelper.has(teamId, MEMBER_ID)) {
        _findMemberId(accountService.getAccount().memberships, teamId);
      }

      memberId = jndWebSocketOtherTeamManagerHelper.get(teamId, MEMBER_ID);

      return memberId;
    }

    /**
     * 현재 어카운트의 memberships 정보를 통해 teamId에 대응하는 memberId를 찾아서 리턴한다.
     * @param {array} memberships - 현재 어카운트의 멤버쉽 정보
     * @param {number} teamId - 찾고 싶은 팀의 아이디
     * @returns {*}
     * @private
     */
    function _findMemberId(memberships, teamId) {
      var memberId;

      _.forEach(memberships, function(membership) {
        if (teamId === membership.teamId) {
          memberId = membership.memberId;
          jndWebSocketOtherTeamManagerHelper.set(teamId, MEMBER_ID, memberId);
          return false;
        }
      });

      return memberId;
    }

    function _isRoomMarkerUpdatedByMe(socketEvent) {
      if (socketEvent.event === 'room_marker_updated') {
        if (socketEvent.marker.memberId === _getMemberId(socketEvent.teamId)) {
          return true;
        }
      }
      return false;
    }

    /**
     * socketEvent가 'room_subscription_updated'인지 아닌지 확인한다.
     * @param {object} socketEvent - socket event로 들어온 parameter와 동일
     * @returns {boolean}
     * @private
     */
    function _isRoomSubscriptionUpdated(socketEvent) {
      return socketEvent.event === ROOM_SUBSCRIPTION_UPDATED;
    }

    /**
     * browser notification은 보내면 안되지만 다른 팀의 뱃지카운트는 업데이트 해야하는 경우인지 아닌지 확인한다.
     * 예를 들면 메세지 삭제/파일 언쉐어 등등 생겼던 content가 없어지는 경우가 여기에 해당되지않나 조심스레 예측해본다.
     * @param {object} socketEvent - socket event parameter
     * @returns {boolean}
     * @private
     */
    function _shouldUpdateBadgeCountOnly(socketEvent) {
      var returnValue = false;

      if (socketEvent.event === MESSAGE && socketEvent.messageType === MESSAGE_TYPE_MESSAGE_DELETED) {
        returnValue = true;
      }
      if (socketEvent.event === FILE_COMMENT_DELETED) {
        returnValue = true
      }

      return returnValue;
    }

    /**
     * 현재 소켓이벤트를 browser notification으로 날려야할지 말지 알아보자.
     * @param {object} socketEvent - socket event param
     * @returns {boolean}
     * @private
     */
    function _shouldBeNotified(socketEvent) {
      return _isNewMessage(socketEvent);
    }

    /**
     * socketEvent가 새로운 메세지 혹은 파일 커맨트에 관련된 이벤트인지 아닌지 확인한다.
     * @param {object} socketEvent - socket event object
     * @returns {boolean}
     * @private
     */
    function _isNewMessage(socketEvent) {
      if (socketEvent.event === MESSAGE) {
        //일반 메시지 혹은 스티커는 messageType === undefined 이다
        if (socketEvent.messageType === MESSAGE_TYPE_FILE_COMMENT || socketEvent.messageType === MESSAGE_TYPE_FILE_SHARE || _.isUndefined(socketEvent.messageType)) {
          return true;
        }
      }
      return false;
    }

    /**
     * 화면 왼쪽 상단에 위치한 '팀' 메뉴에 쩜의 유무를 업데이트하기위해서 어카운트정보를 업데이트한다.
     * @private
     */
    function _updateOtherTeamUnreadAlert() {
      accountService.updateCurrentAccount();
    }

    /**
     * socketEvent에 해당하는 팀의 lastLinkId를 설정한다.
     * @param {object} socketEvent - socket event param
     * @private
     */
    function _setLastLinkId(socketEvent) {
      var teamId = _getTeamId(socketEvent);
      var result = jndWebSocketCommon.getLastLinkId(socketEvent);

      if (result.hasFound) {
        jndWebSocketOtherTeamManagerHelper.set(teamId, LAST_LINK_ID, result.value);
      }
    }

    /**
     * TODO: 추후에 고도화 작업할때 LAST LINK ID를 보고 업데이트 할지 안할지 결정할 것. -JIHOON
     * socketEvent에 해당하는 팀의 lastLinkId를 가져온다.
     * @param {object} socketEvent - socket event param
     * @returns {*}
     * @private
     */
    function _getLastLinkId(socketEvent) {
      return jndWebSocketOtherTeamManagerHelper.get(_getTeamId(socketEvent), LAST_LINK_ID);
    }

    /**
     * socketEvent에 해당하는 팀이 lastLinkId를 가지고 있는지 없는지 확인한다.
     * @param {object} socketEvent - socket event param
     * @returns {boolean}
     * @private
     */
    function _hasLastLinkId(socketEvent) {
      return jndWebSocketOtherTeamManagerHelper.has(_getTeamId(socketEvent), LAST_LINK_ID);
    }

    /**
     * socketEvent에서 teamId를 추출해낸다(원시적인 방법으로).
     * @param {object} socketEvent - socket event param
     * @returns {*}
     * @private
     */
    function _getTeamId(socketEvent) {
      return socketEvent.teamId || (!!socketEvent.data && socketEvent.data.teamId) || (!!socketEvent.team && socketEvent.team.id);
    }
  }
})();
