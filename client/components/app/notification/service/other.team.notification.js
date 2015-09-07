/**
 * @fileoverview 다른 팀으로부터 소켓이 왔을 때, 날려주는 브라우져 노티를 설정한다.
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('OtherTeamNotification', OtherTeamNotification);

  /* @ngInject */
  function OtherTeamNotification(desktopNotificationHelper, accountService, configuration, DesktopNotificationUtil,
                                 jndWebSocketCommon, HybridAppHelper,  $filter, DesktopNotification) {
    this.addNotification = addNotification;

    /**
     * 다른 팀으로부터 소켓이 왔을 때, 날려주는 브라우져 노티를 설정한다.
     * @param socketEvent
     */
    function addNotification(socketEvent) {
      var teamInfo;
      var teamName;

      var options;
      var notification;

      if (_isGoodtoSendNotification(socketEvent)) {
        teamInfo = DesktopNotificationUtil.getTeamInfo(socketEvent.teamId);
        teamName = teamInfo.teamName;

        if (!_.isUndefined(teamName)) {
          options = {
            tag: 'tag',
            body: _getBody(teamName),
            icon: configuration.assets_url + 'assets/images/jandi-logo-200x200.png',
            callback: _onClick,
            data: socketEvent
          };

          (notification = _createInstance(options)) && notification.show();
        }
      }
    }

    /**
     * browser notification을 날려도 되는 상황인지 아닌지 확인/리턴한다.
     * @param {object} socketEvent - sockt event param
     * @returns {boolean}
     * @private
     */
    function _isGoodtoSendNotification(socketEvent) {
      if (DesktopNotification.canSendNotification()) {
        // 우선 시스템상에서 브라우져 노티가 켜져있어야 함
        if (jndWebSocketCommon.shouldSendNotification(socketEvent)) {
          // socket event가 나로부터 온게 아니어야 함.
          return true;
        }
      }
      return false;
    }

    /**
     * 브라우져 노티피케이션을 클릭했을 때 호출된다.
     * @param {object} param - socket event
     * @private
     */
    function _onClick(param) {
      var newWindow;

      if (!HybridAppHelper.isHybridApp()) {
        newWindow = window.open('', '_blank');
        newWindow.location.href = DesktopNotificationUtil.getNotificationUrl(param);
      }
    }

    /**
     * Notification object 생성
     * @param {object} options - object options
     */
    function _createInstance(options) {
      return Object.create(desktopNotificationHelper.WebNotification).init(options);
    }

    /**
     * 브라우져 노티피케이션에 보여질 body 부분의 text를 설정한 후 리턴한다.
     * @param {string} teamName - 포함되어야할 팀의 이름
     * @returns {*}
     * @private
     */
    function _getBody(teamName) {
      var currentLanguage = accountService.getAccountLanguage();

      var bodyMessage;

      switch (currentLanguage) {
        case 'en' :
          bodyMessage = $filter('translate')('@web-notification-body-other-team-pre') + teamName;
          break;
        default :
          bodyMessage = teamName + $filter('translate')('@web-notification-body-other-team-post');
          break;
      }

      return bodyMessage;
    }
  }
})();
