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
    localStorageServiceProvider.setStorageCookieDomain(configuration.domain);
  }

  /* @ngInject */
  function run() {
  }

})();