/**
 * @fileoverview 다른 팀에 들어온 소켓이벤트를 처리하는 곳
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketOtherTeamManager', jndWebSocketOtherTeamManager);

  /* @ngInject */
  function jndWebSocketOtherTeamManager($timeout, accountService, OtherTeamNotification) {
    var _timeoutCaller;

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
      var _teamId;
      if (!!socketEvent.teamId) {
        _teamId = socketEvent.teamId;

        $timeout.cancel(_timeoutCaller);
        _timeoutCaller = $timeout(function() {
          accountService.updateCurrentAccount();
          //DesktopNotification.addOtherTeamNotification(socketEvent);
          OtherTeamNotification.addNotification(socketEvent);
        }, paddingTime);
      }

    }
  }
})();
