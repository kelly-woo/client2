/**
 * @fileoverview 튜토리얼 메인 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('tutorialMainCtrl', function ($scope, $rootScope, $state, $urlRouter, accountService,
                                               currentSessionHelper, TutorialTutor, TutorialAccount, TutorialTopics,
                                               TutorialDm, TutorialAPI) {
    var _isComplete;
    var _topicList;
    var _dmList;
    //향후 lecture step 이 id 가 될 수 있으므로 미리 만들어 놓는다.
    var _lectureMap = {
      0: 'tutorial.team.invitation',
      1: 'tutorial.topic.create',
      2: 'tutorial.topic.join',
      3: 'tutorial.topic.leave',
      4: 'tutorial.file.comment',
      5: 'tutorial.file.upload',
      6: 'tutorial.dm.send',
      7: 'tutorial.profile.change',
      8: 'tutorial.menu.team',
      9: 'tutorial.menu.help'
    };
    var _lectureList = [
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
    $scope.currentStep = 0;
    $scope.onClickComplete = onClickComplete;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialAccount.promise.then(_onSuccessGetAccount);
    }

    /**
     * account success 핸들러
     * @private
     */
    function _onSuccessGetAccount() {
      var account = TutorialAccount.get();
      var currentStep;
      $('#client-ui').removeClass('full-screen');

      _initVariables();
      _isComplete = account.tutorialConfirm;
      $scope.completedStep = account.tutorialStep;

      $scope.isShowComplete = false;

      currentStep =  _getLectureIndex($state.current.name);
      $scope.currentStep = currentStep > -1 ? currentStep : $scope.currentStep;

      _initRouter();
      _attachEvents();
      _attachDomEvents();

      $scope.topicList = TutorialTopics.get();
      $scope.dmList = _dmList;
      $scope.tutor = TutorialTutor.get();
      $rootScope.isReady = true;
    }

    /**
     * routing 을 초기화 한다.
     * @private
     */
    function _initRouter() {
      if (_isTutorialMain($state.current.name)) {
        _autoRoute();
      }
    }

    /**
     * 튜토리얼 시작인지 여부 확인
     * @param {string} currentName
     * @returns {boolean}
     * @private
     */
    function _isTutorialMain(currentName) {
      return currentName === 'tutorial';
    }

    /**
     * 튜토리얼 첫번째 과정인지 여부 반환
     * @private
     */
    function _autoRoute() {
      var start = parseInt($state.params.start, 10) || 0;
      var nextStep = _getNextStep($scope.completedStep);
      if (start > nextStep) {
        start = nextStep;
        start = start < 0 ? 0 : start;
      }

      if (!_lectureList || !_lectureList[start]) {
        start = 0;
      }
      $scope.currentStep = start;
      $state.go(_lectureList[start]);
    }

    function _getNextStep(stepId) {
      var nextStep = stepId + 1;
      if (nextStep === _lectureList.length) {
        nextStep = stepId;
      }
      return nextStep;
    }
    /**
     * 변수를 초기화 한다.
     * @private
     */
    function _initVariables() {
      _topicList = [
        {
          name: '*Notice Board*',
          isActive: true,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic1',
          isActive: false,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic2',
          isActive: false,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic3',
          isActive: false,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic4',
          isActive: false,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic5',
          isActive: false,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic6',
          isActive: false,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic7',
          isActive: false,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic8',
          isActive: false,
          isStarred: true,
          isPrivate: false
        },
        {
          name: 'Topic9',
          isActive: false,
          isStarred: true,
          isPrivate: true
        }
      ];
      _dmList = [
        {
          name: 'Aaron',
          isActive: false,
          isStarred: true
        }
      ];

      TutorialTopics.set(_topicList, true);
      TutorialDm.set(_dmList, true);
    }

    /**
     *
     */
    function onClickComplete() {
      TutorialAPI.set($scope.currentStep,  true);
      _close();
    }

    /**
     * attachEvents
     * @private
     */
    function _attachEvents() {
      $rootScope.$on('$stateChangeStart', _onStateChangeStart);
      $scope.$on('$destroy', _onDestroy);
      $scope.$on('tutorial:nextLecture', _onNextLecture);
      $scope.$on('tutorial:go', _onMoveStep);
      $scope.$on('tutorial:skip', _onSkipTutorial);
    }

    /**
     *
     * @private
     */
    function _attachDomEvents() {
      $(window).on('unload', _close);
    }

    /**
     *
     * @private
     */
    function _detachDomEvents() {
      $(window).off('unload', _close);
    }
    /**
     *
     * @private
     */
    function _onSkipTutorial() {
      TutorialAPI.set($scope.completedStep,  true);
      _close();
    }

    function _close() {
      var jqParentEl = window.opener.angular.element('#tutorial_welcome');
      var scope;

      if (jqParentEl.length) {
        scope = jqParentEl.scope();
        scope.$apply(function() {
          scope.hide();
        });
      }
    }

    /**
     * stateName 으로부터 lecture index 를 반환한다.
     * @param {string} stateName
     * @returns {number}
     * @private
     */
    function _getLectureIndex(stateName) {
      var index = -1;
      console.log(stateName);
      _.forEach(_lectureList, function(lectureName, i) {
        if (lectureName === stateName) {
          index = i;
          return false;
        }
      });
      console.log(index);
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
      var currentStep;
      TutorialAccount.promise.then(function() {
        if (_isTutorialMain(toState.name)) {
          _autoRoute();
        } else {
          currentStep = _getLectureIndex(toState.name);
          if (currentStep > -1) {
            $scope.currentStep = currentStep;
            $scope.isShowComplete = false;
          }
        }
      });
    }

    /**
     * 다음 lecture 를 불러온다.
     * @private
     */
    function _onNextLecture() {
      var length = _lectureList.length;
      var nextStep = $scope.currentStep + 1;
      if (nextStep == length) {
        _save($scope.currentStep, true);
        $scope.isShowComplete = true;
      } else if (_lectureList[nextStep]) {
        _save($scope.currentStep, true);
        $scope.currentStep = nextStep;
        $state.go(_lectureList[$scope.currentStep]);
      }
      console.log('_onNextLecture $scope.currentStep', $scope.currentStep);
    }

    function _save(step, isComplete) {
      isComplete = !!isComplete || false;

      if (isComplete || !_isComplete) {
        if (step <= $scope.currentStep && $scope.completedStep < $scope.currentStep) {
          $scope.completedStep = $scope.currentStep;
          TutorialAPI.set($scope.currentStep,  isComplete);
        }
      }
    }

    function _onComplete() {
    }

    /**
     * step 으로 이동한다.
     * @param {event} event
     * @param {number} step
     * @private
     */
    function _onMoveStep(event, step) {
      if (step !== $scope.currentStep && step <= $scope.completedStep) {
        $state.go(_lectureList[step]);
      }
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      $('#client-ui').addClass('full-screen');
      _detachDomEvents();
    }
  });
})();
