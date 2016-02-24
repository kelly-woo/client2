/**
 * @fileoverview 튜토리얼 웰컴 모달 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialModalWelcome', tutorialModalWelcome);

  function tutorialModalWelcome(JndUtil, jndPubSub) {
    return {
      link: link,
      scope: {},
      restrict: 'E',
      controller: 'TutorialModalWelcomeCtrl',
      templateUrl: 'app/tutorial/modal/tutorial.modal.welcome.html'
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
