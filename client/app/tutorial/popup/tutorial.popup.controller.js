/**
 * @fileoverview 튜토리얼 팝업 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialPopupCtrl', function ($scope, $rootScope, $state) {
    var _curStep = $state.params.step;
    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $rootScope.isReady = true;

      $scope.currentStep = $state.params.step;
      $scope.layer = {
        top: 300,
        left: 300,
        hasSkip: false,
        title: '잔디에 오신것을 화뇽합니다.',
        content: 'aweijfoaiw efo awiejfo awe ofj awievj oiawe jvoawe jviav oiaewj oiv jaewoivj oawe vjoiaewj ovawej iovj awieov oawie jvoiaewj oviawje ivioaew jvoiawe'
      };
      $('#client-ui').removeClass('full-screen');
      _attachEvents();
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      $('#client-ui').addClass('full-screen');
    }
  });
})();
