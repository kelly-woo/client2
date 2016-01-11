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

    function link(scope, el) {
      var timerHideDmSubmit;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.isSelectedImage = false;

        scope.onImageCropDone = onImageCropDone;
        scope.onImageEditClick = onImageEditClick;
        scope.onSubmitDoneClick = onSubmitDoneClick;

        scope.setShowDmSubmit = setShowDmSubmit;
      }

      /**
       * image crop done event handler
       * @param {string} dataURI
       */
      function onImageCropDone(dataURI) {
        scope.isSelectedImage = false;

        if (dataURI) {
          _updateProfileImage(JndUtil.dataURItoBlob(dataURI));
        }
      }

      /**
       * image edit click event handler
       */
      function onImageEditClick() {
        $('<input type="file" accept="image/*"/>')
          .on('change', function(evt) {
            JndUtil.safeApply(scope, function() {
              _setImageData(evt.target.files[0]);
            });
          })
          .trigger('click');
      }

      /**
       * submit done click event handler
       */
      function onSubmitDoneClick() {
        setShowDmSubmit(false);
        _focusInput();
      }

      /**
       * dm 입력란 상태 설정
       * @param {boolean} value
       */
      function setShowDmSubmit(value) {
        var jqMessageSubmit = el.find('.message-submit-bg');
        var jqMessageInput = el.find('.form-control');

        clearTimeout(timerHideDmSubmit);
        scope.isShowDmSubmit = value;
        if (value) {
          jqMessageInput.blur();
          jqMessageSubmit.show();
        } else {
          timerHideDmSubmit = setTimeout(function() {
            jqMessageInput.focus();
            jqMessageSubmit.hide();
          }, 200);
        }
      }

      /**
       * image data 설정
       * @param {object} file
       * @private
       */
      function _setImageData(file) {
        var fileReader;

        if (file && window.FileReader && file.type.indexOf('image') > -1) {
          fileReader = new FileReader();

          scope.isSelectedImage = true;
          fileReader.onload = function(event) {
            scope.croppedImage = null;
            scope.imageData = event.target.result;
          };
          fileReader.readAsDataURL(file);
        }
      }

      /**
       * 현재 보고 있는 프로필의 사진을 변경한다.
       * @param {object} blob - file of an image
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
      }

      /**
       * input에 focus
       * @private
       */
      function _focusInput() {
        var jqInput = el.find('.form-control');

        jqInput.focus();
      }
    }
  }
})();
