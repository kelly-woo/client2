/**
 * @fileoverview wake up service
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('WakeUp', WakeUp);

  /* @ngInject */
  function WakeUp() {
    var _that = this;
    var _onWakeUp = [];

    var DELAY = 6000;
    var _currentTime;
    var _lastTime;

    var _timerLastLoop;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _on();

      _that.push = push;
    }

    /**
     * app이 sleep 상태에서 wake up 했을때 수행할 함수 설정
     * @param {function} fn
     * @returns {WakeUp}
     */
    function push(fn) {
      _onWakeUp.push(fn);

      return _that;
    }

    /**
     * on wake up
     * @private
     */
    function _on() {
      _lastTime = (new Date()).getTime();

      _loop();
    }

    /**
     * off wake up
     * @private
     */
    function _off() {
      clearTimeout(_timerLastLoop);
    }

    /**
     * weak up 상태 동안 주기적으로 수행
     * @private
     */
    function _loop() {
      _currentTime = (new Date()).getTime();

      if (_currentTime > (_lastTime + DELAY + 1000)) {
        // 1000은 setTimeout delay의 오차 허용범위이다.

        _.each(_onWakeUp, function(fn) {
          fn();
        });
      }

      _lastTime = _currentTime;
      _timerLastLoop = setTimeout(_loop, DELAY);
    }
  }
})();
