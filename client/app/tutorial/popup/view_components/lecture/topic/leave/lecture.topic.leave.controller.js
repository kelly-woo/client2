/**
 * @fileoverview 튜토리얼 토픽 생성 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTopicLeaveCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor, TutorialData,
                                                    TutorialEntity, TutorialTopics) {
    var TOTAL_STEP = 3;
    var _tutorDataList;
    var _purseDataList;

    $scope.onClickLeave = onClickLeave;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialData.get('accountPromise').then(function() {
        _initTutor();
        _initTopic();
        _attachEvents();
        $scope.step = 0;
        $scope.purse =_purseDataList[0];

      });
    }

    /**
     * topic 데이터를 초기화 한다.
     * @private
     */
    function _initTopic() {
      TutorialTopics.append({
        name: 'Lunch',
        isStarred: false,
        isPrivate: false
      });
      TutorialTopics.active(TutorialTopics.get().length - 1);
      TutorialEntity.set({
        name: 'Lunch',
        isStarred: false
      });
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      _tutorDataList = [
        {
          title: '잘했쪄',
          content: '토픽 이름을 클릭해서 메뉴를 불러와봐',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '',
          content: '이제 나가기 눌러서 나가보자!',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '잘해써',
          content: '토픽에서 잘 나왔어 언제든지 join leave 할수 있어.',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        }
      ];
      _purseDataList = [
        {
          isShown: true,
          top: 33,
          left: 317
        },
        {
          isShown: true,
          top: 137,
          left: 293
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
     * 나가기를 눌렀을 때
     */
    function onClickLeave() {
      _onNextStep();
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      _restoreTopic();
    }

    /**
     * topic 을 초기화 한다.
     * @private
     */
    function _restoreTopic() {
      TutorialTopics.restore();
      TutorialEntity.restore();
    }

    /**
     * 현재 topic 에서 나간다.
     * @private
     */
    function _leaveTopic() {
      TutorialTopics.remove(TutorialTopics.get().length - 1);
      TutorialTopics.active(0);
      TutorialEntity.restore();
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

      if (step === 2) {
        _leaveTopic();
      }

      $scope.step = step;
    }
  });
})();
