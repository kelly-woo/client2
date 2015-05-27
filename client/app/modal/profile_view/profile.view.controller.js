(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('profileViewerCtrl', profileViewerCtrl);

  /* @ngInject */
  function profileViewerCtrl($scope, curUser, $state, modalHelper, jndPubSub) {

    (function() {
      init();
    })();

    function init() {
      $scope.curUser = curUser;

      $scope.isUserDisabled = _isCurrentUserDisabled();
      $scope.isMyself = _isMyself();
    }

    /**
     * 프로필 모달에서 버튼을 눌렀을 경우 해당하는 기능은 불러준다.
     * @param actionType {string} 실행되어야 할 기능의 이름
     */
    $scope.onActionClick = function(actionType) {
      if (actionType === 'file') {
        _onFileListClick(curUser.id);
      } else if (actionType === 'email') {
        _sendEmail($scope.curUser.u_email);
      } else if (actionType === 'directMessage' && !_isMyself()) {
        _goToDM(curUser.id);
      }

      modalHelper.closeModal();
    };

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
      jndPubSub.pub('setFileTabActive');
    }

    /**
     * 현재 보고 있는 사용자가 disabled 된 사용자인지 아닌지 확인한다.
     * @returns {boolean} true, disabled 됐다면
     * @private
     */
    function _isCurrentUserDisabled() {
      return $scope.curUser.status === 'disabled';
    }

    /**
     * 현재 보고 있는 사용자가 나 자신인지 아닌지 확인한다.
     * @returns {boolean} true, 내 자신이면
     * @private
     */
    function _isMyself() {
      return $scope.curUser === $scope.member;
    }

    /**
     * 이메일을 보내는 창을 연다.
     * @param emailAddr {string} 보냉 이메일 주소
     * @private
     */
    function _sendEmail(emailAddr) {
      if (_isCurrentUserDisabled()) {
        return;
      }

      window.location.href = "mailto:" + emailAddr;
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
