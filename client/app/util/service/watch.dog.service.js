/**
 * @fileoverview watch dog service
 * 특정 지연시간동안 주기적으로 수행할 핸들러들를 관리함
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('WatchDog', WatchDog);

  /* @ngInject */
  function WatchDog() {
    var _that = this;
    var _handlerMap = {
      onWakeUp: []
    };

    var DELAY = 60000;
    var _currentTime;
    var _lastTime;

    var _timerLastLoop;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      _run();

      _that.onWakeUp = onWakeUp;
    }

    /**
     * run watch dog
     * @private
     */
    function _run() {
      _lastTime = (new Date()).getTime();

      _loop();
    }

    /**
     * stop watch dog
     * @private
     */
    function _stop() {
      clearTimeout(_timerLastLoop);
    }

    /**
     * pc가 sleep 상태 였다가 일어날때 수행할 핸들러 추가
     */
    function onWakeUp(handler) {
      _handlerMap.onWakeUp.push(handler);
    }

    /**
     * weak up 상태 동안 주기적으로 수행
     * @private
     */
    function _loop() {
      _currentTime = (new Date()).getTime();

      if (_currentTime > (_lastTime + DELAY + 100)) {
        // 100은 setTimeout delay의 오차 허용범위이다.

        _.each(_handlerMap.onWakeUp, function(handler) {
          handler();
        });
      }

      _lastTime = _currentTime;
      _timerLastLoop = setTimeout(_loop, DELAY);
    }
  }
})();
