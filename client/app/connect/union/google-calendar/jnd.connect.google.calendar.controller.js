(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGoogleCalendarCtrl', JndConnectGoogleCalendarCtrl);

  /* @ngInject */
  function JndConnectGoogleCalendarCtrl($scope, $attrs, $q, $timeout, JndConnectGoogleCalendar, EntityMapManager) {
    // connect id 필수
    var connectId = $attrs.connectId || 49;

    // connect를 추가하는게 아닌 setting mode
    var isSettingMode = true;

    $scope.selectedRoom = '';

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $scope.notificationMinuteList = JndConnectGoogleCalendar.getMinuteList();
      $scope.allDayNotificationDateList = JndConnectGoogleCalendar.getDateList();
      $scope.allDaynotificationHourList = JndConnectGoogleCalendar.getHourList();

      $scope.dailyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();
      $scope.weeklyScheduleSummaryDayList = JndConnectGoogleCalendar.getDayList();
      $scope.weeklyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();

      $scope.onSettingClick = function() {
        console.log('weeklyScheduleSummaryHour ::: ', $scope.data.weeklyScheduleSummaryHour);
      }

      _createModels();

      if (isSettingMode) {
        _setGoogleCalendarData([
          {
            request: _requestConnectInfo(connectId),
            success: _setConnectInfo
          },
          {
            request: _requestAccountList(),
            success: _setAccountList
          }
        ]);
      } else {
        $scope.isInitialized = true;
      }
    }

    function _createModels() {
      $scope.data = {};
    }

    function _setGoogleCalendarData(requests) {
      var deferred = $q.all(_.pluck(requests, 'request'));

      deferred.then(
        function(results) {
          _.each(results, function(result, index) {
            var success;

            if (result && result.data) {
              if (success = requests[index].success) {
                success(result.data);
              }
            }
          });

          $scope.isInitialized = true;
        },
        function() {
          console.log('do 에러 처리');
        }
      );
    }

    function _requestConnectInfo(connectId) {
      return JndConnectGoogleCalendar.getConnectInfo(connectId);
    }

    function _requestAccountList() {
      return JndConnectGoogleCalendar.getAccountList();
    }

    function _setConnectInfo(data) {
      console.log('set connect info ::: ', data);

      $scope.member = EntityMapManager.get('user', data.memberId);
      $scope.room = EntityMapManager.get('total', data.roomId);

      $scope.data = {
        botName: data.botName,
        calendarId: data.calendarId,
        calendarSummary: data.calendarSummary,
        lang: data.lang,
        status: data.status,
        thumbnailUrl: data.thumbnailUrl,
        timezone: data.timezone,

        hasDailyScheduleSummary: data.hasDailyScheduleSummary,
        dailyScheduleSummary: data.dailyScheduleSummary,

        hasAllDayNotification: data.hasAllDayNotification,
        allDayNotificationBeforeDates: data.allDayNotificationBeforeDates,
        allDayNotificationHour: data.allDayNotificationHour,

        hasNotificationBefore: data.hasNotificationBefore,
        notificationBefore: data.notificationBefore,

        hasWeeklyScheduleSummary: data.hasWeeklyScheduleSummary,
        weeklyScheduleSummaryDayOfWeek: data.weeklyScheduleSummaryDayOfWeek,
        weeklyScheduleSummaryHour: data.weeklyScheduleSummaryHour
      };
    }

    function _setAccountList(data) {
      console.log('set account list ::: ', data);
    }
  }
})();
