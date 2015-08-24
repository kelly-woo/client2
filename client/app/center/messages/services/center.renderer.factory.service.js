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
                                 DateDividerRenderer, UnreadBookmarkRenderer) {
    var _renderers = [
      'FileRenderer',
      'TextRenderer',
      'FileCommentRenderer',
      'SystemEventRenderer',
      'DateDividerRenderer',
      'UnreadBookmarkRenderer'
    ];

    this.get = get;
    this.getAll = getAll;

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      getAll();
    }

    /**
     * 모든 renderer 를 반환한다.
     * @returns {Array}
     */
    function getAll() {
      var rendererList = [];

      _.forEach(_renderers, function(renderer) {
        rendererList.push($injector.get(renderer));
      });

      return rendererList;
    }

    /**
     * contentType 에 해당하는 renderer 를 반환한다.
     * @param {string} type
     * @returns {*}
     */
    function get(type) {
      var renderer;
      switch (type) {
        case 'file':
          renderer = FileRenderer;
          break;
        //text 와 sticker 는 동일한 renderer 를 사용
        case 'text':
        case 'sticker':
          renderer = TextRenderer;
          break;
        //comment 와 comment sticker 는 동일한 renderer 를 사용
        case 'comment':
        case 'comment_sticker':
          renderer = FileCommentRenderer;
          break;
        case 'systemEvent':
          renderer = SystemEventRenderer;
          break;
        case 'dateDivider':
          renderer = DateDividerRenderer;
          break;
        case 'unreadBookmark':
          renderer = UnreadBookmarkRenderer;
          break;
      }
      return renderer;
    }
  }
})();
