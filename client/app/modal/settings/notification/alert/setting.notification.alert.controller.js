/**
 * @fileoverview 데스크탑 노티피케이션 설정 모달창을 관리하는 컨트롤러
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('SettingNotificationAlertCtrl', SettingNotificationAlertCtrl);

  /* @ngInject */
  function SettingNotificationAlertCtrl($scope, $filter, modalHelper, NotificationAudio, SampleNotification,
                                        DesktopNotificationUtil, Browser, JndUtil, CoreUtil) {
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

      $scope.setting = _.extend({
        on: true,
        showContent: 'all',
        soundDM: 'off',
        soundMention: 'off',
        soundNormal: 'off'
      }, DesktopNotificationUtil.getData());

      $scope.setting.on = $scope.isAllowSetting;

      console.log('###setting', $scope.setting);
      $scope.onNotificationToggle = onNotificationToggle;
      $scope.onSoundSelect = onSoundSelect;
      $scope.onSampleClick = onSampleClick;
      $scope.onAlertOptionsMouseDown = onAlertOptionsMouseDown;

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
      $scope.$watch('setting.type', _onSettingTypeChange);
      $scope.$watch('setting.showContent', _onSettingShowContentChange);

      $scope.$on('onPermissionChanged', _onPermissionChanged);
      $scope.$on('$destroy', _onDestroy);
      //$modalInstance.result.finally(_onModalClose);
    }

    /**
     * notification 사용여부 값 변경 이벤트 핸들러
     * @private
     */
    function _onSettingOnChange() {
      $scope.isAllowSetting = !DesktopNotificationUtil.isPermissionDenied() && $scope.setting.on;
    }

    /**
     * notification 사용 형태 변경 이벤트 핸들러
     * @private
     */
    function _onSettingTypeChange(value) {
      $scope.isDMnMentionOnly = value === DesktopNotificationUtil.TYPE.DM_AND_MENTION;
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
    function _onDestroy() {
      DesktopNotificationUtil.setData($scope.setting);
    }

    /**
     * notification를 스위치 버튼 토글 이벤트 핸들러
     * @param {boolean} value
     */
    function onNotificationToggle(value) {
      $scope.setting.on = value;
      $scope.isAllowSetting = value;

      // notification on/off switch 선택시 자연스러운 translate 처리하기 위해 사용한다.
      $scope.isSettingSwitch = true;

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
     * 샘플 노티 보내기 이벤트 핸들러
     */
    function onSampleClick() {
      SampleNotification.show({
        sound: recentSound
      });
    }

    /**
     * alert options 영역 mouse down 이벤트 핸들러
     */
    function onAlertOptionsMouseDown() {
      $scope.isSettingSwitch = false;
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
      var translate = $filter('translate');
      var sounds = [
        {text: translate('@sounds-pop'), value: DesktopNotificationUtil.SOUNDS.AIR_POP},
        {text: translate('@sounds-ding'), value: DesktopNotificationUtil.SOUNDS.CHIME_BELL_DING},
        {text: translate('@sounds-chime'), value: DesktopNotificationUtil.SOUNDS.CHIMEY},
        {text: translate('@sounds-mouse'), value: DesktopNotificationUtil.SOUNDS.MOUSE},
        {text: translate('@sounds-nursery'), value: DesktopNotificationUtil.SOUNDS.NURSERY},
        {text: translate('@sounds-point'), value: DesktopNotificationUtil.SOUNDS.ON_POINT},
        {text: translate('@sounds-marimba'), value: DesktopNotificationUtil.SOUNDS.THINK_PING},
        {text: translate('@sounds-super'), value: DesktopNotificationUtil.SOUNDS.SUPER},
        {text: translate('@sounds-arise'), value: DesktopNotificationUtil.SOUNDS.ARISE}
      ];

      notificationAudio = NotificationAudio.getInstance(_.pluck(sounds, 'value'));

      sounds.unshift({text: translate('@common-off'), value: DesktopNotificationUtil.SOUNDS.OFF, nonSound: true});
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
      var isWin = CoreUtil.pick(Browser, 'platform', 'isWin');
      $scope.notificationImage = isWin ?
        'assets/images/app_notification_w.png' :
        'assets/images/app_notification_m.png';
    }
  }
})();
