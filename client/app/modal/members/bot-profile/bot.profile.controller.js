/**
 * @fileoverview 봇의 프로필을 보는 모달창의 컨트롤러.
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('BotProfileCtrl', BotProfileCtrl);

  /* @ngInject */
  function BotProfileCtrl($scope, $filter, curBot, $state, modalHelper, jndPubSub, memberService) {

    (function() {
      init();
    })();

    function init() {
      curBot.exProfileImg = memberService.getProfileImage(curBot.id, 'small');
      $scope.curBot = curBot;
      $scope.$on('updateMemberProfile', _onUpdateMemberProfile);

      $scope.onDmClick = onDmClick;
    }

    /**
     * updateMemberProfile 이벤트 발생시 이벤트 핸들러
     * @param {object} event
     * @param {{event: object, member: object}} data
     * @private
     */
    function _onUpdateMemberProfile(event, data) {
      var member = data.member;
      if ($scope.curBot.id === member.id) {
        $scope.curBot.exProfileImg = memberService.getProfileImage(curBot, 'small');
      }
    }

    /**
     * 1:1 대화로 옮긴다.
     * @param userId {number} 1:1 대화를 할 상대의 아이디
     * @private
     */
    function onDmClick() {
      // TODO: REFACTOR ROUTE.SERVICE
      var routeParam = {
        entityType: 'users',
        entityId: $scope.curBot.id
      };

      $state.go('archives', routeParam);
    }
  }
})();
