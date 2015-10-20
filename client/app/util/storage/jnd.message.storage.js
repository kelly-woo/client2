/**
 * @fileoverview Folder 의 닫힘, 열림 값과 local storage 와의 관계를 확인하는 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MessageStorage', MessageStorage);

  /* @ngInject */
  function MessageStorage(LocalStorage) {
    var that = this;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _.extend(MessageStorage.prototype, LocalStorage);

      that.getMessageInput = getMessageInput;
      that.setMessageInput = setMessageInput;

      that.setMiddleKey('entity.message');
    }

    /**
     * entityId에 해당하는 message 를 반환한다.
     * @param {number} entityId
     * @returns {boolean}
     */
    function getMessageInput(entityId) {
      return that.get(entityId, 'messageInput');
    }

    /**
     * folderId 의 openStatus 를 설정한다.
     * @param {number} folderId
     * @param {boolean} isOpened
     */
    function setMessageInput(entityId, message) {
      that.set(entityId, 'messageInput', message);
    }
  }
})();
