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
    var _purseDataList;
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
          title: '잔디 튜토리얼에 오신것을 환영합니다.',
          content: '자 우리함께 튜토리얼을 시작해볼까?',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '잔디 튜토리얼에 오신것을 환영합니다.',
          content: '탐은 그룹하고 비슷한거야',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '',
          content: '다른 사람을 초대할 수 있써. <br>초대 클릭해봐',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '',
          content: '이렇게 초대할수 있어. 다음 버튼을 눌러봐',
          top: 440,
          left: 510,
          hasSkip: false,
          hasNext: true
        }
      ];
      _purseDataList = [
        {
          isShown: false,
          top: 0,
          left: 0
        },
        {
          isShown: false,
          top: 0,
          left: 0
        },
        {
          isShown: true,
          top: 3,
          left: 100
        },
        {
          isShown: false,
          top: 0,
          left: 0
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
      $scope.$on('tutorial:purseClicked', _onNextStep);
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
        $scope.purse = _purseDataList[step];
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
