/**
 * @fileoverview 이미지들을 보여줄 때 exif 정보에 맞춰 rotate 시킨다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('imageLoader', imageLoader);

  /* @ngInject */
  function imageLoader(ImagesHelper) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element, attrs) {
      var jqImageContainer = element;
      var imageUrl = attrs.imageLoader;
      var callbackFunction = attrs.onImageLoad;
      var isFullScreen = !!attrs.isImageFullScreen;

      // 같은 이미지를 두 번 로드하기 않기위함.
      var hasImageLoaded = !!attrs.hasImageLoaded;

      var displayProperty = jqImageContainer.css('display');

      linkInit();

      function linkInit() {
        if (!hasImageLoaded) {
          // 이미지가 로드가 안되어 있을때만.
          var xhr = new XMLHttpRequest();

          xhr.open('GET', imageUrl, true);
          xhr.responseType = 'blob';
          xhr.onload = onload;

          xhr.send();
          _hide();
        }
      }




      /**
       * 처음에 XMLHttpRequest 를 직접 이용해 호출한 콜의 콜백이다.
       */
      function onload() {
        var that = this;
        var tempBlob;
        var imageOptions;

        if (that.status === 200) {
          tempBlob = that.response;
          imageOptions = _getImageOptions();

          loadImage.parseMetaData(tempBlob, function (data) {
            var currentOrientation;
            if (!!data.exif) {
              // 필요한 정보가 있을 경우
              currentOrientation = _getImageOrientation(data);
              imageOptions['orientation'] = currentOrientation - 1;
            }

            // 이미지옵션들과 함께 블랍이미지를 이용해서 canvas 를 만든다.
            loadImage(tempBlob, _onImageLoad, imageOptions);
          });
        } else {
          _onImageLoadError();
          _show(jqImageContainer, displayProperty);
        }
      }

      /**
       * 이미지 다 로드 된 후에 불려지는 콜백.
       * @param {HTMLElement} img - 이미지가 들어가 있는 엘레멘트
       */
      function _onImageLoad(img) {
        if (img.type === 'error') {
          _onImageLoadError();
        } else {
          img.setAttribute('class', 'image-loader-image');

          _resizeImage(img);

          // 한 번 로드가 되었다는 표시
          jqImageContainer.attr('has-image-loaded', true);

          jqImageContainer.append(img);

        }

        _show(jqImageContainer, displayProperty);

        _callCallback();
      }

      /**
       * image 의 max height 혹은 max width 가 설정되있다면 그에 맞게 이미지 크기를 조정한다.
       * @param {HTMLElement} img - 이미지 엘레멘트
       * @private
       */
      function _resizeImage(img) {
        var imageHeight = parseInt(img.getAttribute('height'), 10);
        var imageWidth = parseInt(img.getAttribute('width'), 10);

        if (!!attrs.imageFitToWidth) {
          _fitImageToWidth(img);
          ImagesHelper.setVerticalCenter(img, jqImageContainer, isFullScreen);
        } else if (imageHeight > imageWidth) {
          // 이미지가 새로로 더 길 경우
          if (!!attrs.imageMaxHeight) {
            _setMaxHeight(img);
          } else if (!!attrs.imageMaxWidth) {
            _setMaxWidth(img);
          }
        } else {
          // 이미지가 가로로 길 경우
          ImagesHelper.setVerticalCenter(img, jqImageContainer, isFullScreen);
        }

        if (isFullScreen) {
          // 이미지가 full screen size 일 경우
          ImagesHelper.setVerticalCenter(img, jqImageContainer, isFullScreen);
        }

      }

      /**
       * 블랍파일을 이용해 canvas 를 만들때 같이 넣어줄 옵션들을 정리한다.
       * @returns {{maxWidth: *, maxHeight: *}}
       */
      function _getImageOptions() {
        if (isFullScreen) {
          return ImagesHelper.getImageOptionForFullScreen();
        }

        return {
          maxWidth: Math.max(jqImageContainer.width(), attrs.imageMaxWidth),
          maxHeight: Math.max($(window).height(), jqImageContainer.height())
        };
      }

      /**
       * data 가 들고 있는 정보중에서 orientation 정보다 추출한다.
       * @param {object} data - 'loadImage.parseMetaData'를 이용해서 추출해낸 데이터
       * @returns {*}
       */
      function _getImageOrientation(data) {
        return data.exif.get('Orientation');
      }

      /**
       * 이미지 로드에 fail 했다면??
       * @private
       */
      function _onImageLoadError() {
        if (attrs.imageIsSquare) {
          jqImageContainer.addClass('no-image-preview-square');
        } else {
          jqImageContainer.addClass('no-image-preview');

          if (isFullScreen) {
            ImagesHelper.setVerticalCenter(jqImageContainer, jqImageContainer.parent(), isFullScreen);
          }
        }

      }

      /**
       * 이미지를 감싸고 있는 엘레멘트를 보여준다.
       * @param {jQueryElement} jqImageContainer - 다시 보여질 엘레멘트
       * @param {object} displayProperty - 엘레멘트가 본래 가지고 있던 css properties
       * @private
       */
      function _show(jqImageContainer, displayProperty) {
        ImagesHelper.showImageElement(jqImageContainer, displayProperty);
      }

      /**
       * 이미지를 감싸고 있는 엘레멘트를 숨긴다.
       * @private
       */
      function _hide() {
        ImagesHelper.hideImageElement(jqImageContainer);
      }

      /**
       * directive 를 이용하는 controller 에서 사용하는 callback 이 있다면 불러준다.
       */
      function _callCallback() {
        if (!!callbackFunction) {
          scope.$apply(callbackFunction);
        }
      }

      /**
       * img 의  width 를 무조건 100%로 한다.
       * 이것을 사용하려면 parent div 의 width 가 set 되어져야한다.
       * @param {HTMLElement} img - width 가 변경될 엘레멘트
       * @private
       */
      function _fitImageToWidth(img) {
        img.style.width = '100%';
        img.style.height = 'auto';
      }

      /**
       * 이미지의 max-height 를 지정한다.
       * @param {HTMLElement} img - max-height 를 지정할 엘레멘트
       * @private
       */
      function _setMaxHeight(img) {
        img.style.maxHeight = attrs.imageMaxHeight + 'px';
        img.style.width = 'auto';
      }

      /**
       * 이미지의 max-width 를 정한다.
       * @param {HTMLElement} img - max-width 를 지정할 엘레멘트
       * @private
       */
      function _setMaxWidth(img) {
        img.style.maxWidth = attrs.imageMaxHeight + 'px';
        img.style.height = 'auto';
      }
    }

  }
})();
