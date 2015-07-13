/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialProfileCtrl', function ($scope, $rootScope, $state, $filter, TutorialData) {

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      var account;
      TutorialData.get('accountPromise').then(function() {
        account = TutorialData.getAccount();
        $scope.name = account.name;
        $scope.profileUrl = $filter('getFileUrl')(account.u_photoThumbnailUrl.smallThumbnailUrl);
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
