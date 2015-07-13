/**
 * @fileoverview 튜토리얼 프로필 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialCenterText', tutorialCenterText);

  function tutorialCenterText() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/center/text/tutorial.center.text.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
