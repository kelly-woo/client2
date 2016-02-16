/**
 * @fileoverview 폴터 튜토리얼 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialPopoverFolderCtrl', TutorialPopoverFolderCtrl);

  function TutorialPopoverFolderCtrl($scope, $timeout, accountService, AccountHasSeenService) {
    $scope.isShown = false;
    $scope.isClose = false;
    $scope.close = close;
    $scope.closeAndNeverShow = closeAndNeverShow;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      if (accountService.getAccount()) {
        _setIsShown();
      } else {
        $scope.$on('accountLoaded', _setIsShown);
      }
    }

    /**
     * 자연스러운 효과를 위해 토픽 폴더가
     * @private
     */
    function _setIsShown() {
      $timeout(function() {
        $scope.isShown = !AccountHasSeenService.get('GUIDE_TOPIC_FOLDER');
      }, 2000);
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
      AccountHasSeenService.set('GUIDE_TOPIC_FOLDER', true);
      close();
    }
  }
})();
