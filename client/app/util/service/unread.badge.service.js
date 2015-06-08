/**
 * @fileoverview 각 토픽 및 direct message 의 input 텍스트를 저장하고 반환하는 서비스
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('UnreadBadge', UnreadBadge);

  function UnreadBadge($state) {

    var map = {};

    this.add = add;
    this.remove = remove;
    this.getUnreadPos = getUnreadPos;
    function add(key, pos, entity) {
      map[key] = {
        top: pos.top,
        bottom: pos.bottom,
        entity: entity
      };
    }
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

    function remove(key) {
      if (map[key]) {
        map[key] = null;
        delete map[key];
      }
    }
  }
})();