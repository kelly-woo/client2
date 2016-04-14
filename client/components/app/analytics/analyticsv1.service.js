(function() {
  'use strict';

  angular
    .module('app.analytics')
    .factory('analyticsService', analyticsService);

  function analyticsService($injector) {
    var storageAPIservice;
    var analyticsAPI = {};

    analyticsAPI.mixpanelTrack = function(title, data_json) {
      if (_.isEmpty(title)) return;

      data_json = data_json || {};
      mixpanel.track(title, data_json);
    };
    analyticsAPI.memberIdentifyMixpanel = function() {
      mixpanel.identify(analyticsAPI.getUserIdentify());
    };
    analyticsAPI.accountMixpanelTrack = function(title, data_json) {
      if (_.isEmpty(title)) return;

      data_json = data_json || {};
      mixpanel.account.track(title, data_json);
    };

    analyticsAPI.accountIdentifyMixpanel = function(account) {
      mixpanel.account.identify("account_"+account.id);
    };

    analyticsAPI.mixpanelIdentify = function(data_string) {
      if (_.isEmpty(data_string)) return;
      mixpanel.identify(data_string);
    };

    analyticsAPI.mixpanelPeople = function(action, data_json) {
      if (_.isEmpty(data_json)) return;

      switch (action) {
        case 'set':
          mixpanel.people.set(data_json);
          break;
        case 'increment':
          mixpanel.people.increment(data_json.key, data_json.value);
          break;
        default:
          break;
      }
    };

    analyticsAPI.mixpanelRegister = function(data_json) {
      if (_.isEmpty(data_json)) return;

      mixpanel.register(data_json);
    };

    analyticsAPI.mixpanelAlias = function(data_string) {
      if (_.isEmpty(data_string)) return;

      mixpanel.alias(data_string);
    };

    analyticsAPI.getEntityType = function(entityType) {
      var entity_type;
      switch (entityType) {
        case 'channels':
          entity_type = "topic";
          break;
        case 'privategroups':
          entity_type = "private group";
          break;
        case 'users':
          entity_type = "direct message";
          break;
        default:
          entity_type = "invalid";
          break;
      }
      return entity_type;
    };


    // Generate 'memberId-teamId' format string for google analytics.
    analyticsAPI.getUserIdentify = function() {
      storageAPIservice = storageAPIservice || $injector.get('storageAPIservice');
      return (storageAPIservice.getMemberIdLocal() || storageAPIservice.getMemberIdSession()) + '-' + (storageAPIservice.getTeamIdLocal() || storageAPIservice.getTeamIdSession());
    };

    analyticsAPI.removeAccountCookieMixpanel= function() {
      if(mixpanel && mixpanel.account.cookie && mixpanel.account.cookie.clear) {
        mixpanel.account.cookie.clear();
      }
    };
    analyticsAPI.removeMemberCookieMixpanel= function() {
      if(mixpanel && mixpanel.cookie && mixpanel.cookie.clear) {
        mixpanel.cookie.clear();
      }
    };

    return analyticsAPI;
  }

})();
