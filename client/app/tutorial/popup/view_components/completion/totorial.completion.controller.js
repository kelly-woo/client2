/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialCompletionCtrl', function ($scope, $rootScope, jndPubSub, TutorialAccount) {
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
      var account;
      var currentTeam;
      TutorialAccount.promise.then(function() {
        account = TutorialAccount.getCurrent();
        currentTeam = TutorialAccount.getCurrentTeam();
        $scope.title = _translate('@tutorial_congratulations').replace('{{username}}', account.name);
        $scope.content = _translate('@tutorial_congratulations_content').replace('{{teamName}}', currentTeam.name);
      });
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
     * 번역한 결과를 반환한다.
     * @param {string} key
     * @returns {*}
     * @private
     */
    function _translate(key) {
      return $filter('translate')(key);
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
