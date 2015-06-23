/**
 * @fileoverview Analytics 모듈의 HTTP 서비스 
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('analyticsData', analyticsData);

  /* @ngInject */
  function analyticsData($http, analyticsTranslate, config, analyticsConstant) {
    
    this.track = track;

    /**
     * 로그의 형태를 정형화 시킨 뒤 로그서버로 전송한다. 
     * @param {String} event - Event Name.
     * @param {Object} Identify - Account, Session, Browser
     *    @param {String} accountId
     *    @oaram {Number} memberId
     *    @param {String} token - Browser Local Storage
     *    @param {String} session - Browser Session Storage
     * @param {Object} Properties
     */
    function track(event, properties, identify) {
      var data = {};
      data[analyticsConstant.LOG.EVENT] = event;
      data[analyticsConstant.LOG.IDENTIFY] = identify;
      data[analyticsConstant.LOG.PLATFORM] = analyticsConstant.PLATFORM;
      data[analyticsConstant.LOG.PROPERTIES] = _.assign(properties, getDefaultProperty());
      data['time'] = new Date().getTime();

      var js = JSON.stringify(data);

      $http.post(config.analytics_server + 'log/web',{
        footprint: analyticsTranslate.base64Encode(js)
      });
    }

    /**
     * Default Properties 반환
     * @returns {Object} Default Properties
     */
    function getDefaultProperty() {
      var defaultProperty = {};
      var PROPERTY = analyticsConstant.PROPERTY;

      defaultProperty[PROPERTY.CHANNEL] = analyticsConstant.CHANNEL;

      return defaultProperty;
    }
  }
})();
