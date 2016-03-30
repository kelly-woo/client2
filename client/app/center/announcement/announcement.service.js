(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('Announcement', Announcement);

  /* @ngInject */
  function Announcement($document, $filter, $sce, jndPubSub, EntityHandler, memberService) {
    var _isOpened = false;

    this.getFilteredContentBody = getFilteredContentBody;
    this.adjustAnnouncementHeight = adjustAnnouncementHeight;
    this.getActionOwner = getActionOwner;
    this.isCurrentTopic = isCurrentTopic;
    this.isOpened = isOpened;
    this.setIsOpened = setIsOpened;

    /**
     * Announcement 패널 열림 상태를 저장한다.
     * @param {boolean} isOpenedFlag
     */
    function setIsOpened(isOpenedFlag) {
      _isOpened = isOpenedFlag;
    }

    /**
     * Announcement 패널이 열려있는지 여부를 반환한다.
     * @returns {boolean}
     */
    function isOpened() {
      return _isOpened;
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
        safeBody = $filter('markdown')(safeBody, ['bolditalic']);
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
      // announcement가 필요한 최소한의 높이
      var minHeight = 42;
      // announcement 의 footer height
      var footerHeight = 50;
      // announcement 의 header height
      var headerHeight = $document.find('.center-announcement-container .announcement-header').height();
      // announcement body의 wrapper
      var jqBodyWrapper = $document.find('.center-announcement-container .announcement-body-wrapper');

      var cPanelHeight = $('#msgs-container').height();
      var newHeight = (cPanelHeight - footerHeight - headerHeight) / 2;

      if (newHeight < minHeight) {
        jndPubSub.pub('minimizeAnnouncement');
      } else {
        jqBodyWrapper.css('max-height', newHeight);
      }
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

      if (memberEntity = EntityHandler.get(entityId)) {
        return {
          'profilePic': memberService.getProfileImage(memberEntity.id, 'small'),
          'name': memberEntity.name,
          'time': announcement[actionType]
        };
      }
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
