/**
 * @fileoverview 튜토리얼 프로필 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialCenter', tutorialCenter);

  function tutorialCenter() {
    return {
      link: link,
      scope: false,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/center/tutorial.center.html',
      controller: 'tutorialCenterCtrl',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
