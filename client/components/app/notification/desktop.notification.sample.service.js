/**
 * @fileoverview Sample Notification 생성하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('SampleNotification', SampleNotification);

  /* @ngInject */
  function SampleNotification($filter, configuration, DesktopNotification, NotificationAudio) {
    var that = this;

    that.show = show;


    /**
     * show sample notification
     */
    function show() {
      noti.play('arise');

      DesktopNotification.show({
        tag: 'tag',
        body: $filter('translate')('@web-notification-sample-body-text'),
        icon: configuration.assets_url + 'assets/images/jandi-logo-200x200.png'
      });
    }
  }
})();
