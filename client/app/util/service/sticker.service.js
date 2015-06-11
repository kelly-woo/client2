/**
 * @fileoverview Sticker 서비스
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Sticker', Sticker);

  /* @ngInject */
  function Sticker($http, configuration, memberService) {
    var cache = {};
    var server_address = configuration.server_address;

    this.getList = getList;
    this.getRecentList = getRecentList;

    /**
     *
     * @param groupId
     * @returns {*}
     */
    function getList(groupId) {
      return $http({
        method  : 'GET',
        url     : server_address + 'stickers/groups/' + groupId
      });
    }

    /**
     *
     * @returns {*}
     */
    function getRecentList() {
      var teamId = memberService.getTeamId();
      return $http({
        method  : 'GET',
        url     : server_address + 'stickers/teams/' + teamId + '/recent'
      });
    }
  }
})();
