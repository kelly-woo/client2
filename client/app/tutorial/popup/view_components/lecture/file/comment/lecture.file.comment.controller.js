/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureFileCommentCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialData) {
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
          title: '자!',
          content: '써치 아이콘 클릭해서 파일서랍 열어봐바',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '',
          content: '파일을 클릭해보자',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '코멘트 남겨보자',
          content: '코멘트 남겨',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '잘햇어',
          content: '다운로드하거나 쉐어할수 잇음',
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
          left: 955
        },
        {
          isShown: true,
          top: 174,
          left: 665
        },
        {
          isShown: false,
          top: 0,
          left: 0
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
