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
  function WatchDog($rootScope) {
    var _that = this;

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
      _that.run = run;
    }

    /**
     * run watch dog
     * @private
     */
    function run() {
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
     * weak up 상태 동안 주기적으로 수행
     * @private
     */
    function _loop() {
      _currentTime = (new Date()).getTime();

      if (_currentTime > (_lastTime + DELAY + 5000)) {
        // 100은 setTimeout delay의 오차 허용범위이다.

        $rootScope.$broadcast('WatchDog:onWakeUp');
      }

      $rootScope.$broadcast('WatchDog:onCycle');

      _lastTime = _currentTime;
      _timerLastLoop = setTimeout(_loop, DELAY);
    }
  }
})();
