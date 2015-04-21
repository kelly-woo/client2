(function() {
  'use strict';

  angular
    .module('base.logger')
    .service('logger', logger);

  /* @ngInject */
  function logger(config) {
    this.log = log;
    this.socketEventLogger = socketEventLogger;

    function log(msg) {
      if (_isTestingMode()) console.log(msg);
    }
    function _isTestingMode() {
      return config.name === 'local' || config.name === 'development';
    }
    function socketEventLogger(event, data, isEmitting) {
      if (_isTestingMode()) {
        console.log("")
        console.log("======================", isEmitting ? 'EMIT' : 'RECEIVE', "======================  ")
        console.log('event name: ', event);
        console.log('event data: ', data);
        console.log("")
      }

    }

  }

})();