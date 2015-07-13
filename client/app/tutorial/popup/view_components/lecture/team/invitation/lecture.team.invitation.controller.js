/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTeamInvitationCtrl', function ($scope, $rootScope, jndPubSub, TutorialTutor) {
    var TOTAL_STEP = 4;
    var _messages;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $scope.step = 0;
      _initMessages();
      _initTutor();
      _attachEvents();
    }

    /**
     * message 를 초기화한다.
     * @private
     */
    function _initMessages() {
      _messages = [
        {
          title: '잔디에 오신것을 환영합니다.',
          content: 'blah blah'
        },
        {
          title: '잔디에 오신것을 환영합니다.',
          content: 'blah blah'
        },
        {
          title: '',
          content: '다른 사람을 초대할 수 있써영'
        },
        {
          title: '',
          content: '초대해 바영'
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
      $scope.$on('$destroy', _onDestroy);
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
        if (step === 3) {
          TutorialTutor.set({
            top: 440,
            left: 510
          });
        }
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
