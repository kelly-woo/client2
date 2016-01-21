/**
 * @fileoverfiew team 관련 socket event를 처리하는 곳
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketTeam', jndWebSocketTeam);

  /* @ngInject */
  function jndWebSocketTeam(currentSessionHelper, memberService, storageAPIservice,
                            configuration, jndWebSocketEmitter, publicService, jndWebSocketCommon) {
    var _isConnected;

    var CHECK_CONNECT_TEAM = 'check_connect_team';
    var CONNECT_TEAM = 'connect_team';
    var DISCONNECT_TEAM = 'disconnect_team';

    var TEAM_NAME_UPDATED = 'team_name_updated';
    var TEAM_DOMAIN_UPDATED = 'team_domain_updated';

    var TEAM_DELETED = 'team_deleted';
    var TEAM_LEFT = 'team_left';
    var TEAM_UPDATED = 'team_updated';

    var events = [
      //{
      //  name: CONNECT_TEAM,
      //  handler: _onConnectTeam
      //},
      //{
      //  name: CHECK_CONNECT_TEAM,
      //  handler: _onCheckConnectTeam
      //},
      {
        name: TEAM_NAME_UPDATED,
        version: 1,
        handler: _onTeamNameUpdated
      },
      {
        name: TEAM_DOMAIN_UPDATED,
        version: 1,
        handler: _onTeamDomainUpdated
      },
      {
        name: TEAM_DELETED,
        version: 1,
        handler: _onTeamDeleted
      },
      {
        name: TEAM_LEFT,
        version: 1,
        handler: _onTeamLeft
      },
      {
        name: TEAM_UPDATED,
        version: 1,
        handler: _onTeamUpdated
      }
    ];

    this.getEvents = getEvents;
    this.disconnectTeam = disconnectTeam;

    function getEvents() {
      return events;
    }

    /**
     * Socket event receiver - SUCCESS socket connection.
     *  1. let socket server know of my current TEAM by emitting 'CONNECT_TEAM' event.
     * @param data
     * @private
     */
    function _onCheckConnectTeam() {

      currentSessionHelper.setSocketConnection();

      var param = {};

      var team = currentSessionHelper.getCurrentTeam();
      var member = memberService.getMember();
      var token = storageAPIservice.getAccessToken();

      param = {
        token: token,
        teamId: team.id,
        teamName: team.name,
        memberId: member.id,
        memberName: member.name
      };

      jndWebSocketEmitter.emit(CONNECT_TEAM, param);
    }

    /**
     * Socket event receiver - connect_team
     *  1. Update local variable.
     * @param data {object} data object that comes with socket event
     * @private
     */
    function _onConnectTeam(data) {
      _isConnected = true;
    }

    /**
     * Disconnect socket connection by emitting 'disconnect_team' socket event.
     * Used when user
     *  1. signs out.
     *  2. switches team.
     */
    function disconnectTeam() {
      if (currentSessionHelper.getSocketConnection()) {
        currentSessionHelper.resetSocketConnection();

        var param = {
          teamId: memberService.getTeamId(),
          memberId: memberService.getMemberId()
        };

        jndWebSocketEmitter.emit(DISCONNECT_TEAM, param);

        // Update socket status variable.
        _isConnected = false;
      }
    }

    /**
     * Team name change event handler
     *  1. Update team name to 'data.team.name'
     * @param data {object}
     */
    function _onTeamNameUpdated(socketEvent) {
      currentSessionHelper.updateCurrentTeamName(socketEvent.team.name);
    }

    /**
     * Team domain change event handler
     *  1. alert user that domain has changed
     *  2. Re-direct user to new domain
     * @param data
     */
    function _onTeamDomainUpdated(socketEvent) {
      var newAddress = configuration.base_protocol + socketEvent.team.domain + configuration.base_url;

      //TODO: L10N here!!!
      alert('Your team domain address has been changed to ' + newAddress + '. Click \'okay\' to proceed.');

      location.href = newAddress;
    }

    /**
     * 현재 팀이 삭제되었을 경우
     * @private
     */
    function _onTeamDeleted() {
      publicService.redirectToMain();
    }

    /**
     * 현재 팀을 누군가 탈퇴했을 경우
     * @param {object} socketEvent - socket event param
     * @private
     */
    function _onTeamLeft(socketEvent) {
      if (jndWebSocketCommon.isActionFromMe(socketEvent.member.id)) {
        // 내가 현재 팀을 나갔을 경우
        publicService.redirectToMain();
      }
    }

    /**
     * 현재 팀 정보가 변경되었을 경우
     * @param {object} socketEvent - socket event param
     * @private
     */
    function _onTeamUpdated(socketEvent) {
      jndPubSub.pub('jndWebSocketTeam:teamUpdated', socketEvent);
    }
  }
})();
