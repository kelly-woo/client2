/**
 * @fileoverview Member 필터
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
    this.isExist = isExist;

    _init();

    /**
    * 초기화 메서드
    * @private
    */
    function _init() {
    }

    /**
     * member list 를 반환한다.
     * @returns {Array}
     */
    function toJSON() {
      return UserList.toJSON().concat(BotList.toJSON());
    }

    /**
     * member 정보를 조회한다.
     * @param {number|string} entityId
     * @returns {object}
     */
    function get(entityId) {
      return UserList.get(entityId) || BotList.get(entityId)
    }

    /**
     * 해당 member 가 존재하는지 반환한다.
     * @param {number|string} entityId
     * @returns {boolean}
     */
    function isExist(entityId) {
      return !!get(entityId);
    }
  }
})();
