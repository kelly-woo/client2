/**
 * @fileoverview room item renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('RoomItemRenderer', RoomItemRenderer);

  /* @ngInject */
  function RoomItemRenderer($filter) {
    var _template;

    this.render = render;

    _init();

    function _init() {
      _template = Handlebars.templates['modal.room.list.item'];
    }

    /**
     * room item을 랜더링한다.
     * @param {object} data
     * @returns {*}
     */
    function render(data) {
      return _template({
        html: {
          roomTypeImage: _getRoomTypeImage(data)
        },
        content: data.name,
        hasCount: _.isNumber(data.count) && data.count > 0,
        count: data.count,
        itemHeight: 50
      });
    }

    function _getRoomTypeImage(data) {
      var roomTypeImage;
      switch(data.type) {
        case 'users':
          roomTypeImage = '<img class="room-type-image" src="' + data.profileImage + '" />';
          break;
        case 'channels':
          roomTypeImage = '<i class="icon-topic room-type-image"></i>';
          break;
        case 'privategroups':
          roomTypeImage = '<i class="icon-lock room-type-image"></i>';
          break;
      }

      return roomTypeImage
    }
  }
})();
