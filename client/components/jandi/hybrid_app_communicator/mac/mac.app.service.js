/**
 * @fileoverview Service that calls functions in mac application through 'jandimac'
 */
(function() {
  'use strict';
  
  angular
    .module('jandi.hybridApp')
    .service('MacAppHelper', MacAppHelper);
  
  /* @ngInject */
  function MacAppHelper(TeamData, NotificationManager) {
    var that = this;

    that.trigger = trigger;
    that.isMacApp = isMacApp;

    that.updateBadge = updateBadge;

    /**
     * app event trigger
     * @param {string} type
     * @param {string|function|object} data
     */
    function trigger(type, data) {
      if (isMacApp()) {
        window.jandimac.trigger(type, _.isFunction(data) ? data() : data);
      }
    }

    /**
     * update badge
     */
    function updateBadge() {
      trigger('updateBadge', function () {
        var hasFocused = !NotificationManager.hasNotificationAfterFocus();
        var totalBadgeCount = _getTotalBadgeCount();

        return {
          // badge 갱신시 focus 여부
          hasFocused: hasFocused,
          // 현재팀과 다른 팀의 총 badge 합
          totalBadgeCount: totalBadgeCount
        };
      });
    }

    /**
     * 현재팀과 다른 팀의 총 badge 합을 전달함.
     * @returns {*}
     * @private
     */
    function _getTotalBadgeCount() {
      return TeamData.getOtherTeamBadgeCount() + NotificationManager.getTotalNotificationCount();
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
