/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectGoogleCalendar', jndConnectGoogleCalendar);

  function jndConnectGoogleCalendar(modalHelper) {
    return {
      restrict: 'E',
      scope: {
        'current': '=jndDataCurrent'
      },
      controller: 'JndConnectGoogleCalendarCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/google-calendar/jnd.connect.google.calendar.html'
    };

    function link(scope) {
      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        scope.onTopicCreateClick = onTopicCreateClick;
      }

      /**
       * topic create click
       */
      function onTopicCreateClick() {
        modalHelper.openTopicCreateModal();
      }
    }
  }
})();
