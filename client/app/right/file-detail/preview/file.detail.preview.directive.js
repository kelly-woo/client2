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
        isIntegrateFile: '=',
        isExternalShared: '='
      },
      link: link,
      templateUrl : 'app/right/file-detail/preview/file.detail.preview.html'
    };

    function link(scope, el) {
      var fileDetail = scope.file;
      var content = fileDetail.content;

      var fileIcon = $filter('fileIcon')(fileDetail.content);

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        if (content.extraInfo) {
          scope.width = content.extraInfo.width;
          scope.height = content.extraInfo.height;
          scope.orientation = content.extraInfo.orientation;
        }

        scope.onImageClick = onImageClick;
        scope.onImageLoad = onImageLoad;
        scope.onExternalShareClick = onExternalShareClick;

        if (content) {
          _setImage(content);
        }
      }

      /**
       * file detail에서 preview 공간에 들어갈 image의 url을 설정한다.
       * @param {object} content
       * @private
       */
      function _setImage(content) {
        if (fileIcon === 'img' && content.icon !== 'etc') {
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
            messageId: fileDetail.id,
            // image carousel view data
            userName: fileDetail.extWriter.name,
            uploadDate: fileDetail.createTime,
            fileTitle: fileDetail.content.title,
            fileUrl: fileDetail.content.fileUrl,
            extraInfo: fileDetail.content.extraInfo,
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
        ExternalShareService.openShareDialog(content);
      }
    }
  }
})();
