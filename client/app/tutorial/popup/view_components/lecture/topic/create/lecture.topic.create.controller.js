/**
 * @fileoverview 튜토리얼 토픽 생성 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTopicCreateCtrl', function ($scope, $rootScope, $filter, jndPubSub, TutorialTutor,
                                                     TutorialAccount, TutorialTopics, TutorialEntity) {
    var TOTAL_STEP = 4;
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
        $scope.entityName = '';
        $scope.purse =_purseDataList[0];
      });
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      var userName = TutorialAccount.getCurrent().name;
      _tutorDataList = [
        {
          title: '토픽',
          content: '은 그룹 메세지 하는데야',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '토픽을 만들어봐.',
          content: '눌러!',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: userName + ',',
          content: '자 토픽을 만들어봐.',
          top: 255,
          left: 280,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '훌륭해!',
          content: '잘 만들었어. <b> {{ entityName }} </b> 토픽을 만들었구나?',
          top: 200,
          left: 300,
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
          isShown: true,
          top: 116,
          left: 196
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

      $scope.$on('tutorial:createTopic', _onCreateTopic);
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * createTopic 이벤트 핸들러
     * @param {object} event
     * @param {string} entityName
     * @private
     */
    function _onCreateTopic(event, entityName) {
      var tutorData = _tutorDataList[$scope.step + 1];
      $scope.entityName = entityName;
      tutorData.content = tutorData.content.replace('{{entityName}}', $scope.entityName);

      TutorialTopics.append({
        name: entityName,
        isStarred: false
      });
      TutorialTopics.active(TutorialTopics.get().length - 1);
      TutorialEntity.set({
        name: entityName,
        isStarred: false
      });

      _onNextStep();
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      TutorialTopics.restore();
      TutorialEntity.restore();
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
        if (step === 3){
          _tutorDataList[step].content = '잘 만들었어. <b> ' + $scope.entityName + ' </b> 토픽을 만들었구나?';
        }

        $scope.purse = _purseDataList[step];
        TutorialTutor.set(_tutorDataList[step]);
      }
      $scope.step = step;
    }
  });
})();
