/**
 * @fileoverview 튜토리얼 Welcome 모달 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialWelcomeCtrl', TutorialWelcomeCtrl);

  function TutorialWelcomeCtrl($scope, $filter, Tutorial) {
    var _translate = $filter('translate');
    var _isComplete = false;

    $scope.isShow = true;
    $scope.curStep = 0;
    $scope.stepList = [
      {
        imgUrl: '',
        content: _translate('@tutorial-welcome-1')
      },
      {
        imgUrl: '',
        content: _translate('@tutorial-welcome-2')
      },
      {
        imgUrl: '',
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
      $scope.$on('Tutorial:showWelcome', _show);
    }

    /**
     * welcome 모달을 노출한다.
     * @private
     */
    function _show() {
      if (!_isComplete) {
        $scope.isShow = true;
      }
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
      $scope.isShow = false;
      _isComplete = true;
      Tutorial.showTooltip();
    }
  }
})();
