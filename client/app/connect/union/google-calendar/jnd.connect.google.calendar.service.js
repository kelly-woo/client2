/**
 * @fileoverview file controller에서 사용가능하도록 file data convert
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectGoogleCalendar', JndConnectGoogleCalendar);

  /* @ngInject */
  function JndConnectGoogleCalendar($http, $filter, memberService, configuration) {
    var that = this;
    var teamId = memberService.getTeamId();

    var minuteList = [
      {text: $filter('translate')('@jnd-connect-43'), value: '0s'},
      {text: $filter('translate')('@jnd-connect-44'), value: '1m'},
      {text: $filter('translate')('@jnd-connect-45'), value: '5m'},
      {text: $filter('translate')('@jnd-connect-46'), value: '10m'},
      {text: $filter('translate')('@jnd-connect-47'), value: '15m'},
      {text: $filter('translate')('@jnd-connect-48'), value: '30m'},
      {text: $filter('translate')('@jnd-connect-59'), value: '1h'},
      {text: $filter('translate')('@jnd-connect-50'), value: '2h'},
      {text: $filter('translate')('@jnd-connect-51'), value: '4h'},
      {text: $filter('translate')('@jnd-connect-52'), value: '1d'}
    ];

    var hourList = [
      {text: $filter('translate')('@jnd-connect-58'), value: 24},
      {text: $filter('translate')('@jnd-connect-59'), value: 1},
      {text: $filter('translate')('@jnd-connect-60'), value: 2},
      {text: $filter('translate')('@jnd-connect-61'), value: 3},
      {text: $filter('translate')('@jnd-connect-62'), value: 4},
      {text: $filter('translate')('@jnd-connect-63'), value: 5},
      {text: $filter('translate')('@jnd-connect-64'), value: 6},
      {text: $filter('translate')('@jnd-connect-65'), value: 7},
      {text: $filter('translate')('@jnd-connect-66'), value: 8},
      {text: $filter('translate')('@jnd-connect-67'), value: 9},
      {text: $filter('translate')('@jnd-connect-68'), value: 10},
      {text: $filter('translate')('@jnd-connect-69'), value: 11},
      {text: $filter('translate')('@jnd-connect-70'), value: 12},
      {text: $filter('translate')('@jnd-connect-71'), value: 13},
      {text: $filter('translate')('@jnd-connect-72'), value: 14},
      {text: $filter('translate')('@jnd-connect-73'), value: 15},
      {text: $filter('translate')('@jnd-connect-74'), value: 16},
      {text: $filter('translate')('@jnd-connect-75'), value: 17},
      {text: $filter('translate')('@jnd-connect-76'), value: 18},
      {text: $filter('translate')('@jnd-connect-77'), value: 19},
      {text: $filter('translate')('@jnd-connect-78'), value: 20},
      {text: $filter('translate')('@jnd-connect-79'), value: 21},
      {text: $filter('translate')('@jnd-connect-80'), value: 22},
      {text: $filter('translate')('@jnd-connect-81'), value: 23}
    ];

    var dateList = [
      {text: $filter('translate')('@jnd-connect-55'), value: '0d'},
      {text: $filter('translate')('@jnd-connect-56'), value: '1d'},
      {text: $filter('translate')('@jnd-connect-57'), value: '2d'}
    ];

    var dayList = [
      {text: $filter('translate')('@jnd-connect-90'), value: 'MO'},
      {text: $filter('translate')('@jnd-connect-91'), value: 'TU'},
      {text: $filter('translate')('@jnd-connect-92'), value: 'WE'},
      {text: $filter('translate')('@jnd-connect-93'), value: 'TH'},
      {text: $filter('translate')('@jnd-connect-94'), value: 'FR'},
      {text: $filter('translate')('@jnd-connect-95'), value: 'SA'},
      {text: $filter('translate')('@jnd-connect-96'), value: 'SU'}
    ];

    _init();

    function _init() {
      that.getConnectInfo = getConnectInfo;
      that.getCalendarList = getCalendarList;
      that.getConnectCount = getConnectCount;

      // deprecated
      that.connect = connect;
      that.setting = setting;
      that.disconnect = disconnect;
      that.setStatus = setStatus;

      that.getMinuteList = getMinuteList;
      that.getHourList = getHourList;
      that.getDateList = getDateList;
      that.getDayList = getDayList;
    }


    /**
     * http://wiki.tosslab.com/pages/viewpage.action?pageId=7241997
     * connect 연동 정보를 반환함
     * @param {number} connectId
     * @returns {*}
     */
    function getConnectInfo(connectId) {
      return $http({
        method: 'GET',
        url: configuration.api_connect_address + 'teams/' + teamId + '/googleCalendar/' + connectId
      });
    }

    /**
     * http://wiki.tosslab.com/pages/viewpage.action?pageId=7242001
     * 등록된 캘린더 리스트를 반환함
     * @returns {*}
     */
    function getCalendarList() {
      return $http({
        method: 'GET',
        url: configuration.api_connect_address + 'authentication/googleCalendar/calendarList'
      });
    }

    function getConnectCount() {
      return $http({
        method: 'GET',
        url: configuration.api_connect_address + 'teams/' + teamId + '/googleCalendar/count'
      });
    }

    /**
     * http://wiki.tosslab.com/pages/viewpage.action?pageId=7241986
     * connect 연동함
     * @param {object} data
     * @returns {*}
     */
    function connect(data) {
      return $http({
        method: 'POST',
        url: configuration.api_connect_address + 'teams/' + teamId + '/googleCalendar',
        data: data
      });
    }

    /**
     * http://wiki.tosslab.com/pages/viewpage.action?pageId=7241992
     * connect 연동 설정을 변경함
     * @param {object} data
     * @returns {*}
     */
    function setting(data) {
      return $http({
        method: 'PUT',
        url: configuration.api_connect_address + 'teams/' + teamId + '/googleCalendar/setting',
        data: data
      });
    }

    /**
     * http://wiki.tosslab.com/pages/viewpage.action?pageId=7242005
     * connect 연동을 해제함
     * @param {number} connectId
     * @returns {*}
     */
    function disconnect(connectId) {
      return $http({
        method: 'DELETE',
        url: configuration.api_connect_address + 'teams/' + teamId + '/googleCalendar',
        data: {
          connectId: connectId
        }
      });
    }

    /**
     * http://wiki.tosslab.com/pages/viewpage.action?pageId=7241994
     * connect 연동을 enable/disable 함
     * @param {number} connectId
     * @param {string} status
     * @returns {*}
     */
    function setStatus(connectId, status) {
      return $http({
        method: 'PUT',
        url: configuration.api_connect_address + 'teams/' + teamId + '/googleCalendar/status',
        data: {
          connectId: connectId,
          status: status
        }
      });
    }

    /**
     * get minute list
     * @returns {Array.<*>}
     */
    function getMinuteList() {
      return minuteList.slice(0);
    }

    /**
     * get hour list
     * @returns {Array.<*>}
     */
    function getHourList() {
      return hourList.slice(0);
    }

    /**
     * get date list
     * @returns {Array.<*>}
     */
    function getDateList() {
      return dateList.slice(0);
    }

    /**
     * get day list
     * @returns {Array.<*>}
     */
    function getDayList() {
      return dayList.slice(0);
    }
  }
})();
