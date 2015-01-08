(function() {
    'use strict';

    angular
        .module('jandiApp')
        .factory('desktopNotificationService', desktopNotificationService);

    desktopNotificationService.$inject = ['$rootScope', '$state', '$filter', 'entityAPIservice', 'accountService'];

    function desktopNotificationService($rootScope, $state, $filter, entityAPIservice, accountService) {
        var service = {
            notify: notify,
            addNotification: addNotification
        };

        return service;


        function notify(title, notificationOption) {
            if (!("Notification" in window)) {
                // Notification not supported by Browser.
                return;
            }
            else if (Notification.permission === "granted") {

                // If it's okay let's create a notification.
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

            // Otherwise, we need to ask the user for permission
            // Note, Chrome does not implement the permission static property
            // So we have to check for NOT 'denied' instead of 'default'
            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    // If the user is okay, let's create a notification
                    if (permission === "granted") {
                        var notification = new Notification("Hi there!");
                    }
                });
            }

            // At last, if the user already denied any notification, and you
            // want to be respectful there is no need to bother them any more.
        }


        function addNotification(fromEntity, toEntity) {

            var notificationOption = toEntity;

            var bodyMessage = getNotificationBodyMessage(fromEntity, toEntity);

            notificationOption.tag = toEntity.id;
            notificationOption.body= bodyMessage;
            notificationOption.icon= $filter('getSmallThumbnail')(fromEntity);

            var title = $filter('translate')('@web-notification-title');

            notify(title, notificationOption);
        }

        function getNotificationBodyMessage(fromEntity, toEntity) {
            if (toEntity.type == 'user')
                return generateMessagesNotificationBody(fromEntity);

            return generateTopicNotificationBody(fromEntity, toEntity)
        }

        // Generates body message for 1:1 messages notification.
        function generateMessagesNotificationBody(fromEntity) {
            return $filter('translate')('@web-notification-body-messages-pre')
                + fromEntity.name
                + $filter('translate')('@web-notification-body-messages-post');
        }

        // Generates body messages for topic related notification.
        function generateTopicNotificationBody(fromEntity, toEntity) {
            var currentLanguage = accountService.getAccountLanguage();

            var bodyMessage;

            console.log(currentLanguage)

            switch (currentLanguage) {
                case 'ko' :
                    bodyMessage = '[' + toEntity.name + ']' + $filter('translate')('@web-notification-body-topic-mid')
                                    + fromEntity.name;
                    break;
                case 'ja' :
                    bodyMessage = fromEntity.name + $filter('translate')('@web-notification-body-topic-mid')
                                    + '[' + toEntity.name + ']';
                    break;
                case 'en' :
                    bodyMessage = $filter('translate')('@web-notification-body-topic-pre')
                                    + fromEntity.name
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

            return $filter('translate')('@web-notification-body-topic-pre')
                + fromEntity.name
                + $filter('translate')('@web-notification-body-topic-mid')
                + '[' + toEntity.name + ']'
                + $filter('translate')('@web-notification-body-topic-post');
        }

        // Binds fadeout effect on notification.
        function notificationFadeOut(noti) {
            setTimeout(noti.close.bind(noti), 1500000);
        }

        // Takes user to topic/messages where notification came from.
        function onNotificationClicked(noti) {
            var toEntity = entityAPIservice.getEntityFromListById($rootScope.totalEntities, noti.tag);
            $state.go('archives', {entityType:toEntity.type + 's', entityId:toEntity.id});
        }
    }

})();
