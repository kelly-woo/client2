/**
 * @fileoverview 다른 팀으로부터 소켓이 왔을 때, 날려주는 브라우져 노티를 설정한다.
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('OtherTeamNotification', OtherTeamNotification);

  /* @ngInject */
  function OtherTeamNotification(desktopNotificationHelper, accountService, configuration,
                                 memberService, $filter) {
    this.addNotification = addNotification;

    /**
     * 다른 팀으로부터 소켓이 왔을 때, 날려주는 브라우져 노티를 설정한다.
     * @param socketEvent
     */
    function addNotification(socketEvent) {
      var notification;

      var teamInfo = _getTeamInfo(socketEvent.teamId);
      var teamName = teamInfo.teamName;
      var teamDomain = teamInfo.teamDomain;

      var options;

      if (!_.isUndefined(teamName)) {
        options = {
          tag: 'tag',
          body: _getBody(teamName),
          icon: 'assets/images/jandi-logo-200x200.png',
          callbackFn: _otherTeamNotificationCallbackFn,
          callbackParam: _.extend(socketEvent, {teamDomain: teamDomain})

        };

        (notification = _createInstance(options)) && notification.show();
      }
    }

    /**
     * 브라우져 노티피케이션을 클릭했을 때 호출된다.
     * @param {object} param - socket event
     * @private
     */
    function _otherTeamNotificationCallbackFn(param) {
      // 기본적으로 /app/# 까지 포함한 주소를 만든다.
      var url = configuration.base_protocol + param['teamDomain'] + configuration.base_url + '/app/#';

      var type = param.room.type.toLowerCase();
      var roomId = param.room.id;

      if (type === 'chat') {
        type = 'user';
        // chat 일 경우, 방 url이 roomId(혹은 entityId)로 되어있지 않고 user의 id로 되어있기에 그 값을 설정한다.
        roomId = param.marker.memberId;
      }

      // url 뒤에 가고 싶은 방의 타입과 주소를 설정한다.
      url += '/' + type + 's/' + roomId;

      var open_link = window.open('', '_blank');
      open_link.location.href = url;
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
