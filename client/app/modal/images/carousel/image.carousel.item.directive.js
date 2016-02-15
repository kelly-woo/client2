/**
 * @fileoverview image carousel item directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageCarouselItem', imageCarouselItem);

  function imageCarouselItem($state, $filter, modalHelper, ImageCarousel) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        item: '='
      },
      link: link,
      templateUrl: 'app/modal/images/carousel/image.carousel.item.html'
    };

    function link(scope, el) {
      var jqImageContainer = el.find('.image-container');

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        var item = scope.item;
        var imageDimension = ImageCarousel.setPosition(el, item);

        // 원본 이미지를 불러오기에 시간이 오래 걸리므로 우선 섬네일 이미지를 로드한다
        _thumbnailLoad(item, imageDimension);
        _imageLoad(item, imageDimension);

        scope.uploadDate = $filter('getyyyyMMddformat')(item.uploadDate);
        scope.downloadUrl = $filter('downloadFile')(false, item.fileTitle, item.fileUrl).downloadUrl;

        scope.fileDetail = fileDetail;
      }

      /**
       * fileDetail 수행
       * @param {string} messageId
       * @param {string} userName
       * @private
       */
      function fileDetail() {
        // ImageCarousel 닫고 fileDetail 열기
        modalHelper.closeModal();

        if ($state.params.itemId !== scope.item.messageId) {
          $state.go('files', {itemId: scope.item.messageId + '', userName: scope.item.userName});
        }
      }

      /**
       * thumbnail load
       * @param {object} imageItem
       * @param {object} imageDimension
       * @private
       */
      function _thumbnailLoad(imageItem, imageDimension) {
        var jqThumbnailImage;
        if (imageItem.extraInfo) {
          jqThumbnailImage = $('<img class="thumbnail-image-item">');

          jqThumbnailImage.css({
            width: imageDimension.width,
            height: imageDimension.height,
          })
          .attr('src', imageItem.extraInfo.thumbnailUrl + '?size=640');

          jqImageContainer.append(jqThumbnailImage);
        }
      }

      /**
       * 특정 url에 해당하는 image data(blob)을 load하여 canvas element를 생성
       * @param {object} imageItem
       * @private
       */
      function _imageLoad(imageItem, imageDimension) {
        var fullFileUrl = $filter('getFileUrl')(imageItem.fileUrl);
        var imageOptions = {
          maxWidth: '100%',
          orientation: imageItem.extraInfo && imageItem.extraInfo.orientation
        };

        loadImage(fullFileUrl, function(img) {
          if (img.type === 'error') {
            setNoImagePreview(el);
          } else {
            // img position 설정하고 출력
            ImageCarousel.setPosition(el, scope.item, img);

            jqImageContainer.empty().append(img);
            $(img).css({
              maxWidth: imageDimension.width,
              maxHeight: imageDimension.height
            })
              .addClass('original-image-item');
          }
        }, imageOptions);
      }

      /**
       * no image preview 설정한다.
       * @param {object} qImageItem
       */
      function setNoImagePreview(jqImageItem) {
        // img가 존재하지 않기 때문에 error image 출력
        var jqImg = $('<img src="assets/images/no_image_available.png" style="opacity: 0;" width="400" height="153"/>');
        ImageCarousel.setPosition(jqImageItem, {}, jqImg[0]);

        jqImageItem.addClass('no-image-carousel').prepend(jqImg[0]);
        jqImg.css('opacity', 1);
      }
    }
  }
})();
