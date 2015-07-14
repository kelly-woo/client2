/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialCenterCtrl', function ($scope, $rootScope, $state, $filter, TutorialData, TutorialMessages) {

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      var account;
      TutorialData.get('accountPromise').then(function() {
        account = TutorialData.getCurrentAccount();
        $scope.name = account.name;
        $scope.profileUrl = $filter('getFileUrl')(account.u_photoThumbnailUrl.smallThumbnailUrl);

        $scope.messages = TutorialMessages.get();
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
