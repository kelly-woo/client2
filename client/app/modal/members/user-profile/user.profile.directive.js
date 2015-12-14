/**
 * @fileoverview user profile dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('userProfile', userProfile);

  function userProfile(JndUtil, memberService) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      var jqWindow = $(window);
      var originModalDimentions;

      _init();

      function _init() {
        scope.isSelectedImage = false;

        scope.onImageEditClick = onImageEditClick;
        scope.onCroppedImageChange = onCroppedImageChange;

        scope.onCropCancel = onCropCancel;
        scope.onCropDone = onCropDone;

        _attachEvents();
      }

      function _attachEvents() {
        scope.$on('$destroy', _onDestroy);
        jqWindow.resize(_onResize);
      }

      function _onDestroy() {
        jqWindow.off('resize', _onResize);
      }

      function _onResize() {
        if (scope.isSelectedImage) {
          _setModalDimentions();
        }
      }

      function onImageEditClick() {
        $('<input type="file" />')
          .on('change', function(evt) {
            JndUtil.safeApply(scope, function() {
              _selectFile(evt.target.files[0]);
            });
          })
          .trigger('click');
      }

      function onCroppedImageChange(dataURI) {
        scope.croppedImage = dataURI;
      }

      function onCropCancel() {
        _closeCropContent()
      }

      function onCropDone() {
        var blob;

        if (!scope.isLoading) {
          if (scope.croppedImage) {
            scope.toggleLoading();

            blob = _dataURItoBlob(scope.croppedImage);
            _updateProfileImage(blob);
          }
        }
      }

      function _closeCropContent() {
        scope.isSelectedImage = false;
        scope.selectedImage = null;

        el.css({
          width: originModalDimentions.width,
          height: originModalDimentions.height
        });
      }

      function _selectFile(file) {
        var fileReader;

        if (file && window.FileReader && file.type.indexOf('image') > -1) {
          fileReader = new FileReader();

          scope.isSelectedImage = true;
          originModalDimentions = {
            width: el.width(),
            height: el.height()
          };

          _setModalDimentions();

          fileReader.onload = function(event) {
            scope.croppedImage = null;
            scope.selectedImage = event.target.result;
          };
          fileReader.readAsDataURL(file);
        }
      }

      function _setModalDimentions() {
        var dimensions = _getWindowDimensions();
        el.css({width: dimensions.width, height: dimensions.height});
      }

      function _getWindowDimensions() {
        var width = jqWindow.width() - 150;
        var height = jqWindow.height() - 150;

        return {
          width: width < 0 ? 0 : width,
          height: height < 0 ? 0 : height
        };
      }

      /**
       * 현재 보고 있는 프로필의 사진을 변경한다.
       * @param blob {blob} blob file of an image
       */
      function _updateProfileImage(blob) {
        // Since I'm calling 'updateProfilePic' api with blob file,
        // there might be an image file missing file extension.
        memberService.updateProfilePic(blob, true)
          .success(function() {
            // TODO: Currently, there is no return value.  How about member object for return???
            //memberService.getMemberInfo(memberService.getMemberId())
            //  .success(function(response) {
            //    //memberService.replaceProfilePicture(response);
            //    //memberService.setMember(response);
            //  });
            scope.hasUpdatedProfilePic = true;
          })
          .finally(function() {
            scope.toggleLoading();
            _closeCropContent()
          });
      }

      function _dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
        else
          byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        return new Blob([ab],{type: 'image/png'});
      }
    }
  }
})();
