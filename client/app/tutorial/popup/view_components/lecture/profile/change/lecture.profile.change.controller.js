/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureProfileChangeCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialData) {
    var TOTAL_STEP = 3;
    var _tutorDataList;
    var _purseDataList;

    $scope.onClickProfile = onClickProfile;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      var account;
      TutorialData.get('accountPromise').then(function() {
        account = TutorialData.getCurrentAccount();

        _initTutor();
        _attachEvents();
        $scope.step = 0;
        $scope.purse =_purseDataList[0];
      });
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      _tutorDataList = [
        {
          title: '프로필을 바꺼보쟝!',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: false
        },
        {
          title: '프로필을 바꺼보쟝!',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: false
        },
        {
          title: '',
          content: '이렇게 프로필을 바꾸는게 중요할때가 있다는걸 잊지마.',
          top: 340,
          left: 510,
          hasSkip: true,
          hasNext: true
        }
      ];
      _purseDataList = [
        {
          isShown: true,
          top: 50,
          left: 210
        },
        {
          isShown: true,
          top: 82,
          left: 390
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

    function onClickProfile() {
      _onNextStep();
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
        $scope.purse = _purseDataList[step];
        TutorialTutor.set(_tutorDataList[step]);
      }
      $scope.step = step;
    }
  });
})();
