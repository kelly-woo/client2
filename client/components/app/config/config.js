(function() {
  'use strict';

  /**
   * last_update_message
   *  - Month/Dday/Year Hour:Minute:Second
   */
  angular
    .module('app.config', [])
    .constant('configuration', {
      name                : 'staging',
      api_address         : '../',
      socket_address      : 'https://ws.jandi.com/',
      api_version         : '2',
      ga_token            : 'UA-53634725-1',
      ga_token_global     : 'UA-53634725-4',
      mp_account_token    : 'fe754ed3c3b6fcf0c510ebcfd6244f3e',
      mp_member_token     : 'f72e67d5099ab4e0ba4a83da4a9cafe3',
      base_url            : '.jandi.com',
      assets_url          : 'https://www.jandi.com/app/',
      base_protocol       : 'https://',
      main_address        : 'https://www.jandi.com/main/#/',
      app_store_address   : 'itms-apps://itunes.apple.com/us/app/jandi/id904895208?mt=8',
      play_store_address  : 'https://play.google.com/store/apps/details?id=com.tosslab.jandi.app',
      last_update_message : '04/06/2015 23:00:00',
      integration: {
        google_drive: {
          client_id: '524738787050-7dvpmffvpmk3ooaifcl2a9kpqsm17l12.apps.googleusercontent.com',
          api_key: 'AIzaSyAarJcX7VfgOiuYzl0ShapunGh5B7amAxA',
          redirect: 'https://oauth.jandi.com/'
        },
        dropbox: 'sce84hy9tjy3o6v'
      }
    })
    .run(run);

  /* @ngInject */
  function run($rootScope, config) {
    // server address, server api version
    config.init($rootScope);
  }

})();

