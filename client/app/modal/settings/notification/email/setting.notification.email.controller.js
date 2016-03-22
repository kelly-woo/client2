/**
 * @fileoverview 이메일 노티피케이션 설정 모달창을 관리하는 컨트롤러
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('SettingNotificationEmailCtrl', SettingNotificationEmailCtrl);

  /* @ngInject */
  function SettingNotificationEmailCtrl($scope, $timeout, SettingNotificationEmailApi) {
    /**
     * request 최소화를 위한 delay time
     * @type {number}
     */
    var REQUEST_DELAY_TIME= 1000;

    /**
     * $timeout 의 반환 값
     * @type {*}
     */
    var _timer;

    $scope.isOn = true;
    $scope.data = {
      status: 'enabled',
      notificationFrequency: 'hourly',
      notificationHour: 0
    };
    $scope.notificationFrequencyList = [
      {
        text: '매 시 정각',
        value: 'hourly'
      },
      {
        text: '매일',
        value: 'daily'
      },
      {
        text: '매주 월요일',
        value: 'everyMonday'
      },
      {
        text: '매주 화요일',
        value: 'everyTuesday'
      },
      {
        text: '매주 수요일',
        value: 'everyWednesday'
      },
      {
        text: '매주 목요일',
        value: 'everyThursday'
      },
      {
        text: '매주 금요일',
        value: 'everyFriday'
      },
      {
        text: '매주 토요일',
        value: 'everySaturday'
      },
      {
        text: '매주 일요일',
        value: 'everySunday'
      }
    ];
    $scope.notificationHourList = [];
    $scope.setting = {
      on: true
    };

    $scope.onNotificationToggle = onNotificationToggle;
    $scope.onChange = onChange;

    _init();

    /**
     * 초기화 메서드
     * @private
     */
    function _init() {
      _initNotificationHourList();
      _attachScopeEvents();
      SettingNotificationEmailApi.get().then(_onSuccessGetSetting, _onErrorGetSetting);
    }

    /**
     * scope 이벤트 핸들러
     * @private
     */
    function _attachScopeEvents() {
      $scope.$on('$destroy', _onDestroy);
    }

    /**
     * 소멸자
     * @private
     */
    function _onDestroy() {
      $timeout.cancel(_timer);
      _requestSaveSetting();
    }

    /**
     * on/off 토글 콜백
     * @param {boolean} isOn
     */
    function onNotificationToggle(isOn) {
      _setOnOff(isOn);
      onChange();
    }

    /**
     * 설정값 변경 콜백
     */
    function onChange() {
      $timeout.cancel(_timer);
      _timer = $timeout(_requestSaveSetting, REQUEST_DELAY_TIME);
    }

    /**
     * 설정 저장 요청을 수행한다.
     * @private
     */
    function _requestSaveSetting() {
      SettingNotificationEmailApi.set($scope.data).then(null, _onErrorSaveSetting);
    }

    /**
     * 설정 저장 오류 콜백
     * @param {object} result
     * @private
     */
    function _onErrorSaveSetting(result) {
      JndUtil.alertUnknownError(result.data, result.status);
    }

    /**
     * 설정 조회 성공 콜백
     * @param {object} result
     * @private
     */
    function _onSuccessGetSetting(result) {
      $scope.isOn = (result.data.status === 'enabled');
      _.extend($scope.data, {
        status: result.data.status,
        notificationHour: result.data.notificationHour,
        notificationFrequency: result.data.notificationFrequency
      });
    }

    /**
     * 설정 조회 실패 콜백
     * @private
     */
    function _onErrorGetSetting(result) {
      JndUtil.alertUnknownError(result.data, result.status);
    }

    /**
     * 알림 시간 목록을 초기화 한다
     * @private
     */
    function _initNotificationHourList() {
      var i = 0;
      var text;
      for(; i < 24; i++) {
        text = i < 10 ? '0' + i : i;
        text += ':00';
        $scope.notificationHourList.push({
          text: text,
          value: i
        });
      }
    }

    /**
     * onOff 값을 설정한다.
     * @param {boolean} isOn
     * @private
     */
    function _setOnOff(isOn) {
      $scope.isOn = isOn;
      $scope.data.status = isOn ? 'enabled' : 'disabled';
    }
  }
})();
