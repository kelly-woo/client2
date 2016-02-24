/**
 * @fileoverview team switch modal view 의 controller
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('TeamChangeController', TeamChangeController);

  function TeamChangeController($scope, modalHelper, currentSessionHelper, publicService, TeamData) {

    $scope.redirectToMain = publicService.redirectToMain;
    _init();

    /**
     * 초기화 펑션
     * @private
     */
    function _init() {
      // 우선적으로 보여줄 팀
      $scope.teamList = [];

      $scope.emptyTeamList = false;
      $scope.showLoadingBar = false;
      $scope.isListReady = false;

      $scope.currentTeamId = currentSessionHelper.getCurrentTeam().id;

      $scope.onModalClose = modalHelper.closeModal;
      _attachEventListener();
      _resetTeamList();
    }

    /**
     * 이벤트 리스너
     * @private
     */
    function _attachEventListener() {
      $scope.$on('TeamData:updated', _resetTeamList);
    }


    /**
     * team list 정보를 업데이트 한다
     * @private
     */
    function _resetTeamList() {
      var teamList = TeamData.getTeamList();
      $scope.teamList = _.reject(teamList, function(team) {
        return team.teamId === $scope.currentTeamId;
      });

      if ($scope.teamList.length < 1) {
        $scope.emptyTeamList = true;
      }
      $scope.showLoadingBar = false;
      $scope.isListReady = true;
    }
  }
})();
