/**
 * @fileoverview 튜토리얼 프로필 디렉티브
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
