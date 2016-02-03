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
  function NotificationCtrl($scope, $modalInstance, modalHelper, NotificationAudio, SampleNotification,
                            DesktopNotificationUtil, Browser, JndUtil) {
    var notificationAudio;
    var recentSound;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _setAllowSwitch();
      $scope.isAllowSetting = $scope.isAllowSwitch && DesktopNotificationUtil.isAllowSendNotification();

      $scope.setting = DesktopNotificationUtil.getData();
      $scope.setting.on = $scope.isAllowSetting;

      $scope.onNotificationToggle = onNotificationToggle;
      $scope.onSoundSelect = onSoundSelect;
      $scope.onClose = onClose;
      $scope.onSampleClick = onSampleClick;

      _createAlertSelectList();
      _setNotificationImage();

      _attachEvents();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$watch('setting.on', _onSettingOnChange);
      $scope.$watch('setting.showContent', _onSettingShowContentChange);

      $scope.$on('onPermissionChanged', _onPermissionChanged);

      $modalInstance.result.finally(_onModalClose);
    }

    /**
     * notification 사용여부 값 변경 이벤트 핸들러
     * @private
     */
    function _onSettingOnChange() {
      $scope.isAllowSetting = !DesktopNotificationUtil.isPermissionDenied() && $scope.setting.on;
    }

    /**
     * notification의 content 노출여부 변경 이벤트 핸들러
     * @param value
     * @private
     */
    function _onSettingShowContentChange(value) {
      DesktopNotificationUtil.setData('showContent', value);
    }

    /**
     * 모달 닫힘 이벤트 핸들러
     * @private
     */
    function _onModalClose() {
      DesktopNotificationUtil.setData($scope.setting);
    }

    /**
     * notification를 스위치 버튼 토글 이벤트 핸들러
     * @param {boolean} value
     */
    function onNotificationToggle(value) {
      $scope.setting.on = value;
      $scope.isAllowSetting = value;

      if (value) {
        DesktopNotificationUtil.requestPermission();
      }
    }

    /**
     * 메세지별 사운드 선택 이벤트 핸들러
     * @param {string} name
     * @param {number} index
     */
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
      recentSound = value;
    }

    /**
     * 닫기 이벤트 핸들러
     */
    function onClose() {
      modalHelper.closeModal();
    }

    /**
     * 샘플 노티 보내기 이벤트 핸들러
     */
    function onSampleClick() {
      SampleNotification.show({
        sound: recentSound
      });
    }

    /**
     * browser의 노티 퍼미션 변경 이벤트 핸들러
     * @private
     */
    function _onPermissionChanged() {
      JndUtil.safeApply($scope, function() {
        _setAllowSwitch();
      });
    }

    /**
     * alert 목록 생성
     * @private
     */
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

    /**
     * browser에 설정된 permission값을 해당 controller에 설정함
     * @private
     */
    function _setAllowSwitch() {
      $scope.isAllowSwitch = !DesktopNotificationUtil.isPermissionDenied();
    }

    function _setNotificationImage() {
      var isWin = JndUtil.pick(Browser, 'platform', 'isWin');
      $scope.notificationImage = isWin ?
        'assets/images/app_notification_w.png' :
        'assets/images/app_notification_m.png';
    }
  }
})();
