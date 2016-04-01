/**
 * @fileoverview file detail preview directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  function fileDetailPreview($filter, ExternalShareService, modalHelper) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        originalUrl: '=',
        isIntegrateFile: '='
      },
      link: link,
      templateUrl : 'app/right/file-detail/preview/file.detail.preview.html'
    };

    function link(scope, el) {
      var _fileDetail = scope.file;
      var _content = _fileDetail.content;

      var _fileIcon = $filter('fileIcon')(_content);

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onImageClick = onImageClick;
        scope.onImageLoad = onImageLoad;
        scope.onExternalShareClick = onExternalShareClick;

        if (_content.extraInfo) {
          scope.width = _content.extraInfo.width;
          scope.height = _content.extraInfo.height;
          scope.orientation = _content.extraInfo.orientation;
        }

        _setImage(_content);
      }

      /**
       * file detail에서 preview 공간에 들어갈 image의 url을 설정한다.
       * @param {object} content
       * @private
       */
      function _setImage(content) {
        if (_fileIcon === 'img' && content.icon !== 'etc') {
          scope.isImageLoading = true;

          scope.isImagePreview = true;
          scope.imageUrl = $filter('getPreview')(content, 'large');
          scope.previewCursor = 'zoom-in';
        } else {
          scope.isImagePreview = false;
          scope.imageUrl = $filter('getFilterTypePreview')(content);
          scope.previewCursor = 'pointer'
        }

        el.find('.preview-body').css('cursor', scope.previewCursor);
      }

      /**
       * image click event handler
       */
      function onImageClick() {
        if (scope.isImagePreview) {
          modalHelper.openImageCarouselModal({
            // image file api data
            messageId: _fileDetail.id,
            // image carousel view data
            userName: _fileDetail.extWriter.name,
            uploadDate: _fileDetail.createTime,
            fileTitle: _content.title,
            fileUrl: _content.fileUrl,
            extraInfo: _content.extraInfo,
            // single
            isSingle: true
          });
        }
      }

      /**
       * image loaded event handler
       */
      function onImageLoad() {
        scope.isImageLoading = false;
      }

      /**
       * external share click event handler
       */
      function onExternalShareClick() {
        ExternalShareService.openShareDialog(_content);
      }
    }
  }
})();
