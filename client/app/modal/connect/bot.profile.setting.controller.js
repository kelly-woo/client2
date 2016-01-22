/**
 * @fileoverview 현재 멤버(자신)의 프로필(계정) 을 수정하는 모달창의 컨트롤러.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('BotProfileSettingCtrl', BotProfileSettingCtrl);

  function BotProfileSettingCtrl($scope, jndPubSub, modalHelper, imageData) {
    $scope.onImageCropDone = onImageCropDone;

    _init();

    /**
     * 초기화
     * @private
     */
    function _init() {
      $scope.imageData = imageData;
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
