/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialModalProfileCtrl', function ($scope, $filter, TutorialAccount) {
    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialAccount.promise.then(function() {
        $scope.curUser = TutorialAccount.getCurrent();
        $scope.account = TutorialAccount.get();
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
