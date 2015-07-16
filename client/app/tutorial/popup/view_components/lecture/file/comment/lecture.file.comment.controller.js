/**
 * @fileoverview 튜토리얼 팀 초대
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureFileCommentCtrl', function ($scope, $rootScope, $filter, jndPubSub, jndKeyCode, TutorialTutor,
                                                     TutorialAccount) {
    var TOTAL_STEP = 4;
    var _tutorDataList;
    var _purseDataList;

    $scope.onClickFile = onClickFile;
    $scope.onClickSubmit = onClickSubmit;
    $scope.onKeyDown = onKeyDown;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      TutorialAccount.promise.then(function() {
        _initTutor();
        _initAccount();
        _attachEvents();
        $scope.step = 0;
        $scope.comment = {};
        $scope.purse =_purseDataList[0];
      });
    }

    /**
     * 계정 정보를 초기화 한다.
     * @private
     */
    function _initAccount() {
      var account = TutorialAccount.getCurrent();
      $scope.name = account.name;
      $scope.profileUrl = $filter('getFileUrl')(account.u_photoThumbnailUrl.smallThumbnailUrl);
    }

    /**
     * 튜터를 초기화한다.
     * @private
     */
    function _initTutor() {
      _tutorDataList = [
        {
          title: '자!',
          content: '써치 아이콘 클릭해서 파일서랍 열어봐바',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '',
          content: '파일을 클릭해보자',
          top: 200,
          left: 300,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '코멘트 남겨보자',
          content: '코멘트 남겨',
          top: 200,
          left: 30,
          hasSkip: false,
          hasNext: false
        },
        {
          title: '잘햇어',
          content: '저걸 누르면 다운로드하거나 쉐어할수 있음. <b>다음</b> 버튼 눌러.',
          top: 200,
          left: 30,
          hasSkip: false,
          hasNext: true
        }
      ];

      _purseDataList = [
        {
          isShown: true,
          top: 0,
          left: 955
        },
        {
          isShown: true,
          top: 124,
          left: 525
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
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * file 영역 클릭시 핸들러
     */
    function onClickFile() {
      _onNextStep();
    }

    /**
     * keyDown 이벤트 핸들러
     * @param {event} keyDownEvent
     */
    function onKeyDown(keyDownEvent) {
      var keyCode = keyDownEvent.keyCode;
      if (!keyDownEvent.shiftKey && jndKeyCode.match('ENTER', keyCode)) {
        _postComment();
      }
    }

    /**
     * submit 클릭시 핸들러
     */
    function onClickSubmit() {
      _postComment();
    }

    /**
     * comment 를 포스팅 한다.
     * @private
     */
    function _postComment() {
      var jqInput = $('#file-detail-comment-input');
      var content = jqInput.val();
      if ($scope.step === 2 && _.trim(content).length > 0) {
        $scope.comment = {
          time: (new Date()).getTime(),
          content: content
        };
        jqInput.blur().val('');
        _onNextStep();
      }
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
