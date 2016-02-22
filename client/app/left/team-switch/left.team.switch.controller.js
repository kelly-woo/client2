/**
 * @filevoerview team switch 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LeftTeamSwitchCtrl', LeftTeamSwitchCtrl);

  /* @ngInject */
  function LeftTeamSwitchCtrl($scope, TeamData, currentSessionHelper, configuration) {
    $scope.teamList = [];
    $scope.isShow = false;
    $scope.currentTeamId = currentSessionHelper.getCurrentTeam().id;

    $scope.go = go;

    _init();

    /**
     * 초기화 함수
     * @private
     */
    function _init() {
      _attachEvents();
      _resetTeamList();
    }

    /**
     * 이벤트를 바인딩한다
     * @private
     */
    function _attachEvents() {
      $scope.$on('TeamData:updated', _resetTeamList);
    }

    /**
     * team list 정보를 업데이트 한다
     * @private
     */
    function _resetTeamList() {
      var teamList = TeamData.getTeamList();
      $scope.teamList = _.map(teamList, function(team) {
        team.extHasUnread = (team.unread > 0);
        return team;
      });
    }

    /**
     * 해당 팀으로 이동한다.
     * @param {object} team
     */
    function go(team) {
      window.location.href = configuration.base_protocol + team.t_domain + configuration.base_url;
    }
  }

})();