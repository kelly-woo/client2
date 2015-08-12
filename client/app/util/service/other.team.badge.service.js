/**
 * @fileoverview 다른 팀에 들어온 notification/badge 를 관리하는 service
 **/
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('OtherTeamBadgeManager', OtherTeamBadgeManager);

  /* @ngInject */
  function OtherTeamBadgeManager(accountService, currentSessionHelper, jndPubSub) {
    // 현재 팀을 제외한 팀들의 badge count의 총합
    var _totalBadgeCount;

    // 현재 유져가 속한 팀들의 리스트
    var _memberships;

    // 현재 보고 있는 팀의 아이디
    var _currentTeamId;

    this.init = init;
    this.getTotalBadgeCount = getTotalBadgeCount;
    this.hasBadgeInOtherTeams = hasBadgeInOtherTeams;
    this.updateTotalBadgeCount = updateTotalBadgeCount;

    /**
     * 초기화 펑션.
     */
    function init() {
      _totalBadgeCount = 0;
      _getMemberships();
      _getCurrentTeamId();
    }

    /**
     * 현재 멤버가 속한 팀들의 정보를 가져온다.
     * @private
     */
    function _getMemberships() {
      _memberships = accountService.getAccount() && accountService.getAccount().memberships;
    }

    /**
     * 현재 보고있는 팀의 아이디를 가져온다.
     * @private
     */
    function _getCurrentTeamId() {
      _currentTeamId = currentSessionHelper.getCurrentTeam() && currentSessionHelper.getCurrentTeam().id;
    }

    /**
     * 현재 팀을 제외한 팀들의 뱃지 카운트의 총합을 리턴한다.
     * @returns {number}
     */
    function getTotalBadgeCount() {
      _totalBadgeCount = 0;

      _.forEach(_memberships, function(team) {
        if (!_.isUndefined(team.unread) && team.teamId !== _currentTeamId) {
          _totalBadgeCount += team.unread;
        }
      });

      return _totalBadgeCount;
    }

    /**
     * 다른 팀에 안 읽은 메세지가 있는지 없는지 알려준다.
     * @returns {boolean}
     */
    function hasBadgeInOtherTeams() {
      return _totalBadgeCount > 0;
    }

    /**
     * 현재 가지고 있는 정보를 모두 업데이트한 후 다른 컨트롤러에게 알려준다.
     */
    function updateTotalBadgeCount() {
      init();

      getTotalBadgeCount();

      if (_totalBadgeCount >= 0) {
        jndPubSub.pub('updateTeamBadgeCount', _totalBadgeCount);
      }
    }
  }
})();

