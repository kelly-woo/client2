/**
 * @fileoverview Center renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderStorage', TopicFolderStorage);

  /* @ngInject */
  function TopicFolderStorage(memberService) {
    var DELIMITER = '.';
    var localStorage = window.localStorage;

    this.getOpenStatus = getOpenStatus;
    this.setOpenStatus = setOpenStatus;
    this.removeOpenStatus = removeOpenStatus;
    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {

    }

    function getOpenStatus(folderId) {
      return get(folderId, 'openStatus') !== 'close';
    }

    function setOpenStatus(folderId, isOpened) {
      var status = isOpened ? 'open' : 'close';
      set(folderId, 'openStatus', status);
    }
    function removeOpenStatus(folderId) {
      remove(folderId, 'openStatus');
    }

    function get(folderId, key) {
      return localStorage.getItem(_getRealKeyName(folderId, key));
    }

    function set(folderId, key, value) {
      localStorage.setItem(_getRealKeyName(folderId, key), value);
    }

    function remove(folderId, key) {
      localStorage.removeItem(_getRealKeyName(key));
    }


    function _getRealKeyName(folderId, key) {
      var keyList = [
        memberService.getMemberId(),
        'topic',
        'folder',
        folderId || '',
        key || ''
      ];

      return keyList.join(DELIMITER);
    }
  }
})();
