/**
 * @fileoverview User 가 속해있는 team data 를 모두 관장하는 서비스
 **/
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TeamData', TeamData);

  /* @ngInject */
  function TeamData($rootScope, accountService, currentSessionHelper, jndPubSub, CoreUtil) {
    var _teamList = [];
    var _scope = $rootScope.$new();

    this.getTeamList = getTeamList;
    this.getOtherTeamBadgeCount = getOtherTeamBadgeCount;

    _init();

    /**
     * 초기화
     * @private
     */
    function _init() {
      _attachEvents();
      _resetTeamList();
    }

    /**
     * event 를 바인딩한다.
     * @private
     */
    function _attachEvents() {
      _scope.$on('accountLoaded', _resetTeamList);
    }

    /**
     * team list 를 갱신한다.
     * @private
     */
    function _resetTeamList() {
      var account = accountService.getAccount();
      _teamList = CoreUtil.pick(account, 'memberships') || [];

      jndPubSub.pub('TeamData:updated', _teamList);
    }

    /**
     * team list 를 반환한다.
     * @returns {Array}
     */
    function getTeamList() {
      return _teamList;
    }

    /**
     * 다른 팀의 badge count를 전달함.
     * @returns {number}
     */
    function getOtherTeamBadgeCount() {
      var currentTeamId = currentSessionHelper.getCurrentTeam().id;
      var badgeCount = 0;

      _.forEach(_teamList, function(team) {
        if (!_.isUndefined(team.unread) && team.teamId !== currentTeamId) {
          badgeCount += team.unread;
        }
      });

      return badgeCount;
    }
  }
})();
