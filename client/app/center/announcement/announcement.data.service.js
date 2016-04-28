/**
 * @fileoverview announcement관련 api 호출을 하는 service
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('AnnouncementData', AnnouncementData);

  /* @ngInject */
  function AnnouncementData($http, memberService, config) {
    this.getAnnouncement = getAnnouncement;
    this.deleteAnnouncement = deleteAnnouncement;
    this.createAnnouncement = createAnnouncement;
    this.toggleAnnouncementStatus = toggleAnnouncementStatus;

    function getAnnouncement(topicId) {
      return $http({
        method: 'GET',
        url: config.server_address + 'teams/' + memberService.getTeamId() + '/topics/' + topicId + '/announcement'
      });
    }

    function deleteAnnouncement(topicId) {
      return $http({
        method: 'DELETE',
        url: config.server_address + 'teams/' + memberService.getTeamId() + '/topics/' + topicId + '/announcement'
      });
    }

    function createAnnouncement(topicId, messageId) {
      return $http({
        method: 'POST',
        url: config.server_address + 'teams/' + memberService.getTeamId() + '/topics/' + topicId + '/announcement',
        data: {
          messageId: messageId
        }
      });
    }

    function toggleAnnouncementStatus(memberId, topicId, isAnnouncementOpened) {
      topicId = parseInt(topicId, 10);
      return $http({
        method: 'PUT',
        url: config.server_address + 'teams/' + memberService.getTeamId() + '/members/' + memberId + '/announcement',
        data: {
          topicId: topicId,
          opened: isAnnouncementOpened
        }
      });
    }

  }
})();
