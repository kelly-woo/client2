/**
 *
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

    function getList(groupId) {
      groupId = 8409;
      return $http({
        method  : 'GET',
        url     : server_address + 'stickers/groups/' + groupId
      });
    }
    function getRecentList() {
      var teamId = memberService.getTeamId();
      return $http({
        method  : 'GET',
        url     : server_address + 'stickers/teams/' + teamId + '/recent'
      });
    }
  }
})();
