/**
 * @fileoverview 현재 멤버(자신)의 프로필(계정) 을 수정하는 모달창의 컨트롤러.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('BotProfileSettingCtrl', BotProfileSettingCtrl);

  function BotProfileSettingCtrl($scope, jndPubSub, modalHelper, files) {
    $scope.onImageCropDone = onImageCropDone;

    _init();

    /**
     * 초기화
     * @private
     */
    function _init() {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.flashId) {
          $scope.isFileReaderAvailable = false;
          alert($filter('translate')('@ie9-profile-image-support'));
          return;
        }
        else {
          if(window.FileReader && file.type.indexOf('image') > -1) {
            $scope.isFileReaderAvailable = true;
            var fileReader = new FileReader();

            $scope.isProfilePicSelected = true;
            fileReader.onload = function(e) {
              $scope.$apply(function($scope) {
                $scope.croppedProfilePic = '';
                $scope.profilePic = e.target.result;
              });
            };
            fileReader.readAsDataURL(files[0]);
          }
        }
      }
    }

    /**
     * image crop done event handler
     * @param {string} dataURI
     */
    function onImageCropDone(dataURI) {
      if (dataURI) {
        jndPubSub.pub('BlobProfileSettingCtrl:done', dataURI);
      }

      modalHelper.closeModal('cancel');
    }
  }
})();
