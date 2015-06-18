(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('notificationBanner', notificationBanner);

  /* @ngInject */
  function notificationBanner() {
    return {
      templateUrl: 'app/banner/desktop.notification.banner.html',
      controller: 'DesktopNotificationBannerCtrl',
      scope: false,
      link: link
    };


    function link(scope, el, attrs) {
    }
  }
})();