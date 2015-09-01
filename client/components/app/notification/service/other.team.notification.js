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
                                 jndWebSocketCommon, pcAppHelper,  $filter, DesktopNotification) {
    this.addNotification = addNotification;

    /**
     * 다른 팀으로부터 소켓이 왔을 때, 날려주는 브라우져 노티를 설정한다.
     * @param socketEvent
     */
    function addNotification(socketEvent) {
      var teamInfo;
      var teamName;
      var teamDomain;

      var options;
      var notification;

      if (_isGoodtoSendNotification(socketEvent)) {
        teamInfo = _getTeamInfo(socketEvent.teamId);
        teamName = teamInfo.teamName;
        teamDomain = teamInfo.teamDomain;

        if (!_.isUndefined(teamName)) {
          options = {
            tag: 'tag',
            body: _getBody(teamName),
            icon: 'assets/images/jandi-logo-200x200.png',
            callback: _onNotificationClicked,
            data: _.extend(socketEvent, {teamDomain: teamDomain})

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
    function _onNotificationClicked(param) {
      if (!pcAppHelper.isPcApp()) {
        // 기본적으로 /app/# 까지 포함한 주소를 만든다.
        var url = configuration.base_protocol + param['teamDomain'] + configuration.base_url + '/app/#';

        var type = param.room.type.toLowerCase();
        var roomId = param.room.id;

      if (DesktopNotificationUtil.isChatType(param)) {
        type = 'user';
        // chat 일 경우, 방 url이 roomId(혹은 entityId)로 되어있지 않고 user의 id로 되어있기에 그 값을 설정한다.
        roomId = param.writer;
      }

        // url 뒤에 가고 싶은 방의 타입과 주소를 설정한다.
        url += '/' + type + 's/' + roomId;

        if (!!param.messageType && param.messageType === 'file_comment') {
          // file comment socket event일 때
          url += '/files/' + param.file.id;
        }

        var open_link = window.open('', '_blank');
        open_link.location.href = url;
      }
    }

    /**
     * 현재 유저의 membership을 돌면서 teamId가 같은  team을 찾는다.
     * 그 팀의 이름과 도메인을 리턴한다.
     * @param {number} teamId - 찾으려는 팀의 아이디
     * @returns {{teamName: *, teamDomain: *}}
     * @private
     */
    function _getTeamInfo(teamId) {
      var account = accountService.getAccount();
      var memberships = account.memberships;
      var teamName;
      var teamDomain;

      _.forEach(memberships, function(team) {
        if (team.teamId === teamId) {
          teamName = team.name;
          teamDomain = team.t_domain;
        }
      });

      return {
        teamName: teamName,
        teamDomain: teamDomain
      };
    }

    /**
     * Notification object 생성
     *
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
