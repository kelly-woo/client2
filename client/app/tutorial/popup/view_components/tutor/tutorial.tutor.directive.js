/**
 * @fileoverview 튜토리얼 가이드 레이어 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialTutor', tutorialTutor);

  function tutorialTutor() {
    return {
      link: link,
      scope: {
        current: '=current',
        completed: '=completed'
      },
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/tutor/tutorial.tutor.html',
      controller: 'tutorialTutorCtrl',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
      element.css({
        top: scope.options.top + 'px',
        left: scope.options.left + 'px'
      });
    }
  }
})();
