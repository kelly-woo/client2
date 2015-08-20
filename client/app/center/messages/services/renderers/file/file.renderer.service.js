/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileRenderer', FileRenderer);

  /* @ngInject */
  function FileRenderer($templateRequest, $filter, ImagesHelper, MessageCollection, FileUploaded, memberService, centerService,
                        RendererUtil, fileAPIservice, jndPubSub, configuration, AnalyticsHelper) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/file/file.html';
    var _template = '';
    var _regxHTTP = /^[http|https]/i;

    this.render = render;

    /**
     * center 에서 delegate 하여 처리할 핸들러를 정의한다.
     * @type {{click: _onClick}}
     */
    this.delegateHandler = {
      'click': _onClick
    };

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }

    /**
     * click 이벤트 핸들러
     * @param {Object} clickEvent
     * @private
     */
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

    /**
     * file download 이벤트 핸들러
     * @param {object} msg
     * @private
     */
    function _onClickFileDownload(msg) {
      AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_DOWNLOAD, {
        'FILE_ID': msg.message.id
      });
    }

    /**
     * file more 이벤트 핸들러
     * @param {object} msg
     * @param {object} jqTarget
     * @private
     */
    function _onClickFileMore(msg, jqTarget) {
      jndPubSub.pub('show:center-file-dropdown', {
        target: jqTarget,
        msg: msg,
        isIntegrateFile: _isIntegrateFile(msg)
      });
    }

    /**
     * index 에 해당하는 메세지를 랜더링한다.
     * @param {number} index
     * @returns {*}
     */
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

    /**
     * file download 에 랜더링 할 attribute 문자열을 반환한다.
     * @param {object} msg
     * @returns {string}
     * @private
     */
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

    /**
     * msg 에서 feedback(comment) 정보를 담고있는 데이터를 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function _getFeedbackContent(msg) {
      return centerService.isCommentType(msg.message.contentType) ? msg.feedback.content : msg.message.content;
    }

    /**
     * image url 을 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function _getImageUrl(msg) {
      var content = _getFeedbackContent(msg);
      var hasPreview = $filter('hasPreview')(content);
      return hasPreview ? FileUploaded.getSmallThumbnailUrl(_getFeedbackContent(msg)) : '';
    }

    /**
     * 현재 사용자가 file 작성자인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     * @private
     */
    function _isFileOwner(msg) {
      return msg.message.writerId === memberService.getMemberId();
    }

    /**
     * integrate file 인지 여부를 반환한다.
     * @param {object} msg
     * @returns {*}
     * @private
     */
    function _isIntegrateFile(msg) {
      var content = _getFeedbackContent(msg);
      return fileAPIservice.isIntegrateFile(content.serverUrl);
    }
  }
})();
