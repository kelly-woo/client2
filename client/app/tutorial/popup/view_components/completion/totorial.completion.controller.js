/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialCompletionCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor) {
    var MAX_STEP_COUNT = 10;
    $scope.onClickNext = onClickNext;
    $scope.onClickSkip = onClickSkip;
    $scope.onClickMove = onClickMove;
    $scope.stepList = new Array(MAX_STEP_COUNT);

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $scope.options = TutorialTutor.get();
    }

    /**
     * 다음 버튼 클릭시
     */
    function onClickNext() {
      jndPubSub.pub('tutorial:nextStep');
    }

    /**
     * skip 버튼 클릭시
     */
    function onClickSkip() {
      jndPubSub.pub('tutorial:skip');
    }

    function onClickMove(index) {
      jndPubSub.pub('tutorial:go', index);
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
