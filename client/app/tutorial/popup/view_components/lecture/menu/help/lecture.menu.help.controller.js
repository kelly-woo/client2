/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureMenuHelpCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialAccount) {
    var TOTAL_STEP = 1;
    var _tutorDataList;
    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialAccount.promise.then(function() {
        _initTutor();
        _attachEvents();
        $scope.step = 0;
      });
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      _tutorDataList = [
        {
          title: '',
          content: '궁금한 점이 있으면 언제든 여기를 누르면 된다는걸 잊지마!',
          top: 200,
          left: 300,
          hasNext: true
        }
      ];
      TutorialTutor.reset();
      TutorialTutor.set(_tutorDataList[0]);
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $scope.$on('tutorial:nextStep', _onNextStep);
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {

    }

    /**
     * 다음 버튼 클릭시 이벤트 핸들러
     * @private
     */
    function _onNextStep() {
      var step = $scope.step;
      if (step + 1 === TOTAL_STEP) {
        jndPubSub.pub('tutorial:nextLecture');
      } else {
        step++;
        TutorialTutor.set(_tutorDataList[step]);
      }
      $scope.step = step;
    }
  });
})();
