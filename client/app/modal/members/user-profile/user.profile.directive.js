/**
 * @fileoverview user profile dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('userProfile', userProfile);

  function userProfile($filter, CoreUtil, memberService, JndUtil, Dialog) {
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

        scope.onProfileImageChange = onProfileImageChange;
        scope.onSubmitDoneClick = onSubmitDoneClick;
        scope.setShowDmSubmit = setShowDmSubmit;
      }

      /**
       * profile image change 이벤트 핸들러
       * @param {string} dataURI
       */
      function onProfileImageChange(dataURI) {
        _updateProfileImage(CoreUtil.dataURItoBlob(dataURI));

        scope.userProfileImage = dataURI;

        Dialog.success({title: _translate('@profile-success')});
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
            scope.hasUpdatedProfilePic = true;
          })
          .error(function(response, status) {
            JndUtil.alertUnknownError(response, status);
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
