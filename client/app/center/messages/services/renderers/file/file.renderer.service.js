/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileRenderer', FileRenderer);

  /* @ngInject */
  function FileRenderer($templateRequest, $filter, config, MessageCollection, FileUploaded, memberService, centerService,
                        RendererUtil, fileAPIservice, jndPubSub) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/file/file.html';
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
      var msg = MessageCollection.list[index];
      var content = msg.message.content;
      var isArchived = (msg.message.status === 'archived');

      return _template({
        css: {
          wrapper: isArchived ? ' archived-file': '',
          star: RendererUtil.getStarCssClass(msg)
        },
        file: {
          icon: $filter('fileIcon')(content),
          imageUrl: _getImageUrl(msg),
          hasPreview: $filter('hasPreview')(content),
          title: $filter('fileTitle')(content),
          type: $filter('fileType')(content),
          size: $filter('bytes')(content.size),
          isFileOwner: _isFileOwner(msg),
          ownerName: $filter('getName')(msg.message.writerId),
          isIntegrateFile: _isIntegrateFile(msg)
        },
        isArchived: isArchived,
        msg: msg
      });
    }
    function _getFeedbackContent(msg) {
      return centerService.isCommentType(msg.message.contentType) ? msg.feedback.content : msg.message.content;
    }
    function _getImageUrl(msg) {
      var content = _getFeedbackContent(msg);
      var hasPreview = $filter('hasPreview')(content);
      return hasPreview ? config.server_uploaded + FileUploaded.getSmallThumbnailUrl(_getFeedbackContent(msg)) : '';
    }
    function _isFileOwner(msg) {
      return msg.message.writerId === memberService.getMemberId();
    }
    function _isIntegrateFile(msg) {
      var content = _getFeedbackContent(msg);
      return fileAPIservice.isIntegrateFile(content.serverUrl);
    }
  }
})();
