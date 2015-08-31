/**
 * @fileoverview Service that calls functions in mac application through 'jandimac'
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('macAppHelper', macAppHelper);
  
  /* @ngInject */
  function macAppHelper() {
    var that = this;

    that.trigger = trigger;
    that.isHybridApp = isHybridApp;

    /**
     * app event trigger
     * @param {string} type
     * @param {string|object} data
     */
    function trigger(type, data) {
      if (isHybridApp()) {
        window.jandimac.triggerNotification(data);
        window.jandimac.trigger(type, data);
      }
    }

    /**
     * Return true if 'jandimac' exists as a variable.
     * 'jandimac' id first declared and defined by mac application. so 'jandimac' is defined if and only if when it's running on mac application.
     * @returns {boolean}
     * @private
     */
    function isHybridApp() {
      return typeof window.jandimac != null;
    }
  }
})();
