/**
 * @fileoverview member list renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('ListRenderer', ListRenderer);

  /* @ngInject */
  function ListRenderer(ItemRenderFactory) {
    this.render = render;

    /**
     * member list를 랜더링한다.
     * @param {object} data
     * @param {string} data.type - renderer type
     * @param {array} data.list - topic list
     * @param {string} data.filterText
     * @param {object} data.viewport
     * @param {boolean} isUpdateList
     */
    function render(data, isUpdateList) {
      var elements = [];
      var itemRenderer = ItemRenderFactory.get(data.type);
      var i;
      var len;

      var position;

      if (isUpdateList) {
        data.viewport.updateList(data.list);
      }

      console.log('list renderer ::: ', data.filterType);

      position = data.viewport.getPosition();

      for (i = position.beginIndex, len = position.endIndex; i <= len; ++i) {
        elements.push(itemRenderer.render(data.list[i], data.filterText));
      }

      data.viewport.render(position, elements);
    }
  }
})();
