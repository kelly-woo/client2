/**
 * @fileoverview storage service for only be read client side
 * storage / localstorage 명칭 중복으로 service error발생함
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('LocalStorage', LocalStorage);

  /* @ngInject */
  function LocalStorage(memberService) {
    var that = this;
    var DELIMITER = '.';
    var localStorage = window.localStorage;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      that.get = get;
      that.set = set;
      that.remove = remove;
    }

    function get(id, property) {
      return localStorage.getItem(_getKeyName(id, property));
    }

    function set(id, property, value) {
      if (property != null && value == null) {
        value = property;
        property = null;
      }

      localStorage.setItem(_getKeyName(id, property), value);
    }

    function remove(id, property) {
      localStorage.removeItem(_getKeyName(id, property));
    }

    /**
     * 실제 local storage 에 저장될 key name
     * @param {number} id
     * @param {string} property
     * @returns {string} '3302123.topic.folder.23.openStatus'
     * @private
     */
    function _getKeyName(id, property) {
      var keyList = [
        memberService.getMemberId(),
        'topic',
        'folder',
        id || '',
        property || ''
      ];

      return keyList.join(DELIMITER);
    }
  }
})();
