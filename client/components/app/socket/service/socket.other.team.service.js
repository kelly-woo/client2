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

    var OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP = 'other_team_topic_status';

    // 다른 팀의 토픽들의 subscription setting을 저장한다.
    var _otherTeamSubscriptionMap = {};


    // 연속된 api call를 방지하기위해 기다리는 시간
    //var paddingTime = 5000;
    var paddingTime = 0;

    this.onSocketEvent = onSocketEvent;

    /**
     * 다른 팀에 소켓이벤트가 왔을 때, 최대 10초 기다렸다가
     * 현재 어카운트 정보를 업데이트한다.
     * @param socketEvent
     */
    function onSocketEvent(socketEvent) {
      console.log(socketEvent)
      var _teamId;
      if (_isNewMessage(socketEvent) && !!socketEvent.teamId) {

        // 처리하려는 소켓이벤트는 무조건 팀아이디와 방의 정보가 있어야한다.
        _teamId = socketEvent.teamId;

        console.log(';;', _hasNotificationOn(socketEvent))
        if (_hasNotificationOn(socketEvent)) {
          _sendBrowserNotification(socketEvent);
        }
      }
    }

    /**
     * socketEvent가 새로운 메세지 혹은 파일 커맨트에 관련된 이벤트인지 아닌지 확인한다.
     * @param {object} socketEvent - socket event object
     * @returns {boolean}
     * @private
     */
    function _isNewMessage(socketEvent) {
      if (socketEvent.event === 'message') {
        console.log(';;', socketEvent.messageType === 'file_comment');
        console.log(';;', _.isUndefined(socketEvent.messageType));
        if (socketEvent.messageType === 'file_comment' || _.isUndefined(socketEvent.messageType)) {
          return true;
        }
      }
      return false;
    }

    /**
     * socketEvent가 속한 방의 노티피케이션 상태가 켜져있는지 꺼져있는지 확인한다.
     * @param socketEvent
     * @private
     */
    function _hasNotificationOn(socketEvent) {
      console.log(socketEvent)
      var teamId = socketEvent.teamId;
      var roomId = socketEvent.room.id;

      if (!_hasTeamMessageMarkers(teamId)) {
        // 해당 팀의 정보가 전혀 없을 때
        return _getTeamMessageMarkers(teamId, roomId, socketEvent);
      } else {
        return _isSubscriptionOn(teamId, roomId);
      }
    }

    function _getTeamMessageMarkers(teamId, roomId, socketEvent) {
      var memberId;

      // 해당 팀의 정보가 전혀 없을 때
      EntityMapManager.create(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP);

      memberId = _getMemberId((teamId));

      console.log(memberId);
      memberService.getMemberInfo(memberId)
        .success(function(response) {
          console.log(response);
          var messageMarkers = _getMessageMarkersMap(response.u_messageMarkers);
          EntityMapManager.set(OTHER_TEAM_TOPIC_NOTIFICATION_STATUS_MAP, teamId, messageMarkers);
          if (_isSubscriptionOn(teamId, roomId)) {
            _sendBrowserNotification(socketEvent);
          }
        })
        .error(function(err) {
          return false;
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
      console.log(messageMarkersMap)
      if (_.isUndefined(messageMarkersMap[roomId])) {
        return _getTeamMessageMarkers(teamId, roomId);
      }
      console.log(messageMarkersMap[roomId].subscribe)

      return messageMarkersMap[roomId].subscribe;

    }


    function _sendBrowserNotification(socketEvent) {
      console.log(';;_sendBrowserNotification')
      $timeout.cancel(_timeoutCaller);
      _timeoutCaller = $timeout(function() {
        accountService.updateCurrentAccount();
        //DesktopNotification.addOtherTeamNotification(socketEvent);

        OtherTeamNotification.addNotification(socketEvent);
      }, paddingTime);
    }
  }
})();
