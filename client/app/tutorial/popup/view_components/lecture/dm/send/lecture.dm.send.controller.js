/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureDmSendCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialData) {
    var TOTAL_STEP = 7;
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
          title: '팀 멤버한테 DM 보내봐',
          content: '눌러서 DM 해봐',
         top: 200,
          left: 300,
          hasSkip: true,
          hasNext: true
        },
        {
          title: 'Jane 하고 이야기 해봐',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: true
        },
        {
          title: 'Jane 한테 안녕이라고 해볼래',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: true
        },
        {
          title: '이렇게 떠',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: true
        },
        {
          title: '스티카 날려봐',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: true
        },
        {
          title: '스티카 날려봐',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: true
        },
        {
          title: '그레이트 팍\n 기억해!',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
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
    function _onNextStep() {;
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
