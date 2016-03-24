/**
 * @fileoverview notification util
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('DesktopNotificationUtil', DesktopNotificationUtil);

  /* @ngInject */
  function DesktopNotificationUtil($filter, logger, jndPubSub, localStorageHelper, accountService, HybridAppHelper,
                                   configuration, NotificationAudio, RoomTopicList) {
    var that = this;

    that.NAVER_ASK = {
      TRUE: true,
      FALSE: false
    };
    that.ON = {
      TRUE: 'true',
      FALSE: false
    };
    that.TYPE = {
      ALL: 'all',
      DM_AND_MENTION: 'dmNmention'
    };
    that.SHOW_CONTENT = {
      ALL: 'all',
      NONE: 'none',
      PUBLIC_ONLY: 'public_only'
    };
    that.SOUNDS = {
      OFF: 'off',
      AIR_POP: 'air_pop',
      CHIME_BELL_DING: 'chime_bell_ding',
      CHIMEY: 'chimey',
      MOUSE: 'mouse',
      NURSERY: 'nursery',
      ON_POINT: 'on_point',
      THINK_PING: 'think_ping',
      SUPER: 'super',
      ARISE: 'arise'
    };

    // Notification support 여부
    var isNotificationSupported = 'Notification' in window;

    var NOTIFICATION_SHOW_CONTENT_FLAG_KEY = 'show_notification_content';
    var NOTIFICATION_LOCAL_STORAGE_KEY = 'local_notification_flag';
    var NOTIFICATION_NEVER_ASK_KEY = 'notification_never_ask_flag';
    var NOTIFICATION_STORAGE_KEY = 'setting_notification';

    var notificationAudio;
    var notificationData;

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      that.getPermission = getPermission;
      that.requestPermission = requestPermission;
      that.isPermissionGranted = isPermissionGranted;
      that.isPermissionDenied = isPermissionDenied;

      that.isAllowSendNotification = isAllowSendNotification;
      that.isAllowShowContent = isAllowShowContent;
      that.isAllowDMnMentionOnly = isAllowDMnMentionOnly;

      that.getNotificationAudio = getNotificationAudio;
      that.toggleSendNotification = toggleSendNotification;

      that.getData = getData;
      that.setData = setData;

      that.getFileTitleFormat = getFileTitleFormat;
      that.getSenderContentFormat = getSenderContentFormat;
      that.getRoomFormat = getRoomFormat;
      that.getTeamInfo = getTeamInfo;
      that.getNotificationUrl = getNotificationUrl;
      that.getBodyWithoutMessage = getBodyWithoutMessage;

      that.validateNotificationParams = validateNotificationParams;
      that.isChatType = isChatType;
      that.log = log;

      getData();
    }

    /**
     * browser에 선언된 notification permission 전달
     * @returns {boolean|number}
     */
    function getPermission() {
      // 현재 window, mac app 에서 사용하는 notification은 app마다 다른 notification object를 사용하고 항상 허용된 상태로
      // 보기때문에 window, mac app일 경우 'granted'를 전달한다.
      return HybridAppHelper.isHybridApp() ? 'granted' : isNotificationSupported && Notification.permission;
    }

    /**
     * browser에 notification permission 변경 요청
     */
    function requestPermission() {
      Notification.requestPermission(function (permission) {
        if (permission === 'granted') {
          setData('on', that.ON.TRUE);
        } else {
          setData('on', that.ON.FALSE);
        }
        jndPubSub.pub('onPermissionChanged');
      });
    }

    /**
     * notification permission이 허용되었는지 여부
     * @returns {boolean}
     */
    function isPermissionGranted() {
      return getPermission() === 'granted';
    }

    /**
     * notification permission이 차단되었는지 여부
     * @returns {boolean}
     */
    function isPermissionDenied() {
      return getPermission() === 'denied';
    }

    /**
     * addNotification function 에서 필요한 validation 이다.
     * notification을 생성하기전 값 validation
     * @param {object} data - data
     * @param {object} writerEntity - writer entity
     * @param {object} roomEntity - room entity
     * @returns {*}
     */
    function validateNotificationParams(data, writerEntity,  roomEntity) {
      return data && writerEntity && roomEntity && data.message && isAllowSendNotification();
    }

    /**
     * get notification audio
     * @param {array} sounds
     * @returns {*}
     */
    function getNotificationAudio(sounds, options) {
      if (notificationAudio == null) {
        notificationAudio = NotificationAudio.getInstance(sounds, options);
      }

      return notificationAudio;
    }

    /**
     * notification 관련 data 전달
     * @param name
     * @returns {*}
     */
    function getData(name) {
      if (notificationData == null) {
        // cache 되지 않음

        notificationData = localStorageHelper.get(NOTIFICATION_STORAGE_KEY);
        if (notificationData == null) {
          // local storage에 존재하지 않음

          notificationData = {
            // 'notification 사용해 주세요' 더 이상 묻지 않기, true | [false]
            naverAsk: _getOldSetNaverAsk() || that.NAVER_ASK.FALSE,
            // notification 사용여부, true | [false]
            on: _getOldSetLocalNotificationFlag() || that.ON.FALSE,
            // notification을 사용하는 메시지 타입, [all] | dmNmention
            type: that.TYPE.ALL,
            // notification에 content 노출 시킬지 여부, [all] | none | public_only
            showContent: _getOldSetShowContent() || that.SHOW_CONTENT.ALL,
            // 일반 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundNormal: that.SOUNDS.OFF,
            // 멘션 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundMention: that.SOUNDS.OFF,
            // 1:1 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundDM: that.SOUNDS.OFF
          };

          if (HybridAppHelper.isHybridApp()) {
            // window, mac app일 경우 초기값을 web app과 다르게 설정한다.

            notificationData.on = that.ON.TRUE;
            notificationData.showContent = that.SHOW_CONTENT.ALL;
          }
        }
      }

      return _.isString(name) ? notificationData[name] : notificationData;
    }

    /**
     * notification 관련 data 설정
     * @param {string|object} name
     * @param {string} value
     */
    function setData(name, value) {
      if (_.isObject(name)) {
        notificationData = name;
        localStorageHelper.set(NOTIFICATION_STORAGE_KEY, notificationData);
      } else {
        notificationData[name] = value;
      }
    }

    /**
     * notification 사용을 허용하는지 여부
     * @returns {boolean|*}
     */
    function isAllowSendNotification() {
      // browser에 설정된 권한과 jandi app에서 설정여부 둘다 확인함
      return isPermissionGranted() && getData('on');
    }

    /**
     * notification의 내용 보여주는것 허용하는지 여부
     * @param {number} entityId
     * @returns {*}
     */
    function isAllowShowContent(entityId) {
      var data = getData();
      var result;

      if (data.showContent === that.SHOW_CONTENT.ALL ||
        (data.showContent === that.SHOW_CONTENT.PUBLIC_ONLY && RoomTopicList.isPublicTopic(entityId))) {
        result = true;
      } else {
        result = false;
      }

      return result;
    }

    /**
     * DM 과 mention만 notification 허용하는지 여부
     */
    function isAllowDMnMentionOnly() {
      return getData('type') === that.TYPE.DM_AND_MENTION;
    }

    /**
     * 불리언 타입을 리턴한다.
     * @param {string} value - true 인지 아닌지 확인
     * @returns {boolean}
     * @private
     */
    function _getBoolean(value) {
      if (typeof value === 'string') {
        return value === 'true';
      }
      return false;
    }

    /**
     * socketEvent가 dm을 향한건지 토픽을 향한건지 확인한다.
     * @param {object} socketEvent - socket event paramter
     * @returns {boolean}
     */
    function isChatType(socketEvent) {
      return socketEvent.room.type === 'chat' || socketEvent.room.type === 'bot';
    }

    /**
     * 이전에 사용하던 content 노출 여부 값 전달
     * @returns {*}
     * @private
     */
    function _getOldSetShowContent() {
      var isShowContent = _loadShowNotificationContentFlag();

      if (isShowContent === true) {
        isShowContent = that.SHOW_CONTENT.ALL;
      } else if (isShowContent === false) {
        isShowContent = that.SHOW_CONTENT.NONE;
      }

      return isShowContent;
    }

    /**
     * content 전달여부 값 전달
     * 없으면 granted 인지 아닌지확인한다.
     * @private
     */
    function _loadShowNotificationContentFlag() {
      var value = localStorageHelper.get(NOTIFICATION_SHOW_CONTENT_FLAG_KEY);
      return value && _getBoolean(value);
    }

    /**
     * 이전에 사용하던 더 이상 묻지 않기 값 전달
     * @returns {*|boolean}
     * @private
     */
    function _getOldSetNaverAsk() {
      var value = localStorageHelper.get(NOTIFICATION_NEVER_ASK_KEY);
      return value && _getBoolean(value);
    }

    /**
     * 이전에 사용하던 notification 사용여부(browser에서 허용한 것과 무관함) 전달
     * @returns {*}
     * @private
     */
    function _getOldSetLocalNotificationFlag() {
      var value = localStorageHelper.get(NOTIFICATION_LOCAL_STORAGE_KEY);
      return value && _getBoolean(value);
    }

    /**
     * notification 사용여부(browser에서 허용한 것과 무관함) 토글
     */
    function toggleSendNotification() {
      setData('on', !getData('on'));
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

    /**
     * 유져인지 아닌지 확인 후, 메세지를 포함하지 않고 바디를 맞는 포맷으로 만든다.
     * @param {boolean} isUser - 유져인지 아닌지 분별
     * @param {object} writerEntity - 메세지를 보낸이
     * @param {object} roomEntity - 메세지가 전공된 곳
     * @returns {string} body - 바디에 들어갈 내용}
     * @private
     */
    function getBodyWithoutMessage(isUser, writerEntity, roomEntity) {
      if (isUser) {
        return _getBodyForChat(roomEntity);
      }
      return _getBodyForTopic(writerEntity, roomEntity);
    }

    /**
     * 토픽에서 새로운 메세지가 왔을때, 실제 내용은 보여주지 않고 노티피케이션에 들어갈 메세지를 만든다.
     * @param {object} fromEntity - 메세지를 보낸 사람
     * @param {object} toEntity - 메세지가 전송된 토픽
     * @returns {string}
     * @private
     */
    function _getBodyForTopic(fromEntity, toEntity) {
      var currentLanguage = accountService.getAccountLanguage();

      var bodyMessage;

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
            + '[' + toEntity.name + ']'
            + $filter('translate')('@web-notification-body-topic-mid')
            + fromEntity.name;
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

    /**
     * 1:1 로 새로운 메세지가 들어왔을때 내용을 보여주지 않고 노티피케이션에 들어갈 메세지를 만든다.
     * @param {object} fromEntity - 메세지를 보낸 사람
     * @returns {string}
     * @private
     */
    function _getBodyForChat(fromEntity) {
      return $filter('translate')('@web-notification-body-messages-pre')
        + fromEntity.name
        + $filter('translate')('@web-notification-body-messages-post');
    }


    // 노티피케이션 permission 의 값
    var notificationPermission;

    // 노티피케이션을 킬지 말지 알려주는 flag. 브라우져 내부에서만 가지고 있다.
    var isNotificationOnLocally;

    //노티피케이션을 보낼 수 있는 설정인지 아닌지 확인한다.
    // shouldSendNotification Notification permission이 'granted' 이고 isNotificationOnLocally이 true인 경우

    // 노티피케이션 내용을 보여줄지 말지 알려주는 flag.  브라우져 내부에서만 가지고 있다.
    var isShowNotificationContent;

    /**
     * notification log
     */
    function log() {
      logger.desktopNotificationSettingLogger(isNotificationSupported, notificationPermission, isNotificationOnLocally, isAllowSendNotification(), isShowNotificationContent);
    }
  }
})();
