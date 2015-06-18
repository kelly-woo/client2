/**
 * @fileoverview Analytics LazyLoad 서비스. 특정이유로 전송에 실패할 경우 Queue에 저장한 후 다시 전송한다.
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('analyticsLazyload', analyticsLazyload);

  analyticsLazyload.$inject = ['$interval', 'analyticsPersistence', 'analyticsData', 'analyticsConstant']
  /* @ngInject */
  function analyticsLazyload($interval, analyticsPersistence, analyticsData, analyticsConstant) {
    

    var ENQUEUE_REQUEST = false;
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

      ENQUEUE_REQUEST = true;

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
        var identify = analyticsPersistence.getIdentify();
        var isLazyload = _checkLazyloadCondition(event, properties, identify);

        if (!isLazyload) {
          console.log(event,properties)
          analyticsData.track(event, properties ,identify);
          delayedLogQueue.shift();
        }
        console.log('lazylaod cycle');
      } else {
        ENQUEUE_REQUEST = false;
        console.log('cancel the lazy Load');
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

      if (ENQUEUE_REQUEST) {
        console.log(1);
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
      var accountId = identify[analyticsConstant.IDENTIFY.ACCOUNT_ID];
      var memberId = identify[analyticsConstant.IDENTIFY.MEMBER_ID];
      if (_.isUndefined(accountId)) {
        //AccountId가  Undefined인 경우(=Sign In이 끝나지 않은 경우)
        console.log(2);
        return true;
      } else if (_.isUndefined(memberId)) {
        //memberId가  Undefined인 경우(=Sign In이 끝나지 않은 경우)
        console.log(3);
        return true;
      }
      return false;
    }

  }
})();
