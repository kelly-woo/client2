/**
 * @fileoverview Analytics 모듈 중 다른 모듈의 Controller에서 Google Analytics로 
 *                 접근할 때 사용
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('GAHelper', GAHelper);

  /* @ngInject */
  function GAHelper($rootScope) {
    this.setLanguage = setLanguage;
    this.sendEvent = sendEvent;
    this.pageTrack = pageTrack;
    this.setCampaign = setCampaign;

    function setLanguage(language) {
      ga('set', 'language', language);
    }

    function setCampaign(name, source, medium) {
      if (name) { 
        ga('set', 'campaignName', name);
      }
      if (source) {
        ga('set', 'campaignSource', source);
      }
      if (medium) {
        ga('set', 'campaignMedium', medium);
      }
    }

    function sendEvent(category, action, label, value){
      ga('send', 'event', category, action, label, value);
    }

    function pageTrack(page, title){
      ga('send','pageview', {
        page:  page,
        title: title
      });
    }

  }
})();
