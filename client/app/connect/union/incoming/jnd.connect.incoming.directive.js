/**
 * @fileoverview 컨넥트 JIRA 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectIncoming', jndConnectIncoming);

  function jndConnectIncoming() {
    return {
      restrict: 'E',
      scope: {
        'current': '=jndDataCurrent'
      },
      controller: 'JndConnectIncomingCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/incoming/jnd.connect.incoming.html'
    };

    function link(scope, el, attrs) {
      scope.toggleCollapseGuide = toggleCollapseGuide;
      scope.selectInput = selectInput;
      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {

      }

      /**
       * 안내 Guide 를 collapse 한다
       */
      function toggleCollapseGuide() {
        var jqEl = el.find('._guide');
        jqEl.slideToggle();
      }

      /**
       * input 영역을 select 한다.
       * @param {object} clickEvent
       */
      function selectInput(clickEvent) {
        setTimeout(function() {
          $(clickEvent.target).select();
        });
      }
    }
  }
})();