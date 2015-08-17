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
    var _teamStatusMap = {};

    var OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP = 'other_team_topic_status';
    var ROOM_SUBSCRIPTION_UPDATED = 'room_subscription_updated';

    // 연속된 api call를 방지하기위해 기다리는 시간
    //var paddingTime = 5000;
    var paddingTime = 3000;

    this.onSocketEvent = onSocketEvent;

    /**
     * 다른 팀에 소켓이벤트가 왔을 때.
     * @param socketEvent
     */
    function onSocketEvent(socketEvent) {
      if (_isRoomSubscriptionUpdated(socketEvent)) {
        _onRoomSubscriptionUpdated(socketEvent);
      } else if (_isNewMessage(socketEvent) && !!socketEvent.teamId) {
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
     * 다른 팀의 토픽들중 하나의 subscription status가 변경되었을 때 호출된다.
     * @param {object} socketEvent - socket event로 들어온 parameter
     * @private
     */
    function _onRoomSubscriptionUpdated(socketEvent) {
      var messageMarkersMap;

      var data = socketEvent.data;

      var teamId = data.teamId;
      var roomId = data.roomId;
      var newValue = data.subscribe;

      if (_hasTeamMessageMarkers(teamId)) {
        // 팀에 대한 정보가 있을때
        messageMarkersMap = EntityMapManager.get(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId);
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
        // 팀에 대한 정보가 없을 때
        var tempMessageMarkerObj = {
          roomId: {
            subscribe: newValue
          }
        };

        // 새로 만든다
        EntityMapManager.set(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId, tempMessageMarkerObj);
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
      var teamId = socketEvent.teamId;

      if (!_hasTeamMessageMarkers(teamId)) {
        // 해당 팀의 정보가 전혀 없을 때
        if (!_isWaitingOnTeamId(teamId)) {
          // 여러번 호출 되는 것을 방지
          _getTeamMessageMarkers(teamId, socketEvent);
        }
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
      return EntityMapManager.contains(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId);
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
     * @param {object} socketEvent - socket event parameter
     * @returns {.data.subscribe|*}
     * @private
     */
    function _isSubscriptionOn(teamId, socketEvent) {
      var messageMarkersMap = EntityMapManager.get(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId);
      var roomId = socketEvent.room.id;
      if (_.isUndefined(messageMarkersMap[roomId])) {
        // 방에대한 정보가 없을 때.
        _getTeamMessageMarkers(teamId, socketEvent);
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

      if (_hasTimeoutCaller(teamId)) {
        timeoutCaller = _getTimeoutCaller(teamId);
        $timeout.cancel(timeoutCaller);
      }

      timeoutCaller = $timeout(function() {
        // 어카운트 정보를 업데이트해야 화면 왼쪽 상단에 위치한 '팀' 메뉴에 붙어있는 파란색 점을 업데이트할 수 있음
        accountService.updateCurrentAccount();

        OtherTeamNotification.addNotification(socketEvent);

        _afterNotificationSent(teamId, socketEvent);
      }, paddingTime);

      _setTimeoutCaller(teamId, timeoutCaller);

    }

    /**
     * 해당 팀에 대한 browser notification을 보낸 후 처리해야할 일들의 모음이다.
     * @param {number} teamId - browser notification을 보낸 팀의 아이디
     * @param {object} socketEvent - socket event로 들어온 paramter
     * @private
     */
    function _afterNotificationSent(teamId, socketEvent) {
      // 혹시 모르니 $timoue을 cancel 시킨다.
      var timeout = _getTimeoutCaller(teamId);
      $timeout.cancel(timeout);
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
      var curValue = _teamStatusMap[teamId];

      if (_.isUndefined(curValue)) {
        _teamStatusMap[teamId] = {
          isWaiting: value
        };
      } else {
        curValue.isWaiting = value;
      }
    }

    /**
     * 해당 teamId로 이미 timeout이 실행되고있는지 없는지 확인한다.
     * @param {number} teamId - 확인하고 싶은 팀의 아이디
     * @returns {boolean|*}
     * @private
     */
    function _hasTimeoutCaller(teamId) {
      return !!_teamStatusMap[teamId] && !!_teamStatusMap[teamId]['timeoutCaller'] && _teamStatusMap[teamId]['timeoutCaller'];
    }

    /**
     * 해당 teamId로 실행된 timeout을 저장한다.
     * @param {number} teamId - timeout을 실행한 팀의 아이디
     * @param {object} caller - timeout promise
     * @private
     */
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

    /**
     * 해당 teamId로 실행되어지고 있는 timeout을 가져온다.
     * @param {number} teamId - timeout을 실행시키고 있는 팀의 아이디
     * @returns {*}
     * @private
     */
    function _getTimeoutCaller(teamId) {
      return _teamStatusMap[teamId]['timeoutCaller'];
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
     * socketEvent가 'room_subscription_updated'인지 아닌지 확인한다.
     * @param {object} socketEvent - socket event로 들어온 parameter와 동일
     * @returns {boolean}
     * @private
     */
    function _isRoomSubscriptionUpdated(socketEvent) {
      return socketEvent.event === ROOM_SUBSCRIPTION_UPDATED;
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
