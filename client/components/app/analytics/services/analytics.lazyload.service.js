/**
 * @fileoverview Analytics LazyLoad 서비스. 특정이유로 전송에 실패할 경우 Queue에 저장한 후 다시 전송한다.
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('AnalyticsLazyload', AnalyticsLazyload);

  /* @ngInject */
  function AnalyticsLazyload($interval, AnalyticsPersistence, AnalyticsData, AnalyticsConstant) {
    

    var isEnqueRequest = false;
    var delayedLogQueue = [];
    var interval;

    this.track = track;
    this.checkLazyload = checkLazyload;

    /**
     * LazyLoad 서비스로 들어온 로그를 QUEUE에 저장시키고, LazyLoad Interval를 실행한다.
     * @param {String} event - Event Name.
     * @param {Object} Properties
     */
    function track(event, properties) {

      isEnqueRequest = true;

      delayedLogQueue.push({
        event: event,
        properties: properties
      });

      if (_.isUndefined(interval)) {
        interval = $interval(sendDataCycle, 1000);
      } 
      
    }

    /**
     * Queue에 저장된 이벤트를 꺼내, 검사후 전송가능하면 보낸뒤 Queue에서 POP한다.
     * Queue에 남은 이벤트가 없을경우 Interval을 중지하고 LazyLoad를 종료한다.
     * @param {String} event - Event Name.
     * @param {Object} Properties
     */
    function sendDataCycle() {
      if (delayedLogQueue.length > 0) {

        var event = delayedLogQueue[0].event;
        var properties = delayedLogQueue[0].properties;
        var identify = AnalyticsPersistence.getIdentify();
        var isLazyload = _checkLazyloadCondition(event, properties, identify);

        if (!isLazyload) {

          AnalyticsData.track(event, properties ,identify);
          delayedLogQueue.shift();
        }

      } else {
        isEnqueRequest = false;

        $interval.cancel(interval);
      }
    }


    /**
     * 로그속성들을 받아 현재 LazyLoad Queue가 돌고있거나 
     * 속성들이 Load가 다 되지않았을 경우 true를 반환한다.
     * @param {String} event - Event Name.
     * @param {Object} properties
     * @param {Object} identify
     * @return {Boolean} 
     */
    function checkLazyload(event, properties, identify) {

      if (isEnqueRequest) {

        //현재 LazyLoad가 돌고 있을 경우
        return true;
      } else {
        return _checkLazyloadCondition(event, properties, identify);
      }
    }

    /**
     * 로그속성들을 받아 LazyLoad를 해야할 상황인지 판단한다.
     * @param {String} event - Event Name.
     * @param {Object} properties
     * @param {Object} identify
     * @return {Boolean} 
     */
    function _checkLazyloadCondition(event, properties, identify) {
      var EVENT = AnalyticsConstant.EVENT;
      var PROPERTY = AnalyticsConstant.PROPERTY;
      var PAGE = AnalyticsConstant.PAGE;
      var accountId = identify[AnalyticsConstant.IDENTIFY.ACCOUNT_ID];
      var memberId = identify[AnalyticsConstant.IDENTIFY.MEMBER_ID];

      if (event === EVENT.SESSION_START
          || event === EVENT.WINDOW_FOCUS
          || event === EVENT.WINDOW_BLUR) {
        //Sign Out상태에서도 발생하는 Event들
        return false;
      } else if (event === EVENT.PAGE_VIEWED && properties[PROPERTY.PAGE] === PAGE['signin']) {
        //Sign In page View
        return false;
      } else if (event === EVENT.SIGN_IN && properties[PROPERTY.RESPONSE_SUCCESS] === false) {
        //Sign In 실패시
        return false;
      } else if (_.isUndefined(accountId)) {
        //AccountId가  Undefined인 경우(=Sign In이 끝나지 않은 경우)

        return true;
      } else if (_.isUndefined(memberId)) {
        //memberId가  Undefined인 경우(=Sign In이 끝나지 않은 경우)

        return true;
      }
      return false;
    }

  }
})();
