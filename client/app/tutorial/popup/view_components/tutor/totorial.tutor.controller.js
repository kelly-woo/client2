/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialTutorCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor) {
    $scope.onClickNext = onClickNext;
    $scope.onClickSkip = onClickSkip;

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
