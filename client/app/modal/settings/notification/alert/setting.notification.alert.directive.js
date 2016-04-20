/**
 * @fileoverview notification audio menu directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('settingNotificationAlert', settingNotificationAlert);

  function settingNotificationAlert() {
    return {
      restrict: 'E',
      replace: true,
      link: link,
      scope: {},
      controller: 'SettingNotificationAlertCtrl',
      templateUrl: 'app/modal/settings/notification/alert/setting.notification.alert.html'
    };

    function link(scope) {


      _init();

      /**
       * init
       * @private
       */
      function _init() {
      }
    }
  }
})();
