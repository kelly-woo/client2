(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('teamAPIservice', teamAPIservice);

  /* @ngInject */
  function teamAPIservice($http, $filter, configuration, CoreUtil, JndUtil, accountService, memberService, Dialog, jndPubSub) {
    var team;
    var server_address = configuration.server_address;

    this.inviteToTeam = inviteToTeam;
    this.cancelInvitation = cancelInvitation;
    this.getTeamInfo = getTeamInfo;

    this.setTeam = setTeam;
    this.getTeam = getTeam;

    this.getTeamId = getTeamId;

    this.alertInvitationSuccess = alertInvitationSuccess;
    this.confirmCancelInvitation = confirmCancelInvitation;

    /**
     * 현재 team 으로 초대 메일을 송신한다.
     * @param {Array} receivers - e-mail을 수신할 주소 배열
     * @returns {*}
     */
    function inviteToTeam(receivers) {
      jndPubSub.showLoading();
      return $http({
        method: 'POST',
        url: server_address + 'teams/' + memberService.getTeamId() + '/invitations',
        data: {
          receivers: receivers,
          lang: accountService.getAccountLanguage()
        }
      }).error(_onErrorCommon)
        .finally(jndPubSub.hideLoading);
    }

    /**
     * memberId 에 해당하는 초대장을 취소한다.
     * @param {number} memberId
     * @returns {*}
     */
    function cancelInvitation(memberId) {
      jndPubSub.showLoading();
      return $http({
        method: 'DELETE',
        url: server_address + 'teams/' + memberService.getTeamId() + '/members/' + memberId + '/invitation'
      }).success(_onSuccessCancelInvitation)
        .error(_onErrorCommon)
        .finally(jndPubSub.hideLoading);
    }

    /**
     * 초대 성공시 띄워줄 alert
     */
    function alertInvitationSuccess() {
      Dialog.alert({
        allowHtml: true,
        title: $filter('translate')('@dummy-invitation-resent-title'),
        body: $filter('translate')('@dummy-invitation-resent-description')
      })
    }

    /**
     *
     * @param {number} memberId
     * @param {object} options
     *    @param {function} [options.onSuccess] 성공시 콜백
     */
    function confirmCancelInvitation(memberId, options) {
      Dialog.confirm({
        title: $filter('translate')('@dummy-invitation-cancel-title'),
        body: $filter('translate')('@dummy-invitation-cancel-description'),
        allowHtml: true,
        onClose: function(result) {
          if (result === 'okay') {
            cancelInvitation(memberId).then(CoreUtil.pick(options, 'onSuccess'));
          }
        }
      });
    }

    /**
     * invitation 취소 성공시 toast를 노출한다.
     * @param {object} result
     * @private
     */
    function _onSuccessCancelInvitation(result) {
      Dialog.success({
        title: $filter('translate')('@dummy-invitation-cancel-toast')
      });
    }

    /**
     * error 핸들러
     * @param {object} err
     * @param {number} status - 상태코드
     * @private
     */
    function _onErrorCommon(err, status) {
      JndUtil.alertUnknownError(err, status);
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
