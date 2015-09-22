/**
 * @fileoverview Folder 의 닫힘, 열림 값과 local storage 와의 관계를 확인하는 서비스
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

    /**
     * folderId 의 openStatus 를 반환한다.
     * @param {number} folderId
     * @returns {boolean}
     */
    function getOpenStatus(folderId) {
      return _get(folderId, 'openStatus') !== 'close';
    }

    /**
     * folderId 의 openStatus 를 설정한다.
     * @param {number} folderId
     * @param {boolean} isOpened
     */
    function setOpenStatus(folderId, isOpened) {
      var status = isOpened ? 'open' : 'close';
      _set(folderId, 'openStatus', status);
    }

    /**
     * folderId 에 해당하는 openStatus 를 삭제한다.
     * @param folderId
     */
    function removeOpenStatus(folderId) {
      remove(folderId, 'openStatus');
    }

    /**
     * folderId 와 key 에 해당하는 값을 반환한다.
     * @param {number} folderId
     * @param {string} key
     * @return {string}
     * @private
     */
    function _get(folderId, key) {
      return localStorage.getItem(_getRealKeyName(folderId, key));
    }

    /**
     * folderId 와 key 에 해당하는 storage 에 value 를 설정한다.
     * @param {number} folderId
     * @param {string} key
     * @param {string} value
     * @private
     */
    function _set(folderId, key, value) {
      localStorage.setItem(_getRealKeyName(folderId, key), value);
    }

    /**
     * storage 에서 folderId 와 key 에 해당하는 값을 제거한다.
     * @param {number} folderId
     * @param {string} key
     */
    function remove(folderId, key) {
      localStorage.removeItem(_getRealKeyName(folderId, key));
    }

    /**
     * 실제 local storage 에 저장될 key name
     * @param {string} folderId
     * @param {number} key
     * @returns {string} '3302123.topic.folder.23.openStatus'
     * @private
     */
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
