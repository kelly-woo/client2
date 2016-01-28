/**
 * @fileoverview 폴더 튜토리얼 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('tutorialPopoverFolder', tutorialPopoverFolder);

  function tutorialPopoverFolder() {
    return {
      link: link,
      scope: {},
      restrict: 'E',
      controller: 'TutorialPopoverFolderCtrl',
      templateUrl: 'app/tutorial/popover/folder/tutorial.popover.folder.html'
    };

    function link(scope, el, attrs) {
    }
  }
})();
