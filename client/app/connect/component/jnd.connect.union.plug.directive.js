/**
 * @fileoverview 잔디 컨넥트 서비스(union) 에 연결된 plug 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionPlug', jndConnectUnionPlug);

  function jndConnectUnionPlug() {
    return {
      restrict: 'E',
      scope: false,
      controller: 'JndConnectUnionPlugCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/component/jnd.connect.union.plug.html'
    };

    function link(scope, el, attrs) {

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
      }

    }
  }
})();