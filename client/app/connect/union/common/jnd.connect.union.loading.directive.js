/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionLoading', jndConnectUnionLoading);

  function jndConnectUnionLoading() {
    return {
      restrict: 'E',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/common/jnd.connect.union.loading.html'
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
