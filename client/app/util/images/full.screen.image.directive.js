/**
 * @fileoverview 이미지를 full screen으로 보여줄 때 이미지를 로드하고 rotate하고 resize 그리고 re-locate 한다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fullScreenImage', fullScreenImage);

  /* @ngInject */
  function fullScreenImage(ImagesHelper) {
    var imageElement;
    var displayProperty;

    // 화면에 꽉 찰 수도 있으니 양 옆에 남겨두고 싶은 공간
    var widthOffset = 40;

    // 현재 사용하고 있는 모달에서 원래 가지고 있는 margin-top 의 값 * 2 에 10을 그냥 더한 값
    var heightOffset = 50;

    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs) {
      var xhr = new XMLHttpRequest();

      imageElement = element;
      displayProperty = element.css('display');

      ImagesHelper.hideImageElement(imageElement);

      xhr.open('GET', attrs.imageSrc, true);
      xhr.responseType = 'blob';
      xhr.onload = onload;
      xhr.onerror = onerror;
      xhr.send();

      /**
       * 처음에 XMLHttpRequest 를 직접 이용해 호출한 콜의 콜백이다.
       */
      function onload() {
        var that = this;
        var tempBlob;
        var imageOptions;

        if (that.status === 200) {
          tempBlob = that.response;

          imageOptions = {
            maxWidth: $(window).width() - widthOffset,
            maxHeight: $(window).height() - heightOffset
          };


          loadImage.parseMetaData(tempBlob, function (data) {
            var currentOrientation;
            if (!!data.exif) {
              // 필요한 정보가 있을 경우
              currentOrientation = data.exif.get('Orientation');
              imageOptions['orientation'] = currentOrientation - 1;
            }

            loadImage(tempBlob, onImageLoad, imageOptions);

          });
        } else {
          ImagesHelper.showImageElement(imageElement, displayProperty);
        }
      }

      /**
       * 이미지 다 로드 된 후에 불려지는 콜백.
       * @param img {HTMLElement} 이미지가 들어가 있는 엘레멘트
       */
      function onImageLoad(img) {
        if (img.type === 'error') {
          onImageLoadError();
        } else {
          document.getElementById('full-screen-image').appendChild(img);
          setVerticalCenter(img);
        }

        ImagesHelper.showImageElement(imageElement, displayProperty);
        callCallback();

      }


      /**
       * 이미지 엘레멘트를 화면 정중앙에 위치시킨다.
       * @param imgElement {HTMLElement} 중앙에 위치시킬 엘레멘트
       */
      function setVerticalCenter(imgElement) {
        var jqImageWrapperElement = $('.modal-full .modal-dialog');
        ImagesHelper.setVerticalCenter(imgElement, jqImageWrapperElement, true);
      }

      /**
       * directive 를 이용하는 controller 에서 사용하는 callback 이 있다면 불러준다.
       */
      function callCallback() {
        if (!!attrs.onFullScreenImageLoad) {
          scope.$apply(attrs.onFullScreenImageLoad);
        }
      }

      /**
       * 이미지 로드할 때 에러가 났을 경우 호출된다.
       */
      function onImageLoadError() {
        imageElement.addClass('no-image-preview');
      }
    }
  }
})();
