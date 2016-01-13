/**
 * @fileoverview Webhook 타입 컨넥트 공통 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectWebhook', jndConnectWebhook);

  function jndConnectWebhook($filter, JndUtil) {
    return {
      restrict: 'E',
      scope: {
        'current': '=jndDataCurrent'
      },
      controller: 'JndConnectWebhookCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/webhook/jnd.connect.webhook.html'
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
        scope.isCollapsed = true;
      }

      /**
       * 안내 Guide 를 collapse 한다
       */
      function toggleCollapseGuide(clickEvent) {
        var jqEl = el.find('._guide');
        jqEl.slideToggle({
          complete: _setCollapseText
        });
      }

      /**
       * collapsed 상태 text 노출을 위한 설정을 한다.
       * @private
       */
      function _setCollapseText() {
        var jqEl = el.find('._guide');
        JndUtil.safeApply(scope, function() {
          scope.isCollapsed = (jqEl.css('display') !== 'block');
        });
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
