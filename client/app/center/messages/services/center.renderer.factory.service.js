/**
 * @fileoverview Center Renderer Factory 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('CenterRendererFactory', CenterRendererFactory);

  /* @ngInject */
  function CenterRendererFactory(FileRenderer, TextRenderer, FileCommentRenderer, SystemEventRenderer,
                                 DateRenderer) {
    this.get = get;
    _init();

    function _init() {
    }

    function get(type) {
      var renderer;
      switch (type) {
        case 'file':
          renderer = FileRenderer;
          break;
        case 'text':
        case 'sticker':
          renderer = TextRenderer;
          break;
        case 'comment':
        case 'comment_sticker':
          renderer = FileCommentRenderer;
          break;
        case 'systemEvemt':
          renderer = SystemEventRenderer;
          break;
        case 'date':
          renderer = DateRenderer;
          break;
        case 'unreadBookmark':
          break;
      }
      return renderer;
    }
  }
})();
