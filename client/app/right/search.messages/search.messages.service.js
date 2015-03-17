(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('messageSearchHelper', messageSearchHelper);

  /* @ngInject */
  function messageSearchHelper(configuration, $http, memberService) {
    var server_address = configuration.api_address + 'inner-api/';
    this.searchMessages = searchMessages;

    function searchMessages(messageSearchQuery) {
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + memberService.getTeamId() + '/search/messages',
        params: messageSearchQuery
      });
    }
  }

})();