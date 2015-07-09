/**
 * @fileoverview
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialGuide', tutorialGuide);

  function tutorialGuide() {
    return {
      link: link,
      scope: {
        top: '=',
        left: '=',
        hasSkip: '=',
        step: '=',
        title: '=',
        content: '='
      },
      replace: true,
      templateUrl: 'app/tutorial/popup/guide/tutorial.guide.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
      element.css({
        top: scope.top + 'px',
        left: scope.left + 'px'
      });
    }
  }
})();
