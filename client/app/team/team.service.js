(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('teamAPIservice', teamAPIservice);

  /* @ngInject */
  function teamAPIservice($http, configuration, accountService, memberService) {
    var team;

    this.setTeam = setTeam;
    this.inviteToTeam = inviteToTeam;

    function inviteToTeam(receivers) {
      return $http({
        method: 'POST',
        url: configuration.server_address + 'invitations',
        data: {
          teamId: memberService.getTeamId(),
          receivers: receivers,
          lang: accountService.getAccountLanguage()
        }
      });
    }

    function setTeam(team) { this.team = team;}
    function getTeam() { return team;}

    function setTeamName(name) { this.team.name = name; }
  }
})();
