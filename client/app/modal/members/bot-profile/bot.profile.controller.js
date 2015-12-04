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
      curBot.exProfileImg = $filter('getSmallThumbnail')(curBot);
      $scope.curBot = curBot;
      $scope.isDeactivatedUser = _isDeactivatedUser();
      $scope.isMyself = _isMyself();
      $scope.$on('updateMemberProfile', _onUpdateMemberProfile);
    }

    /**
     * 프로필 모달에서 버튼을 눌렀을 경우 해당하는 기능은 불러준다.
     * @param actionType {string} 실행되어야 할 기능의 이름
     */
    $scope.onActionClick = function(actionType) {
      if (actionType === 'file') {
        _onFileListClick(curBot.id);
      } else if (actionType === 'email') {
        _sendEmail($scope.curBot.u_email);
      } else if (actionType === 'directMessage' && !_isMyself()) {
        _goToDM(curBot.id);
      }

      modalHelper.closeModal();
    };

    /**
     * updateMemberProfile 이벤트 발생시 이벤트 핸들러
     * @param {object} event
     * @param {{event: object, member: object}} data
     * @private
     */
    function _onUpdateMemberProfile(event, data) {
      var member = data.member;
      if ($scope.curBot.id === member.id) {
        $scope.curBot.exProfileImg = $filter('getSmallThumbnail')(member);
      }
    }

    /**
     * 해당 유저의 파일리스트를 연다.
     * @param userId {number} 해당 유저의 아이디.
     * @private
     */
    function _onFileListClick(userId) {
      if ($state.current.name != 'messages.detail.files') {
        $state.go('messages.detail.files');
      }

      jndPubSub.pub('updateFileWriterId', userId);
    }

    /**
     * 현재 보고 있는 사용자가 disabled 된 사용자인지 아닌지 확인한다.
     * @returns {boolean} true, disabled 됐다면
     * @private
     */
    function _isDeactivatedUser() {
      var deactivatedMessageKey;
      var isDeactivated = false;

      if (memberService.isDisabled($scope.curBot)) {
        isDeactivated = true;
        deactivatedMessageKey = '@common-disabled-member-profile-msg';
      } else if (memberService.isDeleted($scope.curBot)) {
        isDeactivated = true;
        deactivatedMessageKey = '@common-deleted-member-profile-msg';
      }

      if (isDeactivated) {
        $scope.deactivatedMessage = $filter('translate')(deactivatedMessageKey);
      }

      return isDeactivated;
    }

    /**
     * 현재 보고 있는 사용자가 disabled 된 사용자인지 아닌지 확인한다.
     * @returns {boolean} true, disabled 됐다면
     * @private
     */
    function _isCurrentUserDisabled() {
      return $scope.curBot.status === 'disabled';
    }

    /**
     * 현재 보고 있는 사용자가 나 자신인지 아닌지 확인한다.
     * @returns {boolean} true, 내 자신이면
     * @private
     */
    function _isMyself() {
      return $scope.curBot === $scope.member;
    }

    /**
     * 이메일을 보내는 창을 연다.
     * @param emailAddr {string} 보냉 이메일 주소
     * @private
     */
    function _sendEmail(emailAddr) {
      if (!_isCurrentUserDisabled()) {
        window.location.href = "mailto:" + emailAddr;
      }
    }

    /**
     * 1:1 대화로 옮긴다.
     * @param userId {number} 1:1 대화를 할 상대의 아이디
     * @private
     */
    function _goToDM(userId) {
      if (_isMyself()) {
        return;
      }

      // TODO: REFACTOR ROUTE.SERVICE
      var routeParam = {
        entityType: 'users',
        entityId: userId
      };

      $state.go('archives', routeParam);
    }
  }
})();
