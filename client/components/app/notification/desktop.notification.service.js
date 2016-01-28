/**
 * @fileoverview window.Notification 생성하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('DesktopNotification', DesktopNotification);

  /* @ngInject */
  function DesktopNotification($state, $filter, RouterHelper, jndPubSub, HybridAppHelper, DesktopNotificationUtil,
                               NotificationAudio) {
    var that = this;
    var NOTIFICATION_EXPIRE_TIME = 7000;
    var isSupportNotification;
    var notificationAudio;

    _init();

    function _init() {
      notificationAudio = notificationAudio.getInstance([
        'arise'
      ], {
        preload: true,
        multiple: true
      });
    }

    that.config = config;
    that.show = show;

    //setTimeout(function() {
    //
    //  noti.play('arise');
    //  //noti.play('arise');
    //  //noti.play('arise');
    //}, 5000);
    /**
     * config
     */
    function config() {
      isSupportNotification = 'Notification' in window;
    }

    /**
     * show notification
     * @param {options} options
     */
    function show(options) {
      if (isSupportNotification && options) {
        createNotification(options);
      }
    }

    /**
     * create window.Notification
     * @param {object} options
     */
    function createNotification(options) {
      var title = options.title || $filter('translate')('@web-notification-title');
      var notification;

      if (options.body) {
        // markdown 제거한다.
        options.body = $filter('stripMarkdown')(options.body);
      }

      notification = new Notification(title, {
        tag: options.tag,
        body: options.body,
        icon: options.icon
      });

      notification.onshow = function() {
        _showNotification(notification, options);
      };
      notification.onclick = function() {
        _clickNotification(options);
      };

      if (HybridAppHelper.isMacApp()) {
        HybridAppHelper.trigger('notification', {
          title: title,
          body: options.body,
          icon: options.icon,
          url: DesktopNotificationUtil.getNotificationUrl(options.data)
        });
      }
    }

    /**
     * show notification event handler
     * @param {object} notification
     * @param {object} options
     * @private
     */
    function _showNotification(notification, options) {
      // Binds fadeout effect on notification.
      setTimeout(notification.close.bind(notification), NOTIFICATION_EXPIRE_TIME);

      options.onShow && options.onShow();
    }

    /**
     * click notification event handler
     * @param {object} options
     * @private
     */
    function _clickNotification(options) {
      var fn;

      if (fn = options.onClick) {
        fn(options.data);
      } else {
        _defaultClickNotification(options);
      }

      window.focus();
      jndPubSub.pub('notification-click');
    }

    /**
     * 기본 click notification event handler
     * @param {object} options
     * @private
     */
    function _defaultClickNotification(options) {
      // Decides what to do when notification click.
      // Takes user to topic/messages where notification came from.
      var targetEntity = options.data;

      if (!!targetEntity) {
        if (targetEntity.type === 'file_comment') {
          RouterHelper.setCommentToScroll(targetEntity.commentId);
          $state.go('files', {itemId: targetEntity.id});
        } else {
          $state.go('archives', {entityType: targetEntity.type, entityId: targetEntity.id});
        }
      }
    }
  }
})();
