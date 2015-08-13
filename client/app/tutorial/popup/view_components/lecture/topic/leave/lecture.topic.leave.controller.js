/**
 * @fileoverview 튜토리얼 토픽 나가기 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LectureTopicLeaveCtrl', LectureTopicLeaveCtrl);

  function LectureTopicLeaveCtrl($scope, $filter, jndPubSub, TutorialTutor, TutorialAccount, TutorialEntity,
                                 TutorialTopics) {
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
      TutorialAccount.promise.then(function() {
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
          title: _translate('@tutorial_there_we_go'),
          content: _translate('@tutorial_leave_click_title'),
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '',
          content: _translate('@tutorial_leave_lets'),
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: _translate('@tutorial_leave_success'),
          content: _translate('@tutorial_leave_success_desc'),
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
          left: 970
        },
        {
          isShown: true,
          top: 137,
          left: 823
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
     * key 에 해당하는 L10N 으로 변환한다.
     * @param {string} key
     * @returns {string}
     * @private
     */
    function _translate(key) {
      return $filter('translate')(key);
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
  }
})();
