/**
 * @fileoverview 노티피케이션 설정 모달창을 관리하는 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('SettingNotificationCtrl', SettingNotificationCtrl);

  /* @ngInject */
  function SettingNotificationCtrl($scope, modalHelper) {

    $scope.onClose = onClose;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
    }

    /**
     * 닫기 이벤트 핸들러
     */
    function onClose() {
      modalHelper.closeModal();
    }
  }
})();
