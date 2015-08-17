/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileRenderer', FileRenderer);

  /* @ngInject */
  function FileRenderer($templateRequest, $filter, MessageCollection) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/file/file.html';
    var _templateTitle = '';
    var _template = '';

    this.render = render;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }

    function render(index) {
      var message = MessageCollection.list[index];
      var status = message && message.feedback && message.feedback.status;
      var content = message && message.feedback && message.feedback.content;
      var isArchived = (status === 'archived');
      var isChild = MessageCollection.isChildComment(index);
      var isTitle = MessageCollection.isTitleComment(index);
      var isSticker = (message.message.contentType !== 'comment_sticker');
      var isIntegrateFile = false;

      var template = isTitle ? _templateTitle : _template;

      return template({
        isIntegrateFile: isIntegrateFile,
        isSticker: isSticker,
        isChild: isChild,
        isTitle: isTitle,
        fileTitle: $filter('fileTitle')(content),
        hasPreview: $filter('hasPreview')(content),
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
