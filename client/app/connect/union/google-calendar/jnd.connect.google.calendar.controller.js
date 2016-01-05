(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGoogleCalendarCtrl', JndConnectGoogleCalendarCtrl);

  /* @ngInject */
  function JndConnectGoogleCalendarCtrl($scope, $filter, JndConnectGoogleCalendar, EntityMapManager, JndUtil,
                                        JndConnectUnion, accountService) {
    $scope.selectedRoom = '';

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      // connect를 추가하는게 아닌 setting mode
      $scope.isSettingMode = $scope.current.connectId != null;

      $scope.notificationMinuteList = JndConnectGoogleCalendar.getMinuteList();
      $scope.allDayNotificationDateList = JndConnectGoogleCalendar.getDateList();
      $scope.allDaynotificationHourList = JndConnectGoogleCalendar.getHourList();

      $scope.dailyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();
      $scope.weeklyScheduleSummaryDayList = JndConnectGoogleCalendar.getDayList();
      $scope.weeklyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();

      _setTimezone();

      _createModel();
      _setContent();

      _attachEvents();
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
        _requestConnectInfo();
      } else {
        $scope.isInitialized = true;
      }
      _requestCalendarInfo();
    }

    /**
     * account info change handler
     * @private
     */
    function _onAccountInfoChange() {
      _requestCalendarInfo();
    }

    /**
     * save event handler
     * @private
     */
    function _onSave() {
      var requestData = _createRequestData($scope.data);
      JndConnectUnion.save({
        current: $scope.current,
        data: requestData
      });
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

        _.extend(requestData, data.footer);
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
          header: JndConnectUnion.getDefaultHeader($scope.current),
          footer: JndConnectUnion.getDefaultFooter($scope.current)
        };
      } else {
        $scope.data = {
          hasNotificationBefore: true,
          notificationBefore: '15m',
          hasDailyScheduleSummary: true,
          dailyScheduleSummary: 9,
          newEventNotification: true,
          header: JndConnectUnion.getDefaultHeader($scope.current),
          footer: JndConnectUnion.getDefaultFooter($scope.current)
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
      JndConnectUnion.read({
        current: $scope.current,
        header: $scope.data.header,
        footer: $scope.data.footer
      })
      .success(function(connectInfo) {
        var data = $scope.data;

        _.extend(data, connectInfo);

        $scope.member = EntityMapManager.get('user', data.memberId);
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
          $scope.isCalendarListLoaded = true;
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

      $scope.calendarMap = {};
      _.each(calendarInfo, function(googleAccount) {
        var calendarList = [];
        var googleId = googleAccount.authenticationName;

        list.push({
          groupName: googleId,
          groupList: calendarList
        });

        _.each(googleAccount.list, function(calendar) {
          $scope.calendarMap[calendar.id] = {
            googleId: googleId,
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
        JndConnectUnion.setHeaderAccountData($scope.data.header, calendarInfo);
      });
    }

    /**
     * timezone 설정
     * @private
     */
    function _setTimezone() {
      var account = accountService.getAccount();

      if (account) {
        $scope.timezone = '(' + account.timezone + ')';
        $scope.timezoneDescription = $filter('translate')('@jnd-connect-82').replace('{{timezone}}', $scope.timezone);
      }
    }
  }
})();
