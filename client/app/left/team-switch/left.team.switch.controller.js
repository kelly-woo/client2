/**
 * @filevoerview team switch 컨트롤러
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('LeftTeamSwitchCtrl', LeftTeamSwitchCtrl);

  /* @ngInject */
  function LeftTeamSwitchCtrl($scope, TeamData, currentSessionHelper, HybridAppHelper) {
    var _currentTeamId = currentSessionHelper.getCurrentTeam().id;

    $scope.teamList = [];

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
      var otherTeamBadgeCount = TeamData.getOtherTeamBadgeCount();

      $scope.teamList = _.chain(teamList)
        .filter(function(team) {
          return _currentTeamId !== team.teamId;
        })
        .sortBy(function(team) {
          return [!(team.unread > 0), team.name.toLowerCase()];
        })
        .value();

      $scope.hasOtherTeam = $scope.teamList.length > 0;

      // badge 존재 여부
      $scope.hasBadge = otherTeamBadgeCount > 0;

      // teamList 정보가 갱신 되었으므로 Hybrid App의 badge도 갱신한다.
      HybridAppHelper.updateBadge();
    }
  }

})();
