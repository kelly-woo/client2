/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialModalProfileCtrl', function ($scope, $filter, TutorialData) {
    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialData.get('accountPromise').then(function() {
        $scope.curUser = TutorialData.getCurrentAccount();
        $scope.account = TutorialData.getAccount();
        console.log('account', $scope.account);
        $scope.profileUrl = $filter('getFileUrl')($scope.curUser.u_photoThumbnailUrl.mediumThumbnailUrl);
      });
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
    }
  });
})();
