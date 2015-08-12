/**
 * @fileoverview team switch modal view 의 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamChangeController', TeamChangeController);

  function TeamChangeController($scope, modalHelper, accountService) {
    // 우선적으로 보여줄 팀
    $scope.teamList;
    $scope.onModalClose = modalHelper.closeModal;

    _init();

    /**
     * 초기화 펑션
     * @private
     */
    function _init() {
      $scope.teamList = accountService.getAccount().memberships;
      _updateAccount();
      _attachEventListener();
    }

    /**
     * 현재 스코프가 듣고 싶은 이벤트들.
     * @private
     */
    function _attachEventListener() {
      $scope.$on('updateTeamBadgeCount', _updateTeamBadgeCount);
    }

    /**
     * 어카운트정보를 업데이트한다.
     * @private
     */
    function _updateAccount() {
      accountService.getAccountInfo()
        .success(_onUpdateAccountSuccess)
        .error(_onUpdateAccountError);
    }

    /**
     * 어카운트와 관련된 팀 정보들을 업데이트한다.
     * @param {object} response - response object that contains new account info
     * @private
     */
    function _onUpdateAccountSuccess(response) {
      var account = response;
      accountService.setAccount(account);
      $scope.teamList = account.memberships;
    }

    /**
     * 어카운트를 새로 가져와서 memberships를 갈아치운다!
     * @private
     */
    function _updateTeamBadgeCount() {
      $scope.teamList = accountService.getAccount().memberships;
    }

    /**
     * 애석하게도 업데이트할때 오류가 났다.
     * @param {object} err - error object from server
     * @private
     */
    function _onUpdateAccountError(err) {

    }
  }
})();
