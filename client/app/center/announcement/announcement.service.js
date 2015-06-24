(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Announcement', Announcement);

  /* @ngInject */
  function Announcement(memberService, $document, $filter, $sce, currentSessionHelper, config, entityAPIservice) {

    this.getFilteredContentBody = getFilteredContentBody;
    this.adjustAnnouncementHeight = adjustAnnouncementHeight;
    this.getActionOwner = getActionOwner;
    this.isCurrentTopic = isCurrentTopic;

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

    /**
     * actionType 에 따라 알맞는 멤버정보를 리턴한다.
     * @param {object} announcement - server로 부터 받은 announcement object
     * @param {number} entityId - 엔티티 아이디
     * @param {string} actionType - 액션의 종류
     * @returns {*}
     * @private
     */
    function getActionOwner(announcement, entityId, actionType) {
      var memberEntity;

      memberEntity = entityAPIservice.getEntityFromListById(currentSessionHelper.getCurrentTeamMemberList(), entityId);

      return {
        'profilePic':  config.server_uploaded + memberService.getSmallThumbnailUrl(memberEntity),
        'name': memberEntity.name,
        'time': announcement[actionType]
      };
    }

    /**
     * 현재 토픽아이디과 같은지 확인한다.
     * @param {number} eventTopic - topic id
     * @returns {boolean}
     * @private
     */
    function isCurrentTopic(eventTopicId, currentTopicId) {
      return eventTopicId === currentTopicId;
    }
  }
})();
