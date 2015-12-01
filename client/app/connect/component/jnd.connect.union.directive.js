/**
 * @fileoverview 잔디 컨넥트 디렉티브
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
      console.log('### scope', scope);
      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        console.log('######init');
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