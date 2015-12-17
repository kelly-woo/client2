(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGoogleCalendarCtrl', JndConnectGoogleCalendarCtrl);

  /* @ngInject */
  function JndConnectGoogleCalendarCtrl($scope, $attrs, $q, modalHelper, JndConnectGoogleCalendar, EntityMapManager) {
    // connect id 필수
    var connectId = $attrs.connectId || 49;


    $scope.selectedRoom = '';

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      // connect를 추가하는게 아닌 setting mode
      $scope.isSettingMode = true;

      $scope.notificationMinuteList = JndConnectGoogleCalendar.getMinuteList();
      $scope.allDayNotificationDateList = JndConnectGoogleCalendar.getDateList();
      $scope.allDaynotificationHourList = JndConnectGoogleCalendar.getHourList();

      $scope.dailyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();
      $scope.weeklyScheduleSummaryDayList = JndConnectGoogleCalendar.getDayList();
      $scope.weeklyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();

      $scope.onTopicCreateClick = onTopicCreateClick;
      $scope.onSettingClick = function() {
        console.log('weeklyScheduleSummaryHour ::: ', $scope.data.weeklyScheduleSummaryHour);
      };

      _createModels();
      if ($scope.isSettingMode) {
        _setGoogleCalendarData([
          {
            request: _requestConnectInfo(connectId),
            success: _setConnectInfo
          },
          //{
          //  request: _requestAccountList(),
          //  success: _setCalendarInfo
          //}
        ]);
        _setCalendarInfo();
      } else {
        _setGoogleCalendarData([
          //{
          //  request: _requestAccountList(),
          //  success: _setCalendarInfo
          //}
        ]);
        _setCalendarInfo();
        $scope.isInitialized = true;
      }
    }

    function onTopicCreateClick() {
      modalHelper.openTopicCreateModal();
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

    function _setConnectInfo(connectInfo) {
      var data = $scope.data;
      console.log('set connect info ::: ', data);

      $scope.member = EntityMapManager.get('user', data.memberId);

      // room id
      data.roomId = connectInfo.roomId;
      // member id
      data.memberId = connectInfo.memberId;
      // connect 명
      data.botName = connectInfo.botName;
      // calendar id
      data.calendarId = connectInfo.calendarId;
      // calendar summary
      data.calendarSummary = connectInfo.calendarSummary;
      // connect 언어
      data.lang = connectInfo.lang;
      // connect 상태
      data.status = connectInfo.status;
      // connect 이미지
      data.thumbnailUrl = connectInfo.thumbnailUrl;
      // 타임 존
      data.timezone = connectInfo.timezone;

      //새 일정 등록 시 메시지 노출 여부
      data.newEventNotification = connectInfo.newEventNotification;
      //일정 업데이트 시 메시지 노출 여부
      data.updatedEventNotification = connectInfo.updatedEventNotification;
      //일정 취소 및 삭제 시 메시지 노출 여부
      data.cancelledEventNotification = connectInfo.cancelledEventNotification;

      //일정 미리 알림을 설정했는지 여부
      data.hasNotificationBefore = connectInfo.hasNotificationBefore;
      //일정 미리 알림 시간 설정
      data.notificationBefore = connectInfo.notificationBefore;

      // 종일 일정 알림을 설정했는지 여부
      data.hasAllDayNotification = connectInfo.hasAllDayNotification;
      // 종일 일정의 알림 날짜
      data.allDayNotificationBeforeDates = connectInfo.allDayNotificationBeforeDates;
      // 종일 일정의 알림 시간
      data.allDayNotificationHour = connectInfo.allDayNotificationHour;

      // 당일 일정 요약을 설정했는지 여부
      data.hasDailyScheduleSummary = connectInfo.hasDailyScheduleSummary;
      // 당일 일정 요약 시간
      data.dailyScheduleSummary = connectInfo.dailyScheduleSummary;

      // 주간 일정 요약을 설정했는지 여부
      data.hasWeeklyScheduleSummary = connectInfo.hasWeeklyScheduleSummary;
      // 주간 일정 요약 요일
      data.weeklyScheduleSummaryDayOfWeek = connectInfo.weeklyScheduleSummaryDayOfWeek;
      // 주간 일정 요약 시간
      data.weeklyScheduleSummaryHour = connectInfo.weeklyScheduleSummaryHour;
    }

    function _setCalendarInfo(calendarInfo) {
      console.log('set account list ::: ', calendarInfo);
      var data = $scope.data;
      var list = [];
      var temp = [{
        "googleId":"alex.kim@tosslab.com",
        "list":[{
          "id":"alex.kim@tosslab.com",
          "summary":"alex.kim@tosslab.com",
          "timeZone":"Asia/Seoul"
        },{
          "id":"jandi.room3@gmail.com",
          "summary":"jandi.room3@gmail.com",
          "timeZone":"Asia/Seoul"
        },{
          "id":"jandi.room1@gmail.com",
          "summary":"jandi.room1@gmail.com",
          "timeZone":"Asia/Seoul"
        },{
          "id":"jandi.room2@gmail.com",
          "summary":"jandi.room2@gmail.com",
          "timeZone":"Asia/Seoul"
        },{
          "id":"#contacts@group.v.calendar.google.com",
          "summary":"생일",
          "timeZone":"Asia/Seoul"
        },{
          "id":"ko.south_korea#holiday@group.v.calendar.google.com",
          "summary":"대한민국의 휴일",
          "timeZone":"Asia/Seoul"
        }]
      }];

      _.each(temp, function(googleAccount) {
        var calendarList = [];

        list.push({
          name: googleAccount.googleId,
          list: calendarList
        });

        _.each(googleAccount.list, function(calendar) {
          calendarList.push({
            text: calendar.summary,
            value: calendar.id
          });
        });
      });

      data.calendarList = list;
    }
  }
})();
