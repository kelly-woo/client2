/**
 * @fileoverview Logging service
 * @author JiHoon Kim <jihoonk@tosslab.com>
 *
 */
(function() {
  'use strict';

  angular
    .module('base.logger')
    .service('logger', logger);

  /* @ngInject */
  function logger(config) {
    this.log = log;
    this.socketEventLogger = socketEventLogger;

    /**
     * Print msg in console in browser.
     *
     * @param msg {string}
     */
    function log(msg) {
      if (_isTestingMode()) console.log(msg);
    }

    /**
     * Check if application is currently running on either 'development' or 'local' environment.
     *
     * @returns {boolean}
     * @private
     */
    function _isTestingMode() {
      return config.name === 'local' || config.name === 'development';
    }

    /**
     * Print basic information about socket event.
     *
     * @param event {string} name of event
     * @param data {string} data
     * @param isEmitting {boolean} true if type of socket event is 'emit'
     */
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