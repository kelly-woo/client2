(function() {
    'use strict';

    angular
        .module('jandiApp')
        .factory('desktopNotificationService', desktopNotificationService);

    desktopNotificationService.$inject = ['entityAPIservice'];

    function desktopNotificationService(entityAPIservice) {
        var service = {
            notify: notify,
            addNotification: addNotification
        };

        return service;


        function notify(title) {
            if (!("Notification" in window)) {
                console.log('no notification.');
                return;
            }
            else if (Notification.permission === "granted") {
                // If it's okay let's create a notification
                var notification = new Notification("Hi there!");
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
            console.log(fromEntity);
            console.log(toEntity);

        }
    }

})();
