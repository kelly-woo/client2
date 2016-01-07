/**
 * @fileoverview 잔디 컨넥트 로딩 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectLoading', jndConnectLoading);

  function jndConnectLoading() {
    return {
      restrict: 'E',
      link: link,
      replace: true,
      templateUrl: 'app/connect/jnd.connect.loading.html'
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
