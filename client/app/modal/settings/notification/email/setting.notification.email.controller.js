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
  function SettingNotificationEmailCtrl($scope, $timeout, $filter, SettingNotificationEmailApi) {
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

    var _translate = $filter('translate');

    $scope.isOn = true;
    $scope.data = {
      status: 'enabled',
      notificationFrequency: 'hourly',
      notificationHour: 0
    };
    $scope.notificationFrequencyList = [
      {
        text: _translate('@common-hourly'),
        value: 'hourly'
      },
      {
        text: _translate('@common-daily'),
        value: 'daily'
      },
      {
        text: _getFullDayText('@jnd-connect-90'),
        value: 'everyMonday'
      },
      {
        text: _getFullDayText('@jnd-connect-91'),
        value: 'everyTuesday'
      },
      {
        text: _getFullDayText('@jnd-connect-92'),
        value: 'everyWednesday'
      },
      {
        text: _getFullDayText('@jnd-connect-93'),
        value: 'everyThursday'
      },
      {
        text: _getFullDayText('@jnd-connect-94'),
        value: 'everyFriday'
      },
      {
        text: _getFullDayText('@jnd-connect-95'),
        value: 'everySaturday'
      },
      {
        text: _getFullDayText('@jnd-connect-96'),
        value: 'everySunday'
      }
    ];
    $scope.notificationHourList =  [
      {text: _translate('@jnd-connect-58'), value: 24},
      {text: _translate('@jnd-connect-59'), value: 1},
      {text: _translate('@jnd-connect-60'), value: 2},
      {text: _translate('@jnd-connect-61'), value: 3},
      {text: _translate('@jnd-connect-62'), value: 4},
      {text: _translate('@jnd-connect-63'), value: 5},
      {text: _translate('@jnd-connect-64'), value: 6},
      {text: _translate('@jnd-connect-65'), value: 7},
      {text: _translate('@jnd-connect-66'), value: 8},
      {text: _translate('@jnd-connect-67'), value: 9},
      {text: _translate('@jnd-connect-68'), value: 10},
      {text: _translate('@jnd-connect-69'), value: 11},
      {text: _translate('@jnd-connect-70'), value: 12},
      {text: _translate('@jnd-connect-71'), value: 13},
      {text: _translate('@jnd-connect-72'), value: 14},
      {text: _translate('@jnd-connect-73'), value: 15},
      {text: _translate('@jnd-connect-74'), value: 16},
      {text: _translate('@jnd-connect-75'), value: 17},
      {text: _translate('@jnd-connect-76'), value: 18},
      {text: _translate('@jnd-connect-77'), value: 19},
      {text: _translate('@jnd-connect-78'), value: 20},
      {text: _translate('@jnd-connect-79'), value: 21},
      {text: _translate('@jnd-connect-80'), value: 22},
      {text: _translate('@jnd-connect-81'), value: 23}
    ];

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
     * onOff 값을 설정한다.
     * @param {boolean} isOn
     * @private
     */
    function _setOnOff(isOn) {
      $scope.isOn = isOn;
      $scope.data.status = isOn ? 'enabled' : 'disabled';
    }

    /**
     * "매주 x요일" 이라는 text 를 반환한다.
     * @param {string} dayKey - L10N 키 값
    * @returns {string}
     * @private
     */
    function _getFullDayText(dayKey) {
      return _translate('@jnd-connect-88') + ' '+ _translate(dayKey);
    }
  }
})();
