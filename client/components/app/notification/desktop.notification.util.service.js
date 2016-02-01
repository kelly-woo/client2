/**
 * @fileoverview notification util
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('DesktopNotificationUtil', DesktopNotificationUtil);

  /* @ngInject */
  function DesktopNotificationUtil(logger, jndPubSub, localStorageHelper, accountService, HybridAppHelper,
                                   configuration, NotificationAudio) {
    var that = this;
    var NOTIFICATION_PERMISSION = {
      granted: 'granted',
      denied: 'denied',
      default: 'default',
      callbacks: {
        granted: _onPermissionGranted,
        denied: _onPermissionDenied,
        default: _onPermissionDefault
      }
    };

    var NOTIFICATION_SHOW_CONTENT_FLAG_KEY = 'show_notification_content';
    var NOTIFICATION_LOCAL_STORAGE_KEY = 'local_notification_flag';
    var NOTIFICATION_NEVER_ASK_KEY = 'notification_never_ask_flag';

    var NOTIFICATION_STORAGE_KEY = 'setting_notification';
    var notificationData;

    // Notification support 여부
    var isNotificationSupported = 'Notification' in window;

    // 노티피케이션 permission 의 값
    var notificationPermission;

    // 노티피케이션 내용을 보여줄지 말지 알려주는 flag.  브라우져 내부에서만 가지고 있다.
    var isShowNotificationContent;

    // 노티피케이션을 킬지 말지 알려주는 flag. 브라우져 내부에서만 가지고 있다.
    var isNotificationOnLocally;

    // notification instance
    var notificationAudio;

    _init();

    that.getNotificationPermission = getNotificationPermission;
    that.isNotificationLocalFlagUp = isNotificationLocalFlagUp;

    that.getShowNotificationContentFlag = getShowNotificationContentFlag;

    that.isNotificationOn = isNotificationOn;

    that.isNotificationPermissionDenied = isNotificationPermissionDenied;
    that.isNotificationPermissionGranted = isNotificationPermissionGranted;

    that.setShowNotificationContent = setShowNotificationContent;

    that.turnOnDesktopNotification = turnOnDesktopNotification;
    that.toggleDesktopNotificationLocally = toggleDesktopNotificationLocally;

    that.canSendNotification = shouldSendNotification;

    that.setNeverAskFlag = setNeverAskFlag;
    that.isNeverAskFlagUp = isNeverAskFlagUp;

    that.validateNotificationParams = validateNotificationParams;

    that.isChatType = isChatType;

    that.getFileTitleFormat = getFileTitleFormat;
    that.getSenderContentFormat = getSenderContentFormat;
    that.getRoomFormat = getRoomFormat;

    that.getTeamInfo = getTeamInfo;
    that.getNotificationUrl = getNotificationUrl;

    that.getBodyWithoutMessage = getBodyWithoutMessage;

    that.log = log;

    that.getNotificationAudio = getNotificationAudio;

    that.getData = getData;
    that.setData = setData;

    /**
     * init
     */
    function _init() {
      if (HybridAppHelper.isHybridApp()) {
        // hybrid 앱 일 경우
        _initHybridSetting();
      } else {
        _initSetting();
      }
    }

    /**
     * 웹일 경우 첫 설정 펑션
     * @private
     */
    function _initSetting() {
      _setNotificationPermission();
      _loadLocalNotificationFlag();
      _loadShowNotificationContentFlag();
    }

    /**
     * hybrid 앱일 경우 우선 첫 설정을 'granted'로 한다.
     * @private
     */
    function _initHybridSetting() {
      var isNotificationOnLocallyFlag;
      var isShowNotificationContentFlag;

      _loadLocalNotificationFlag();
      _loadShowNotificationContentFlag();

      notificationPermission = 'granted';
      isShowNotificationContentFlag = isShowNotificationContent;
      isNotificationOnLocallyFlag = isNotificationOnLocally;

      _onPermissionGranted();
      /*
       _onPermissionGranted 에서 isShowNotificationContent, isNotificationOnLocally 값을 강제 true 로 설정하므로,
       해당 값을 localStorage 값으로 다시 설정 한다
       */
      _storeLocalNotificationFlag(isNotificationOnLocallyFlag);
      setShowNotificationContent(isShowNotificationContentFlag);
      _onNotificationSettingChanged();
    }




    /**
     * Notification content를 보여줄지 말지 결정하는 flag 를 local storage 에 저장한다.
     * @private
     */
    function _storeShowNotificationContentFlag() {
      localStorageHelper.set(NOTIFICATION_SHOW_CONTENT_FLAG_KEY, isShowNotificationContent);
    }

    /**
     * local storage 로 부터 불러온다.
     * 없으면 granted 인지 아닌지확인한다.
     * @private
     */
    function _loadShowNotificationContentFlag() {
      var localIsShowContentFlag = localStorageHelper.get(NOTIFICATION_SHOW_CONTENT_FLAG_KEY);

      if (localIsShowContentFlag === null) {
        localIsShowContentFlag = shouldSendNotification();
      } else {
        localIsShowContentFlag = _getBoolean(localStorageHelper.get(NOTIFICATION_SHOW_CONTENT_FLAG_KEY));
      }

      return isShowNotificationContent = localIsShowContentFlag;
    }

    /**
     * isNotificationOnLocally 을 local storage 에 저장한다.
     * @param {boolean} flag
     * @private
     */
    function _storeLocalNotificationFlag(flag) {
      isNotificationOnLocally = !!flag;
      localStorageHelper.set(NOTIFICATION_LOCAL_STORAGE_KEY, isNotificationOnLocally);
    }

    /**
     * local storage 로 부터 isNotificationOnLocally 를 가져온다.
     * @returns {*}
     * @private
     */
    function _loadLocalNotificationFlag() {
      var value = localStorageHelper.get(NOTIFICATION_LOCAL_STORAGE_KEY);
      return isNotificationOnLocally = value ? _getBoolean(value) : true;
    }











    /**
     * 현재 노티피케이션의 permission 상태를 리턴한다.
     * @returns {string} notificationPermission - Notification.permission 의 값
     */
    function getNotificationPermission() {
      return notificationPermission;
    }

    /**
     * 브라우져 내부에서 저장하고 있는 값을 리턴한다.
     * @returns {boolean} isNotificationOnLocally - true, if it's on
     */
    function isNotificationLocalFlagUp() {
      return isNotificationOnLocally;
    }

    /**
     * Notification content를 보여줄지 말지 결정하는 flag 를 리턴한다.
     * @returns {*}
     */
    function getShowNotificationContentFlag() {
      return isShowNotificationContent;
    }









    /**
     * Notification 이 켜져있는지 알 수 있는 함수이다.
     * @returns {*}
     */
    function isNotificationOn() {
      return isNotificationPermissionGranted();
    }

    /**
     * 노티피케이션이 블락되었는지 확인한다.
     * @returns {boolean}
     */
    function isNotificationPermissionDenied() {
      return notificationPermission === 'denied';
    }

    /**
     * Notification.permission 을 확인한다.
     * 'granted' 일 경우에만 유져가 web notification 을 허락했다고 판단한다.
     */
    function isNotificationPermissionGranted() {
      return notificationPermission === 'granted';
    }

    /**
     * 노티피케이션에서 메세지 내용을 보여줄지 말지 결정하는 flag 를 set 한다.
     * @param {boolean} isShowNotificationContentFlag - flag value
     */
    function setShowNotificationContent(isShowNotificationContentFlag) {
      isShowNotificationContent = isShowNotificationContentFlag;
      _storeShowNotificationContentFlag();
    }

    /**
     * 노티피케이션을 킬 수 있도록 사용자에게 permission 을 물어본다.
     */
    function turnOnDesktopNotification() {
      Notification.requestPermission(_onRequestNotificationPermission);
    }

    /**
     * isNotificationOnLocally 값은 설정한다.
     */
    function toggleDesktopNotificationLocally() {
      var newNotificationLocalValue = !isNotificationOnLocally;
      _setDesktopNotificationLocally(newNotificationLocalValue);
      _onNotificationSettingChanged();
    }

    /**
     * isNotificationOnLocally 의 값을 설정한다.
     * 혹시 몰라서 SETTER 를 따로 뺐지만 솔직히 쓸 일이 있을까 싶다.
     * @param {string} newNotificationLocalValue - value to be set
     * @private
     */
    function _setDesktopNotificationLocally(newNotificationLocalValue) {
      _storeLocalNotificationFlag(newNotificationLocalValue);
    }

    /**
     * 브라우저 팝업창에서 유저의 대답을 받아 처리하는 콜백 펑션.
     * 대답은 'default', 'denied', 그리고 'granted' 가 있을 수 있지만 브라우져마다 default 의 값이 조금 다를 수도 있다.
     * @param {string} permission - user 의 대답
     * @private
     */
    function _onRequestNotificationPermission(permission) {
      // TODO: 이럴경우에는 callbackFunction 선언을 먼저해야하나요? 아니면 notificationPermission 을 먼저 할당하나요?궁금궁금.
      notificationPermission = permission;
      var callbackFunction = NOTIFICATION_PERMISSION.callbacks[permission];

      if (!!callbackFunction) {
        callbackFunction(permission);
      } else {
        // 해당하는 콜백펑션이 없을 경우에는 default 로 처리한다.
        _onPermissionDefault();
      }

      _onNotificationSettingChanged();
    }

    /**
     * notification permission change trigger
     * @private
     */
    function _onNotificationSettingChanged() {
      jndPubSub.pub('onDesktopNotificationPermissionChanged', notificationPermission);
    }

    /**
     * 사용자가 Notification.permission 을 허락했을 때
     * @private
     */
    function _onPermissionGranted() {
      localStorageHelper.remove(NOTIFICATION_NEVER_ASK_KEY);
      setShowNotificationContent(true);
      _storeLocalNotificationFlag(true);
    }

    /**
     * 사용자가 Notification.permission 을 거부했을 때
     * @private
     */
    function _onPermissionDenied() {
      setShowNotificationContent(false);
      _storeLocalNotificationFlag(false);
    }

    /**
     * 사용자가 Notification.permission 에서 'x' 눌렀을 때
     * @private
     */
    function _onPermissionDefault() {
      setShowNotificationContent(false);
    }

    /**
     * 현재 브라우져의 노티피케이션이 허락되었는지 업데이트한다.
     * @private
     */
    function _setNotificationPermission() {
      if (isNotificationSupported) {
        notificationPermission = _getNotificationPermission();
      }
    }

    /**
     * Notification.permission 을 리턴한다.
     * @returns {string} notificationPermission - Notification.permission 의 값
     * @private
     */
    function _getNotificationPermission() {
      return Notification.permission;
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
     * local storage 에 never_ask 관련 flag 를 true 로 바꾼다.
     */
    function setNeverAskFlag() {
      localStorageHelper.set(NOTIFICATION_NEVER_ASK_KEY, true);
    }

    /**
     * never ask flag 가 true인지 아닌지 리턴한다.
     * @returns {boolean}
     */
    function isNeverAskFlagUp() {
      return _getBoolean(localStorageHelper.get(NOTIFICATION_NEVER_ASK_KEY));
    }

    /**
     * addNotification function 에서 필요한 validation 이다.
     * 정확한 내용은 나도 잘 모른다.
     * @param {object} data - data
     * @param {object} writerEntity - writer entity
     * @param {object} roomEntity - room entity
     * @returns {*}
     */
    function validateNotificationParams(data, writerEntity,  roomEntity) {
      return data && writerEntity && roomEntity && data.message && shouldSendNotification();
    }

    /**
     * 노티피케이션을 보낼 수 있는 설정인지 아닌지 확인한다.
     * "Notification.permission 이 'granted' 여야하고 동시에 isNotificationOnLocally 가 true 여야 한다."
     * @returns {*}
     */
    function shouldSendNotification() {
      return isNotificationPermissionGranted() && isNotificationOnLocally;
    }

    /**
     * socketEvent가 dm을 향한건지 토픽을 향한건지 확인한다.
     * @param {object} socketEvent - socket event paramter
     * @returns {boolean}
     */
    function isChatType(socketEvent) {
      return socketEvent.room.type === 'chat';
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

    /**
     * notification log
     */
    function log() {
      logger.desktopNotificationSettingLogger(isNotificationSupported, notificationPermission, isNotificationOnLocally, shouldSendNotification(), isShowNotificationContent);
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

    function getData() {
      if (notificationData == null) {
        // cache 되지 않음

        notificationData = localStorageHelper.get(NOTIFICATION_STORAGE_KEY);
        if (notificationData == null) {
          // local storage에 존재하지 않음

          notificationData = {
            // notification 사용여부, true | false
            on: _loadLocalNotificationFlag(),
            // notification을 사용하는 메시지 타입, all | dmNmention
            type: 'all',
            // notification에 content 노출 시킬지 여부, all | none | public_only
            showContent: _getOldSetShowContent() || 'all',
            // 일반 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundNormal: 'off',
            // 멘션 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundMention: 'off',
            // 1:1 메시지에 사용할 알림 값, asstes/sounds/{{$1}}.mp3
            soundDM: 'off'
          };
        }
      }

      return notificationData;
    }

    function _getOldSetShowContent() {
      var isShowContent = _loadShowNotificationContentFlag();

      if (isShowContent === true) {
        isShowContent = 'all'
      } else if (isShowContent === false) {
        isShowContent = 'none';
      }

      return isShowContent;
    }

    function setData(value) {
      notificationData = value;
      localStorageHelper.set(NOTIFICATION_STORAGE_KEY, value);
    }
  }
})();
