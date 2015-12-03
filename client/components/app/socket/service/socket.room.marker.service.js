/**
 * @fileoverview room marker 관련 socket event 처리
 */
(function() {
  'use strict';

  angular
    .module('app.socket')
    .service('jndWebSocketRoomMarker', jndWebSocketRoomMarker);

  /* @ngInject */
  function jndWebSocketRoomMarker(jndPubSub, jndWebSocketCommon, logger) {
    var ROOM_MARKER_UPDATED = 'room_marker_updated';

    var events = [
      {
        name: ROOM_MARKER_UPDATED,
        version: 1,
        handler: _onRoomMarkerUpdated
      }
    ];

    this.getEvents = getEvents;
    function getEvents() {
      return events;
    }

    function _onRoomMarkerUpdated(data) {
      var room = data.room;
      var isCurrentEntity = jndWebSocketCommon.isCurrentEntity(room);
      if (isCurrentEntity) {
        logger.log('update marker for current entity');
        jndPubSub.pub('centerOnMarkerUpdated', data);
      }

      var memberId = data.marker.memberId;

      if (jndWebSocketCommon.isActionFromMe(memberId)) {
        logger.log('I read something from somewhere');
        if (!isCurrentEntity) {
          jndWebSocketCommon.updateLeft();
        }
      }
    }
  }
})();
