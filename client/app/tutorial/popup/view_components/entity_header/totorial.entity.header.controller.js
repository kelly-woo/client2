/**
 * @fileoverview 튜토리얼 C패널 헤더 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialEntityHeaderCtrl', function ($scope, TutorialEntity) {

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $scope.entity = TutorialEntity.get();
    }
  });
})();
