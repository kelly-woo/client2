(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGoogleCalendarCtrl', JndConnectGoogleCalendarCtrl);

  /* @ngInject */
  function JndConnectGoogleCalendarCtrl($scope, $filter, JndConnectGoogleCalendar, EntityMapManager, JndUtil,
                                        JndConnectUnion, accountService, Dialog, JndConnect) {
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
      $scope.$on('accountMenuDirective:removeAccountBefore', _onRemoveAccountBefore);
      $scope.$on('accountMenuDirective:removeAccountDone', _onRemoveAccountDone);
      $scope.$on('JndConnectUnion:showLoading', _onShowLoading);
      $scope.$on('JndConnectUnion:hideLoading', _onHideLoading);
    }

    /**
     * show loading 이벤트 핸들러
     * @private
     */
    function _onShowLoading() {
      $scope.isLoading = true;
    }

    /**
     * hide loading 이벤트 핸들러
     * @private
     */
    function _onHideLoading() {
      $scope.isLoading = false;
    }

    /**
     * header의 account 삭제 수행 전 event handler
     * @param {object} angularEvent
     * @param {object} data
     * @private
     */
    function _onRemoveAccountBefore(angularEvent, data) {
      if (data.hasSingleItem) {
        $scope.isLoading = true;
      }
    }

    /**
     * header의 account 삭제 수행완료 event handler
     * @param {object} angularEvent
     * @param {object} data
     * @private
     */
    function _onRemoveAccountDone(angularEvent, data) {
      if (data.hasSingleItem) {
        $scope.isLoading = false;
      }
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
      var data = $scope.data;
      var requestData = _createRequestData(data);
      var invalidMessage = _getInvalidMessage(requestData);

      if (invalidMessage) {
        Dialog.warning({
          body: invalidMessage
        });
      } else {
        $scope.isLoading = true;
        JndConnectUnion.save({
          current: $scope.current,
          data: requestData
        }).finally(function() {
          $scope.isLoading = false;
        });
      }
    }

    /**
     * 유효하지 않은 상태 메세지 전달
     * @param {object} requestData
     * @returns {*}
     * @private
     */
    function _getInvalidMessage(requestData) {
      var invalidMsg;

      if (_isInvalidCalendar(requestData)) {
        invalidMsg = $filter('translate')('@jnd-connect-216');
      } else if (_isInvalidNotification(requestData)) {
        invalidMsg = $filter('translate')('@jnd-connect-219');
      }

      return invalidMsg;
    }

    /**
     * calendar 값의 유효성 검사
     * @param {object} requestData
     * @returns {boolean}
     * @private
     */
    function _isInvalidCalendar(requestData) {
      return requestData.googleId == null ||
        requestData.calendarId == null ||
        requestData.calendarSummary == null;
    }

    /**
     * notification 값의 유효성 검사
     * @param {object} requestData
     * @returns {boolean}
     * @private
     */
    function _isInvalidNotification(requestData) {
      // 알림 설정, 일정요약 캘린더 업데이트 옵션중 단 하나도 체크된 상태가 아니라면 부정확한 data로 판별한다.
      return !(requestData.hasNotificationBefore ||
        requestData.hasAllDayNotification ||
        requestData.hasDailyScheduleSummary ||
        requestData.hasWeeklyScheduleSummary ||
        requestData.newEventNotification ||
        requestData.updatedEventNotification ||
        requestData.cancelledEventNotification);
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
        if (!$scope.isSettingMode) {
          calendarData = $scope.calendarMap[data.calendarMapKey];
          requestData.googleId = calendarData.googleId;
          requestData.calendarId = calendarData.calendarId;
          requestData.calendarSummary = calendarData.summary;
        } else {
          requestData.googleId = data.googleId;
          requestData.calendarId = data.calendarId;
          requestData.calendarSummary = data.calendarSummary;
        }

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
          _setCalendarInfo(calendarInfo);
          $scope.isCalendarListLoaded = true;
        })
        .error(function () {
          JndConnect.backToMain();
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
    function _setCalendarInfo(calendarInfo) {
      JndUtil.safeApply($scope, function() {
        if (!$scope.isSettingMode) {
          _setCalendarList(calendarInfo);
        }

        JndConnectUnion.setHeaderAccountData($scope.data.header, calendarInfo, $scope.data.googleId);
      });
    }

    function _setCalendarList(calendarInfo) {
      var data = $scope.data;
      var list = [];

      $scope.calendarMap = {};
      $scope.calendarMapKey = 0;

      _.each(calendarInfo, function(googleAccount) {
        var calendarList = [];
        var googleId = googleAccount.authenticationName;

        list.push({
          groupName: googleId,
          groupList: calendarList
        });

        _.each(googleAccount.list, function(calendar) {
          calendarList.push({
            text: calendar.summary,
            value: $scope.calendarMapKey
          });

          $scope.calendarMap[$scope.calendarMapKey++] = {
            googleId: googleId,
            calendarId: calendar.id,
            summary: calendar.summary
          };
        });
      });

      data.calendarList = list;
    }

    /**
     * timezone 설정
     * @private
     */
    function _setTimezone() {
      var account = accountService.getAccount();

      if (account) {
        $scope.utcTimeOffset = '(UTC' + account.utcTimeOffset + ')';
        $scope.utcTimeOffsetDescription = $filter('translate')('@jnd-connect-82').replace('{{timezone}}', $scope.utcTimeOffset);
      }
    }
  }
})();
