/**
 * @fileoverview date를 format에 맞게 리턴하는 서비스
 */
(function() {

  'use strict';

  angular
    .module('jandiApp')
    .service('DateFormatter', DateFormatter);

  /* @ngInject */
  function DateFormatter($filter, language) {
    // 영어를 위한 suffixes
    var _suffixes = ["th", "st", "nd", "rd"];
    var _dateFormatters = {
      ko: _getKoreanFormat,
      ja: _getJapaneseFormat,
      en_US: _getEnglishFormat,
      zh_TW: _getChineseFormat,
      zh_CN: _getChineseFormat
    };

    this.getOrdinalDate = getOrdinalDate;
    this.getFormattedDate = getFormattedDate;

    /**
     * timestamp를 받아 Tuesday, August 5th, 2015 이런 형태로 변환하여 리턴한다.
     * @param {number} input - unix timestamp
     * @param {string} format - 결과물이 보여질 포맷
     * @returns {*}
     */
    function getOrdinalDate(input, format) {
      if (isNaN(input)) return false;
      var dtfilter = $filter('date')(input, format);
      var day = parseInt($filter('date')(input, 'dd'));
      var relevantDigits = (day < 30) ? day % 20 : day % 30;
      var suffix = (relevantDigits <= 3) ? _suffixes[relevantDigits] : _suffixes[0];
      return dtfilter.replace('oo', suffix);
    }

    /**
     * 센터에 뿌려줄 날짜 경계선을 각각의 언어에 맞는 포맷으로 맞춰서 리턴한다.
     * @param {number} input - unit timestamp와 동일함
     * @returns {*}
     */
    function getFormattedDate(input) {
      var currentLanguage = language.getCurrentLanguage().language;
      var date = _getHumanReadableDate(input);

      if (currentLanguage === 'en_US') {
        date = input;
      }

      return _dateFormatters[currentLanguage](date);
    }

    /**
     *  한글 format에 맞는 date를 리턴한다.
     *  ex) 2015년 mm월_dd일_월요일
     * @param {object} date - _getHumanReadableDate()의 결과값
     * @returns {*}
     * @private
     */
    function _getKoreanFormat(date) {
      return date.year + ' ' + date.month + ' ' + date.date + ' ' + _getDayInLanguage(date.day);
    }

    /**
     *  일어 format에 맞는 date를 리턴한다.
     *  ex)  yyyy年mm月dd日_月曜日
     * @param {object} date - _getHumanReadableDate()의 결과값
     * @returns {*}
     * @private
     */
    function _getJapaneseFormat(date) {
      return date.year + date.month + date.date + _getDayInLanguage(date.day);
    }

    /**
     *  중문 format에 맞는 date를 리턴한다.
     *  ex) yyyy年_mm月_dd日
     * @param {object} date - _getHumanReadableDate()의 결과값
     * @returns {*}
     * @private
     */
    function _getChineseFormat(date) {
      return date.year + ' ' + date.month + ' ' + date.date;
    }

    /**
     * 영어 format에 맞는 date를 리턴한다.
     *  ex) Tuesday, September 8th, 2015
     * @param {number} time - server에서 msg에 실어주는 unix timestamp과 똑같음
     * @returns {*}
     * @private
     */
    function _getEnglishFormat(time) {
      return getOrdinalDate(time, "EEEE, MMMM doo, yyyy");
    }

    /**
     * unix timestamp형식을 '년', '월', '일' 이 추가된 형식으로 사람이 읽을 수 있는 형식으로 변환해서 리턴한다.
     * @param {number} time - server에서 msg에 실어주는 unix timestamp과 똑같음
     * @returns {{object}}
     * @private
     * @example
     *  {
     *    year: 2015년
     *    month: 12월
     *    date: 12일
     *    day: 화요일
     *  }
     */
    function _getHumanReadableDate(time) {
      var readableDate = {};

      readableDate.year = $filter('date')(time, 'yyyy') + $filter('translate')('@suffix-year');
      readableDate.month = $filter('date')(time, 'M') + $filter('translate')('@suffix-month');
      readableDate.date = $filter('date')(time, 'd')  + $filter('translate')('@suffix-day');
      readableDate.day = $filter('date')(time, 'EEEE');

      return readableDate;
    }

    /**
     * day을 **요일 포맷을 바꿔준다.
     *   ex) Tuesday -> 화요일
     * @param {string} day - day returned from angular date filter using 'EEEE' as format
     * @returns {*}
     * @private
     */
    function _getDayInLanguage(day) {
      return $filter('translate')('@' + day.toLowerCase());
    }
  }
})();
