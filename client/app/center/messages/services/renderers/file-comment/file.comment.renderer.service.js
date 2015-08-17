/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileCommentRenderer', FileCommentRenderer);

  /* @ngInject */
  function FileCommentRenderer($templateRequest, $filter, MessageCollection) {
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
        console.log(template);
        _templateTitle =  Handlebars.compile(template);
      });
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }

    function render(index) {
      var message = MessageCollection.list[index];
      var feedback = message.feedback;
      var isArchived = (message.feedback.status === 'archived');
      var isChild = MessageCollection.isChildComment(index);
      var isTitle = MessageCollection.isTitleComment(index);
      var isSticker = (message.message.contentType !== 'comment_sticker');
      var template = isTitle ? _templateTitle : _template;

      return template({
        isSticker: isSticker,
        isChild: isChild,
        isTitle: isTitle,
        fileTitle: $filter('fileTitle')(feedback.content),
        hasPreview: $filter('hasPreview')(feedback.content),
        isArchived: isArchived,
        className: {
          archived: 'archived-file-with-comment'
        },
        translate: {
        },
        msg: message
      });
    }
  }
})();
