/**
 * @fileoverview 폴터 튜토리얼
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LeftTutorialFolderCtrl', LeftTutorialFolderCtrl);

  function LeftTutorialFolderCtrl($scope) {
    $scope.isShown = false;
    $scope.close = close;
    $scope.closeAndNeverShow = closeAndNeverShow;
    _init();

    /**
     *
     * @private
     */
    function _init() {
      $scope.isShown = true;
    }

    /**
     * 닫기
     */
    function close() {
      $scope.isShown = false;
    }

    /**
     * 다시 보지 않기
     */
    function closeAndNeverShow() {
      close();
    }
  }
})();
