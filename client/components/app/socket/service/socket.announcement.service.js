/**
 * @fileoverview announcement 관련 소켓 이벤트에 따라 다른 로직으로 처리하는 곳.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketAnnouncement', jndWebSocketAnnouncement);

  /* @ngInject */
  function jndWebSocketAnnouncement(jndPubSub, config) {

    var ANNOUNCEMENT_CREATED =  config.socketEvent.announcement.created;
    var ANNOUNCEMENT_DELETED = config.socketEvent.announcement.deleted;
    var ANNOUNCEMENT_STATUS_UPDATED = config.socketEvent.announcement.status_updated;

    var events = [
      {
        name: ANNOUNCEMENT_CREATED,
        version: 1,
        handler: _onAnnouncementCreated
      },
      {
        name: ANNOUNCEMENT_DELETED,
        version: 1,
        handler: _onAnnouncementDeleted
      },
      {
        name: ANNOUNCEMENT_STATUS_UPDATED,
        version: 1,
        handler: _onAnnouncementStatusUpdated
      }
    ];

    this.getEvents = getEvents;
    function getEvents() {
      return events;
    }

    /**
     * announcement 가 생성됐다는 소켓 이벤트를 처리한다.
     * @param {object} data - socket event param
     * @private
     */
    function _onAnnouncementCreated(data) {
      jndPubSub.pub(config.socketEvent.announcement.created, data.data);
    }

    /**
     * announcement 가 삭제됐다는 소켓 이벤트를 처리한다.
     * @param {object} data - socket event param
     * @private
     */
    function _onAnnouncementDeleted(data) {
      jndPubSub.pub(config.socketEvent.announcement.deleted, data.data);
    }

    /**
     * announcement 의 status 가 변경됐다는 소켓 이벤트를 처리한다.
     * @param {object} data - socket event param
     * @private
     */
    function _onAnnouncementStatusUpdated(data) {
      jndPubSub.pub(config.socketEvent.announcement.status_updated, data.data);
    }
  }
})();
