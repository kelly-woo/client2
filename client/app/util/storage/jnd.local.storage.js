/**
 * @fileoverview storage service for only be read client side
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('LocalStorage', LocalStorage);

  /* @ngInject */
  function LocalStorage(memberService) {
    var that = this;
    var webStorage = window.localStorage;
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
      that.removeAll = removeAll;

      that.setMiddleKey = setMiddleKey;
      that.getKeyName = getKeyName;
    }

    /**
     * storage에 저장된 data를 전달한다.
     * @param {number|string} id
     * @param {string} property
     */
    function get(id, property) {
      return webStorage.getItem(this.getKeyName(id, property));
    }

    /**
     * storage에 data를 설정한다.
     * @param {number|string} id
     * @param {string} property
     * @param value
     */
    function set(id, property, value) {
      try {
        webStorage.setItem(this.getKeyName(id, property), value);
      } catch(e) {}
    }

    /**
     * storage에 특정 item을 삭제한다.
     * @param {number|string} id
     * @param {string} property
     */
    function remove(id, property) {
      webStorage.removeItem(this.getKeyName(id, property));
    }

    /**
     * storage에 특정 property에 해당하는 모든 item을 삭제한다.
     * @param {string} property
     */
    function removeAll(property) {
      var regxKey = new RegExp(this.middleKey + '\\' + DELIMITER + '([\\w]+)\\' + DELIMITER + property + '$');
      var e;
      var match;

      for (e in webStorage) {
        if (match = regxKey.exec(e)) {
          this.remove(match[1], property);
        }
      }
    }

    /**
     * 중간 key를 설정한다.
     * @param {string} value
     */
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
    function getKeyName(id, property) {
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
