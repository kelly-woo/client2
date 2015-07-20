/**
 * @fileoverview 튜토리얼 가이드 레이어 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialWelcome', tutorialWelcome);

  function tutorialWelcome() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/welcome/tutorial.welcome.html',
      controller: 'tutorialWelcomeCtrl',
      restrict: 'E'
    };

    function link(scope, element, attrs) {

    }
  }
})();
