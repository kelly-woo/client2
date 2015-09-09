/**
 * @fileoverview browser notification 을 도와주는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('DesktopNotificationUtil', DesktopNotificationUtil);

  /* @ngInject */
  function DesktopNotificationUtil() {
    this.isChatType = isChatType;

    this.getRoomTypeForRoute = getRoomTypeForRoute;
    this.getRoomIdTogo = getRoomIdTogo;

    this.getFileTitleFormat = getFileTitleFormat;
    this.getSenderContentFormat = getSenderContentFormat;
    this.getRoomFormat = getRoomFormat;

    /**
     * socketEvent가 dm을 향한건지 토픽을 향한건지 확인한다.
     * @param {object} socketEvent - socket event paramter
     * @returns {boolean}
     */
    function isChatType(socketEvent) {
      return socketEvent.room.type === 'chat';
    }

    /**
     * route에 사용되어질 entityType을 리턴한다.
     * @param {object} socketEvent - socket event parameter
     * @returns {string}
     */
    function getRoomTypeForRoute(socketEvent) {
      if (isChatType(socketEvent)) {
        return 'users';
      }
      return socketEvent.room.type + 's';
    }

    /**
     * route에 사용되어질 entityId를 리턴한다.
     * @param {object} socketEvent - socket event paramter
     * @returns {*}
     */
    function getRoomIdTogo(socketEvent) {
      if (isChatType(socketEvent)) {
        return socketEvent.writer;
      }

      return socketEvent.room.id;
    }

    /**
     * browser notification에서 사용되어질 file title에 대한 format에 맞춰 리턴한다.
     * @param {string} title - file title
     * @returns {string}
     */
    function getFileTitleFormat(title) {
      return '<' + title + '>';
    }

    /**
     * browser notification에서 사용되어질 '이름: 내용' 포맷을 리턴한다.
     * @param {string} senderName - 작성자 이름
     * @param {string} content - 내용
     * @returns {string}
     */
    function getSenderContentFormat(senderName, content) {
      return senderName + ': ' + content;
    }

    /**
     * browser notification에서 사용되어질 토픽 이름에 대한 포맷을 리턴한다.
     * @param {object} title - 토픽 이름
     * @returns {string}
     */
    function getRoomFormat(title) {
      return '[' + title + ']';
    }
  }
})();
