(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGoogleCalendarCtrl', JndConnectGoogleCalendarCtrl);

  /* @ngInject */
  function JndConnectGoogleCalendarCtrl($scope, $attrs, $q, JndConnectGoogleCalendar, EntityMapManager,
                                        JndUtil, JndConnectUnionApi) {
    $scope.selectedRoom = '';

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      // connect를 추가하는게 아닌 setting mode
      $scope.isSettingMode = $scope.current.connectId != null;
      //$scope.isSettingMode = true;
      $scope.connectId = 49;

      $scope.notificationMinuteList = JndConnectGoogleCalendar.getMinuteList();
      $scope.allDayNotificationDateList = JndConnectGoogleCalendar.getDateList();
      $scope.allDaynotificationHourList = JndConnectGoogleCalendar.getHourList();

      $scope.dailyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();
      $scope.weeklyScheduleSummaryDayList = JndConnectGoogleCalendar.getDayList();
      $scope.weeklyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();

      _attachEvents();

      _createModel();
      _setContent();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$on('unionHeader:accountInfoChange', _onAccountInfoChange);
      $scope.$on('unionFooter:save', _onSave);
    }

    /**
     * set content
     * @private
     */
    function _setContent() {
      if ($scope.isSettingMode) {
        _requestConnectInfo($scope.connectId);
        _requestCalendarInfo();
      } else {
        $scope.isInitialized = true;
        _requestCalendarInfo();
      }
    }

    /**
     * account info change handler
     * @param {object} angularEvent
     * @param {object} accountInfo
     * @private
     */
    function _onAccountInfoChange(angularEvent, accountInfo) {
      _setCalendarList(accountInfo);
    }

    /**
     * save event handler
     * @private
     */
    function _onSave() {
      //var data = $scope.data;
      //
      //if (!(data.thumbnailUrl instanceof Blob)) {
      //  delete data.thumbnailUrl;
      //}
      var requestData = _createRequestData($scope.data);

      if ($scope.isSettingMode) {
        JndConnectUnionApi.update('googleCalendar', requestData);
      } else {
        JndConnectUnionApi.create('googleCalendar', requestData);
      }
    }

    /**
     * create requestData
     * @param {object} data
     * @returns {{}}
     * @private
     */
    function _createRequestData(data) {
      var requestData = {};
      var calendarData;

      if ($scope.isSettingMode) {
        requestData.connectId = $scope.current.connectId;
      }

      if (data) {
        requestData.calendarId = data.calendarId;

        calendarData = $scope.calendarMap[data.calendarId];
        requestData.googleId = calendarData.googleId;
        requestData.calendarSummary = calendarData.summary;

        requestData.roomId = data.roomId;
        requestData.botName = data.footer.botName || 'GoogleCalendar';
        requestData.botThumbnailFile = data.footer.botThumbnailFile;
        requestData.lang = data.footer.lang;

        requestData.hasNotificationBefore = !!data.hasNotificationBefore;
        requestData.notificationBefore = data.notificationBefore;

        requestData.hasAllDayNotification = !!data.hasAllDayNotification;
        requestData.allDayNotificationBeforeDates = data.allDayNotificationBeforeDates;
        requestData.allDayNotificationHour = data.allDayNotificationHour;

        requestData.hasDailyScheduleSummary = !!data.hasDailyScheduleSummary;
        requestData.dailyScheduleSummary = data.dailyScheduleSummary;

        requestData.hasWeeklyScheduleSummary = !!data.hasWeeklyScheduleSummary;
        requestData.weeklyScheduleSummaryHour = data.weeklyScheduleSummaryHour;
        requestData.weeklyScheduleSummaryDayOfWeek = data.weeklyScheduleSummaryDayOfWeek;

        requestData.newEventNotification = !!data.newEventNotification;
        requestData.updatedEventNotification = !!data.updatedEventNotification;
        requestData.cancelledEventNotification = !!data.cancelledEventNotification;
      }

      return requestData;
    }

    /**
     * create model
     * @see http://wiki.tosslab.com/pages/viewpage.action?pageId=7241997
     * @private
     */
    function _createModel() {
      if ($scope.isSettingMode) {
        $scope.data = {
          footer: {},
          header: {}
        };
      } else {
        $scope.data = {
          hasNotificationBefore: true,
          notificationBefore: '15m',
          hasDailyScheduleSummary: true,
          dailyScheduleSummary: 9,
          newEventNotification: true,
          footer: {},
          header: {}
        };
      }

      _.extend($scope.data.header, {
        current: $scope.current,
        accountId: null,
        accounts: null,
        memberId: null,
        createdAt: null,
        isActive: false
      });
    }

    /**
     * request connect info
     * @returns {*}
     * @private
     */
    function _requestConnectInfo() {
      JndConnectGoogleCalendar.getConnectInfo($scope.current.connectId)
        .success(function(connectInfo) {
          var data = $scope.data;
          //console.log('set connect info ::: ', data);

          _.extend(data, connectInfo);

          $scope.member = EntityMapManager.get('user', data.memberId);

          $scope.data.header.memberId = data.memberId;
          $scope.data.header.createdAt = data.createdAt;
          $scope.data.header.isActive = data.status === 'enabled';
          $scope.data.header.accountId = data.googleId;

          $scope.footer = {
            lang: data.lang,
            botThumbnailFile: _.isString(data.botThumbnailUrl) && data.botThumbnailUrl,
            botName: data.botName
          };
        })
        .finally(function() {
          $scope.isInitialized = true;
        });
    }

    /**
     * request calendar list
     * @returns {*}
     * @private
     */
    function _requestCalendarInfo() {
      _initCalendarList();

      JndConnectGoogleCalendar.getCalendarList()
        .success(function(calendarInfo) {
          _setCalendarList(calendarInfo);
          if (!$scope.isSettingMode) {
            $scope.isCalendarListLoaded = true;
          }
        });
    }

    /**
     * request 중 초기 calendar list 값을 설정함
     * @private
     */
    function _initCalendarList() {
      $scope.isCalendarListLoaded = false;
      $scope.data.calendarList = [
        {text: '@불러오는 중', value: ''}
      ];
    }

    /**
     * set calendar list
     * @param calendarInfo
     * @private
     */
    function _setCalendarList(calendarInfo) {
      var data = $scope.data;
      var list = [];
      var accountList = [];

      //console.log('set account list ::: ', calendarInfo);

      $scope.calendarMap = {};
      _.each(calendarInfo, function(googleAccount) {
        var calendarList = [];

        accountList.push({
          text: googleAccount.googleId,
          value: googleAccount.googleId
        });

        list.push({
          name: googleAccount.googleId,
          list: calendarList
        });

        _.each(googleAccount.list, function(calendar) {
          $scope.calendarMap[calendar.id] = {
            googleId: googleAccount.googleId,
            summary: calendar.summary
          };

          calendarList.push({
            text: calendar.summary,
            value: calendar.id
          });
        });
      });

      JndUtil.safeApply($scope, function() {
        data.calendarList = list;
        $scope.data.header.accounts = accountList;
      });
    }
  }
})();
