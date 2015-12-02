/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectGoogleDrive', jndConnectGoogleDrive);

  function jndConnectGoogleDrive() {
    return {
      restrict: 'E',
      scope: false,
      controller: 'JndConnectGoogleDriveCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/google-drive/jnd.connect.google.drive.html'
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
