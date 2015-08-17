/**
 * @fileoverview Center Renderer Factory 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('CenterRendererFactory', CenterRendererFactory);

  /* @ngInject */
  function CenterRendererFactory($injector, FileRenderer, TextRenderer, FileCommentRenderer, SystemEventRenderer,
                                 DateRenderer) {
    var _renderers = [
      'FileRenderer',
      'TextRenderer',
      'FileCommentRenderer',
      'SystemEventRenderer',
      'DateRenderer'
    ];
    this.get = get;
    this.getAll = getAll;

    _init();

    function _init() {
      getAll();
    }

    function getAll() {
      var rendererList = [];

      _.forEach(_renderers, function(renderer) {
        rendererList.push($injector.get(renderer));
      });

      return rendererList;
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
        case 'systemEvent':
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
