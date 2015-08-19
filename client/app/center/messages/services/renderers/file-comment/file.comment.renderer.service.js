/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileCommentRenderer', FileCommentRenderer);

  /* @ngInject */
  function FileCommentRenderer($templateRequest, $filter, config, MessageCollection) {
    var TEMPLATE_URL_TITLE = 'app/center/messages/services/renderers/file-comment/file.comment.title.html';
    var TEMPLATE_URL = 'app/center/messages/services/renderers/file-comment/file.comment.html';
    var _templateTitle = '';
    var _template = '';

    this.render = render;

    _init();

    /**
     *
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

    function render(index) {
      var msg = MessageCollection.list[index];
      var content = msg.feedback.content;
      var isArchived = (msg.feedback.status === 'archived');
      var isChild = MessageCollection.isChildComment(index);
      var isTitle = MessageCollection.isTitleComment(index);
      var isSticker = (msg.message.contentType === 'comment_sticker');


      var template = isTitle ? _templateTitle : _template;

      return template({
        css: {
          wrapper: isTitle ? 'comment-title' : 'comment-continue',
          archived: isArchived ? 'archived-file-with-comment' : ''
        },
        file: {
          icon: $filter('fileIcon')(content),
          title: $filter('fileTitle')(content),
          imageUrl: _getImageUrl(msg),
          hasPreview: $filter('hasPreview')(content)
        },
        isSticker: isSticker,
        isChild: isChild,
        isTitle: isTitle,
        isArchived: isArchived,
        translate: {
        },
        msg: msg
      });
    }
    function _getImageUrl(msg) {
      var content = msg.feedback.content;
      var uri = content && content.extraInfo && content.extraInfo.smallThumbnailUrl;
      return config.server_uploaded + uri;
    }
  }
})();
