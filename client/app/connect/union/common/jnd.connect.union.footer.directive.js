/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionFooter', jndConnectUnionFooter);

  function jndConnectUnionFooter() {
    return {
      restrict: 'E',
      controller: 'JndConnectUnionFooterCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/common/jnd.connect.union.footer.html'
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
