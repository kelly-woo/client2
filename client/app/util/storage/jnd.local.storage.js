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
    var localStorage = window.localStorage;
    var DELIMITER = '.';

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      that.get = get;
      that.set = set;
      that.remove = remove;

      that.setMiddleKey = setMiddleKey;
    }

    function get(id, property) {
      return localStorage.getItem(_getKeyName.call(this, id, property));
    }

    function set(id, property, value) {
      localStorage.setItem(_getKeyName.call(this, id, property), value);
    }

    function remove(id, property) {
      localStorage.removeItem(_getKeyName.call(this, id, property));
    }

    function setMiddleKey(value) {
      this.middleKey = value;
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
        this.middleKey || '',
        id || '',
        property || ''
      ];

      return keyList.join(DELIMITER);
    }
  }
})();
