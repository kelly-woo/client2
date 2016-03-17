/**
 * @fileoverview user profile dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('userProfile', userProfile);

  function userProfile($filter, JndUtil, memberService, fileAPIservice, Dialog, modalHelper) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el) {
      var _translate = $filter('translate');
      var _timerHideDmSubmit;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.isSelectedImage = false;

        scope.onProfileImageClose = onProfileImageClose;

        scope.onCropClick = onCropClick;
        scope.onCharacterClick = onCharacterClick;
        scope.onSubmitDoneClick = onSubmitDoneClick;

        scope.setShowDmSubmit = setShowDmSubmit;
      }

      /**
       * image crop close event handler
       * @param {string} dataURI
       */
      function onProfileImageClose(dataURI) {
        if (dataURI) {
          _updateProfileImage(JndUtil.dataURItoBlob(dataURI));

          Dialog.success({title: _translate('@profile-success')});
        }
      }

      /**
       * crop 선택 이벤트 핸들러
       */
      function onCropClick() {
        $('<input type="file" accept="image/*"/>')
          .on('change', function(evt) {
            var promise = fileAPIservice.getImageDataByFile(evt.target.files[0]);
            promise.then(_resolveImageData);
          })
          .trigger('click');
      }

      /**
       * resolve image data
       * @param {object} img
       * @private
       */
      function _resolveImageData(img) {
        scope.croppedImage = null;
        if (img) {
          if (img.type === 'error') {
            Dialog.warning({
              'title': _translate('@common-unsupport-image')
            });
          } else {
            scope.isSelectedImage = true;
            scope.imageData = img.toDataURL('image/jpeg');

            modalHelper.openProfileImageModal(scope, {
              type: 'crop',
              imageData: scope.imageData,
              onProfileImageClose: onProfileImageClose
            });
          }
        }
      }

      /**
       * character 생성 선택 이벤트 핸들러
       */
      function onCharacterClick() {
        modalHelper.openProfileImageModal(scope, {
          type: 'character',
          onProfileImageClose: onProfileImageClose
        });
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

        clearTimeout(_timerHideDmSubmit);
        scope.isShowDmSubmit = value;
        if (value) {
          jqMessageInput.blur();
          jqMessageSubmit.show();
        } else {
          _timerHideDmSubmit = setTimeout(function() {
            jqMessageInput.focus();
            jqMessageSubmit.hide();
          }, 200);
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
