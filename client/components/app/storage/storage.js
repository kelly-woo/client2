(function() {
  'use strict';

  angular
    .module('app.storage', [
      'app.config',
      'ngCookies',
      'LocalStorageModule'])
    .config(config)
    .run(run);

  /* @ngInject */
  function config(configuration, localStorageServiceProvider) {
    /* LocalStorage prefix setting */
    localStorageServiceProvider.setPrefix('_jd_');
    localStorageServiceProvider.setStorageCookie(45, '/');
    if (configuration.name == 'development') {
      localStorageServiceProvider.setStorageCookieDomain('jandi.io');
    } else {
      localStorageServiceProvider.setStorageCookieDomain('jandi.com');
    }
  }

  /* @ngInject */
  function run() {
  }

})();