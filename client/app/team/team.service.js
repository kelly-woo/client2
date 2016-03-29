(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('teamAPIservice', teamAPIservice);

  /* @ngInject */
  function teamAPIservice($http, configuration, accountService, memberService) {
    var team;
    var server_address = configuration.server_address;

    this.inviteToTeam = inviteToTeam;
    this.cancelInvitation = cancelInvitation;
    this.getTeamInfo = getTeamInfo;

    this.setTeam = setTeam;
    this.getTeam = getTeam;

    this.getTeamId = getTeamId;

    /**
     * 현재 team 으로 초대 메일을 송신한다.
     * @param {Array} receivers - e-mail을 수신할 주소 배열
     * @returns {*}
     */
    function inviteToTeam(receivers) {
      return $http({
        method: 'POST',
        url: server_address + 'teams/' + memberService.getTeamId() + '/invitations',
        data: {
          receivers: receivers,
          lang: accountService.getAccountLanguage()
        }
      });
    }

    /**
     * memberId 에 해당하는 초대장을 취소한다.
     * @param {number} memberId
     * @returns {*}
     */
    function cancelInvitation(memberId) {
      return $http({
        method: 'DELETE',
        url: server_address + 'teams/' + memberService.getTeamId() + '/members/' + memberId + '/invitation'
      });
    }

    function getTeamInfo(teamId) {
      return $http({
        method  : 'GET',
        url     : server_address  + 'teams/' + (teamId == null ? memberService.getTeamId() : teamId)
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
