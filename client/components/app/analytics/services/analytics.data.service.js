/**
 * @fileoverview Analytics 모듈의 HTTP 서비스 
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsData', AnalyticsData);

  /* @ngInject */
  function AnalyticsData($injector, AnalyticsTranslate, config, AnalyticsConstant) {
    var HybridAppHelper;

    this.track = track;
    /**
     * 로그의 형태를 정형화 시킨 뒤 로그서버로 전송한다. 
     * @param {String} event - Event Name.
     * @param {Object} properties
     * @param {Object} identify - Account, Session, Browser
     *    @param {String} identify.session - Browser Session Storage
     *    @param {String} identify.token - Browser Local Storage
     *    @param {String} identify.accountId
     *    @oaram {Number} identify.memberId
     * @param {Boolean} async - Event 로그 전송 방식. { true = async, false = sync }
     */
    function track(event, properties, identify, async) {
      var data = {};
      var js;
      var isAsync = (!_.isUndefined(async)) ? async : true;
      HybridAppHelper = HybridAppHelper || $injector.get('HybridAppHelper');

      data[AnalyticsConstant.LOG.EVENT] = event;
      data[AnalyticsConstant.LOG.IDENTIFY] = identify;
      if (HybridAppHelper.isPcApp()) {
        data[AnalyticsConstant.LOG.PLATFORM] = AnalyticsConstant.PLATFORM.WIN_APP;
      } else if (HybridAppHelper.isMacApp()) {
        data[AnalyticsConstant.LOG.PLATFORM] = AnalyticsConstant.PLATFORM.MAC_APP;
      } else {
        data[AnalyticsConstant.LOG.PLATFORM] = AnalyticsConstant.PLATFORM.WEB;
      }
      data[AnalyticsConstant.LOG.PROPERTIES] = _.assign(properties, getDefaultProperty());
      data['time'] = new Date().getTime();
      
      js = JSON.stringify(data);

      $.ajax({
        method: 'GET',
        data: {footprint: AnalyticsTranslate.base64Encode(js)},
        url: config.analytics_server + 'log/web',
        async: isAsync,
        timeout: 500,
        dataType: 'jsonp'
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
