/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnect', jndConnect);

  function jndConnect() {
    return {
      restrict: 'E',
      scope: false,
      controller: 'JndConnectCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/jnd.connect.html'
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