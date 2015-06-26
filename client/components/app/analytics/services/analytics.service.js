/**
 * @fileoverview Analytics Service. Analytics 모듈 중 다른 모듈의 Controller에서 Internal Analtics System으로 
 *                 접근할 때 사용
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsHelper', AnalyticsHelper);

  /* @ngInject */
  function AnalyticsHelper(AnalyticsPersistence, AnalyticsData, AnalyticsLazyload, AnalyticsConstant, config) {

    var EVENT = AnalyticsConstant.EVENT;
    var PROPERTY = AnalyticsConstant.PROPERTY;

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
    }

    /**
     * Event와 Properties를 받아 로그서버로 전송한다. 
     * Validation Check를 하고 LazyLoad를 해야할 상황이면 LazyLoad서비스로 넘기고, 
     * 아닌경우는 바로 Data를 전송한다.
     * @param {String} event - Event Name. AnalyticsConstant.Event에 존재해야한다. 
     * @param {object} properties - Event에 종속된 properties.
     */
    function track(event, properties) {
      // try {
        properties = properties || {};
        var identify = AnalyticsPersistence.getIdentify();

        var isValid = checkValidation(event, properties);
        var isLazyload = AnalyticsLazyload.checkLazyload(event, properties, identify);

        if (isValid) {
          if (isLazyload) {
            AnalyticsLazyload.track(event, properties);
          } else {
            AnalyticsData.track(event, properties, identify);
          }
        }
      // } catch (e) {
      //   error(e, 'AnalyticsHelper.track');
      // }
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
      var defaultProperty = {};
      defaultProperty[PROPERTY.BROWSER_HEIGHT] = window.innerHeight || document.body.clientHeight;
      defaultProperty[PROPERTY.BROWSER_WIDTH] = window.innerWidth || document.body.clientWidth;
      defaultProperty[PROPERTY.SYSTEM_WIDTH] = screen.width;
      defaultProperty[PROPERTY.SYSTEM_HEIGHT] = screen.height;
      defaultProperty[PROPERTY.USER_AGENT] = window.navigator.userAgent;
      defaultProperty[PROPERTY.REFERRER] = document.referrer;
      defaultProperty[PROPERTY.BROWSER_LANGUAGE] = window.navigator.language;
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
  }                                                                                                              
})();
