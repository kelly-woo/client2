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

    var NOTI_TURN_ON = '@setting-notification-turn-on';
    var NOTI_TURN_OFF = '@setting-notification-turn-off';

    /**
     * 모달을 닫는다.
     */
    $scope.cancel = modalHelper.closeModal;

    // 노티피케이션은 켜져있는가?
    $scope.isDesktopNotificationOn = false;

    // 노티피케이션에서 메세지를 보여줘야하는가?
    $scope.isShowNotificationContent;

    // 데스크탑 노티피케이션을 켜야하는가?
    $scope.shouldTurnOnNotification = true;

    // 노티피케이션이 아예 block 되어버렸는가?
    $scope.isNotificationDenied = false;

    $scope.onNotificationButtonClicked = onNotificationButtonClicked;

    $scope.sendTestNotification = sendTestNotification;

    $scope.onNotificationShowContentMessageChanged = onNotificationShowContentMessageChanged;
    $scope.onNotificationShowContentMessageClicked = onNotificationShowContentMessageClicked;

    (function() {
      init();
    })();

    $scope.$on('onDesktopNotificationPermissionChanged', _onDesktopNotificationPermissionChanged);

    /**
     * Desktop notification permission 이 변했을 때 호출된다.
     * @param {object} event - angular 에서 던져주는 $broadcast event
     * @param {string} permission - 새로이 바뀐 Notification.permission 의 값
     * @private
     */
    function _onDesktopNotificationPermissionChanged(event, permission) {
      init();
    }

    /**
     * 모달이 불러졌을 때 실행되어야 하는 부분.
     */
    function init() {
      DesktopNotificationUtil.log();

      // 데스크탑 노티피케이션이 켜져있는가??
      $scope.isDesktopNotificationOn = DesktopNotificationUtil.isNotificationOn();

      if (DesktopNotificationUtil.canSendNotification()) {
        // 노티피케이션을 날려도 되는 상태!
        _onNotificationGranted();
      } else {
        // 노티피케이션이 denied 거나 default 인 경우.
        if (DesktopNotificationUtil.isNotificationPermissionDenied()) {
          // 노티피케이션이 완전히 블락되었음.
          // 이럴땐 사용자가 직접 브라우져 설정창에서 바꿔야 함.
          _onNotificationDenied();
        } else {
          // 그냥 default 인 경우.
          _onNotificationDefault();
        }
      }

      $scope.isShowNotificationContent = DesktopNotificationUtil.getShowNotificationContentFlag();

      // view 를 바꾸기위해서 한다.
      $timeout(function() {
        $scope.notificationBtnText = $scope.shouldTurnOnNotification ? NOTI_TURN_ON : NOTI_TURN_OFF;
      }, 10);
    }

    /**
     * 데스크탑 노티피케이션을 키고 끈다.
     */
    function onNotificationButtonClicked() {
      if (!$scope.isDesktopNotificationOn) {
        // 노티피케이션이 꺼져있으므로 킨다.
        DesktopNotificationUtil.turnOnDesktopNotification();
      } else {
        // 브라우져 노티피케이션은 켜져있지만 유저가 끄거나 키길원한다.
        DesktopNotificationUtil.toggleDesktopNotificationLocally();
      }
    }

    /**
     * 테스트용 데스크탑 노티피케이션을 보낸다.
     */
    function sendTestNotification() {
      SampleNotification.show();
    }

    /**
     * 노티피케이션이 'granted' (allow) 되었을 때 호출된다.
     * @private
     */
    function _onNotificationGranted() {
      $scope.shouldTurnOnNotification = false;
    }

    /**
     * 노티피케이션이 'denied' (block) 되었을 때 호출된다.
     @private
     */
    function _onNotificationDenied() {
      $scope.shouldTurnOnNotification = true;
      $scope.isNotificationDenied = true;
    }

    /**
     * 노티피케이션이 'default' (알람창에서 그냥 x 누름) 되었을 때 호출된다.
     @private
     */
    function _onNotificationDefault() {
      $scope.shouldTurnOnNotification = true;

    }

    /**
     * 노티피케이션 메세지 내용을 보여주나 마나 하는 checkbox 의 값이 변했을 때 호출된다.
     */
    function onNotificationShowContentMessageChanged() {
      DesktopNotificationUtil.setShowNotificationContent($scope.isShowNotificationContent);
    }

    /**
     * 노티피케이션 메세지 내용을 보여주나 마나 하는 checkbox 의 값이 변했을 때 호출된다.
     */
    function onNotificationShowContentMessageClicked() {
      if ($scope.isDesktopNotificationOn) {
        // 노티피케이션이 켜져있을 때만
        $scope.isShowNotificationContent = !$scope.isShowNotificationContent;
        DesktopNotificationUtil.setShowNotificationContent($scope.isShowNotificationContent);
      }
    }

    $scope.toggleNotificationStatus = function() {
      $scope.isDesktopNotificationOn = !$scope.isDesktopNotificationOn;
      $scope.notificationBtnText = $scope.isDesktopNotificationOn ? '@setting-notification-turn-off' : '@setting-notification-turn-on';
      $scope.shouldTurnOnNotification = !$scope.isDesktopNotificationOn;
    }
  }
})();
