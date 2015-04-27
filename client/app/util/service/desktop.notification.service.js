(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('desktopNotificationService', desktopNotificationService);

  desktopNotificationService.$inject = ['$rootScope', '$state', '$filter', 'entityAPIservice', 'accountService'];

  function desktopNotificationService($rootScope, $state, $filter, entityAPIservice, accountService) {
    var service = {
      addNotification: addNotification
    };

    return service;


    function addNotification(fromEntity, toEntity) {

      console.log(fromEntity)
      console.log(toEntity)
      var notificationOption = getNotificationOption(fromEntity, toEntity);

      // Set title for notification.
      var title = $filter('translate')('@web-notification-title');

      if (!("Notification" in window)) {
        // Notification not supported by Browser.
        return;
      }
      else if (Notification.permission === "granted") {
        notify(title, notificationOption);
      }
      else if (Notification.permission !== 'denied') {
        // Otherwise, we need to ask the user for permission
        // Note, Chrome does not implement the permission static property
        // So we have to check for NOT 'denied' instead of 'default'
        Notification.requestPermission(function (permission) {
          // If the user is okay, let's create a notification
          if (permission === "granted") {
            notify(title, notificationOption);
          }
        });
      }
    }

    function getNotificationOption(fromEntity, toEntity) {
      // Start with entity
      var notificationOption = toEntity;

      // Get body message for notification.
      var bodyMessage = getNotificationBodyMessage(fromEntity, toEntity);


      if (_isUser(toEntity)) {
        // Notification is 'to' me -> 1:1 direct message.
        // Direct user to fromEntity who sends direct message to you.
        notificationOption.tag = fromEntity.id;
      }
      else {
        // Otherwise, get entity id from 'toEntity'
        notificationOption.tag = toEntity.id;
      }

      // Set appropriate attributes to notification.
      notificationOption.body= bodyMessage;

      // User profile picture.
      notificationOption.icon= $filter('getSmallThumbnail')(fromEntity);

      return notificationOption;
    }

    function getNotificationBodyMessage(fromEntity, toEntity) {
      if (_isUser(toEntity))
        return generateMessagesNotificationBody(fromEntity);

      return generateTopicNotificationBody(fromEntity, toEntity)
    }

    // Generates body message for 1:1 direct message notification.
    function generateMessagesNotificationBody(fromEntity) {
      return $filter('translate')('@web-notification-body-messages-pre')
        + fromEntity.name
        + $filter('translate')('@web-notification-body-messages-post');
    }
    // Generates body messages for topic related notification.
    function generateTopicNotificationBody(fromEntity, toEntity) {
      var currentLanguage = accountService.getAccountLanguage();
      var bodyMessage;

      switch (currentLanguage) {
        case 'ko' :
          bodyMessage = '[' + toEntity.name + ']'
          + $filter('translate')('@web-notification-body-topic-mid')
          + fromEntity.name;
          break;
        case 'ja' :
          bodyMessage = fromEntity.name
          + $filter('translate')('@web-notification-body-topic-mid')
          + '[' + toEntity.name + ']';
          break;
        default :
          bodyMessage = $filter('translate')('@web-notification-body-topic-pre')
          + '[' + toEntity.name + ']'
          + $filter('translate')('@web-notification-body-topic-mid')
          + fromEntity.name;
          break;
      }

      bodyMessage += $filter('translate')('@web-notification-body-topic-post');
      return bodyMessage;
    }

    function notify(title, notificationOption) {
      // An actually notification object.
      var notification = new Notification(title, notificationOption);

      // Decides what it does when notification pops up.
      notification.onshow = function() {
        notificationFadeOut(notification);
      };

      // Decides what to do when notification click.
      notification.onclick = function() {
        onNotificationClicked(notification);
      };
    }

    // Binds fadeout effect on notification.
    function notificationFadeOut(noti) {
      setTimeout(noti.close.bind(noti), 3000);
    }
    // Takes user to topic/messages where notification came from.
    function onNotificationClicked(noti) {
      var toEntity = entityAPIservice.getEntityFromListById($rootScope.totalEntities, noti.tag);
      $state.go('archives', {entityType:toEntity.type, entityId:toEntity.id});
      window.focus();
    }

    function _isUser(entity) {
      return entity.type == 'users';
    }
  }

})();
