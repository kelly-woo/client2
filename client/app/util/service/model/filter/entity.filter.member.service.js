/**
 * @fileoverview
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('EntityFilterMember', EntityFilterMember);

  /* @ngInject */
  function EntityFilterMember(UserList, BotList) {

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
      return UserList.toJSON().concat(BotList.toJSON());
    }

    /**
     *
     * @param {number|string} entityId
     * @returns {object}
     */
    function get(entityId) {
      return UserList.get(entityId) || BotList.get(entityId)
    }
  }
})();
