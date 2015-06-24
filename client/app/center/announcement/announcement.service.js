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
    this.adjustAnnouncementHeight = adjustAnnouncementHeight;

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


    /**
     * announcement 의 body-wrapper element 의 높이를 조절한다.
     *  메세지를 담고 있는 컨테이너의 높이
     *  빼기 announcement header 의 높이
     *  빼기 announcement footer 의 높이
     *  한 후 나누기 2
     */
    function adjustAnnouncementHeight() {
      var centerPanelHeight;
      var announcementFooterHeight;
      var announcementHeaderHeight;
      var jqAnnouncementBodyWrapper;

      centerPanelHeight = $document.find('#msgs-container').eq(0).height();

      //announcementFooterHeight = $document.find('.center-announcement-container .announcement-option-container').eq(0).height();
      announcementFooterHeight = 50;
      announcementHeaderHeight = $document.find('.center-announcement-container .announcement-header').eq(0).height();

      jqAnnouncementBodyWrapper = $document.find('.center-announcement-container .announcement-body-wrapper').eq(0);

      jqAnnouncementBodyWrapper.css('max-height', (centerPanelHeight - announcementFooterHeight - announcementHeaderHeight) / 2);
    }
  }
})();
