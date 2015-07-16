/**
 * @fileoverview 튜토리얼 토픽 생성 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTopicJoinCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialAccount) {
    var TOTAL_STEP = 2;
    var _tutorDataList;
    var _purseDataList;

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
          title: '토픽에 조인해보자!',
          content: '햄버거 버튼 눌러!',
          hasSkip: false,
          hasNext: false
        },
        {
          title: '토픽에 조인해보자!',
          content: '참여하기 버튼 눌러!',
          hasSkip: false,
          hasNext: false
        }
      ];
      _purseDataList = [
        {
          isShown: true,
          top: 117,
          left: 175
        },
        {
          isShown: true,
          top: 174,
          left: 665
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
