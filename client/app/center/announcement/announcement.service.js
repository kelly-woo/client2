(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Announcement', Announcement);

  /* @ngInject */
  function Announcement($http, memberService, config, $document, $filter, $sce) {
    var teamId = memberService.getTeamId();

    this.getAnnouncement = getAnnouncement;
    this.removeAnnouncement = removeAnnouncement;
    this.getFilteredContentBody = getFilteredContentBody;

    function getAnnouncement(topicId) {
      return $http({
        method: 'GET',
        url: config.server_address + 'teams/' + teamId + '/topics/' + topicId + '/announcement'
      });
    }

    function removeAnnouncement() {
      var jqAnnouncementContainer = $document.find('body .center-announcement-container').eq(0);
      jqAnnouncementContainer.remove();
    }


    /**
     * 메세지를 노출하기 알맞게 가공한다.
     * @param {object} msg 메세지
     * @private
     */
    function getFilteredContentBody(msg) {
      // TODO: center 와 중복 로직이다! center refactor 끝난 후 하나로 합츼자.
      var safeBody = msg;
      if (safeBody != undefined && safeBody !== "") {
        safeBody = $filter('parseAnchor')(safeBody);
      }
      return $sce.trustAsHtml(safeBody);
    }
  }
})();
