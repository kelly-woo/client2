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
      var callbackFunction = attrs.onImageLoad;
      var isFullScreen = !!attrs.isImageFullScreen;

      // 같은 이미지를 두 번 로드하기 않기위함.
      var hasImageLoaded = !!attrs.hasImageLoaded;

      // 이미지를 감싸고 있는 엘레멘트가 본래 가지고 있었던 css 값들.
      var displayProperty = jqImageContainer.css('display');

      attrs.$observe('imageLoader', function() {
        _init();
      });

      /**
       * 파일 형태가 블랍인이 url인지 판단하고 알맞는 다음 스텝을 지정한다.
       * @private
       */
      function _init() {
        if (!!attrs.isblob) {
          // 로드할 파일이 blob 파일일 경우
          _loadImage(scope.blobFile);
        } else {
          // url 로 이미지를 로드할 경우
          _openRequest();
        }
      }

      /**
       * XMLHttpRequest를 사용해서 이미지를 로드한다.
       * @private
       */
      function _openRequest() {
        if (!hasImageLoaded) {
          // 이미지가 로드가 안되어 있을때만.
          var xhr = new XMLHttpRequest();
          var imageUrl = attrs.imageLoader;

          xhr.open('GET', imageUrl, true);
          xhr.responseType = 'blob';
          xhr.onload = _onload;

          xhr.send();
          _hide();
        }
      }

      /**
       * 처음에 XMLHttpRequest 를 직접 이용해 호출한 콜의 콜백이다.
       */
      function _onload() {
        var that = this;

        if (that.status === 200) {
          _loadImage(that.response);
        } else {
          _onImageLoadError();
          _show(jqImageContainer, displayProperty);
        }
      }

      /**
       * blob 파일을 가지고 'loadImage' library를 사용해서 dom element를 만든다.
       * @param {blob} blob - 이미지를 가지고 있는 blob 파일
       * @private
       */
      function _loadImage(blob) {
        var tempBlob = blob;
        var imageOptions = _getImageOptions();

        loadImage.parseMetaData(tempBlob, function (data) {
          if (!!data.exif) {
            // 필요한 정보가 있을 경우
            imageOptions['orientation'] = _getImageOrientation(data);
          }
          // 이미지옵션들과 함께 블랍이미지를 이용해서 canvas 를 만든다.
          loadImage(tempBlob, _onImageLoad, imageOptions);
        });
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

          // 혹시 이미지가 있을 경우, 삭제한다.
          jqImageContainer.empty();

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
        var imageContainerWidth = jqImageContainer.width();
        var imageHeight = parseInt(img.getAttribute('height'), 10);
        var imageWidth = parseInt(img.getAttribute('width'), 10);

        if (!!attrs.imageFitToWidth) {
          // width 에 맞게 이미지를 넓히기위해선 jqImageContainer의 width가 지정되어있어야 한다.
          if (!!imageContainerWidth && imageWidth >= imageContainerWidth) {
            _fitImageToWidth(img);
          }
        } else if (imageHeight > imageWidth) {
          // 이미지가 새로로 더 길 경우
          // 아무것도 하지 않는다.

        } else {
          // 이미지가 가로로 길 경우
          ImagesHelper.setVerticalCenter(img, jqImageContainer, isFullScreen);
        }

        if (isFullScreen) {
          // 이미지가 full screen size 일 경우
          ImagesHelper.setVerticalCenter(img, jqImageContainer, isFullScreen);
        }

        if (!!attrs.imageMaxHeight) {
          _setMaxHeight(img);
        }

        _setMaxWidth(img);

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
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      }
    }
  }
})();
