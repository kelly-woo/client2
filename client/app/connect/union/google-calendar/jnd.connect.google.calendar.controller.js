(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('JndConnectGoogleCalendarCtrl', JndConnectGoogleCalendarCtrl);

  /* @ngInject */
  function JndConnectGoogleCalendarCtrl($scope, $attrs, $q, modalHelper, JndConnectGoogleCalendar, EntityMapManager,
                                        JndUtil) {
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
      $scope.isSettingMode = false;

      $scope.notificationMinuteList = JndConnectGoogleCalendar.getMinuteList();
      $scope.allDayNotificationDateList = JndConnectGoogleCalendar.getDateList();
      $scope.allDaynotificationHourList = JndConnectGoogleCalendar.getHourList();

      $scope.dailyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();
      $scope.weeklyScheduleSummaryDayList = JndConnectGoogleCalendar.getDayList();
      $scope.weeklyScheduleSummaryHourList = JndConnectGoogleCalendar.getHourList();

      $scope.onTopicCreateClick = onTopicCreateClick;

      _attachEvents();

      _createModel();
      _setContent();
    }

    function _attachEvents() {
      $scope.$on('unionFooter:save', _onSave);
    }

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
     * topic create click
     */
    function onTopicCreateClick() {
      modalHelper.openTopicCreateModal();
    }

    /**
     * create model
     * @see http://wiki.tosslab.com/pages/viewpage.action?pageId=7241997
     * @private
     */
    function _createModel() {
      $scope.data = {};
    }

    /**
     * request google calendar data
     * @param requests
     * @private
     */
    function _requestGoogleCalendarData(requests) {
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

    /**
     * request connect info
     * @param {number} connectId
     * @returns {*}
     * @private
     */
    function _requestConnectInfo(connectId) {
      JndConnectGoogleCalendar.getConnectInfo(connectId)
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
      $scope.isCalendarListLoaded = false;
      $scope.data.calendarList = [
        {text: '불러오는 중', value: ''}
      ];

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
      }, 3000);

      //JndConnectGoogleCalendar.getAccountList()
      //  .success(function(calendarInfo) {
      //    $scope.isCalendarListLoaded = true;
      //    _setCalendarList(calendarInfo);
      //  });
    }

    /**
     * set calendar list
     * @param calendarInfo
     * @private
     */
    function _setCalendarList(calendarInfo) {
      var data = $scope.data;
      var list = [];

      console.log('set account list ::: ', calendarInfo);

      _.each(calendarInfo, function(googleAccount) {
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
