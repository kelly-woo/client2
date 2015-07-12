/**
 * @fileoverview 튜토리얼 가이드 레이어 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialModalTeamInvitation', tutorialModalTeamInvitation);

  function tutorialModalTeamInvitation() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/modal/invitation/tutorial.modal.team.invitation.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
