/**
 * @fileoverview quick launcher modal directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('notificationAudioMenu', notificationAudioMenu);

  function notificationAudioMenu() {
    return {
      restrict: 'E',
      link: link,
      replace: true,
      templateUrl: 'app/modal/settings/notification/setting.notification.audio.html'
    };

    function link(scope, el) {

    }
  }
})();
