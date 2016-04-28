/**
 * @fileoverview FILE renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('FileRenderer', FileRenderer);

  /* @ngInject */
  function FileRenderer($rootScope, $filter, $state, modalHelper, MessageCollection, RendererUtil, CoreUtil, JndPdfViewer,
                        FileDetail, memberService, fileAPIservice, jndPubSub, AnalyticsHelper, currentSessionHelper,
                        publicService) {
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
      } else if (jqTarget.closest('._fileDetailComment').length) {
        _onClickFileDetail(msg, true);
      } else if (jqTarget.closest('._fileDetail').length) {
        _onClickFileDetail(msg);
      } else if (jqTarget.closest('._fileDetailContainer').length) {
        _onClickContainer(msg);
      }
    }

    /**
     * file card 자체를 클릭했을 때 이벤트 핸들러
     * @param {object} msg
     * @private
     */
    function _onClickContainer(msg) {
      var contentType = CoreUtil.pick(msg, 'message', 'contentType');
      var content;
      var file;
      if (contentType === 'comment') {
        content = CoreUtil.pick(msg, 'feedback', 'content');
        file = CoreUtil.pick(msg, 'feedback');
      } else {
        content = CoreUtil.pick(msg, 'message', 'content');
        file = CoreUtil.pick(msg, 'message');
      }
      if (content) {
        //TODO: PDF Viewer 배포 시점에 아래 주석으로 대체해야 함
        _onClickFileDetail(msg);
        // if (content.ext === 'pdf' && !FileDetail.isIntegrateFile(content.serverUrl)) {
        //   JndPdfViewer.load(content.fileUrl, file);
        // } else {
        //   _onClickFileDetail(msg);
        // }
      }
    }

    /**
     * file detail
     * @param {object} msg
     * @param {boolean} [isFocusCommentInput=false]
     * @private
     */
    function _onClickFileDetail(msg, isFocusCommentInput) {
      var contentType = msg.message.contentType;
      var userName = $filter('getName')(msg.message.writerId);
      var itemId = contentType === 'comment' ? msg.feedbackId : msg.message.id;

      if ($state.params.itemId != itemId) {
        if (msg.feedback && contentType !== 'file') {
          userName = $filter('getName')(msg.feedback.writerId);
          itemId = msg.feedback.id;
        }

        if (isFocusCommentInput) {
          $rootScope.setFileDetailCommentFocus = true;
        }

        $state.go('files', {
          userName: userName,
          itemId: itemId
        });
      } else if (isFocusCommentInput) {
        fileAPIservice.broadcastCommentFocus();
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
      var jqToggleTarget = jqMsg.find('._fileToggleTarget');
      var jqToogle = jqMsg.find('._fileToggle');
      var isHide = jqToggleTarget.css('display') === 'none';

      if (isHide) {
        jqToggleTarget.show();
        jqToogle.addClass('icon-arrow-up-fill').removeClass('icon-arrow-down-fill');
      } else {
        jqToggleTarget.hide();
        jqToogle.addClass('icon-arrow-down-fill').removeClass('icon-arrow-up-fill');
      }
    }

    /**
     * thumbnail image를 original image로 보기 위한 클릭 핸들러
     * @param {object} msg
     * @param {object} jqTarget
     * @private
     */
    function _onClickFileExpand(msg, jqTarget) {
      var message;
      var content;
      var currentEntity;

      if (!jqTarget.hasClass('no-image-preview')) {
        message = RendererUtil.getFeedbackMessage(msg);
        content = message.content;
        currentEntity = currentSessionHelper.getCurrentEntity();

        modalHelper.openImageCarouselModal({
          // server api
          getImage: fileAPIservice.getImageListOnRoom,

          // image file api data
          messageId: message.id,
          entityId: currentEntity.entityId || currentEntity.id,
          // image carousel view data
          userName: $filter('getName')(message.writerId),
          uploadDate: msg.time,
          fileTitle: content.title,
          fileUrl: content.fileUrl,
          extraInfo: content.extraInfo,
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
        isIntegrateFile: RendererUtil.isIntegrateFile(msg)
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

      var icon = $filter('fileIcon')(content);

      var isArchived = (msg.message.status === 'archived');
      var isUnshared = publicService.isFileUnshared(msg);

      var hasPermission = publicService.hasFilePermission(msg);
      var isMustPreview = $filter('mustPreview')(content);

      var feedback = RendererUtil.getFeedbackMessage(msg);

      var data = {
        css: {
          unshared: isUnshared ? 'unshared' : '',
          archived: isArchived ? 'archived' : '',
          wrapper: isArchived ? '': '',
          star: RendererUtil.getStarCssClass(msg.message),
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg)
        },
        attrs: {
          download: RendererUtil.getFileDownloadAttrs(msg)
        },
        file: {
          id: msg.message.id,
          isUnshared: isUnshared,
          hasPermission: hasPermission,
          icon: icon,
          hasOriginalImageView: !!(feedback.content && feedback.content.extraInfo),
          mustPreview: isMustPreview,
          hasPreview: $filter('hasPreview')(content),
          imageUrl: $filter('getPreview')(content, 'large'),
          title: $filter('fileTitle')(content),
          type: $filter('fileType')(content),
          size: $filter('bytes')(content.size),
          isIntegrateFile: RendererUtil.isIntegrateFile(msg),
          commentCount: RendererUtil.getCommentCount(msg),
          isFileOwner: _isFileOwner(msg),
          ownerName: $filter('getName')(msg.message.writerId),
          time: $filter('getyyyyMMddformat')(feedback.createTime)
        },
        isArchived: isArchived,
        msg: msg
      };

      if (isMustPreview && content.extraInfo) {
        _setExtraInfo(data.file, content.extraInfo);
      }

      return _template(data);
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
     * 현재 사용자가 file 작성자인지 여부를 반환한다.
     * @param {object} msg
     * @returns {boolean}
     * @private
     */
    function _isFileOwner(msg) {
      return msg.message.writerId === memberService.getMemberId();
    }
  }
})();
