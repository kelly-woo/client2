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
     * @param {string} type - renderer type
     * @param {array} list - topic list
     * @param {object} viewport
     * @param {boolean} isUpdateList
     */
    function render(type, list, viewport, isUpdateList) {
      var elements = [];
      var itemRenderer = ItemRenderFactory.get(type);
      var i;
      var len;

      var position;

      if (isUpdateList) {
        viewport.updateList(list);
      }

      position = viewport.getPosition();

      for (i = position.beginIndex, len = position.endIndex; i <= len; ++i) {
        elements.push(itemRenderer.render(list[i]));
      }

      viewport.render(position, elements);
    }
  }
})();
