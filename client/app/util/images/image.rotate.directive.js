/**
 * @fileoverview 이미지들을 보여줄 때 exif 정보에 맞춰 rotate 시킨다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageRotator', imageRotator);

  /* @ngInject */
  function imageRotator(ImagesHelper) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var jqImageContainer = element;
        var displayProperty = element.css('display');
        var imageUrl = attrs.imageSrc;
        var callbackFunction = attrs.onImageLoad;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', imageUrl, true);
        xhr.responseType = 'blob';

        xhr.onload = onload;

        xhr.send();

        // hide image while rotating.
        ImagesHelper.hideImageElement(jqImageContainer);

        /**
         * 처음에 XMLHttpRequest 를 직접 이용해 호출한 콜의 콜백이다.
         */
        function onload() {
          var that = this;
          var tempBlob;
          var imageOptions;


          if (that.status === 200) {
            tempBlob = that.response;
            imageOptions = getImageOptions();

            loadImage.parseMetaData(tempBlob, function (data) {
              var currentOrientation;
              if (!!data.exif) {
                // 필요한 정보가 있을 경우
                currentOrientation = getImageOrientation(data);
                imageOptions['orientation'] = currentOrientation - 1;
              }

              // 이미지옵션들과 함께 블랍이미지를 이용해서 canvas 를 만든다.
              loadImage(tempBlob, onImageLoad, imageOptions);

            });
          } else {
            ImagesHelper.showImageElement(jqImageContainer, displayProperty);
          }
        }

        /**
         * 이미지 다 로드 된 후에 불려지는 콜백.
         * @param {HTMLElement} img - 이미지가 들어가 있는 엘레멘트
         */
        function onImageLoad(img) {
          jqImageContainer.append(img);
          
          ImagesHelper.showImageElement(jqImageContainer, displayProperty);

          if (!!callbackFunction) {
            scope.$apply(callbackFunction);
          }

          /*

          var imageHeight = img.getAttribute('height');
          var imageWidth = img.getAttribute('width');

          if (imageHeight > imageWidth) {
            // 이미지가 새로로 더 길 때
            //img.style.height = '65px';
            //img.style.width = 'auto';
          } else {
            var containerHeight = jqImageContainer.height();
            if (containerHeight > imageHeight) {
              img.style.marginTop = (containerHeight - imageHeight) / 2 + 'px';
            }
            // 이미지가 가로로 더 길 때
            //img.style.width = '65px';
          }
           */
        }

        /**
         * 블랍파일을 이용해 canvas 를 만들때 같이 넣어줄 옵션들을 정리한다.
         * @returns {{maxWidth: *, maxHeight: *}}
         */
        function getImageOptions() {
          var containerHeight = Math.max($(window).height(), jqImageContainer.height());
          var containerWidth = jqImageContainer.width();

          return {
            maxWidth: containerWidth,
            maxHeight: containerHeight
          };
        }

        /**
         * data 가 들고 있는 정보중에서 orientation 정보다 추출한다.
         * @param {object} data - 'loadImage.parseMetaData'를 이용해서 추출해낸 데이터
         * @returns {*}
         */
        function getImageOrientation(data) {
          return data.exif.get('Orientation');
        }
      }
    }
  }
})();
