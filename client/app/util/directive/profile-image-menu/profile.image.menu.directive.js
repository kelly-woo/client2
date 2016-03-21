/**
 * @fileoverview profile image dicrective
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('profileImageMenu', profileImageMenu);

  function profileImageMenu($filter, fileAPIservice, modalHelper, Dialog) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        onProfileImageChange: '&'
      },
      templateUrl : 'app/util/directive/profile-image-menu/profile.image.menu.html',
      link: link
    };

    function link(scope, el, attrs) {
      var _translate = $filter('translate');

      var _menuClass = attrs.menuClass || '';

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.menuClass = _menuClass;
        scope.onCropClick = onCropClick;
        scope.onCharacterClick = onCharacterClick;
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
              onProfileImageChange: _onProfileImageChange
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
          onProfileImageChange: _onProfileImageChange
        });
      }

      /**
       * profile image change 이벤트 핸들러
       * @param {string} dataURI
       * @private
       */
      function _onProfileImageChange(dataURI) {
        scope.onProfileImageChange({
          $dataURI: dataURI
        });
      }
    }
  }
})();
