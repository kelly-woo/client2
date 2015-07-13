/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureMenuTeamCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor) {
    var TOTAL_STEP = 2;
    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $scope.step = 0;
      TutorialTutor.set({
        top: 200,
        left: 300,
        hasSkip: false,
        title: '팀 메뉴',
        content: 'step 0'
      });
      _attachEvents();
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
      if ($scope.step + 1 === TOTAL_STEP) {
        jndPubSub.pub('tutorial:nextLecture');
      } else {
        $scope.step++;
        TutorialTutor.set({
          top: TutorialTutor.get('top') + 10,
          left: TutorialTutor.get('left') + 10,
          content: 'step' + $scope.step
        });

      }
    }
  });
})();
