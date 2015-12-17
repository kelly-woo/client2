/**
 * @fileoverview 현재 멤버(자신)의 프로필(계정) 을 수정하는 모달창의 컨트롤러.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('BotProfileSettingCtrl', BotProfileSettingCtrl);

  function BotProfileSettingCtrl($scope, jndPubSub, JndUtil, modalHelper, files) {
    $scope.cancel = cancel;
    $scope.done = done;
    $scope.onChange = onChange;

    _init();

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
    function onChange(tempPic) {
      $scope.croppedProfilePic = tempPic;
      jndPubSub.pub('BlobProfileSettingCtrl:done', $scope.croppedProfilePic);
      console.log('###onChange', $scope.croppedProfilePic);
    }

    function cancel() {
      modalHelper.closeModal('cancel');
    }

    function done() {
      var blob;
      console.log('###done', $scope.croppedProfilePic);
      if ($scope.croppedProfilePic) {
        //blob = JndUtil.dataURItoBlob($scope.croppedProfilePic);
        jndPubSub.pub('BlobProfileSettingCtrl:done', $scope.croppedProfilePic);
      }
      modalHelper.closeModal('cancel');
    }
  }
})();
