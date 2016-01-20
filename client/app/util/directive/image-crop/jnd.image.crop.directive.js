/**
 * @fileoverview image crop dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndImageCrop', jndImageCrop);

  function jndImageCrop(JndUtil) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        files: '=',
        onImageCropDone: '&'
      },
      templateUrl : 'app/util/directive/image-crop/jnd.image.crop.html',
      link: link
    };

    function link(scope, el) {
      var jqWindow = $(window);
      var jqModalBody = el.parents('.modal-body');
      var originModalDimentions;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.croppedImageData = null;
        scope.onCroppedImageChange = onCroppedImageChange;

        scope.onCropCancel = onCropCancel;
        scope.onCropDone = onCropDone;

        _initImageCrop();
        _setCropDimentions();
        jqModalBody.find('.crop-area').addClass('active');

        _attachEvents();
      }

      /**
       * image crop 초기화
       * @private
       */
      function _initImageCrop() {
        var file = scope.files[0];
        var orientation;

        if (file) {
          loadImage.parseMetaData(file, function(data) {
            if (data.exif) {
              orientation = data.exif.get('Orientation');
            }

            loadImage(scope.files[0], function(img) {
              JndUtil.safeApply(scope, function() {
                scope.imageData = img.toDataURL('image/jpeg');
              });
            }, {
              canvas: true,
              orientation: orientation
            });
          });
        }
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
        jqWindow.resize(_onResize);
      }

      /**
       * destroy event handler
       * @private
       */
      function _onDestroy() {
        jqWindow.off('resize', _onResize);
      }

      /**
       * resize event handler
       * @private
       */
      function _onResize() {
        _setCropDimentions();
      }

      /**
       * cropped image change handler
       * imgCrop directive에서 crop data 변경시 수행함
       * @param {string} dataURI
       */
      function onCroppedImageChange(dataURI) {
        scope.croppedImageData = dataURI;
      }

      /**
       * cancel event handler
       */
      function onCropCancel() {
        _setOriginDimentions();
        scope.onImageCropDone();
      }

      /**
       * done event handler
       */
      function onCropDone() {
        _setOriginDimentions();
        scope.onImageCropDone({
          $dataURI: scope.croppedImageData
        });
      }

      /**
       * crop 영역 호줄전 본래 사이즈로 설정
       * @private
       */
      function _setOriginDimentions() {
        scope.imageData = null;

        jqModalBody.css({
          width: originModalDimentions.width,
          height: originModalDimentions.height
        });
      }

      /**
       * crop 영역 사이즈 설정
       * @private
       */
      function _setCropDimentions() {
        var dimensions = _getWindowDimensions();

        // 원본 사이즈로 돌리기 위해 저장해둔다
        originModalDimentions = {
          width: jqModalBody.width(),
          height: jqModalBody.height()
        };

        jqModalBody.css({width: dimensions.width, height: dimensions.height});
      }

      /**
       * 현재 page dimention 전달
       * @returns {{width: number, height: number}}
       * @private
       */
      function _getWindowDimensions() {
        var width = jqWindow.width() - 150;
        var height = jqWindow.height() - 150;

        return {
          width: width < 0 ? 0 : width,
          height: height < 0 ? 0 : height
        };
      }
    }
  }
})();
