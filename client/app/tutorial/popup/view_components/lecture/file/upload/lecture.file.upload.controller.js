/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureFileUploadCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialAccount,
                                                    TutorialMessages, TutorialEntity) {
    var TOTAL_STEP = 3;
    var _tutorDataList;
    var _purseDataList;

    $scope.onClickUpload = onClickUpload;

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
          title: '아무 토픽에서나 파일 업로드 할 수 있어',
          content: '눌러서 파일 업로드를 해봐',
         top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '',
          content: '여길 눌러서 내컴터 드랍박스 구글드라이브 등에서 파일 업로드를 할 수 있어',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '',
          content: '업로드하면 이렇게 표시가 돼',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        }
      ];
      _purseDataList = [
        {
          isShown: true,
          top: 695,
          left: 235
        },
        {
          isShown: true,
          top: 587,
          left: 235
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
      TutorialMessages.restore();
    }

    function onClickUpload() {
      _onNextStep();
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
        if (step === 2) {
          _postFile();
        }
      }

      $scope.step = step;
    }

    function _postFile() {
      var topicName = TutorialEntity.get('name');
      TutorialMessages.append(TutorialMessages.getBaseMessage('file'));
    }
  });
})();
