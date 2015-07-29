/**
 * @fileoverview 튜토리얼 최상단 바 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialTop', tutorialTop);

  function tutorialTop() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/top/tutorial.top.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();