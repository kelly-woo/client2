/**
 * @fileoverview Center Renderer Factory 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('CenterRendererFactory', CenterRendererFactory);

  /* @ngInject */
  function CenterRendererFactory(MessageCollection, TextRenderer) {
    this.get = get;
    this.render = render;
    _init();

    function _init() {
    }

    function get(type) {
      var renderer;
      switch (type) {
        case 'file':
          break;
        case 'text':
          renderer = TextRenderer;
          break;
        case 'sticker':
          break;
        case 'comment':
          break;
        case 'comment_sticker':
          break;
        case 'systemEvemt':
          break;
        case 'date':
          break;
        case 'unreadBookmark':
          break;
      }
      return renderer;
    }

    function render(index) {
      var message = MessageCollection.list[index];
      var contentType;
      var renderer;
      if (message) {
        contentType = message.message.contentType;
        renderer = get(contentType);
        if (renderer) {
          return renderer.render(index);
        }
      }
      return '';
    }
  }
})();
