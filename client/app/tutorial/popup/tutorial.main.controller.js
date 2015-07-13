/**
 * @fileoverview 튜토리얼 메인 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialMainCtrl', function ($scope, $rootScope, $state, TutorialTutor, currentSessionHelper,
                                               TutorialData, accountService) {
    var _topicList;
    var _dmList;
    var _lectureList;
    var _currentLectureIdx;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      var promise = accountService.getAccountInfo()
        .success(_onSuccessGetAccount)
        .error(_onFailGetAccount);
      TutorialData.set('accountPromise', promise);
    }

    /**
     * account success 핸들러
     * @param {object} response
     * @private
     */
    function _onSuccessGetAccount(response) {
      TutorialData.setAccount(response);

      _initVariables();
      $('#client-ui').removeClass('full-screen');
      _attachEvents();
      $scope.topicList = _topicList;
      $scope.dmList = _dmList;
      $scope.tutor = TutorialTutor.get();
      $rootScope.isReady = true;
    }

    /**
     * account fail 핸들러
     * @param {object} err
     * @private
     */
    function _onFailGetAccount(err) {
    }

    /**
     * 변수를 초기화 한다.
     * @private
     */
    function _initVariables() {
      _currentLectureIdx = 0;
      _topicList = [
        {
          name: 'aaaa',
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'bbbb',
          isStarred: true,
          isPrivate: false
        }
      ];
      _dmList = [
        {
          name: 'ccc',
          isStarred: true
        }
      ];
      _lectureList = [
        'tutorial.team.invitation',
        'tutorial.topic.create',
        'tutorial.topic.join',
        'tutorial.topic.leave',
        'tutorial.file.comment',
        'tutorial.file.upload',
        'tutorial.dm.send',
        'tutorial.profile.change',
        'tutorial.menu.team',
        'tutorial.menu.help'
      ];

      _currentLectureIdx = _getLectureIndex($state.current.name);
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $rootScope.$on('$stateChangeStart', _onStateChangeStart);
      $scope.$on('$destroy', _onDestroy);
      $scope.$on('tutorial:nextLecture', _onNextLecture);
    }

    /**
     * stateName 으로부터 lecture index 를 반환한다.
     * @param {string} stateName
     * @returns {number}
     * @private
     */
    function _getLectureIndex(stateName) {
      var index = -1;
      _.forEach(_lectureList, function(lectureName, i) {
        if (lectureName === stateName) {
          index = i;
          return false;
        }
      });
      return index;
    }

    /**
     * $stateChageStart 이벤트 발생시 핸들러
     * @param {object} toState
     * @param {object} toParams
     * @param {object} fromState
     * @param {object} fromParams
     * @private
     */
    function _onStateChangeStart(event, toState, toParams, fromState, fromParams) {
      _currentLectureIdx = _getLectureIndex(toState.name);
    }

    /**
     * 다음 lecture 를 불러온다.
     * @private
     */
    function _onNextLecture() {
      _currentLectureIdx++;
      if (_lectureList[_currentLectureIdx]) {
        $state.go(_lectureList[_currentLectureIdx]);
      }
    }
    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      $('#client-ui').addClass('full-screen');
    }
  });
})();
