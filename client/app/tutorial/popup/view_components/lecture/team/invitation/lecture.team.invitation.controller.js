/**
 * @fileoverview 튜토리얼 팀 초대 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  var app = angular.module('jandiApp');

  app.controller('lectureTeamInvitationCtrl', function ($scope, $rootScope, jndPubSub) {
    var _layer;
    var TOTAL_STEP = 4;
    $scope.step = 0;

    _init();

    /**
     * initialize
     * @private
     */
    function _init() {
      $scope.$parent.$parent.tutor = {
        top: 200,
        left: 300,
        hasSkip: false,
        title: 'Welcome start',
        content: 'welcome to jandi'
      };
      _attachEvents();
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
      if ($scope.step + 1 === TOTAL_STEP) {
        jndPubSub.pub('tutorial:nextLecture');
      } else {
        $scope.step++;
      }
    }
  });
})();
