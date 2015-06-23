(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('teamAPIservice', teamAPIservice);

  /* @ngInject */
  function teamAPIservice($http, configuration, accountService, memberService) {
    var team;

    this.inviteToTeam = inviteToTeam;
    this.getTeamInfo = getTeamInfo;

    this.setTeam = setTeam;
    this.getTeam = getTeam;

    this.getTeamId = getTeamId;

    function inviteToTeam(receivers) {
      return $http({
        method: 'POST',
        url: configuration.server_address + 'teams/' + memberService.getTeamId() + '/invitations',
        data: {
          receivers: receivers,
          lang: accountService.getAccountLanguage()
        }
      });
    }

    function getTeamInfo(teamId) {
      return $http({
        method  : 'GET',
        url     : configuration.server_address  + 'teams/' + (teamId == null ? memberService.getTeamId() : teamId)
      });
    }

    function setTeam(team) { this.team = team;}
    function getTeam() { return team;}

    function getTeamId() {
      return team.id;
    }
    function setTeamName(name) { this.team.name = name; }
  }
})();
