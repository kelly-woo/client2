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
     * @param {object} $state
     * @returns {{set: set, get: get, clear: clear}}
     */
    function TextBuffer($state) {
      var _buffer = {};

      this.set = set;
      this.get = get;
      this.clear = clear;

      /**
       * 현재 entityType 과 entityId 에 해당하는 키를 반환한다.
       * @returns {string}
       * @private
       */
      function _getCurrentKey() {
        return _getKey($state.params.entityType, $state.params.entityId);
      }

      /**
       * entityType 과 entityId 에 해당하는 키를 반환한다.
       * @param {string} entityType   엔티티 타입
       * @param {number|string} entityId 엔티티 아이디
       * @returns {string}
       * @private
       */
      function _getKey(entityType, entityId) {
        return entityType + '_' + entityId;
      }

      /**
       * 현재 버퍼를 clear 한다.
       * @param {string} entityType   엔티티 타입
       * @param {number|string} entityId 엔티티 아이디
       */
      function clear(entityType, entityId) {
        if (entityType && entityId !== undefined) {
          _buffer[_getKey(entityType, entityId)] = null;
        } else {
          _buffer = {};
        }
      }

      /**
       * 버퍼에 text 를 저장한다.
       * @param {string} text 저장할 텍스트
       */
      function set(text) {
        _buffer[_getCurrentKey()] = text;
      }

      /**
       * entityType 과 id 에 해당하는 버퍼를 가져온다.
       * 파라미터가 없을 경우 현재 entityType 과 id 에 해당하는 버퍼를 반환한다.
       * @param {string} [entityType]
       * @param {string|number} [entityId]
       * @returns {string}
       */
      function get(entityType, entityId) {
        var text;
        if (entityType && entityId !== undefined) {
          text = _buffer[_getKey(entityType, entityId)];
        } else {
          text = _buffer[_getCurrentKey()];
        }
        return text || '';
      }
    }
})();