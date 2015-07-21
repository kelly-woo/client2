(function() {
  'use strict';

  angular
    .module('jandi.active.notifier')
    .service('ActiveNotifier', ActiveNotifier);

  /* @ngInject */
  function ActiveNotifier($timeout) {
    // 주기적으로 체크하는 간격.
    var _ACTIVE_THRESHOLD = 1000;

    // 마지막으로 active 되었던 시간.
    var _lastActiveTime;

    // $(window)에서 들어야할 이벤트들. *event handler는 모두 같다.
    // TODO: 'keyup'을 걸어야하나 말아야 하나 고민됩니다.
    var _WINDOW_EVENTS = {
      'mousemove': _updateLastActiveTime,
      'click': _updateLastActiveTime,
      'focus': _updateLastActiveTime,
      'keyup': _updateLastActiveTime
    };

    this.init = init;
    this.detachEventListener = detachEventListener;

    /**
     * 초기화 함수.
     */
    function init() {
      detachEventListener();
      _lastActiveTime = _.now();
      _attachEventListener();
      _startTimer();
    }

    /**
     * $(window)에 이벤트 listener들을 추가한다.
     * @private
     */
    function _attachEventListener() {
      $(window).on(_WINDOW_EVENTS);
    }

    /**
     * 위에서 $(window)에 추가했던 이벤트들을 다시 제거한다.
     * @private
     */
    function detachEventListener() {
      $(window).off(_WINDOW_EVENTS);
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
      console.log('is he active?', _isActive)

      _startTimer();
    }

    /**
     * active 상태 체크를 위한 타이머를 설정한다.
     * @private
     */
    function _startTimer() {
      $timeout(_checkStatus, _ACTIVE_THRESHOLD);
    }
  }
})();