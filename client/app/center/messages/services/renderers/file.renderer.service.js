/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileRenderer', FileRenderer);

  /* @ngInject */
  function FileRenderer($filter, modalHelper, MessageCollection, RendererUtil, Loading, centerService, EntityMapManager,
                        memberService, fileAPIservice, jndPubSub, AnalyticsHelper, currentSessionHelper, publicService) {
    var _template = '';

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
      _template = Handlebars.templates['center.file'];
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
      } else if (jqTarget.closest('._fileExpand').length) {
        _onClickFileExpand(msg, jqTarget);
      } else if (jqTarget.closest('._fileToggle').length) {
        _onClickFileToggle(msg, jqTarget);
      }
    }

    /**
     * file show/hide event handler
     * @param {object} msg
     * @param {object} jqTarget
     * @private
     */
    function _onClickFileToggle(msg, jqTarget) {
      var jqMsg = $('#' + msg.id);
      var jqThumb = jqMsg.find('._fileMediumThumb');
      var jqToogle = jqMsg.find('._fileToggle');
      var isHide = jqThumb.css('display') === 'none';
      var isScrollBottom = centerService.isScrollBottom();

      if (isHide) {
        jqThumb.show();
        jqToogle.addClass('icon-angle-down').removeClass('icon-angle-right');
      } else {
        jqThumb.hide();
        jqToogle.addClass('icon-angle-right').removeClass('icon-angle-down');
      }

      if (isScrollBottom) {
        // image 접기/펼치기 전 scroll이 bottom에 있었다면 scroll bottom 고정
        jndPubSub.pub('center:scrollToBottom');
      }
    }

    /**
     * thumbnail image를 original image로 보기 위한 클릭 핸들러
     * @param {object} msg
     * @param {object} jqTarget
     * @private
     */
    function _onClickFileExpand(msg, jqTarget) {
      var message = msg.message;
      var content;
      var currentEntity;

      if (!jqTarget.hasClass('no-image-preview')) {
        content = _getFeedbackContent(msg);
        currentEntity = currentSessionHelper.getCurrentEntity();

        modalHelper.openImageCarouselModal({
          // server api
          getImage: fileAPIservice.getImageListOnRoom,

          // image file api data
          messageId: message.id,
          entityId: currentEntity.entityId || currentEntity.id,
          // image carousel view data
          userName: message.writer.name,
          uploadDate: msg.time,
          fileTitle: content.title,
          fileUrl: content.fileUrl,
          // single file
          isSingle: msg.status === 'unshared'
        });
      }
    }

    /**
     * file download 클릭 이벤트 핸들러
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
      var hasPreview = $filter('hasPreview')(content);
      var icon = $filter('fileIcon')(content);
  
      var isUnshared = publicService.isFileUnshared(msg);
      var hasPermission = publicService.hasFilePermission(msg);

      return _template({
        html: {
          loading: Loading.getTemplate()
        },
        css: {
          unshared: isUnshared ? 'unshared' : '',
          privateUnshared: (isUnshared && !hasPermission) ? 'private-unshared' : '',
          wrapper: isArchived ? ' archived-file': '',
          star: RendererUtil.getStarCssClass(msg),
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg)
        },
        attrs: {
          download: _getFileDownloadAttrs(msg)
        },
        file: {
          hasPermission: hasPermission,
          icon: icon,
          isImageIcon: icon === 'img',
          mustPreview: $filter('mustPreview')(content),
          hasPreview: hasPreview,
          imageUrl: _getMediumThumbnailUrl(content, hasPreview),
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
      var attrList = [];
      var urlObj = $filter('downloadFile')(_isIntegrateFile(msg), msg.message.content.title, fileUrl);

      attrList.push('download="' + msg.message.content.title + '"');
      attrList.push('href="' + urlObj.downloadUrl + '"');

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
    function _getMediumThumbnailUrl(content, hasPreview) {
      //var content = _getFeedbackContent(msg);
      //var hasPreview = $filter('hasPreview')(content);

      return hasPreview ? $filter('getFileUrl')(content.extraInfo.mediumThumbnailUrl) : '';
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
