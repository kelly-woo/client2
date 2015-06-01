(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fullScreenImage', fullScreenImage);

  function fullScreenImage() {
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
      imageElement = element;
      displayProperty = element.css('display');

      hideImageElement();

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
            maxWidth: $(window).width() - widthOffset,
            maxHeight: $(window).height() - heightOffset
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
          showImageElement();
        }
      }

      /**
       * 이미지 다 로드 된 후에 불려지는 콜백.
       * @param img {HTMLElement} 이미지가 들어가 있는 엘레멘트
       */
      function onImageLoad(img) {
        document.getElementById('full-screen-image').appendChild(img);

        setVerticalCenter(img);

        showImageElement();

        if (!!attrs.onFullScreenImageLoad) {
          scope.$apply(attrs.onFullScreenImageLoad);
        }
      }

      /**
       * 이미지 엘레멘트를 화면에서 숨긴다.
       * @param imageElement {jQueryElement} 화면에서 숨길 이미지 엘레멘트
       */
      function hideImageElement() {
        // hide image while rotating.
        imageElement.css('display', 'hidden');
      }

      /**
       * 이미지 엘레멘트를 화면에 보여준다.
       * @param imageElement {jQueryElement} 화면에 보여줄 이미지 엘레멘트
       * @param displayProperty {object} 본래 엘레멘트가 가지고 있었던 display properties
       */
      function showImageElement() {
        imageElement.addClass('opac-in-fast');
        imageElement.css(displayProperty);
      }

      /**
       * 이미지 엘레멘트를 화면 정중앙에 위치시킨다.
       * @param imgElement {HTMLElement} 중앙에 위치시킬 엘레멘트
       */
      function setVerticalCenter(imgElement) {
        // TODO: 이렇게 DOM ELEMENT 설정할때 이렇게 안하고 다른 곳에서 일괄절으로 한다고 했었나요? 기억이 잘 안나네요....
        var jqImageWrapperElement = $('.modal-full .modal-dialog');

        // 이미지 엘레멘트의 높이
        var elementHeight = imgElement.getAttribute('height');

        // 현재 화면의 높이
        var windowHeight = $(window).height();

        // 이미지보다 화면이 더 클 경우
        if ((windowHeight - elementHeight) > heightOffset) {
          var marginTop = (windowHeight - elementHeight) / 2 + 'px';
          jqImageWrapperElement.css('marginTop', marginTop);
        }
      }  }

  }
})();
