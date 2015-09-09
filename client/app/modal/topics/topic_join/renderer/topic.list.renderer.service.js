/**
 * @fileoverview Center renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicListRenderer', TopicListRenderer);

  /* @ngInject */
  function TopicListRenderer(JoinableTopicRenderer, JoinedTopicRenderer) {
    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      _template = Handlebars.templates['topic.list'];
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(type, list, viewport) {
      var elements = [];
      var itemRenderer = type === 'joinable' ? JoinableTopicRenderer : JoinedTopicRenderer;
      var i;
      var len;

      var position;

      if (list.length !== viewport.list.length) {
        viewport.updateList(list);
      }

      position = viewport.getPosition()

      for (i = position.beginIndex, len = position.endIndex; i < len; ++i) {
        elements.push(itemRenderer.render(list[i]));
      }

      viewport.render(position, elements);
    }
  }
})();
