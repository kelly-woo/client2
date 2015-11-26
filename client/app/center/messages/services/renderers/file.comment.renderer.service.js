/**
 * @fileoverview FILE Comment renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileCommentRenderer', FileCommentRenderer);

  /* @ngInject */
  function FileCommentRenderer($filter, MessageCollection, RendererUtil, publicService) {
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

      var icon = $filter('fileIcon')(content);

      var isUnshared = publicService.isFileUnshared(msg);
      var isMustPreview = $filter('mustPreview')(content);
      var hasPreview = $filter('hasPreview')(content);
      var hasPermission = publicService.hasFilePermission(msg, true);

      var commentCount = RendererUtil.getCommentCount(msg);

      var data = {
        css: {
          wrapper: isTitle ? 'comment-title' : 'comment-continue',
          star: RendererUtil.getStarCssClass(msg.message),
          fileStar: RendererUtil.getStarCssClass(RendererUtil.getFeedbackMessage(msg)),
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg)
        },
        attrs: {
          download: RendererUtil.getFileDownloadAttrs(msg)
        },
        file: {
          id: msg.feedbackId,
          unshared: isUnshared,
          hasPermission: hasPermission,
          icon: icon,
          isImageIcon: icon === 'img',
          mustPreview: isMustPreview,
          hasPreview: hasPreview,
          imageUrl: $filter('getPreview')(content, 'medium'),
          title: $filter('fileTitle')(content),
          type: $filter('fileType')(content),
          size: $filter('bytes')(content.size),
          isIntegrateFile: RendererUtil.isIntegrateFile(msg),
          commentCount: commentCount
        },
        hasCommentAllDesc: commentCount > 0 && !isArchived && hasPermission,
        hasStar: RendererUtil.hasStar(msg),
        isSticker: RendererUtil.isSticker(msg),
        isChild: isChild,
        isTitle: isTitle,
        isArchived: isArchived,
        translate: {
          commentAllDesc: _getCommentAllDesc(msg.feedbackId, commentCount)
        },
        msg: msg
      };

      if (hasPreview && content.extraInfo) {
        _setExtraInfo(data.file, content.extraInfo);
      }

      return template(data);
    }

    /**
     * set extraInfo
     * @param {object} file
     * @param {object} extraInfo
     * @private
     */
    function _setExtraInfo(file, extraInfo) {
      file.width = extraInfo.width;
      file.height = extraInfo.height;
      file.orientation = extraInfo.orientation;
    }

    /**
     * get comment all desc
     * @private
     */
    function _getCommentAllDesc(fileId, commentCount) {
      var text = $filter('translate')('@comment-all-desc');

      return text.replace('{{commentCount}}', function() {
        return '<span class="comment-count-' + fileId + '">' + commentCount + '</span>';
      });
    }
  }
})();
