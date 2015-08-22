/**
 * @fileoverview FILE Comment renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileCommentRenderer', FileCommentRenderer);

  /* @ngInject */
  function FileCommentRenderer($templateRequest, $filter, config, MessageCollection, RendererUtil) {
    var TEMPLATE_URL_TITLE = 'app/center/messages/services/renderers/file-comment/file.comment.title.mustache.html';
    var TEMPLATE_URL = 'app/center/messages/services/renderers/file-comment/file.comment.mustache.html';
    var _templateTitle = '';
    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL_TITLE).then(function(template) {
        _templateTitle =  Handlebars.compile(template);
      });
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var msg = MessageCollection.list[index];
      var content = msg.feedback.content;
      var isArchived = (msg.feedback.status === 'archived');
      var isChild = MessageCollection.isChildComment(index);
      var isTitle = MessageCollection.isTitleComment(index);

      var template = isTitle ? _templateTitle : _template;

      return template({
        css: {
          star: RendererUtil.getStarCssClass(msg),
          wrapper: isTitle ? 'comment-title' : 'comment-continue',
          archived: isArchived ? 'archived-file-with-comment' : ''
        },
        file: {
          icon: $filter('fileIcon')(content),
          title: $filter('fileTitle')(content),
          imageUrl: _getImageUrl(msg),
          hasPreview: $filter('hasPreview')(content)
        },
        hasStar: RendererUtil.hasStar(msg),
        isSticker: RendererUtil.isSticker(msg),
        isChild: isChild,
        isTitle: isTitle,
        isArchived: isArchived,
        translate: {
        },
        msg: msg
      });
    }

    /**
     * image url 을 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function _getImageUrl(msg) {
      var content = msg.feedback.content;
      var url = content && content.extraInfo && content.extraInfo.smallThumbnailUrl;
      return $filter('getFileUrl')(url);
    }
  }
})();
