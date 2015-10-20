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

      that.getInputMessage = getInputMessage;
      that.setInputMessage = setInputMessage;
    }

    /**
     * entityId에 해당하는 message 를 반환한다.
     * @param {number} entityId
     * @returns {boolean}
     */
    function getInputMessage(entityId) {
      return LocalStorage.get.call(that, entityId, 'inputMessage');
    }

    /**
     * folderId 의 openStatus 를 설정한다.
     * @param {number} folderId
     * @param {boolean} isOpened
     */
    function setInputMessage(entityId, message) {
      LocalStorage.set.call(that, entityId, 'inputMessage', message);
    }
  }
})();
