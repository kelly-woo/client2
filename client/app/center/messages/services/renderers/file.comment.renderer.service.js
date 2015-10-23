/**
 * @fileoverview FILE Comment renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileCommentRenderer', FileCommentRenderer);

  /* @ngInject */
  function FileCommentRenderer($filter, MessageCollection, RendererUtil) {
    var _templateTitle = '';
    var _template = '';

    this.render = render;

    _init();

    /**
     * 생성자 함수
     * @private
     */
    function _init() {
      _templateTitle = Handlebars.templates['center.file.comment.title'];
      _template = Handlebars.templates['center.file.comment'];
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
          archived: isArchived ? 'archived-file-with-comment' : '',
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg)
        },
        file: {
          icon: $filter('fileIcon')(content),
          title: $filter('fileTitle')(content),
          imageUrl: $filter('getPreview')(content, 'small'),
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
  }
})();
