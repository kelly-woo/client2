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
        imageUrl: data.imageUrl,
        content: data.name,
        hasCount: _.isNumber(data.count) && data.count > 0,
        count: data.count,
        itemHeight: 40
      });
    }
  }
})();
