/**
 * @fileoverview Service that calls functions in mac application through 'jandimac'
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('MacAppHelper', MacAppHelper);
  
  /* @ngInject */
  function MacAppHelper(OtherTeamBadgeManager, NotificationManager) {
    var that = this;

    that.trigger = trigger;
    that.isMacApp = isMacApp;

    that.updateBadge = updateBadge;


    /**
     * app event trigger
     * @param {string} type
     * @param {boolean|string|object} data
     */
    function trigger(type, data) {
      if (isMacApp()) {
        window.jandimac.trigger(type, data);
      }
    }

    function updateBadge() {
      if (NotificationManager.hasNotificationAfterFocus()) {
        console.log('has unfocused message :::', true);
      } else {
        console.log('has unfocused message :::', false);
      }

      console.log('total badge count ::: ', _getTotalBadgeCount());
    }

    function _getTotalBadgeCount() {
      return OtherTeamBadgeManager.getTotalBadgeCount() + NotificationManager.getTotalNotificationCount();
    }

    //function _updateUnfocusedMessage() {
    //  trigger('hasUnfocusedMessage', value);
    //}
    //
    //function _updateBadgeCount() {
    //  trigger('updateBadgeCount', value);
    //}

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
