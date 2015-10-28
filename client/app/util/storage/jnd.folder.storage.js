/**
 * @fileoverview Folder 의 닫힘, 열림 값과 local storage 와의 관계를 확인하는 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndTopicFolderStorage', JndTopicFolderStorage);

  /* @ngInject */
  function JndTopicFolderStorage(JndLocalStorage) {
    var that = this;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _.extend(JndTopicFolderStorage.prototype, JndLocalStorage);

      that.getOpenStatus = getOpenStatus;
      that.setOpenStatus = setOpenStatus;
      that.removeOpenStatus = removeOpenStatus;

      that.setMiddleKey('topic.folder');
    }

    /**
     * folderId 의 openStatus 를 반환한다.
     * @param {number} folderId
     * @returns {boolean}
     */
    function getOpenStatus(folderId) {
      return that.get(folderId, 'openStatus') !== 'close';
    }

    /**
     * folderId 의 openStatus 를 설정한다.
     * @param {number} folderId
     * @param {boolean} isOpened
     */
    function setOpenStatus(folderId, isOpened) {
      that.set(folderId, 'openStatus', isOpened ? 'open' : 'close');
    }

    /**
     * folderId 에 해당하는 openStatus 를 삭제한다.
     * @param {number} folderId
     */
    function removeOpenStatus(folderId) {
      that.remove(folderId, 'openStatus');
    }
  }
})();
