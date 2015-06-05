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
        this.hasBadgeBelow = hasBadgeBelow;
        this.getBelowPositionList = getBelowPositionList;

        function add(key, top, entity) {
            map[key] = {
                top: top,
                entity: entity
            }
        }
        function hasBadgeBelow(basePosition) {
            return !!getBelowPositionList(basePosition).length;
        }
        function getBelowPositionList(basePosition) {
            var list = [];
            var data;
            var key;

            for(key in map) {
                data = map[key];
                if (basePosition < data.top) {
                    list.push(data.top);
                }
            }

            return list.sort();
        }
        function remove(key) {
            if (map[key]) {
                map[key] = null;
                delete map[key];
            }
        }
    }
})();