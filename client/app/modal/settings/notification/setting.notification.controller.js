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
  function NotificationCtrl($scope, $timeout, modalHelper, NotificationAudio, SampleNotification,
                            DesktopNotificationUtil) {
    var NOTI_TURN_ON = '@setting-notification-turn-on';
    var NOTI_TURN_OFF = '@setting-notification-turn-off';

    var notificationAudio;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.setting = $scope.originSetting = DesktopNotificationUtil.getData();
      $scope.setting.on = $scope.setting.on === 'true' ? true : false;

      $scope.isAllowSwitch = !DesktopNotificationUtil.isNotificationPermissionDenied();
      $scope.isAllowSetting = $scope.isAllowSwitch && $scope.setting.on;

      $scope.onNotificationToggle = onNotificationToggle;
      $scope.onSoundSelect = onSoundSelect;
      $scope.onSubmit = onSubmit;
      $scope.onCancel = onCancel;
      $scope.onSampleClick = onSampleClick;

      _createAlertSelectList();
    }

    function _createAlertSelectList() {
      var sounds = [
        {text: 'Ari Pop', value: 'air_pop'},
        {text: 'Arise', value: 'arise'},
        {text: 'Chime Bell Ding', value: 'chime_bell_ding'},
        {text: 'Chimey', value: 'chimey'},
        {text: 'Mouse', value: 'mouse'},
        {text: 'Nursery', value: 'nursery'},
        {text: 'On Point', value: 'on_point'},
        {text: 'Super', value: 'super'},
        {text: 'Think Ping', value: 'think_ping'}
      ];

      notificationAudio = NotificationAudio.getInstance(_.pluck(sounds, 'value'));

      sounds.unshift({text: 'Off', value: 'off', nonSound: true});
      $scope.alertSelectList = sounds;
    }

    function onNotificationToggle(value) {
      $scope.setting.on = value;
      $scope.isAllowSetting = value;
      if (value) {
        DesktopNotificationUtil.turnOnDesktopNotification();
      }
    }

    function onSoundSelect(name, index) {
      var value = $scope.alertSelectList[index].value;

      switch (name) {
        case 'normal':
          $scope.setting.soundNormal = value;
          break;
        case 'mention':
          $scope.setting.soundMention = value;
          break;
        case 'dm':
          $scope.setting.soundDM = value;
          break;
      }
    }

    function onSubmit() {
      DesktopNotificationUtil.setData($scope.setting);
      modalHelper.closeModal();
    }

    function onCancel() {
      modalHelper.closeModal();
    }

    function onSampleClick() {
      SampleNotification.show();
    }

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
  }
})();
