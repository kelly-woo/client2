/**
 * @fileoverview 유져의 행동을 감지해 서버에 active 상태인지 아닌지 알려주는 directive
 *  web_admin 과 공용으로 사용한다.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('activeNotifier', activeNotifier);

  /* @ngInject */
  function activeNotifier($timeout, $http, configuration, storageAPIservice) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      // 주기적으로 체크하는 간격 in ms
      var _ACTIVE_THRESHOLD = 60000;

      // 마지막으로 active 되었던 시간
      var _lastActiveTime;
      var _isSignedIn = true;

      // $(window)에서 들어야할 이벤트들. *event handler는 모두 같다.
      // TODO: 'keyup'을 걸어야하나 말아야 하나 고민됩니다.
      var _EVENTS = {
        'mousemove': _updateLastActiveTime,
        'click': _updateLastActiveTime,
        'focus': _updateLastActiveTime,
        'keyup': _updateLastActiveTime
      };

      _init();

      /**
       * 초기화 함수.
       */
      function _init() {
        //live 서버에서 console 로 version 체크하기 위함.
        var jandi = window.JANDI= window.JANDI || {};
        jandi.version = configuration.version;

        _lastActiveTime = _.now();
        _detachEventListener();
        _attachEventListener();
        _checkStatus();
        scope.$on('$destroy', _onDestroy);
        scope.$on('signIn', _onSignIn);
        scope.$on('signOut', _onSignOut);
      }

      /**
       *
       * @private
       */
      function _onSignIn() {
        _isSignedIn = true;
        _notify(true);
      }

      /**
       *
       * @private
       */
      function _onSignOut() {
        _isSignedIn = false;
        _notify(false);
      }
      /**
       * $(window)에 이벤트 listener들을 추가한다.
       * @private
       */
      function _attachEventListener() {
        el.on(_EVENTS);
        $(window).on('beforeunload', _onBeforeUnload);
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _notify(false);
        _detachEventListener();
      }

      /**
       * beforeunload 시 active 상태를 해제한다.
       * @private
       */
      function _onBeforeUnload() {
        _notify(false);
      }

      /**
       * 위에서 $(window)에 추가했던 이벤트들을 다시 제거한다.
       * @private
       */
      function _detachEventListener() {
        el.off(_EVENTS);
        $(window).off('beforeunload', _onBeforeUnload);
      }

      /**
       * 가장 최근 active 시간을 저장한다.
       */
      function _updateLastActiveTime() {
        _lastActiveTime = _.now();
      }

      /**
       * 현재 상태를 체크해서 서버에 알려준다.
       * @private
       */
      function _checkStatus() {
        var _isActive = true;

        if (_.now() - _lastActiveTime > _ACTIVE_THRESHOLD) {
          _isActive = false;
        }

        _notify(_isActive);

        _startTimer();
      }

      /**
       * 서버로 현재 active상태를 알려준다.
       * @param {boolean} isActive - active라면 true 아니면 false
       * @private
       */
      function _notify(isActive) {
        var accessToken = storageAPIservice.getAccessToken();
        if (accessToken) {
          if (!_isSignedIn) {
            isActive = false;
          }
          $.ajax({
            method: 'GET',
            url: configuration.api_address + 'inner-api/platform/active',
            dataType: 'jsonp',
            data: {
              access_token: accessToken,
              active: isActive,
              version: configuration.version
            },
            success: _onSuccessNotify
          });
        }
      }

      /**
       * 응답을 성공적으로 받은 경우 핸들러
       * @param {object} response
       * @private
       */
      function _onSuccessNotify(response) {
        var latestVersion = response && response.lastestWebVersion;
        if (_hasToUpdate(latestVersion)) {
          window.location.reload();
        }
      }

      /**
       * 업데이트 해야되는지 여부를 반환한다.
       * @param {string} latestVersion - 서버에 저장된 가장 최신 버전 정보
       * @returns {boolean}
       * @private
       */
      function _hasToUpdate(latestVersion) {
        var latest;
        var current;
        var hasToUpdate = false;
        if (_.isString(latestVersion)) {
          latest = _parseVersion(latestVersion);
          current = _parseVersion(configuration.version);
          _.forEach(latest, function(latestNum, index) {
            if (latestNum > current[index]) {
              hasToUpdate = true;
              return false;
            } else if (current[index] > latestNum) {
              return false;
            }
          });
        }
        return hasToUpdate;
      }

      /**
       * version 정보를 parsing 하여 version string 으로 반환한다.
       * @param {string} versionStr
       * @returns {string[]}
       * @private
       */
      function _parseVersion(versionStr) {
        var versionArr;
        var version = ['0', '0', '0'];
        if (_.isString(versionStr)) {
          versionArr = versionStr.split('.');
          version[0] = _getNumber(versionArr[0]) || parseInt(version[0], 10);
          version[1] = _getNumber(versionArr[1]) || parseInt(version[1], 10);
          version[2] = _getNumber(versionArr[2]) || parseInt(version[2], 10);
        }
        return version;
      }

      /**
       * version 정보 중 숫자만 추출하여 반환한다.
       * @param {string} version
       * @returns {*}
       * @private
       */
      function _getNumber(version) {
        if (_.isString(version)) {
          var index = version.search(/[^0-9]/);
          if (index !== -1) {
            version = version.substring(0, index) || '0';
          }
        }
        return parseInt(version, 10);
      }

      /**
       * active 상태 체크를 위한 타이머를 설정한다.
       * @private
       */
      function _startTimer() {
        $timeout(_checkStatus, _ACTIVE_THRESHOLD);
      }
    }
  }
})();
