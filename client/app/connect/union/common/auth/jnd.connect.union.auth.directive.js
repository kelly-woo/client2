/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionAuth', jndConnectUnionAuth);

  function jndConnectUnionAuth() {
    return {
      restrict: 'E',
      controller: 'JndConnectUnionAuthCtrl',
      link: link,
      scope: {
        'current': '=jndDataCurrent'
      },
      replace: true,
      templateUrl: 'app/connect/union/common/auth/jnd.connect.union.auth.html'
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
