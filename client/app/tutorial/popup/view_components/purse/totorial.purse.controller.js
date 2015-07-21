/**
 * @fileoverview 튜토리얼 purse 버튼 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialPurseCtrl', function ($scope, jndPubSub) {
    $scope.onClickPurse = onClickPurse;

    function onClickPurse() {
      jndPubSub.pub('tutorial:purseClicked');
    }
  });
})();
