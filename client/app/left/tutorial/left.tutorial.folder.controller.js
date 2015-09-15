(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LeftTutorialFolderCtrl', LeftTutorialFolderCtrl);

  function LeftTutorialFolderCtrl($scope) {
    $scope.isShow = false;
    $scope.close = close;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      $scope.isShow = true;
    }

    /**
     *
     */
    function close() {
      $scope.isShow = false;
    }
  }
})();
