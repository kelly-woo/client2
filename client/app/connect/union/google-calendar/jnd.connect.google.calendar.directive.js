/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectGoogleCalendar', jndConnectGoogleCalendar);

  function jndConnectGoogleCalendar($timeout) {
    return {
      restrict: 'E',
      scope: {
        'union': '=jndDataUnion'
      },
      controller: 'JndConnectGoogleCalendarCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/google-calendar/jnd.connect.google.calendar.html'
    };

    function link(scope, el, attrs) {

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        $timeout(function() {
          scope.weeklyScheduleSummaryHour = 2;
          console.log('change week ::: ', scope.weeklyScheduleSummaryHour);
        }, 3000);

        $timeout(function() {
          console.log('change week ::: ', scope.weeklyScheduleSummaryHour);
        }, 5000);
      }

    }
  }
})();
