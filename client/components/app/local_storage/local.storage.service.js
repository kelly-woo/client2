/**
 * @fileoverview 스토리지에 저장하고 빼고하는 서비스
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('app.local.storage')
    .service('localStorageHelper', localStorageHelper);

  /* @ngInject */
  function localStorageHelper(localStorageService) {
    var that = this;

    that.set = set;
    that.get = get;
    that.remove = remove;

    function set(key, value) {
      _set(key, value);
    }

    function get(key) {
      return _get(key);
    }

    function remove(key) {
      _remove(key);
    }

    /**
     * localStorageService 의 set function 의 wrapper
     * @param {string} key - storage 에 저장 될 key 값
     * @param {*} value - storage 에 저장 될 value
     * @private
     */
    function _set(key, value) {
      localStorageService.set(key, value);
    }

    /**
     * localStorageService 의 get function 의 wrapper
     * @returns {*}
     * @private
     */
    function _get(key) {
      return localStorageService.get(key);
    }

    /**
     * local storage 로부터 해당 key 를 지운다.
     * @param {string} key - 지울 키
     * @private
     */
    function _remove(key) {
      localStorageService.remove(key);
    }
  }
})();