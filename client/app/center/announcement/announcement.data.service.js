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
    this.createAnnouncement = createAnnouncement;
    this.toggleAnnouncementStatus = toggleAnnouncementStatus;

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

    function createAnnouncement(topicId, messageId) {
      return $http({
        method: 'POST',
        url: config.server_address + 'teams/' + teamId + '/topics/' + topicId + '/announcement',
        data: {
          messageId: messageId
        }
      });
    }

    function toggleAnnouncementStatus(memberId, topicId, isAnnouncementOpened) {
      topicId = parseInt(topicId, 10);
      return $http({
        method: 'PUT',
        url: config.server_address + 'teams/' + teamId + '/members/' + memberId + '/announcement',
        data: {
          topicId: topicId,
          opened: isAnnouncementOpened
        }
      });
    }

  }
})();
