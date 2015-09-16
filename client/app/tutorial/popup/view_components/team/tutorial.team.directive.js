/**
 * @fileoverview 튜토리얼 프로필 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialTeam', tutorialTeam);

  function tutorialTeam() {
    return {
      link: link,
      scope: false,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/team/tutorial.team.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
