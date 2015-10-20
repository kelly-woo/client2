/**
 * @fileoverview 각 토픽 및 direct message 의 input 텍스트를 저장하고 반환하는 서비스
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
    'use strict';

    angular
      .module('jandiApp')
      .service('TextBuffer', TextBuffer);

    /**
     * 각 방의 input 기록을 저장하는 서비스
     * @returns {{set: set, get: get, clear: clear}}
     */
    function TextBuffer(MessageStorage) {;
      var that = this;

      _init();

      function _init() {
        that.get = get;
        that.set = set;
      }

      /**
       * entityType 과 id 에 해당하는 버퍼를 가져온다.
       * @param {string|number} entityId
       * @returns {string}
       */
      function get(entityId) {
        return MessageStorage.getInputMessage(entityId);
      }

      /**
       * 버퍼에 text 를 저장한다.
       * @param {string|number} entityId
       * @param {string} text 저장할 텍스트
       */
      function set(entityId, text) {
        MessageStorage.setInputMessage(entityId, text);
      }
    }
})();
