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
        var imageElement = element;
        var displayProperty = element.css('display');

        // hide image while rotating.
        ImagesHelper.hideImageElement(imageElement);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', attrs.imageSrc, true);
        xhr.responseType = 'blob';

        xhr.onload = onload;

        xhr.send();

        /**
         * 처음에 XMLHttpRequest 를 직접 이용해 호출한 콜의 콜백이다.
         * @param e {event}
         */
        function onload(e) {
          if (this.status === 200) {
            var tempBlob = this.response;

            var imageOptions = {
              maxWidth: attrs.rotateWidth,
              maxHeight: attrs.rotateHeight
            };


            loadImage.parseMetaData(tempBlob, function (data) {
              if (!!data.exif) {
                // 필요한 정보가 있을 경우
                var currentOrientation = data.exif.get('Orientation');
                imageOptions['orientation'] = currentOrientation - 1;
              }


              loadImage(tempBlob, onImageLoad, imageOptions);

            });
          } else {
            ImagesHelper.showImageElement(imageElement, displayProperty);
          }
        }

        function onImageLoad(img) {
          imageElement.append(img);

          var imageHeight = img.getAttribute('height');
          var imageWidth = img.getAttribute('width');

          if (imageHeight > imageWidth) {
            // 이미지가 새로로 더 길 때
            //img.style.height = '65px';
            //img.style.width = 'auto';
          } else {
            var containerHeight = imageElement.height();
            if (containerHeight > imageHeight) {
              img.style.marginTop = (containerHeight - imageHeight) / 2 + 'px';
            }
            // 이미지가 가로로 더 길 때
            //img.style.width = '65px';
          }

          ImagesHelper.showImageElement(imageElement, displayProperty);
        }

      }
    }
  }
})();
