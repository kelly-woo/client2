(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LeftTutorialFolderCtrl', LeftTutorialFolderCtrl);

  function LeftTutorialFolderCtrl($scope) {
    $scope.isShown = false;
    $scope.close = close;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      $scope.isShown = true;
    }

    /**
     *
     */
    function close() {
      $scope.isShown = false;
    }
  }
})();
