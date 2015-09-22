(function() {
  'use strict';

  /**
   * last_update_message
   *  - Month/Dday/Year Hour:Minute:Second
   */
  angular
    .module('config.common', [])
    .constant('configuration', {
      version             : '@@version',
      team_name           : '@@team_name',
      name                : '@@name',
      api_address         : '@@api_address',
      socket_address      : '@@socket_address',
      file_address        : '@@file_address',
      api_version         : '@@api_version',
      ga_token            : '@@ga_token',
      ga_token_global     : '@@ga_token_global',
      mp_account_token    : '@@mp_account_token',
      mp_member_token     : '@@mp_member_token',
      base_url            : '@@base_url',
      assets_url          : '@@assets_url',
      base_protocol       : '@@base_protocol',
      main_address        : '@@main_address',
      app_store_address   : '@@app_store_address',
      play_store_address  : '@@play_store_address',
      last_update_message : '@@last_update_message',
      analytics_server    : '@@analytics_server',
      integration: {
        google_drive: {
          client_id: '@@google_drive_client_id',
          api_key: '@@google_drive_api_key',
          redirect: '@@google_drive_redirect'
        },
        dropbox: '@@dropbox_api_key'
      },
      cors: {
        api_address: '@@cors_api_address',
        file_address: '@@cors_file_address'
      }
    })
    .run(run);

  /* @ngInject */
  function run($rootScope, config) {
    // server address, server api version
    config.init($rootScope);
  }

})();

