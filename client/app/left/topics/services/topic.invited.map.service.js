/**
 * @fileoverview 토픽 invited flag 들을 담당하는 container
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicInvitedFlagMap', TopicInvitedFlagMap);

  function TopicInvitedFlagMap(EntityMapManager) {
    var _map = {};
    this.reset = reset;
    this.add = add;
    this.remove = remove;
    this.isInvited = isInvited;

    _init();

    /**
     * 초기화
     * @private
     */
    function _init() {
      reset();
    }

    /**
     * 데이터를 reset 한다
     */
    function reset() {
      _map = {};
    }

    /**
     * invited flag 를 설정한다
     * @param {number} roomId
     */
    function add(roomId) {
      _map[roomId] = true;
    }

    /**
     * invited flag 를 해제한다
     * @param {number} roomId
     */
    function remove(roomId) {
      var entity;
      if (_map[roomId]) {
        _map[roomId] = null;
        delete _map[roomId];

        entity = EntityMapManager.get('total', roomId);
        if (entity) {
          entity.extHasInvitedFlag = false;
        }
      }
    }

    /**
     * 인자로 받은 roomId 가 invited flag 를 갖고 있는지 확인한다
     * @param {number} roomId
     * @returns {boolean}
     */
    function isInvited(roomId) {
      return !!_map[roomId];
    }
  }
})();
