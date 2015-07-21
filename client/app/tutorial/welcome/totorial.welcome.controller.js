/**
 * @fileoverview center 튜토리얼 모달 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialWelcomeCtrl', function ($scope, accountService, TutorialAPI, Popup) {

    $scope.isComplete = true;
    $scope.completedStep = -1;
    $scope.onClickStart = onClickStart;
    $scope.onClickContinue = onClickContinue;
    $scope.onClickSkip = onClickSkip;
    $scope.hide = hide;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      _attachEvents();
    }

    /**
     * tutorial start click 시
     */
    function onClickStart() {
      _openTutorial();
    }

    /**
     * tutorial skip click 시
     */
    function onClickSkip() {
      TutorialAPI.set($scope.completedStep,  true);
      hide();
    }

    /**
     * hide 한다.
     */
    function hide() {
      Popup.close(Popup.get('tutorial'));
      $scope.isComplete = true;
    }

    /**
     * continue 클릭시
     */
    function onClickContinue() {
      var startStep = $scope.completedStep + 1;
      startStep = startStep < 0 ? 0 : startStep;
      _openTutorial(startStep);
    }

    /**
     * tutorial 을 open 한다.
     * @param {string| number} step
     * @private
     */
    function _openTutorial(step) {
      step = step || 0;
      var token = location.href.split('/#/');
      var url = token[0] + '/#/tutorial';

      Popup.open(url, {
        name: 'tutorial',
        data: {
          start: step
        },
        optionStr: 'width=1024; height=768; scrollbars=yes; resizable=no;'
      });
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $scope.$on('accountLoaded', _onAccountLoaded);
      $scope.$on('tutorial:open', _onTutorialOpen);
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * tutorial open 이벤트 핸들러
     * @param {object} event
     * @param {string|number} step
     * @private
     */
    function _onTutorialOpen(event, step) {
      _openTutorial(step);
    }

    /**
     * account load 이벤트 핸들러
     * @private
     */
    function _onAccountLoaded() {
      var account = accountService.getAccount();

      $scope.isComplete = account.tutorialConfirm;
      //@fixme: remove isComplete = false; for test
      //$scope.isComplete = false;
      $scope.completedStep = account.tutorialStep;
    }


    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      hide();
    }
  });
})();
