/**
 * @fileoverview unread badge 의 위치 정보를 담고 있는 service
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('UnreadBadge', UnreadBadge);

  function UnreadBadge() {
    var map = {};

    this.add = add;
    this.remove = remove;
    this.getUnreadPos = getUnreadPos;

    /**
     * badge 정보를 추가한다.
     * @param {string} key  식별자
     * @param {object} pos  뱃지의 위치 정보
     *    @param {number} pos.top 뱃지의 top
     *    @param {number} pos.bottom 뱃지의 bottom
     * @param {object} entity 뱃지 정보의 원본 데이터 entity
     */
    function add(key, pos, entity) {
      map[key] = {
        top: pos.top,
        bottom: pos.bottom,
        entity: entity
      };
    }

    /**
     * badge 정보를 제거한다.
     * @param {string} key 삭제할 아이템 식별자
     */
    function remove(key) {
      if (map[key]) {
        map[key] = null;
        delete map[key];
      }
    }

    /**
     * 화면에 노출되지 않은 unread badge 의 포지션 정보를 반환한다.
     * @param {number} top 현재 view-port 의 top 값
     * @param {number} bottom 현재 view-port 의 bottom 값
     * @returns {{above: Array, below: Array}}
     */
    function getUnreadPos(top, bottom) {
      var unread = {
        above: [],
        below: []
      };

      _.each(map, function(data, key) {
        if (bottom < data.bottom) {
          unread.below.push(data.bottom);
        } else if (data.top < top) {
          unread.above.push(data.top);
        }
      });
      unread.above.sort();
      unread.below.sort();

      return unread;
    }
  }
})();