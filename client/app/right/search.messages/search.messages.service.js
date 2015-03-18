(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('messageSearchHelper', messageSearchHelper);

  /* @ngInject */
  function messageSearchHelper(configuration, $http, memberService) {
    var server_address = configuration.api_address + 'inner-api/';

    var linkIdToSearch = -1;

    this.searchMessages = searchMessages;
    this.getLinkId = getLinkId;
    this.setLinkId = setLinkId;
    this.resetMessageSearch = resetMessageSearch;
    this.hasMessageToSearch = hasMessageToSearch;

    function searchMessages(messageSearchQuery) {
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + memberService.getTeamId() + '/search/messages',
        params: messageSearchQuery
      });
    }

    function setLinkId(linkId) {
      linkIdToSearch = linkId;
    }

    function getLinkId() {
      return linkIdToSearch;
    }

    function resetMessageSearch() {
      this.setLinkId(-1);
    }
    function hasMessageToSearch() {
      return linkIdToSearch != -1;
    }
  }

})();