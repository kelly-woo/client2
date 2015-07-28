/**
 * @fileoverview 튜토리얼 C 패널 date msg 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialCenterDate', tutorialCenterDate);

  function tutorialCenterDate() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/center/date/tutorial.center.date.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
