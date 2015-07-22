/**
 * @fileoverview 튜토리얼 프로필 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialProfile', tutorialProfile);

  function tutorialProfile() {
    return {
      link: link,
      scope: false,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/profile/tutorial.profile.html',
      controller: 'TutorialProfileCtrl',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
