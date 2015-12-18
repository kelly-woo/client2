(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGoogleCalendarCtrl', JndConnectGoogleCalendarCtrl);

  /* @ngInject */
  function JndConnectGoogleCalendarCtrl($scope, $attrs, $q, JndConnectGoogleCalendar, EntityMapManager,
                                        JndUtil) {
    var googleAccountSpliter = '%^%';
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

      _attachEvents();

      _createModel();
      _setContent();
    }

    /**
     * attach events
     * @private
     */
    function _attachEvents() {
      $scope.$on('unionFooter:save', _onSave);
    }

    /**
     * set content
     * @private
     */
    function _setContent() {
      if ($scope.isSettingMode) {
        _requestConnectInfo(connectId);
        _requestCalendarInfo();
      } else {
        $scope.isInitialized = true;
        _requestCalendarInfo();
      }
    }

    /**
     * save event handler
     * @private
     */
    function _onSave() {
      var data = $scope.data;

      if (!(data.thumbnailUrl instanceof Blob)) {
        delete data.thumbnailUrl;
      }

      if ($scope.isSettingMode) {
        JndConnectGoogleCalendar.setting(data);
      } else {
        JndConnectGoogleCalendar.connect(data);
      }
    }

    /**
     * create model
     * @see http://wiki.tosslab.com/pages/viewpage.action?pageId=7241997
     * @private
     */
    function _createModel() {
      if ($scope.isSettingMode) {
        $scope.data = {
          footer: {}
        };
      } else {
        $scope.data = {
          hasNotificationBefore: true,
          notificationBefore: '15m',
          hasDailyScheduleSummary: true,
          dailyScheduleSummary: 9,
          newEventNotification: true,
          footer: {}
        };
      }
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

      setTimeout(function() {
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
        JndUtil.safeApply($scope, function() {
          $scope.isCalendarListLoaded = true;
          _setCalendarList(temp);
        });
      }, 2000);

      //JndConnectGoogleCalendar.getCalendarList()
      //  .success(function(calendarInfo) {
      //    $scope.isCalendarListLoaded = true;
      //    _setCalendarList(calendarInfo);
      //  });
    }

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

      console.log('set account list ::: ', calendarInfo);

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
          calendarList.push({
            text: calendar.summary,
            value: calendar.id + '' +
          });
        });
      });

      data.calendarList = list;
      $scope.accountList = accountList;
    }
  }
})();
