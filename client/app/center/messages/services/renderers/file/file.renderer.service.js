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
                        RendererUtil, fileAPIservice, jndPubSub, configuration, AnalyticsHelper) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/file/file.html';
    var _template = '';
    var _regxHTTP = /^[http|https]/i;

    this.render = render;
    this.delegateHandler = {
      'click': _onClick
    };

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
    function _onClick(clickEvent) {
      var jqTarget = $(clickEvent.target);
      var id = jqTarget.closest('.msgs-group').attr('id');
      var msg = MessageCollection.get(id);

      if (jqTarget.closest('._fileDownload').length) {
        _onClickFileDownload(msg);
      } else if (jqTarget.closest('._fileMore').length) {
        _onClickFileMore(msg, jqTarget);
      }
    }
    function _onClickFileDownload(msg) {
      AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DOWNLOAD, {
        'FILE_ID': msg.message.id
      });
    }
    function _onClickFileMore(msg, jqTarget) {
      jndPubSub.pub('show:center-file-dropdown', {
        target: jqTarget,
        msg: msg,
        isIntegrateFile: _isIntegrateFile(msg)
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
        attrs: {
          download: _getFileDownloadAttrs(msg)
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
    function _getFileDownloadAttrs(msg) {
      var fileUrl = msg.message.content.fileUrl;
      var hasProtocol = _regxHTTP.test(fileUrl);

      var downloadUrl;
      var originalUrl;
      var attrList = [];
      if (hasProtocol) {
        downloadUrl = fileUrl;
        originalUrl = fileUrl;
        attrList.push('target="_blank"');
      } else {
        downloadUrl = configuration.api_address + 'download/' + fileUrl;
        originalUrl = configuration.server_uploaded + fileUrl;
        attrList.push('download="' + msg.message.content.title + '"');
      }
      attrList.push('href="' + downloadUrl + '"');
      return attrList.join(' ');
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
