/**
 * @fileoverview image carousel service
 */
(function() {
  'use strict';

  angular
      .module('jandiApp')
      .service('ImageCarousel', ImageCarousel);

  /* @ngInject */
  function ImageCarousel($q, $filter) {
    var that = this;

    // image item의 최소 크기
    var MIN_WIDTH = 400;
    var MIN_HEIGHT = 400;

    var jqWindow = $(window);

    that.THUMBNAIL_IMAGE_SIZE = 640;

    that.preloadThumbnail = preloadThumbnail;
    that.getImageElement = getImageElement;
    that.setPosition = setPosition;
    that.hasDimension = hasDimension;

    /**
     * preload thumbnail
     * @param {object} imageItem
     */
    function preloadThumbnail(imageItem) {
      if (imageItem.extraInfo) {
        $("<img />").attr("src", imageItem.extraInfo.thumbnailUrl + '?size=' + that.THUMBNAIL_IMAGE_SIZE);
      }
    }

    /**
     * get image element
     * @param {object} imageItem
     * @returns {deferred.promise|{then, always}}
     */
    function getImageElement(imageItem) {
      var deferred = $q.defer();
      var imageUrl = $filter('getFileUrl')(imageItem.fileUrl);
      var imageOptions = {
        maxWidth: '100%'
      };

      if (hasDimension(imageItem)) {
        imageOptions.orientation = imageItem.extraInfo && imageItem.extraInfo.orientation;
        _getImageHttpRequest(deferred, imageUrl, imageOptions);
      } else {
        _getImageBlobRequest(deferred, imageUrl, imageOptions);
      }

      return deferred.promise;
    }

    /**
     * get image for http
     * @param {object} deferred
     * @param {string} imageUrl
     * @param {object} imageOptions
     * @private
     */
    function _getImageHttpRequest(deferred, imageUrl, imageOptions) {
      loadImage(imageUrl, function(img) {
        if (img.type === 'error') {
          deferred.reject();
        } else {
          deferred.resolve(img);
        }
      }, imageOptions);
    }

    /**
     * get image for blob
     * @param {object} deferred
     * @param {string} imageUrl
     * @param {object} imageOptions
     * @private
     */
    function _getImageBlobRequest(deferred, imageUrl, imageOptions) {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', imageUrl, true);
      xhr.responseType = 'blob';
      xhr.onload = function() {
        var that = this;
        var blob = that.response;

        if (that.status === 200) {
          // loadImage library를 사용하여 blob에 포함된 meta data를 긁음
          loadImage.parseMetaData(blob, function(data) {
            // 필요한 정보가 있을 경우
            if (!!data.exif) {
              imageOptions.orientation = data.exif.get('Orientation');
            }

            loadImage(blob, function(img) {
              if (img.type === 'error') {
                deferred.reject();
              } else {
                deferred.resolve(img);
              }
            });
          });
        } else {
          deferred.reject();
        }
      };
      xhr.send();
    }

    /**
     * image element의 position 설정
     * image carousel에서 image item element의 size의 크기와 비율에 따라 canvas element가 가지는 size가 달라짐
     * @param {object} jqImageItem
     * @param {object} imageItem
     * @param {object} [img] - image item에 포함되어 image를 출력할 canvas element
     * @private
     */
    function setPosition(jqImageItem, imageItem, img) {
      var dimension = _getDimension(imageItem, img);

      // image를 정중앙에 출력할때 필요로 하는 여백
      var margin = 56;
      var ratio;

      var maxWidth = jqWindow.width() - margin * 2;
      var maxHeight = jqWindow.height() - margin * 2;
      var imageWidth;
      var imageHeight;

      var top;
      var height;
      var left;
      var width;
      var lineHeight;

      if (dimension) {
        // arguments에서 dimension을 가져 오지 못한다면 position 설정하지 않음.

        imageWidth = dimension.width;
        imageHeight = dimension.height;

        if (maxWidth < imageWidth || maxHeight < imageHeight) {
          // maxWidth, maxHeight 보다 imageWidth, imageHeight가 크다면 비율 조정 필요함.
          ratio = [maxWidth / imageWidth, maxHeight / imageHeight];
          ratio = Math.min(ratio[0], ratio[1]);
        } else {
          ratio = 1;
        }

        // canvas element가 가질 수 있는 size
        imageWidth = imageWidth * ratio;
        imageHeight = imageHeight * ratio;

        if (imageWidth < MIN_WIDTH) {
          left = Math.round((maxWidth - MIN_WIDTH) / 2) + margin;
          width = MIN_WIDTH;
        } else {
          left = Math.round((maxWidth - imageWidth) / 2) + margin;
          width = imageWidth;
        }
        if (imageHeight < MIN_HEIGHT) {
          top = Math.round((maxHeight - MIN_HEIGHT) / 2) + margin;
          height = MIN_HEIGHT;
          lineHeight = MIN_HEIGHT + 'px';
        } else {
          top = Math.round((maxHeight - imageHeight) / 2) + margin;
          height = imageHeight;
        }

        jqImageItem.css({
          left: left,
          width: width,
          top: top,
          height: height,
          lineHeight: lineHeight
        });

        jqImageItem.find('.thumbnail-image-item').css({
          width: imageWidth,
          height: imageHeight
        });

        jqImageItem.find('.original-image-item').css({
          maxWidth: imageWidth,
          maxHeight: imageHeight
        });
      }

      return {
        width: imageWidth,
        height: imageHeight
      };
    }

    /**
     * get dimension
     * @param {object} imageItem
     * @param {object} img
     * @returns {{width: *, height: *}}
     * @private
     */
    function _getDimension(imageItem, img) {
      var width;
      var height;
      var temp;

      if (hasDimension(imageItem)) {
        width = parseInt(imageItem.extraInfo.width, 10);
        height = parseInt(imageItem.extraInfo.height, 10);

        if (_.isNumber(imageItem.extraInfo.orientation) && imageItem.extraInfo.orientation > 4) {
          temp = height;
          height = width;
          width = temp;
        }
      } else if (img) {
        img = $(img);
        width = parseInt(img[0].getAttribute('width'), 10);
        height = parseInt(img[0].getAttribute('height'), 10);

        if (img.is('.rotate-90, .rotate-270')) {
          temp = height;
          height = width;
          width = temp;
        }
      }

      return {
        width: width,
        height: height
      };
    }

    /**
     * has dimension
     * @param {object} imageItem
     * @returns {boolean}
     * @private
     */
    function hasDimension(imageItem) {
      return !!(imageItem && imageItem.extraInfo
        && imageItem.extraInfo.width && imageItem.extraInfo.height
        && imageItem.extraInfo.thumbnailUrl);
    }
  }
}());
