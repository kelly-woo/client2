/**
 * @fileoverview 데스크탑 노티피케이션 설정 모달창을 관리하는 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('NotificationCtrl', NotificationCtrl);

  /* @ngInject */
  function NotificationCtrl($scope, $timeout, modalHelper, DesktopNotificationUtil, SampleNotification) {

    _init();

    /**
     * init
     * @private
     */
    function _init() {

    }


    var NOTI_TURN_ON = '@setting-notification-turn-on';
    var NOTI_TURN_OFF = '@setting-notification-turn-off';

    /**
     * 모달을 닫는다.
     */
    $scope.cancel = modalHelper.closeModal;

    // 노티피케이션은 켜져있는가? 노티피케이션 활성/비활성 상태
    $scope.isDesktopNotificationOn = false;

    // 노티피케이션에서 메세지를 보여줘야하는가? 노티피케이션 보여짐 여부
    $scope.isShowNotificationContent;

    // 데스크탑 노티피케이션을 켜야하는가? 노티피케이션 활성/비활성 상태
    $scope.shouldTurnOnNotification = true;

    // 노티피케이션이 아예 block 되어버렸는가? 노티피케이션 활성/비활성 버튼 자체가 의미없음
    $scope.isNotificationDenied = false;
    
    $scope.onSampleClick = function () {
      SampleNotification.show();
    };
  }
})();
