/**
 * @fileoverview Analytics Service. Analytics 모듈 중 다른 모듈의 Controller에서 Internal Analtics System으로 
 *                 접근할 때 사용
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsHelper', AnalyticsHelper);

  /* @ngInject */
  function AnalyticsHelper(AnalyticsPersistence, AnalyticsData, AnalyticsLazyload, AnalyticsConstant, config) {

    var LANGUAGE_SET = AnalyticsConstant.LANGUAGE_SET;
    var EVENT = AnalyticsConstant.EVENT;
    var PROPERTY = AnalyticsConstant.PROPERTY;
    var LOCAL_STORAGE_KEY = AnalyticsConstant.LOCAL_STORAGE_KEY;
    var SESSION_STORAGE_KEY = AnalyticsConstant.SESSION_STORAGE_KEY;

    this.EVENT = EVENT;
    this.PROPERTY = PROPERTY;

    this.init = init;
    this.track = track;
    this.getDefaultProperty = getDefaultProperty;
    this.error = error;


    /**
     * Analytics 서비스 시작할때 실행. 모듈 세팅.
     */
    function init() {
      var isSessionSet = AnalyticsPersistence.init();
      if (isSessionSet) {
        track(EVENT.SESSION_START, getDefaultProperty());
      }
      bindTrakcerToWindowFocusEvent();
      bindTrackerToWindowCloseEvent();
    }

    /**
     * Event와 Properties를 받아 로그서버로 전송한다. 
     * Validation Check를 하고 LazyLoad를 해야할 상황이면 LazyLoad서비스로 넘기고, 
     * 아닌경우는 바로 Data를 전송한다.
     * @param {String} event - Event Name. AnalyticsConstant.Event에 존재해야한다. 
     * @param {String} properties - Event에 종속된 properties.
     * @param {Boolean} async - Event 로그 전송 방식. { true = async, false = sync }
     */
    function track(event, properties, async) {
      try {
        var isAsync = (!_.isUndefined(async)) ? async : true;
        var customProperties = properties || {};
        var parsedProperties = mapProperty(customProperties);
        var identify = AnalyticsPersistence.getIdentify();
        var isValid = checkValidation(event, parsedProperties);
        var isLazyload = AnalyticsLazyload.checkLazyload(event, parsedProperties, identify);

        if (isValid) {
          if (isLazyload) {
            AnalyticsLazyload.track(event, parsedProperties);
          } else {
            if (isAsync) {
              AnalyticsData.track(event, parsedProperties, identify);
            } else {
              AnalyticsData.track(event, parsedProperties, identify, isAsync);
            }
          }
        } 
      } catch (e) {
        error(e, 'AnalyticsHelper.track');
      }      
    }

    /**
     * track에서 받은 Property의 Key값들을 Sprinkler Log규약에 맞도록 맵핑한다.
     * @see analytics.constant.service.js
     * @see http://wiki.tosslab.com/display/SPRK/Jandi+Track+abbreviation
     * @example 'CURRENT_LANGUAGE': 'kr' =>  'p12': 'kr'
     * @param {Object} properties - Event Name. AnalyticsConstant.Event에 존재해야한다. 
     * @param {Object} properties - Event에 종속된 properties.
     */
    function mapProperty(properties) {
      return _.mapKeys(properties, function(value, key) {
        return PROPERTY[key];
      });
    }

    /**
     * Event와 Properties를 받아 로그서버로 전송한다. 
     * Validation Check를 하고 LazyLoad를 해야할 상황이면 LazyLoad서비스로 넘기고, 
     * 아닌경우는 바로 Data를 전송한다.
     * @param {String} event - Event Name. 
     * @param {String} properties - Event에 종속된 properties.
     */
    function checkValidation(event, properties) {

      //TODO: Event 명, property명 Check
      if (_.isUndefined(event)) {
        //Event값이 없을 경우
        console.error("EVENT is undefined");
        return false;
      } 
      return true;
    }

    /**
     * 기본적으로 브라우저에서 얻을수 있는 Default Property를 반환한다.
     * @return {Object}
     */
    function getDefaultProperty() {
      var defaultProperty = {
        'BROWSER_HEIGHT': window.innerHeight || document.body.clientHeight,
        'BROWSER_WIDTH': window.innerWidth || document.body.clientWidth,
        'SYSTEM_WIDTH': screen.width,
        'SYSTEM_HEIGHT': screen.height,
        'USER_AGENT': window.navigator.userAgent,
        'REFERRER': document.referrer,
        'BROWSER_LANGUAGE': window.navigator.language
      };
      
      return defaultProperty;
    }
    
    /**
     * Analytics 모듈 내부의 Console.error wrapper. Staging 상태가 아닐때에만 에러메세지 출력.
     * @param {String} message - Error
     * @param {String} html HTML 문자열
     */
    function error(message, position) {
      var isStaging = (config.name === 'staging'); 
      var isLocal = (config.name === 'local');
      var isDev = (config.name === 'development');
      if (!isStaging) {
        if (isLocal || isDev) {
          console.error('Kevin: Error in Analytics Module!. At ' + position + ': ' + message);
        }
      }
    }

    /**
     * Window Focus, Blur 이벤트에 트래커를 붙인다.
     */
    function bindTrakcerToWindowFocusEvent() {
      $(window)
      .on('focus', _trackFocus)
      .on('blur', _trackBlur);
    }
    
    /**
     * Window Focus 이벤트 로그를 수집한다.
     */
    function _trackFocus() {
      track(EVENT.WINDOW_FOCUS);
    }
    /**
     * Window Blur 이벤트 로그를 수집한다.
     */
    function _trackBlur() {
      track(EVENT.WINDOW_BLUR);
    }

    /**
     * Window Close 이벤트에 트래커를 붙인다.
     * beforeunload -> blur -> unload 순으로 이벤트가 발생해서
     * unload 이벤트를 붙임
     */
    function bindTrackerToWindowCloseEvent() {
      $(window).on('unload', function() {
        track(EVENT.WINDOW_CLOSE, null, false);
      });
    }
  }                                                                                                              
})();
