/**
 * @fileoverview 다른 팀에 들어온 소켓이벤트를 처리하는 곳
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketOtherTeamManager', jndWebSocketOtherTeamManager);

  /* @ngInject */
  function jndWebSocketOtherTeamManager($timeout, accountService, OtherTeamNotification,
                                        EntityMapManager, memberService) {
    var _timeoutCaller;
    var _isWaiting = false;
    var _waitingMap = {};

    var _teamStatusMap = {};


    var OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP = 'other_team_topic_status';

    // 연속된 api call를 방지하기위해 기다리는 시간
    //var paddingTime = 5000;
    var paddingTime = 3000;

    this.onSocketEvent = onSocketEvent;

    /**
     * 다른 팀에 소켓이벤트가 왔을 때.
     * @param socketEvent
     */
    function onSocketEvent(socketEvent) {
      if (_isNewMessage(socketEvent) && !!socketEvent.teamId) {
        // 처리하려는 소켓이벤트는 무조건 팀아이디와 방의 정보가 있어야한다.

        // file_comment 일 경우 방의 정보가 rooms로 넘어오기때문에 처리한다.
        _getNotificationOnRoom(socketEvent);

        if (socketEvent.extFoundRoom) {
          // 방의 정보가 있다는 것, 노티를 보내도 된다는 것.
          _sendBrowserNotification(socketEvent);
        }
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
      var teamId = socketEvent.teamId;

      if (!_hasTeamMessageMarkers(teamId)) {
        // 해당 팀의 정보가 전혀 없을 때
        if (!_isWaitingOnTeamId(teamId)) {
          // 여러번 호출 되는 것을 방지
          _getTeamMessageMarkers(teamId, socketEvent);
        }
        return false;
      }

      return _isSubscriptionOn(teamId, socketEvent.room.id);
    }

    /**
     * 서버에 해당팀의 message markers를 요청한 후 roomId를 찾는다.
     * @param {number} teamId - message markers를 가지고 싶은 팀의 아이디
     * @param {number} roomId - subscribe 상태를 알고 싶은 방의 아이디
     * @param socketEvent
     * @private
     */
    function _getTeamMessageMarkers(teamId, socketEvent) {
      _setWaiting(teamId, true);

      var memberId;

      // 해당 팀의 정보가 전혀 없을 때
      EntityMapManager.create(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP);

      memberId = _getMemberId((teamId));

      memberService.getMemberInfo(memberId)
        .success(function(response) {
          EntityMapManager.set(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId, _getMessageMarkersMap(response.u_messageMarkers));

          _setWaiting(teamId, false);

          onSocketEvent(socketEvent);
        });
    }

    /**
     * local에 팀의 message markers를 들고 있는지 없는지 확인한다.
     * @param {number} teamId - 알고 싶은 팀의 아이디
     * @returns {*}
     * @private
     */
    function _hasTeamMessageMarkers(teamId) {
      return EntityMapManager.contains(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId);
    }

    /**
     * teamId에 해당하는 팀을 찾아 나의 memberId를 리턴한다.
     * @param {number} teamId - 찾고 싶은 팀의 아이디
     * @returns {*}
     * @private
     */
    function _getMemberId(teamId) {
      var memberId;
      var memberships = accountService.getAccount().memberships;

      _.forEach(memberships, function(membership) {
        if (teamId === membership.teamId) {
          memberId = membership.memberId;
          return false;
        }
      });

      return memberId;
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
     * teamId에 해당하는 팀에 있는 방들 중 roomId를 가진 방의 subscibe 값을 리턴한다.
     * @param {number} teamId - 알고 싶은 팀의 아이디
     * @param {number} roomId - 알고 싶은 방의 아이디
     * @returns {.data.subscribe|*}
     * @private
     */
    function _isSubscriptionOn(teamId, roomId) {
      var messageMarkersMap = EntityMapManager.get(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId);
      if (_.isUndefined(messageMarkersMap[roomId])) {
        return _getTeamMessageMarkers(teamId, roomId);
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

      if (_hasTimeoutCaller(teamId)) {
        timeoutCaller = _getTimeoutCaller(teamId);
        $timeout.cancel(timeoutCaller);
      }

      timeoutCaller = $timeout(function() {
        accountService.updateCurrentAccount();
        //DesktopNotification.addOtherTeamNotification(socketEvent);

        OtherTeamNotification.addNotification(socketEvent);
      }, paddingTime);

      _setTimeoutCaller(teamId, timeoutCaller);

    }

    /**
     * 해당 팀아이디의 정보를 호출하고 있는지 확인한다.
     * @param {number} teamId - 확인해보고 싶은 팀의 아이디
     * @returns {boolean}
     * @private
     */
    function _isWaitingOnTeamId(teamId) {
      return !!_teamStatusMap[teamId] && _teamStatusMap[teamId]['isWaiting'];
    }

    /**
     * 해당 팀의 정보를 얻고있다는 flag를 설정한다.
     * @param {number} teamId - 설정하려는 플래그의 팀의 아이디
     * @param {boolean} value - 설정하려는 값
     * @private
     */
    function _setWaiting(teamId, value) {
      _waitingMap[teamId] = value;

      var curValue = _teamStatusMap[teamId];

      if (_.isUndefined(curValue)) {
        _teamStatusMap[teamId] = {
          isWaiting: value
        };
      } else {
        curValue.isWaiting = value;
      }
    }

    function _hasTimeoutCaller(teamId) {
      return !!_teamStatusMap[teamId] && _teamStatusMap[teamId]['timeoutCaller'];
    }

    function _setTimeoutCaller(teamId, caller) {
      var curValue = _teamStatusMap[teamId];

      if (_.isUndefined(curValue)) {
        _teamStatusMap[teamId] = {
          timeoutCaller: caller
        }
      } else {
        curValue.timeoutCaller = caller;
      }
    }
    function _getTimeoutCaller(teamId) {
      return _teamStatusMap[teamId]['timeoutCaller'];

    }
    /**
     * socketEvent가 새로운 메세지 혹은 파일 커맨트에 관련된 이벤트인지 아닌지 확인한다.
     * @param {object} socketEvent - socket event object
     * @returns {boolean}
     * @private
     */
    function _isNewMessage(socketEvent) {
      if (socketEvent.event === 'message') {
        if (socketEvent.messageType === 'file_comment' || _.isUndefined(socketEvent.messageType)) {
          return true;
        }
      }
      return false;
    }
  }
})();
