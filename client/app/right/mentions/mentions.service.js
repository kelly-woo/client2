/**
 * @fileoverview mentions api
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MentionsAPI', MentionsAPI);

  /* @ngInject */
  function MentionsAPI($rootScope, $http, memberService) {
    var that = this;

    that.getMentionList = getMentionList;

    /**
     * get mention list
     * @param {object} data
     * @param {number} data.messageId
     * @param {number} [data.count=40]
     * @returns {*}
     */
    function getMentionList(data) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'teams/' + memberService.getTeamId() + '/messages/mentioned',
        params: {
          messageId: data.messageId,
          count: 40
        }
      });
    }
  }
})();
