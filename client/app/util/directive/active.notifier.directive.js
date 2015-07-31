/**
 * @fileoverview 유져의 행동을 감지해 서버에 active 상태인지 아닌지 알려주는 곳
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('activeNotifier', activeNotifier);

  /* @ngInject */
  function activeNotifier($timeout, $http, config, logger) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, el, attrs) {
      var PLATFORM = 'web';

      // 주기적으로 체크하는 간격 in ms
      var _ACTIVE_THRESHOLD = 60000;

      // 마지막으로 active 되었던 시간
      var _lastActiveTime;

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
        _detachEventListener();
        _lastActiveTime = _.now();
        _attachEventListener();
        _startTimer();
        scope.$on('$destroy', _detachEventListener);
      }

      /**
       * $(window)에 이벤트 listener들을 추가한다.
       * @private
       */
      function _attachEventListener() {
        el.on(_EVENTS);
      }

      /**
       * 위에서 $(window)에 추가했던 이벤트들을 다시 제거한다.
       * @private
       */
      function _detachEventListener() {
        el.off(_EVENTS);
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

        logger.log('is he active?' + _isActive);
      }

      /**
       * 서버로 현재 active상태를 알려준다.
       * @param {boolean} isActive - active라면 true 아니면 false
       * @private
       */
      function _notify(isActive) {
        $http({
          method: 'PUT',
          url: config.server_address + 'platform/active',
          data: {
            platform: PLATFORM,
            active: isActive
          }
        });
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
