/**
 * @fileoverview 잔디 컨넥트 Navigation 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionNav', jndConnectUnionNav);

  function jndConnectUnionNav() {
    return {
      restrict: 'E',
      scope: false,
      controller: 'JndConnectUnionNavCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/common/nav/jnd.connect.union.nav.html'
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
