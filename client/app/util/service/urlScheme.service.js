(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('urlScheme', urlScheme);

  /* @ngInject */
  function urlScheme(storageAPIservice, $rootScope, configuration) {
    this.urlScheme = urlScheme;

    function redirectTo(url) {
      // Direct to 'url'.
      window.location.href = url;
    }

    /**
     * Send url scheme.
     */
    function urlScheme() {
      var url_to_app, url_to_store;

      var access_token = _getAccessToken();
      var refresh_token = _getRefreshToken();

      url_to_app = 'tosslabjandi://open?' + access_token + '&' + refresh_token;

      if (_isAndroid()) {
        // Android.
        url_to_app = 'intent://open?' +
                      access_token +
                      '&' +
                      refresh_token +
                      '/#Intent;scheme=tosslabjandi;package=' +
                      configuration.android_package +
                      ';end;';

        redirectTo(url_to_app);
      } else {
        // iOS.
        url_to_store = configuration.app_store_address;
        _startApp(url_to_app, url_to_store);
      }

    }

    /**
     *
     * @returns {boolean}
     *  true, if user is using android device.
     *  false, if user is using non-android device.
     *
     *  @private
     */
    function _isAndroid() {
      var userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return userAgent.match(/Android/i)=='Android';
    }

    /**
     *
     * @returns {access_token with correct format 'access_token=token_value}
     * @private
     */
    function _getAccessToken() {
      var access_token = storageAPIservice.getAccessToken() || $rootScope.mobileStatus.access_token;
      if (!!access_token) {
        access_token = 'access_token='+access_token;
      } else {
        access_token = '';
      }
      return access_token;
    }

    /**
     *
     * @returns {refresh_token with correct format 'refresh_token=token_value}
     * @private
     */
    function _getRefreshToken() {
      var refresh_token = storageAPIservice.getRefreshToken() || $rootScope.mobileStatus.refresh_token;
      if (!!refresh_token) {
        refresh_token = 'refresh_token='+refresh_token;
      }
      else {
        refresh_token = '';
      }
      return refresh_token;
    }

    var timeout;


    /**
     *
     * @param url_to_app: url to application.
     * @param url_to_store: url to store.
     * @private
     */
    function _startApp(url_to_app, url_to_store) {
      redirectTo(url_to_app);

      window.addEventListener('pagehide', _preventPopup);

      timeout = setTimeout(function(){
        redirectTo(url_to_store);
      }, 500);

    }
    /**
     * Prevent alert window from popping up.
     */
    function _preventPopup() {
      clearTimeout(timeout);
      timeout = null;
      window.removeEventListener('pagehide', _preventPopup);
    }

  }
})();
