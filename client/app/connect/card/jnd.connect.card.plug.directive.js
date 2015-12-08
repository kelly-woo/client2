/**
 * @fileoverview 잔디 컨넥트 서비스(union) 에 연결된 plug 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectCardPlug', jndConnectCardPlug);

  function jndConnectCardPlug() {
    return {
      restrict: 'E',
      scope: false,
      controller: 'JndConnectCardPlugCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/card/jnd.connect.card.plug.html'
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