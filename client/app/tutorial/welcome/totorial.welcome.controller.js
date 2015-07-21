/**
 * @fileoverview 튜토리얼 가이드 컨트롤러
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

    function onClickStart() {
      _openTutorial();
    }

    function onClickSkip() {
      TutorialAPI.set($scope.completedStep,  true);
      hide();
    }

    function hide() {
      Popup.close(Popup.get('tutorial'));
      $scope.isComplete = true;
    }

    function onClickContinue() {
      var startStep = $scope.completedStep + 1;
      startStep = startStep < 0 ? 0 : startStep;
      _openTutorial(startStep);
    }

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

    function _onTutorialOpen(event, step) {
      _openTutorial(step);
    }

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
