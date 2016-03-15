/**
 * @fileoverview
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('EntityRoomFilter', EntityRoomFilter);

  /* @ngInject */
  function EntityRoomFilter(RoomTopicList) {

    this.toJSON = toJSON;
    this.get = get;

    _init();

    /**
    * 초기화 메서드
    * @private
    */
    function _init() {
    }

    /**
     *
     * @returns {Array}
     */
    function toJSON() {
    }

    /**
     *
     * @param {number|string} entityId
     * @returns {object}
     */
    function get(entityId) {
    }
  }
})();
