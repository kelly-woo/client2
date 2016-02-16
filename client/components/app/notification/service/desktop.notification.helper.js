/**
 * Created by jihoonkim on 8. 12.2015.
 */
(function() {
  'use stirct';

  angular
    .module('app.desktop.notification')
    .service('desktopNotificationHelper', desktopNotificationHelper);

  /* @ngInject */
  function desktopNotificationHelper($filter, $state, RouterHelper, HybridAppHelper, DesktopNotificationUtil, jndPubSub) {
    var NOTIFICATION_EXPIRE_TIME = 7000;

    /**
     * WebAPI Notification class
     */
    var WebNotification = {
      init: notificationInit,
      show: show,
      _createOptions: _createOptions
    };

    /**
     * @constructor
     * @param {object} options - object options
     */
    function notificationInit(options) {
      var that = this;

      that.options = {
        body: 'Hello World!',
        tag: 'tag',
        icon: ''
      };

      angular.extend(that.options, options);

      return that;
    }

    /**
     * Web Notification show
     * native Notification object 생성하고 event handler를 열결함.
     */
    function show() {
      var that = this;
      var options = that.options;
      var notification;

      // 이것을 맨 위로 글로벌하게 빼고 싶었지만 사용자가 언어를 바꿨을 때 service 다시 호출되질않아서 번역이 안 맞는 경우가 있어서 매번배먼 콜하는 방식으로 바꿈.
      var NOTIFICATION_TITLE = $filter('translate')('@web-notification-title');
      var title = that.options.title || NOTIFICATION_TITLE;

      // An actual notification object.
      notification = new Notification(title, that._createOptions());

      notification.onshow = onNotificationShow;
      notification.onclick = onNotificationClick;

      if (HybridAppHelper.isMacApp()) {
        HybridAppHelper.trigger('notification', {
          title: title,
          body: options.body,
          icon: options.icon,
          url: DesktopNotificationUtil.getNotificationUrl(options.data)
        });
      }

      /**
       * 노티피케이션이 보여지면 호출되어진다.
       */
      function onNotificationShow() {
        // Binds fadeout effect on notification.
        setTimeout(notification.close.bind(notification), NOTIFICATION_EXPIRE_TIME);

        options.onShow && options.onShow();
      }

      /**
       * 노티피케이션이 클릭되었을 경우 호출된다.
       */
      function onNotificationClick() {
        var fn;
        if (_.isFunction(that.options.callback)) {
          fn = that.options.callback;

          if (!_.isUndefined(that.options.data)) {
            fn(that.options.data);
          } else {
            fn();
          }

        } else {
          // Decides what to do when notification click.
          // Takes user to topic/messages where notification came from.
          var targetEntity = that.options.data;

          if (!!targetEntity) {
            if (targetEntity.type === 'file_comment') {
              RouterHelper.setCommentToScroll(targetEntity.commentId);
              $state.go('files', {itemId: targetEntity.id});
            } else {
              $state.go('archives', {entityType: targetEntity.type, entityId: targetEntity.id});
            }
          }
        }

        window.focus();
        options.onClick && options.onClick();
        jndPubSub.pub('notification-click');
      }
    }

    /**
     * Web Notification object 생성시 전달하는 options object 생성
     */
    function _createOptions() {
      var that = this;
      var options = that.options;

      if (options.body) {
        options.body = $filter('stripMarkdown')(options.body);
      }

      return {
        tag: options.tag,
        // body message for notification
        body: options.body,
        // User profile picture.
        icon: options.icon
      };
    }


    this.WebNotification = WebNotification;
  }
})();
