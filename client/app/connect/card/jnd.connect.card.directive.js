/**
 * @fileoverview 잔디 컨넥트 서비스(union) 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectCard', jndConnectCard);

  function jndConnectCard() {
    return {
      restrict: 'E',
      controller: 'JndConnectCardCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/card/jnd.connect.card.html'
    };

    function link(scope, el, attrs) {
      scope.toggleCollapse = toggleCollapse;
      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
      }

      /**
       * collapse 를 토글한다.
       */
      function toggleCollapse() {
        el.find('.connect-union-body').slideToggle();
      }
    }
  }
})();