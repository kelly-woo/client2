/**
 * @fileoverview 튜토리얼 토픽 생성 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTopicCreateCtrl', function ($scope, $rootScope, $filter, jndPubSub, TutorialTutor,
                                                     TutorialData) {
    var TOTAL_STEP = 4;
    var _messages;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialData.get('accountPromise').then(function() {
        $scope.step = 0;
        $scope.entityName = '';
        _initMessages();
        _initTutor();
        _attachEvents();
      });
    }

    /**
     * message 를 초기화한다.
     * @private
     */
    function _initMessages() {
      var userName = TutorialData.getAccount().name;

      _messages = [
        {
          title: '토픽',
          content: 'blah blah'
        },
        {
          title: '토픽을 만들어봐.',
          content: '눌러!'
        },
        {
          title: userName + ',',
          content: '자 토픽을 만들어봐.'
        },
        {
          title: '그레이트팍!',
          content: '{{entityName}} 잘 만들었졍'
        }
      ];
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      TutorialTutor.reset();
      TutorialTutor.set({
        top: 200,
        left: 300,
        hasSkip: false,
        title: _messages[0].title,
        content: _messages[0].content
      });
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $scope.$on('tutorial:nextStep', _onNextStep);
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
      var msg = _messages[$scope.step + 1];
      $scope.entityName = entityName;
      msg.content = msg.content.replace('{{entityName}}', $scope.entityName);
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
      var msg;
      var step = $scope.step;
      if (step + 1 === TOTAL_STEP) {
        jndPubSub.pub('tutorial:nextLecture');
      } else {
        step++;
        msg = _messages[step];
        TutorialTutor.set({
          title: msg.title,
          content: msg.content
        });
        //topic 모달 생성부분
        if (step === 2) {
          TutorialTutor.set({
            hasNext: false,
            top: 255,
            left: 280
          });
        } else {
          TutorialTutor.set({
            hasNext: true
          }).reset('top', 'left');
        }
      }
      $scope.step = step;
    }
  });
})();
