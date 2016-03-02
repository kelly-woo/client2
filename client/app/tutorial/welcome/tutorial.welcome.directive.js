/**
 * @fileoverview 튜토리얼 중 가장 첫번째 노출하게 될 웰컴 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialWelcome', tutorialWelcome);

  function tutorialWelcome() {
    return {
      link: link,
      scope: {},
      restrict: 'E',
      controller: 'TutorialWelcomeCtrl',
      templateUrl: 'app/tutorial/welcome/tutorial.welcome.html'
    };

    function link(scope, el, attrs) {

      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
      }
    }
  }
})();
