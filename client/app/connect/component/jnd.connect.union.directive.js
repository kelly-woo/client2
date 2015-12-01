/**
 * @fileoverview 잔디 컨넥트 서비스(union) 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnion', jndConnectUnion);

  function jndConnectUnion() {
    return {
      restrict: 'E',
      controller: 'JndConnectUnionCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/component/jnd.connect.union.html'
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