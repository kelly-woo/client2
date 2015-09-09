/**
 * @fileoverview topic list renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicListRenderer', TopicListRenderer);

  /* @ngInject */
  function TopicListRenderer(TopicItemRenderer) {
    var _template;

    this.render = render;

    _init();

    function _init() {
      _template = Handlebars.templates['topic.list'];
    }

    /**
     * topic list를 랜더링한다.
     * @param {string} type - rendering type
     * @param {array} list - topic list
     * @param {object} viewport
     */
    function render(type, list, viewport) {
      var elements = [];
      var itemRenderer = TopicItemRenderer;
      var i;
      var len;

      var position;

      if (list.length !== viewport.getItem().length) {
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
