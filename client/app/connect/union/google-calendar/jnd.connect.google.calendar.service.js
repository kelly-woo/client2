/**
 * @fileoverview file controller에서 사용가능하도록 file data convert
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('JndConnectGoogleCalendar', JndConnectGoogleCalendar);

  /* @ngInject */
  function JndConnectGoogleCalendar($http, $filter, configuration) {
    var that = this;
    var translate = $filter('translate');

    var minuteList = [
      {text: translate('@jnd-connect-43'), value: '0s'},
      {text: translate('@jnd-connect-44'), value: '1m'},
      {text: translate('@jnd-connect-45'), value: '5m'},
      {text: translate('@jnd-connect-46'), value: '10m'},
      {text: translate('@jnd-connect-47'), value: '15m'},
      {text: translate('@jnd-connect-48'), value: '30m'},
      {text: translate('@jnd-connect-49'), value: '1h'},
      {text: translate('@jnd-connect-50'), value: '2h'},
      {text: translate('@jnd-connect-51'), value: '4h'},
      {text: translate('@jnd-connect-52'), value: '1d'}
    ];

    var hourList = [
      {text: translate('@jnd-connect-58'), value: 24},
      {text: translate('@jnd-connect-59'), value: 1},
      {text: translate('@jnd-connect-60'), value: 2},
      {text: translate('@jnd-connect-61'), value: 3},
      {text: translate('@jnd-connect-62'), value: 4},
      {text: translate('@jnd-connect-63'), value: 5},
      {text: translate('@jnd-connect-64'), value: 6},
      {text: translate('@jnd-connect-65'), value: 7},
      {text: translate('@jnd-connect-66'), value: 8},
      {text: translate('@jnd-connect-67'), value: 9},
      {text: translate('@jnd-connect-68'), value: 10},
      {text: translate('@jnd-connect-69'), value: 11},
      {text: translate('@jnd-connect-70'), value: 12},
      {text: translate('@jnd-connect-71'), value: 13},
      {text: translate('@jnd-connect-72'), value: 14},
      {text: translate('@jnd-connect-73'), value: 15},
      {text: translate('@jnd-connect-74'), value: 16},
      {text: translate('@jnd-connect-75'), value: 17},
      {text: translate('@jnd-connect-76'), value: 18},
      {text: translate('@jnd-connect-77'), value: 19},
      {text: translate('@jnd-connect-78'), value: 20},
      {text: translate('@jnd-connect-79'), value: 21},
      {text: translate('@jnd-connect-80'), value: 22},
      {text: translate('@jnd-connect-81'), value: 23}
    ];

    var dateList = [
      {text: translate('@jnd-connect-55'), value: '0d'},
      {text: translate('@jnd-connect-56'), value: '1d'},
      {text: translate('@jnd-connect-57'), value: '2d'}
    ];

    var dayList = [
      {text: translate('@jnd-connect-90'), value: 'MO'},
      {text: translate('@jnd-connect-91'), value: 'TU'},
      {text: translate('@jnd-connect-92'), value: 'WE'},
      {text: translate('@jnd-connect-93'), value: 'TH'},
      {text: translate('@jnd-connect-94'), value: 'FR'},
      {text: translate('@jnd-connect-95'), value: 'SA'},
      {text: translate('@jnd-connect-96'), value: 'SU'}
    ];

    _init();

    /**
     * init
     * @private
     */
    function _init() {
      that.getCalendarList = getCalendarList;

      that.getMinuteList = getMinuteList;
      that.getHourList = getHourList;
      that.getDateList = getDateList;
      that.getDayList = getDayList;
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
