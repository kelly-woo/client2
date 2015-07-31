(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('StarsAPI', StarsAPI);

  /* @ngInject */
  function StarsAPI(configuration, $http, memberService) {
    var that = this;

    that.getStarList = getStarList;

    /**
     * get star list
     * @param {object} data;
     * @param {number} [data.page=1] - list page
     * @returns {*}
     */
    function getStarList(data) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'teams/' + memberService.getTeamId() + '/messages/mentioned',
        params: {
          page: data.page || 1
        }
      });
    }
  }

})();
