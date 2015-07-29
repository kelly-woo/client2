/**
 * @fileoverview 튜토리얼 C 패널 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialCenterCtrl', TutorialCenterCtrl);

  function TutorialCenterCtrl($scope, $filter, TutorialMessages, TutorialAccount) {

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
  }
})();
