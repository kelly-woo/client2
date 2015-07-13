/**
 * @fileoverview 튜토리얼 메인 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialMainCtrl', function ($scope, $rootScope, $state, TutorialTutor) {
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
      _initVariables();
      $('#client-ui').removeClass('full-screen');
      _attachEvents();

      $scope.topicList = _topicList;
      $scope.dmList = _dmList;
      $scope.tutor = TutorialTutor.get();
      $rootScope.isReady = true;
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
    }
    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $scope.$on('$destroy', _onDestroy);
      $scope.$on('tutorial:nextLecture', _onNextLecture);
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
