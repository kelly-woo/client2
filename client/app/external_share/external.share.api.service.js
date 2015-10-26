/**
 * @fileoverview external share api service
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ExternalShareAPIService', ExternalShareAPIService);

  /* @ngInject */
  function ExternalShareAPIService($http, memberService, configuration) {
    var that = this;
    var _server_address = configuration.server_address;
    var _teamId = memberService.getTeamId();

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      that.share = share;
      that.unShare = unShare;
    }

    /**
     * 외부 파일 공유 설정한다.
     * @param {number|string} fileId
     * @param {number|string} [teamId=현재팀]
     * @returns {*}
     */
    function share(fileId, teamId) {
      teamId = teamId || _teamId;
      return $http({
        method: 'PUT',
        url: _server_address + 'teams/' + teamId + '/files/' + fileId + '/externalShared'
      });
    }

    /**
     * 외부 파일 공유 해제한다.
     * @param {number|string} fileId
     * @param {number|string} [teamId=현재팀]
     * @returns {*}
     */
    function unShare(fileId, teamId) {
      teamId = teamId || _teamId;
      return $http({
        method: 'DELETE',
        url: _server_address + 'teams/' + teamId + '/files/' + fileId + '/externalShared'
      });
    }
  }
})();
