/**
 * @fileoverview 폴더 튜토리얼 디렉티브
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('leftTutorialFolder', leftTutorialFolder);

  function leftTutorialFolder() {
    return {
      link: link,
      scope: true,
      restrict: 'E',
      controller: 'LeftTutorialFolderCtrl',
      templateUrl: 'app/left/topics/tutorial/left.tutorial.folder.html'
    };

    function link(scope, el, attrs) {
    }
  }
})();
