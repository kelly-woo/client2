(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('desktopNotificationService', desktopNotificationService);

  desktopNotificationService.$inject = ['$rootScope', '$state', '$filter', 'entityAPIservice', 'accountService', 'memberService'];

  function desktopNotificationService($rootScope, $state, $filter, entityAPIservice, accountService, memberService) {
    var NOTIFICATION_EXPIRE_TIME = 5000;
    var NOFITICATION_TITLE = $filter('translate')('@web-notification-title');

    var supportNotification = 'Notification' in window;         // Notification support 여부

    /**
     * WebAPI Notification class
     */
    var WebNotification = {
      /**
       * @constructor
       * @param {object} options - object options
       */
      init: function(options) {
        var that = this;

        that.options = {
          body: 'Hello World!',
          tag: 'tag',
          icon: ''
        };

        angular.extend(that.options, options);

        return that;
      },
      /**
       * Web Notification show
       * native Notification object 생성하고 event handler를 열결함.
       */
      show: function() {
        var that = this;
        var options = that.options;
        var notification;

        // An actually notification object.
        notification = new Notification(that.options.title || NOFITICATION_TITLE, that._createOptions());


        // onshow, onclick의 hard code는 바뀌지 않는다고 판단하여 그대로 박아둠.

        // show event callback
        notification.onshow = function() {                  // Decides what it does when notification pops up.
          // Binds fadeout effect on notification.
          setTimeout(notification.close.bind(notification), NOTIFICATION_EXPIRE_TIME);

          options.onShow && options.onShow();
        };

        // click event callback
        notification.onclick = function() {                 // Decides what to do when notification click.
          // Takes user to topic/messages where notification came from.
          var roomEntity = that.options.data;

          $state.go('archives', {entityType: roomEntity.type, entityId: roomEntity.id});
          window.focus();
          options.onClick && options.onClick();
        };
      },
      /**
       * Web Notification object 생성시 전달하는 options object 생성
       */
      _createOptions: function() {
        var that = this;
        var options = that.options;

        return {
          tag: options.tag,
          body: options.body,                   // body message for notification.
          icon: options.icon                    // User profile picture.
        };
      }
    };

    return {
      /**
       * Notification object 생성
       *
       * @param {object} options - object options
       */
      createInstance: function(options) {
        var permission;

        // Notification supported by Browser.
        if (supportNotification) {
          permission = Notification.permission;
          if (permission === 'granted') {
            return Object.create(WebNotification).init(options);
          } else if (permission !== 'denied') {
            // Otherwise, we need to ask the user for permission
            // Note, Chrome does not implement the permission static property
            // So we have to check for NOT 'denied' instead of 'default'
            Notification.requestPermission(function (permission) {
              // If the user is okay, let's create a notification
              if (permission === 'granted') {
                return Object.create(WebNotification).init(options);
              }
            });
          }
        }
      },
      /**
       * object options 생성 및 object 생성
       *
       * @param {object} data - message
       * @param {object} writerEntity - message 작성한 작성자의 entity
       * @param {object} roomEntity - message 전달한 room의 entity
       */
      addNotification: function(data, writerEntity, roomEntity) {
        var that = this;
        var isUser = roomEntity.type === 'users';
        var options = {};
        var notification;

        if (isUser) {
          options.tag = writerEntity.id;
          options.body = writerEntity.name + ': ' + data.message;
          // $filter('translate')('@web-notification-body-messages-pre')
          // + writerEntity.name
          // + $filter('translate')('@web-notification-body-messages-post');
        } else {
          options.tag = roomEntity.id;
          options.body = '[' + roomEntity.name + ']' + writerEntity.name + ': '+ data.message;
          // var currentLanguage = accountService.getAccountLanguage();
          // var bodyMessage;

          // switch (currentLanguage) {
          //   case 'ko' :
          //     bodyMessage = '[' + roomEntity.name + ']'
          //     + $filter('translate')('@web-notification-body-topic-mid')
          //     + writerEntity.name;
          //     break;
          //   case 'ja' :
          //     bodyMessage = writerEntity.name
          //     + $filter('translate')('@web-notification-body-topic-mid')
          //     + '[' + roomEntity.name + ']';
          //     break;
          //   default :
          //     bodyMessage = $filter('translate')('@web-notification-body-topic-pre')
          //     + '[' + roomEntity.name + ']'
          //     + $filter('translate')('@web-notification-body-topic-mid')
          //     + writerEntity.name;
          //     break;
          // }

          // bodyMessage += '\r\n';
          // console.log('writerEntity ::: ', writerEntity);
          // console.log('roomEntity ::: ', roomEntity);
          // console.log('memberService ::: ', memberService);

          // bodyMessage += $filter('translate')('@web-notification-body-topic-post');
          // return bodyMessage;
        }

        options.icon = $filter('getSmallThumbnail')(writerEntity);
        options.data = {
          id: roomEntity.id,
          type: roomEntity.type
        };

        (notification = that.createInstance(options)) && notification.show();
      }
    };
  }

})();
