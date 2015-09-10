/**
 * @fileoverview member list renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('MemberListRenderer', MemberListRenderer);

  /* @ngInject */
  function MemberListRenderer(MemberItemRenderer) {
    this.render = render;

    /**
     * member list를 랜더링한다.
     * @param {array} list - topic list
     * @param {object} viewport
     * @param {boolean} isUpdateList
     */
    function render(list, viewport, isUpdateList) {
      var elements = [];
      var itemRenderer = MemberItemRenderer;
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
