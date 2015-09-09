/**
 * @fileoverview browser notification 을 도와주는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('DesktopNotificationUtil', DesktopNotificationUtil);

  /* @ngInject */
  function DesktopNotificationUtil(configuration, accountService) {
    this.isChatType = isChatType;

    this.getRoomTypeForRoute = getRoomTypeForRoute;
    this.getRoomIdTogo = getRoomIdTogo;

    this.getFileTitleFormat = getFileTitleFormat;
    this.getSenderContentFormat = getSenderContentFormat;
    this.getRoomFormat = getRoomFormat;

    this.getTeamInfo = getTeamInfo;
    this.getNotificationUrl = getNotificationUrl;

    /**
     * socketEvent가 dm을 향한건지 토픽을 향한건지 확인한다.
     * @param {object} socketEvent - socket event paramter
     * @returns {boolean}
     */
    function isChatType(socketEvent) {
      return socketEvent.room.type === 'chat';
    }

    /**
     * route에 사용되어질 entityType을 리턴한다.
     * @param {object} socketEvent - socket event parameter
     * @returns {string}
     */
    function getRoomTypeForRoute(socketEvent) {
      if (isChatType(socketEvent)) {
        return 'users';
      }
      return socketEvent.room.type + 's';
    }

    /**
     * route에 사용되어질 entityId를 리턴한다.
     * @param {object} socketEvent - socket event paramter
     * @returns {*}
     */
    function getRoomIdTogo(socketEvent) {
      if (isChatType(socketEvent)) {
        return socketEvent.writer;
      }

      return socketEvent.room.id;
    }

    /**
     * browser notification에서 사용되어질 file title에 대한 format에 맞춰 리턴한다.
     * @param {string} title - file title
     * @returns {string}
     */
    function getFileTitleFormat(title) {
      return '<' + title + '>';
    }

    /**
     * browser notification에서 사용되어질 '이름: 내용' 포맷을 리턴한다.
     * @param {string} senderName - 작성자 이름
     * @param {string} content - 내용
     * @returns {string}
     */
    function getSenderContentFormat(senderName, content) {
      return senderName + ': ' + content;
    }

    /**
     * browser notification에서 사용되어질 토픽 이름에 대한 포맷을 리턴한다.
     * @param {object} title - 토픽 이름
     * @returns {string}
     */
    function getRoomFormat(title) {
      return '[' + title + ']';
    }

    /**
     * 현재 유저의 membership을 돌면서 teamId가 같은  team을 찾는다.
     * 그 팀의 이름과 도메인을 리턴한다.
     * @param {number} teamId - 찾으려는 팀의 아이디
     * @returns {{teamName: *, teamDomain: *}}
     * @private
     */
    function getTeamInfo(teamId) {
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
     * notification에 대한 url을 전달함
     * @param {object} data
     * @returns {string}
     */
    function getNotificationUrl(data) {
      var teamInfo;
      var url;
      var type;
      var roomId;

      if (_.isObject(data)) {
        teamInfo = getTeamInfo(data.teamId);

        // 기본적으로 /app/# 까지 포함한 주소를 만든다.
        url = configuration.base_protocol + teamInfo.teamDomain + configuration.base_url + '/app/#';

        if (isChatType(data)) {
          // chat 일 경우

          type = 'user';
          // 방 url이 roomId(혹은 entityId)로 되어있지 않고 user의 id로 되어있기에 그 값을 설정한다.
          roomId = data.writer;
        } else {
          // channel 일 경우

          type = data.room.type.toLowerCase();
          roomId = data.room.id;
        }

        // url 뒤에 가고 싶은 방의 타입과 주소를 설정한다.
        url += '/' + type + 's/' + roomId;

        if (!!data.messageType && data.messageType === 'file_comment') {
          // file comment socket event일 때
          url += '/files/' + data.file.id;
        }
      }

      return url;
    }
  }
})();
