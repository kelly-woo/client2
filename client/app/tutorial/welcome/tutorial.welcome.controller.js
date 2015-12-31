/**
 * @fileoverview center 튜토리얼 모달 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialWelcomeCtrl', TutorialWelcomeCtrl);

  function TutorialWelcomeCtrl($scope, $filter, accountService, TutorialAPI, Popup, HybridAppHelper) {
    var _isAccountLoaded = false;
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
      if (!HybridAppHelper.isPcApp()) {
        _attachEvents();
      }
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
    function onClickSkip(clickEvent) {
      TutorialAPI.set($scope.completedStep,  true);
      hide();
    }

    /**
     * hide 한다.
     */
    function hide() {
      var tutorial = Popup.get('tutorial');
      if (tutorial) {
        Popup.close(tutorial);
      }
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
        optionStr: 'resizable=no, scrollbars=1, toolbar=no, menubar=no, status=no, directories=no, width=1024, height=768'
      });
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $scope.$on('tutorial:hide', hide);
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
      if (!_isAccountLoaded) {
        var account = accountService.getAccount();
        $scope.title = $filter('translate')('@tutorial_welcome_title').replace('{{username}}', account.name);
        $scope.isComplete = account.tutorialConfirm;
        $scope.isOpened = account.tutorialOpened;
        //@fixme: remove isComplete = false; for test
        //$scope.isComplete = false;
        $scope.completedStep = account.tutorialStep;
        _isAccountLoaded = true;
      }
    }


    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      hide();
    }
  }
})();
