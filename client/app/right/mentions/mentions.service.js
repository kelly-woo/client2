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
     * @param {number} page list page;
     * @returns {*}
     */
    function getMentionList(page) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'teams/' + memberService.getTeamId() + '/messages/mentioned',
        data: {
          page: page || 1
        }
      });
    }
  }

})();
