/**
 * @fileoverview file detail preview directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailPreview', fileDetailPreview);

  function fileDetailPreview($filter, modalHelper, ExternalShareService) {
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
      templateUrl : 'app/right/file.detail/preview/file.detail.preview.html'
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
        scope.onImageClick = onImageClick;
        scope.onFileDetailImageLoad = onFileDetailImageLoad;
        scope.onExternalShareClick = onExternalShareClick;

        scope.isLoadingImage = true;

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
          scope.isImagePreview = true;
          scope.imageUrl = $filter('getFileUrl')(content.fileUrl);
          scope.previewCursor = 'zoom-in';

          // 이미지 회전에 대한 data를 전달 받지 않는 이상 자연스러운  dimention 처리는 불가능 함.
          //if (content.extraInfo) {
          //  _setImageDimension(content.extraInfo);
          //}
        } else {
          scope.isImagePreview = false;
          scope.imageUrl = $filter('getFilterTypePreview')(content);
          scope.previewCursor = 'pointer'
        }

        el.find('.image_wrapper').css('cursor', scope.previewCursor);
      }

      /**
       * image dimension을 설정한다.
       * @param extraInfo
       * @private
       */
      function _setImageDimension(extraInfo) {
        var maxWidth = 360;
        var maxHeight = 740;
        var width = extraInfo.width;
        var height = extraInfo.height;
        var ratio;

        if (maxWidth < width || maxHeight < height) {
          // maxWidth, maxHeight 보다 imageWidth, imageHeight가 크다면 비율 조정 필요함.
          ratio = [maxWidth / width, maxHeight / height];
          ratio = Math.min(ratio[0], ratio[1]);
        } else {
          ratio = 1;
        }

        el.css({
          width: width * ratio,
          height: height * ratio
        });
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
            // single
            isSingle: true
          });
        }
      }

      /**
       * image loaded event handler
       */
      function onFileDetailImageLoad() {
        scope.$apply(function() {
          scope.isLoadingImage = false;
        });
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
