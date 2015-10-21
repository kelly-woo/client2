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
      that.removeMessageInput = removeMessageInput;

      that.getCommentInput = getCommentInput;
      that.setCommentInput = setCommentInput;
      that.removeCommentInput = removeCommentInput;

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
     * entityId에 해당하는 message를 설정한다.
     * @param {number} entityId
     * @param {string} message
     */
    function setMessageInput(entityId, message) {
      (message != null && message != '') ? that.set(entityId, 'messageInput', message) : that.remove(entityId, 'messageInput');
    }

    /**
     * entityId에 해당하는 key/value를 삭제한다.
     * @param {number} entityId
     */
    function removeMessageInput(entityId) {
      that.remove(entityId, 'messageInput');
    }

    /**
     * entityId에 해당하는 comment를 설정한다.
     * @param {number} entityId
     */
    function getCommentInput(entityId) {
      return that.get(entityId, 'commentInput');
    }

    /**
     * entityId에 해당하는 comment를 설정한다.
     * @param {number} entityId
     * @param {string} message
     */
    function setCommentInput(entityId, message) {
      (message != null && message != '') ? that.set(entityId, 'commentInput', message) : that.remove(entityId, 'commentInput');
    }

    /**
     * entityId에 해당하는 key/value를 삭제한다.
     * @param {number} entityId
     */
    function removeCommentInput(entityId) {
      that.remove(entityId, 'commentInput');
    }
  }
})();
