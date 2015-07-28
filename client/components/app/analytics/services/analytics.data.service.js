/**
 * @fileoverview Analytics 모듈의 HTTP 서비스 
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsData', AnalyticsData);

  /* @ngInject */
  function AnalyticsData($http, AnalyticsTranslate, config, AnalyticsConstant, pcAppHelper) {
    
    this.track = track;
    /**
     * 로그의 형태를 정형화 시킨 뒤 로그서버로 전송한다. 
     * @param {String} event - Event Name.
     * @param {Object} Identify - Account, Session, Browser
     *    @param {String} identify.accountId
     *    @oaram {Number} identify.memberId
     *    @param {String} identify.token - Browser Local Storage
     *    @param {String} identify.session - Browser Session Storage
     * @param {Object} Properties
     */
    function track(event, properties, identify) {
      var data = {};
      data[AnalyticsConstant.LOG.EVENT] = event;
      data[AnalyticsConstant.LOG.IDENTIFY] = identify;
      if (pcAppHelper.isPcApp()) {
        data[AnalyticsConstant.LOG.PLATFORM] = AnalyticsConstant.PLATFORM.WIN_APP;
      } else {
        data[AnalyticsConstant.LOG.PLATFORM] = AnalyticsConstant.PLATFORM.WEB;
      }
      data[AnalyticsConstant.LOG.PROPERTIES] = _.assign(properties, getDefaultProperty());
      data['time'] = new Date().getTime();
      
      var js = JSON.stringify(data);

      $http.post(config.analytics_server + 'log/web',{
        footprint: AnalyticsTranslate.base64Encode(js)
      });
    }

    /**
     * Default Properties 반환
     * @returns {Object} Default Properties
     */
    function getDefaultProperty() {
      var defaultProperty = {};
      var PROPERTY = AnalyticsConstant.PROPERTY;

      defaultProperty[PROPERTY.CHANNEL] = AnalyticsConstant.CHANNEL;

      return defaultProperty;
    }
  }
})();
