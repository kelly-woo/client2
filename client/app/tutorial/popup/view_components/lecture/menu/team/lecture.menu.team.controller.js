/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureMenuTeamCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialData) {
    var TOTAL_STEP = 2;
    var _tutorDataList;
    var _purseDataList;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialData.get('accountPromise').then(function() {
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
          title: '팀메뉴 클릭해보셩',
          content: '',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '',
          content: '팀메뉴엔 이러이러한 부메뉴들이 있어. 잘 활용해',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        }
      ];
      _purseDataList = [
        {
          isShown: true,
          top: 0,
          left: 10
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
