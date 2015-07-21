/**
 * @fileoverview 튜토리얼 C 패널 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialCenterCtrl', function ($scope, $rootScope, $state, $filter, TutorialMessages,
                                                 TutorialAccount) {

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      var account;
      TutorialAccount.promise.then(function() {
        account = TutorialAccount.getCurrent();
        $scope.name = account.name;
        $scope.profileUrl = $filter('getFileUrl')(account.u_photoThumbnailUrl.smallThumbnailUrl);

        $scope.messages = TutorialMessages.get();
      });
    }
  });
})();
