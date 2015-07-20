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
          title: _translate('@common-topics'),
          content: _translate('@tutorial_topic_definition'),
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: _translate('@common-topics'),
          content: _translate('@tutorial_topic_let_create') + '<br />' + _translate('@tutorial_topic_click_plus'),
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: userName + ',',
          content: _translate('@tutorial_topic_create_own').replace('{{username}}', userName),
          top: 355,
          left: 280,
          hasSkip: false,
          hasNext: false
        },
        {
          title: _translate('@tutorial_awesome'),
          content: _translate('@tutorial_topic_created'),
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
      tutorData.content = tutorData.content.replace('{{topicName}}', $scope.entityName);

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
     * key 에 해당하는 L10N 으로 변환한다.
     * @param {string} key
     * @returns {string}
     * @private
     */
    function _translate(key) {
      return $filter('translate')(key);
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

        $scope.purse = _purseDataList[step];
        TutorialTutor.set(_tutorDataList[step]);
      }
      $scope.step = step;
    }
  });
})();
