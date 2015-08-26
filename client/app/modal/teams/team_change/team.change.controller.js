/**
 * @fileoverview team switch modal view 의 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamChangeController', TeamChangeController);

  function TeamChangeController($scope, $timeout, modalHelper, accountService, currentSessionHelper) {

    _init();

    /**
     * 초기화 펑션
     * @private
     */
    function _init() {
      // 우선적으로 보여줄 팀
      $scope.teamList;

      $scope.showLoadingBar = false;
      $scope.isListReady = false;

      $scope.currentTeamId = currentSessionHelper.getCurrentTeam().id;

      $scope.onModalClose = modalHelper.closeModal;
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
      // 1000ms후 loadingbar 출력
      $timeout(function() {
        if (!$scope.isListReady) {
          $scope.showLoadingBar = true;
        }
      }, 1000);

      accountService.getAccountInfo()
        .success(_onUpdateAccountSuccess)
        .error(_onUpdateAccountError)
        .finally(_onUpdateAccountFinally);
    }

    /**
     * 어카운트와 관련된 팀 정보들을 업데이트한다.
     * @param {object} response - response object that contains new account info
     * @private
     */
    function _onUpdateAccountSuccess(response) {
      var account = response;
      accountService.setAccount(account);
      _setTeamList(account.memberships);
    }

    /**
     * 어카운트를 새로 가져와서 memberships를 갈아치운다!
     * @private
     */
    function _updateTeamBadgeCount() {
      _setTeamList(accountService.getAccount().memberships);
    }

    /**
     * @param memberships
     * @private
     */
    function _setTeamList(memberships) {
      $scope.teamList = _.reject(memberships, function(membership) {
        return membership.teamId === $scope.currentTeamId;
      });
    }

    /**
     * 애석하게도 업데이트할때 오류가 났다.
     * @param {object} err - error object from server
     * @private
     */
    function _onUpdateAccountError() {

    }

    /**
     * 어카운트와 관련된 팀 정보들을 업데이트 finally
     * @private
     */
    function _onUpdateAccountFinally() {
      if ($scope.teamList == null) {
        $scope.teamList = _setTeamList(accountService.getAccount().memberships);
      }

      $scope.showLoadingBar = false;
      $scope.isListReady = true;
    }
  }
})();
