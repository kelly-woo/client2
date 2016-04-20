/**
 * @fileoverview e-mail 노티 설정 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('settingNotificationEmail', settingNotificationEmail);

  function settingNotificationEmail() {
    return {
      restrict: 'E',
      replace: true,
      link: link,
      scope: {},
      controller: 'SettingNotificationEmailCtrl',
      templateUrl: 'app/modal/settings/notification/email/setting.notification.email.html'
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
