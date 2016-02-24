/**
 * @fileoverview 튜토리얼 Welcome 모달 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TutorialModalWelcomeCtrl', TutorialModalWelcomeCtrl);

  function TutorialModalWelcomeCtrl($scope, jndPubSub) {
    $scope.isShow = true;
    $scope.curStep = -1;
    $scope.stepList = [
      {
        imgUrl: '',
        title: '스텝-1',
        content: '스텝1 내용'
      },
      {
        imgUrl: '',
        title: '스텝2',
        content: '스텝2 내용'
      },
      {
        imgUrl: '',
        title: '스텝3',
        content: '스텝3 내용'
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
      if ($scope.curStep > -1) {
        $scope.curStep--;
      }
    }

    /**
     * 이전 스텝으로 진행한다.
     */
    function next() {
      if ($scope.curStep === $scope.stepList.length -1) {
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
      jndPubSub.pub('TutorialModalWelcomeCtrl:complete');
    }
  }
})();
