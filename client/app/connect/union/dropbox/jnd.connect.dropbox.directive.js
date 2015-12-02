/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectDropbox', jndConnectDropbox);

  function jndConnectDropbox() {
    return {
      restrict: 'E',
      scope: false,
      controller: 'JndConnectDropboxCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/dropbox/jnd.connect.dropbox.html'
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
