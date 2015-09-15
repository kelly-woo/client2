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
      templateUrl: 'app/left/tutorial/left.tutorial.folder.html'
    };

    function link(scope, el, attrs) {
    }
  }
})();
