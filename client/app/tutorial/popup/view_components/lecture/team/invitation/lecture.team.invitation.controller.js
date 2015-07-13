/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTeamInvitationCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialData) {
    var TOTAL_STEP = 4;
    var _tutorDataList;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialData.get('accountPromise').then(function() {
        $scope.step = 0;
        _initTutor();
        _attachEvents();
      });
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      _tutorDataList = [
        {
          title: '잔디에 오신것을 환영합니다.',
          content: 'blah blah',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '잔디에 오신것을 환영합니다.',
          content: 'blah blah',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '',
          content: '다른 사람을 초대할 수 있써영',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '',
          content: '초대해 바영',
          top: 440,
          left: 510,
          hasSkip: false,
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

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
    }
  });
})();
