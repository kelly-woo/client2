/**
 * @fileoverview 튜토리얼 Welcome 모달 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialWelcomeCtrl', TutorialWelcomeCtrl);

  function TutorialWelcomeCtrl($scope, $filter, Tutorial, AccountHasSeen) {
    var _translate = $filter('translate');

    $scope.curStep = 0;
    $scope.stepList = [
      {
        imgUrl: '../../../assets/images/tutorial/welcome_01.png',
        content: _translate('@tutorial-welcome-1')
      },
      {
        imgUrl: '../../../assets/images/tutorial/welcome_02.png',
        content: _translate('@tutorial-welcome-2')
      },
      {
        imgUrl: '../../../assets/images/tutorial/welcome_03.png',
        content: _translate('@tutorial-welcome-3')
      }
    ];

    $scope.prev = prev;
    $scope.next = next;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
    }

    /**
     * 다음 스텝으로 진행한다.
     */
    function prev() {
      if ($scope.curStep > 0) {
        $scope.curStep--;
      }
    }

    /**
     * 이전 스텝으로 진행한다.
     */
    function next() {
      if ($scope.curStep >= $scope.stepList.length -1) {
        _complete();
      } else {
        $scope.curStep++;
      }
    }

    /**
     * 모달의 스텝을 모두 완료한다.
     * @private
     */
    function _complete() {
      AccountHasSeen.set('TUTORIAL_VER3_WELCOME', true);
      Tutorial.hideWelcome();
      Tutorial.showTooltip();
    }
  }
})();
