/**
 * @fileoverview 튜토리얼 프로필 모달 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialModalProfile', tutorialModalProfile);

  function tutorialModalProfile() {
    return {
      link: link,
      replace: true,
      controller: 'TutorialModalProfileCtrl',
      templateUrl: 'app/tutorial/popup/view_components/modal/profile/tutorial.modal.profile.html'
    };

    function link(scope, element, attrs) {
    }
  }
})();
