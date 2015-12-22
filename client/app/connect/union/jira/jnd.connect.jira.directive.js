/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectJira', jndConnectJira);

  function jndConnectJira() {
    return {
      restrict: 'E',
      scope: {
        'current': '=jndDataCurrent'
      },
      controller: 'JndConnectJiraCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/jira/jnd.connect.jira.html'
    };

    function link(scope, el, attrs) {
      scope.toggleCollapseGuide = toggleCollapseGuide;
      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {

      }

      function toggleCollapseGuide() {
        var jqEl = el.find('._guide');
        jqEl.slideToggle();
      }
    }
  }
})();
