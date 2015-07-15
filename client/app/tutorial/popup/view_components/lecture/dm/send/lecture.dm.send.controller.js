/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureDmSendCtrl', function ($scope, $rootScope, jndPubSub, jndKeyCode, TutorialTutor, TutorialData,
                                                TutorialTopics, TutorialMessages, TutorialEntity, TutorialDm) {
    var TOTAL_STEP = 7;
    var _tutorDataList;
    var _purseDataList;

    $scope.onClickMember = onClickMember;
    $scope.onKeyDown = onKeyDown;

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
          title: '팀 멤버한테 DM 보내봐',
          content: '눌러서 DM 해봐',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: false
        },
        {
          title: 'Aaron 하고 이야기 해봐',
          content: '',
          top: 400,
          left: 269,
          hasSkip: true,
          hasNext: false
        },
        {
          title: 'Aaron 한테 안녕이라고 해볼래',
          content: '',
          top: 450,
          left: 520,
          hasSkip: true,
          hasNext: false
        },
        {
          title: '이렇게 떠',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: true
        },
        {
          title: '스티카 날려봐',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: false
        },
        {
          title: '스티카 날려봐',
          content: '',
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: false
        },
        {
          title: '잘했어. 이렇게 재밋게 스티커도 보내고 해봐',
          content: '',
          top: 410,
          left: 300,
          hasSkip: true,
          hasNext: true
        }
      ];
      _purseDataList = [
        {
          isShown: true,
          top: 446,
          left: 195
        },
        {
          isShown: true,
          top: 155,
          left: 260
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
        },
        {
          isShown: true,
          top: 695,
          left: 978
        },
        {
          isShown: true,
          top: 395,
          left: 828
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
     * keyDown 이벤트 핸들러
     * @param {event} keyDownEvent
     */
    function onKeyDown(keyDownEvent) {
      var keyCode = keyDownEvent.keyCode;
      if (!keyDownEvent.shiftKey && jndKeyCode.match('ENTER', keyCode)) {
        _postMessage();
      }
    }

    /**
     * message 를 포스팅한다.
     * @private
     */
    function _postMessage() {
      var jqInput = $('#tutorial_text_input');
      var text = jqInput.val();
      var message;
      if (_.trim(text).length > 0){
        message = TutorialMessages.getBaseMessage('text');
        message.content = text;
        TutorialMessages.append(message);
        jqInput.blur();
        _onNextStep();
      }
      jqInput.val('');
    }

    /**
     * sticker 를 포스팅 한다.
     * @private
     */
    function _postSticker() {
      TutorialMessages.append(TutorialMessages.getBaseMessage('sticker'));
    }

    /**
     * DM 을 시작한다.
     * @private
     */
    function _startDm() {
      var list = TutorialDm.get();
      TutorialEntity.set({
        name: list[0].name,
        isStarred: false,
        memberCount: 0
      });
      TutorialTopics.inactiveAll();
      TutorialDm.active(0);
    }
    /**
     * member 클릭시 이벤트 핸들러
     */
    function onClickMember() {
      _onNextStep();
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      TutorialTopics.restore();
      TutorialDm.restore();
      TutorialDm.inactiveAll();
      TutorialEntity.restore();
      TutorialMessages.clear();
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
          _startDm();
        }
        if (step === 6) {
          _postSticker();
        }
      }
      $scope.step = step;
    }
  });
})();
