/**
 * @fileoverview 잔디 컨넥트 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectGithub', jndConnectGithub);

  function jndConnectGithub() {
    return {
      restrict: 'E',
      scope: {
        'current': '=jndDataCurrent'
      },
      controller: 'JndConnectGithubCtrl',
      link: link,
      replace: true,
      templateUrl: 'app/connect/union/github/jnd.connect.github.html'
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
