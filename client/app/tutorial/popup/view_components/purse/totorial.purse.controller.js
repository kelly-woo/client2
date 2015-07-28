/**
 * @fileoverview 튜토리얼 purse 버튼 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialPurseCtrl', TutorialPurseCtrl);

  function TutorialPurseCtrl($scope, jndPubSub) {
    $scope.onClickPurse = onClickPurse;

    function onClickPurse() {
      if (_.isUndefined($scope.options.isClickable) || $scope.options.isClickable === true) {
        jndPubSub.pub('tutorial:purseClicked');
      }
    }
  }
})();
