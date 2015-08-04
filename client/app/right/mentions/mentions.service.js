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
     * @param {object} data;
     * @param {number} [data.page=1] - list page
     * @returns {*}
     */
    function getMentionList(data) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'teams/' + memberService.getTeamId() + '/messages/mentioned',
        params: {
          messageId: data.messageId,
          count: 20
        }
      });
    }
  }
})();
