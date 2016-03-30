/**
 * @fileoverview mentions api
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Mentions', Mentions);

  /* @ngInject */
  function Mentions($rootScope, $http, memberService) {
    var that = this;

    that.getMentionList = getMentionList;

    /**
     * get mention list
     * @param {number} messageId
     * @param {number} count
     * @returns {*}
     */
    function getMentionList(messageId, count) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'teams/' + memberService.getTeamId() + '/messages/mentioned',
        params: {
          messageId: messageId,
          count: count
        }
      });
    }
  }
})();
