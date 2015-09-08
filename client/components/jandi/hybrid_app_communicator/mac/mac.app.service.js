/**
 * @fileoverview Service that calls functions in mac application through 'jandimac'
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('MacAppHelper', MacAppHelper);
  
  /* @ngInject */
  function MacAppHelper() {
    var that = this;

    that.trigger = trigger;
    that.isMacApp = isMacApp;

    /**
     * app event trigger
     * @param {string} type
     * @param {string|object} data
     */
    function trigger(type, data) {
      if (isMacApp()) {
        window.jandimac.trigger(type, data);
      }
    }

    /**
     * Return true if 'jandimac' exists as a variable.
     * 'jandimac' id first declared and defined by mac application. so 'jandimac' is defined if and only if when it's running on mac application.
     * @returns {boolean}
     * @private
     */
    function isMacApp() {
      return window.jandimac != null;
    }
  }
})();
