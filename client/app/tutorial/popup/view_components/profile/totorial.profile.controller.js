/**
 * @fileoverview 튜토리얼 프로필 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialProfileCtrl', TutorialProfileCtrl);

  function TutorialProfileCtrl($scope, $filter, TutorialAccount) {

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
        $scope.position = account.u_extraData.position;
        $scope.profileUrl = $filter('getFileUrl')(account.u_photoThumbnailUrl.smallThumbnailUrl);
      });
    }
  }
})();
