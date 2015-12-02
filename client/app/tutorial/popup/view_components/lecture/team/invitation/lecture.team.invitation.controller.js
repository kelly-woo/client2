/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LectureTeamInvitationCtrl', LectureTeamInvitationCtrl);

  function LectureTeamInvitationCtrl($scope, $filter, jndPubSub, TutorialTutor, TutorialAccount) {
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
        $scope.step = 0;
        _initTutor();
        _attachEvents();
      });
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      var userName = TutorialAccount.getCurrent().name;
      var title = $filter('translate')('@tutorial_team_title').replace('{{username}}', userName);
      _tutorDataList = [
        {
          title: title,
          content: $filter('translate')('@tutorial_team_intro'),
          top: 200,
          left: 300,
          hasSkip: true,
          hasNext: true
        },
        {
          title: title,
          content: $filter('translate')('@tutorial_team_definition'),
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: true
        },
        {
          title: '',
          content: $filter('translate')('@tutorial_team_click_invite'),
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '',
          content: $filter('translate')('@tutorial_team_explain_invitation'),
          top: 440,
          left: 510,
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
          isShown: false,
          top: 0,
          left: 0
        },
        {
          isShown: true,
          top: 3,
          left: 100
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

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
    }
  }
})();
