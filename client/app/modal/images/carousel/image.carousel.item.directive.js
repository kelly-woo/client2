/**
 * @fileoverview image carousel item directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageCarouselItem', imageCarouselItem);

  function imageCarouselItem($state, $filter, modalHelper, ImageCarousel, Loading) {
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
      var _jqImageContainer = el.find('.image-container');
      var _jqLoading = Loading.getElement();

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        var item = scope.item;
        var imageDimension;

        if (ImageCarousel.hasDimension(item)) {
          imageDimension = ImageCarousel.setPosition(el, item);

          // 원본 이미지를 불러오기에 시간이 오래 걸리므로 우선 섬네일 이미지를 로드한다
          _loadThumbnail(item, imageDimension);
          _loadImage(item, imageDimension);
        } else {
          _showLoading();
          _loadImage(item);
        }

        scope.uploadDate = $filter('getyyyyMMddformat')(item.uploadDate);
        scope.downloadUrl = $filter('downloadFile')(false, item.fileTitle, item.fileUrl).downloadUrl;

        scope.openFileDetail = openFileDetail;
      }

      /**
       * open fileDetail
       * @param {string} messageId
       * @param {string} userName
       * @private
       */
      function openFileDetail() {
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
      function _loadThumbnail(imageItem, imageDimension) {
        var jqThumbnailImage;
        if (imageItem.extraInfo) {
          jqThumbnailImage = $('<img class="thumbnail-image-item">');

          jqThumbnailImage.css({
            width: imageDimension.width,
            height: imageDimension.height
          })
          .attr('src', imageItem.extraInfo.thumbnailUrl + '?size=' + ImageCarousel.THUMBNAIL_IMAGE_SIZE);

          _jqImageContainer.append(jqThumbnailImage);
        }
      }

      /**
       * 특정 url에 해당하는 image data(blob)을 load하여 canvas element를 생성
       * @param {object} imageItem
       * @private
       */
      function _loadImage(imageItem, imageDimension) {
        ImageCarousel.getImageElement(imageItem)
          .then(function(img) {
            setOriginalImage($(img), imageDimension);
          }, function() {
            setNoImagePreview(el);
          })
          .finally(function (){
            _hideLoading();
          });
      }

      /**
       * set original image
       * @param {object} jqImg - original image element
       * @param {object} imageDimension
       */
      function setOriginalImage(jqImg, imageDimension) {
        jqImg.addClass('original-image-item');

        if (!_.isObject(imageDimension)) {
          // img position 설정하고 출력
          imageDimension = ImageCarousel.setPosition(el, scope.item, jqImg);
        }

        _jqImageContainer.empty().append(jqImg);
        jqImg.css({
          maxWidth: imageDimension.width,
          maxHeight: imageDimension.height
        });
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

      /**
       * show loading
       * @private
       */
      function _showLoading() {
        el.addClass('loading');
        el.append(_jqLoading);
      }

      /**
       * hide loading
       * @private
       */
      function _hideLoading() {
        el.removeClass('loading');
        _jqLoading.remove();
      }
    }
  }
})();
