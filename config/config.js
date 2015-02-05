(function() {
  'use strict';

  /**
   * last_update_message
   *  - Month/Dday/Year Hour:Minute:Second
   */
  angular
    .module('app.config', [])
    .constant('configuration', {
      name                : '@@name',
      api_address         : '@@api_address',
      api_version         : '@@api_version',
      ga_token            : '@@ga_token',
      ga_token_global     : '@@ga_token_global',
      mp_account_token    : '@@mp_account_token',
      mp_member_token     : '@@mp_member_token',
      base_url            : '@@base_url',
      base_protocol       : '@@base_protocol',
      main_address        : '@@main_address',
      app_store_address   : '@@app_store_address',
      play_store_address  : '@@play_store_address',
      last_update_message : '@@last_update_message'
    })
    .run(run);

  /* @ngInject */
  function run($rootScope, config) {
    // server address, server api version 
    config.init($rootScope);
  }

})();

