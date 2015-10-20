/**
 * @fileoverview Folder 의 닫힘, 열림 값과 local storage 와의 관계를 확인하는 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderStorage', TopicFolderStorage);

  /* @ngInject */
  function TopicFolderStorage(AbstractStorageee) {
    var that = this;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _.extend(TopicFolderStorage.prototype, AbstractStorageee);

      that.getOpenStatus = getOpenStatus;
      that.setOpenStatus = setOpenStatus;
      that.removeOpenStatus = removeOpenStatus;

      that.setTeamId(null);
    }

    /**
     * folderId 의 openStatus 를 반환한다.
     * @param {number} folderId
     * @returns {boolean}
     */
    function getOpenStatus(folderId) {
      return AbstractStorageee.get.call(that, folderId, 'openStatus') !== 'close';
    }

    /**
     * folderId 의 openStatus 를 설정한다.
     * @param {number} folderId
     * @param {boolean} isOpened
     */
    function setOpenStatus(folderId, isOpened) {
      AbstractStorageee.set.call(that, folderId, 'openStatus', isOpened ? 'open' : 'close');
    }

    /**
     * folderId 에 해당하는 openStatus 를 삭제한다.
     * @param {number} folderId
     */
    function removeOpenStatus(folderId) {
      AbstractStorageee.remove.call(that, folderId, 'openStatus');
    }
  }
})();
