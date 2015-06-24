/**
 * @fileoverview Analytics 모듈 중 다른 모듈의 Controller에서 Mixpanel로 
 *                 접근할 때 사용. Will be deprecated
 *               
 * @author Kevin Lee <kevin@tosslab.com>
 */


(function() {
  'use strict';

  angular
    .module('app.analytics')
    .service('MixpanelHelper', MixpanelHelper);

  /* @ngInject */
  function MixpanelHelper($rootScope) {
    this.track = track;
    this.setCampaign = setCampaign;


    function track(event, properties) {
      mixpanel.track(event, properties);
    }

    function setCampaign(name, source, medium) {
      var campaign = {};
      
      if (name) {
        campaign.campaignName = name; 
      }
      if (source) {
        campaign.campaignSource = source;
      }
      if (medium) {
        campaign.campaignMedium = medium;
      }

      mixpanel.people.set(campaign);
      mixpanel.register(campaign);
    }
  }
})();