(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('AnnouncementData', AnnouncementData);

  /* @ngInject */
  function AnnouncementData($http, memberService, config) {
    var teamId = memberService.getTeamId();

    this.getAnnouncement = getAnnouncement;
    this.deleteAnnouncement = deleteAnnouncement;

    function getAnnouncement(topicId) {
      return $http({
        method: 'GET',
        url: config.server_address + 'teams/' + teamId + '/topics/' + topicId + '/announcement'
      });
    }

    function deleteAnnouncement(topicId) {
      return $http({
        method: 'DELETE',
        url: config.server_address + 'teams/' + teamId + '/topics/' + topicId + '/announcement'
      });
    }

  }
})();
