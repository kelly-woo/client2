(function() {
  'use strict';

  angular
    .module('app.storage', [
      'ngCookies',
      'LocalStorageModule'])
    .config(config)
    .run(run);

  /* @ngInject */
  function config(configuration, localStorageServiceProvider) {
    /* LocalStorage prefix setting */
    localStorageServiceProvider.setPrefix('_jd_');
    localStorageServiceProvider.setStorageCookie(45, '/');
    if (configuration.name == 'staging') {
      localStorageServiceProvider.setStorageCookieDomain('jandi.com');
    } else {
      localStorageServiceProvider.setStorageCookieDomain('jandi.io');
    }
  }

  /* @ngInject */
  function run() {
  }

})();