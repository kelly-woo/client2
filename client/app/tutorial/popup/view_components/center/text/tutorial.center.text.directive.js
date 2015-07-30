/**
 * @fileoverview 튜토리얼 C 패널 text msg 디렉티브
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
