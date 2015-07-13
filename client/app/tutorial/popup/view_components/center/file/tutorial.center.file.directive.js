/**
 * @fileoverview 튜토리얼 프로필 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialCenterFile', tutorialCenterFile);

  function tutorialCenterFile() {
    return {
      link: link,
      replace: true,
      templateUrl: 'app/tutorial/popup/view_components/center/file/tutorial.center.file.html',
      restrict: 'E'
    };

    function link(scope, element, attrs) {
    }
  }
})();
