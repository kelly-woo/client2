/**
 * @fileoverview http통신을 가로채서 필요한 일들을 수행한다.
 */
(function() {
  'use strict';

  angular
    .module('app.net')
    .service('AuthInterceptor', AuthInterceptor);

  /* @ngInject */
  function AuthInterceptor($q, $injector, configuration, storageAPIservice) {
    var DISABLED_MEMBER_ERROR_CODE = 40301;

    this.request = request;
    this.requestError = requestError;
    this.responseError = responseError;

    /**
     * request interceptor
     * @param {object} config
     * @returns {*}
     */
    function request(config) {
      if (storageAPIservice.isAccessTokenDirty()) {
        _redirectToAdmin();
      } else {
        config.headers = config.headers || {};
        // API version
        config.headers.Accept = "application/vnd.tosslab.jandi-v" + _getApiVersion(config) + "+json";
        config.headers.authorization = "bearer " + (storageAPIservice.getAccessToken());
        return config;
      }
    }

    /**
     * admin 페이지로 redirect 한다.
     * @private
     */
    function _redirectToAdmin() {
      window.location.href = configuration.main_address + 'team';
    }

    /**
     * 현재 api 버전을 반환한다.
     * @param {object} config
     * @returns {*}
     * @private
     */
    function _getApiVersion(config) {
      return config.version || configuration.api_version;
    }

    /**
     * request error interceptor
     * @param {object} rejection
     */
    function requestError(rejection) {
      console.log(rejection);
    }

    /**
     * responseError interceptor
     * @param {object} rejection
     * @returns {Promise}
     */
    function responseError(rejection) {
      var authAPIservice = $injector.get('authAPIservice');
      if (rejection.status === 0) {
        // net::ERR_CONNECTION_REFUSED
        // what should i do?
        return $q.reject(rejection);
      } else if (rejection.status === 400) {
        // This is just bad request.
        //console.debug('BAD REQUEST');
        //console.debug(rejection.config.method, rejection.config.url);
        //console.debug(rejection.headers);
        return $q.reject(rejection);
      } else if (rejection.status === 403) {
        if (rejection.data.code === DISABLED_MEMBER_ERROR_CODE) {
        } else {
          console.log('I am so sorry. It is 403 error. You are not supposed to be here.');
          return $q.reject(rejection);
        }

        return $q.reject();

      } else if (rejection.status == 502) {
        console.log('I am sorry, it is a 502 error. Keep calm and close your console.');
      } else if (rejection.status == 503) {
        authAPIservice.handleConstructionErr();
        return $q.reject(rejection);
      } else if (rejection.status === 401) {
        // Unauthorized Access.
        // What to do? - get new access_token using refresh_token
        console.log('I am so sorry. It is 401 error.');
        //sholdn't be here
        if (angular.isUndefined(authAPIservice)) {
          _redirectToAdmin();
        } else {
          authAPIservice.requestAccessTokenWithRefreshToken();
        }
      } else {
        return $q.reject(rejection);
      }
    }
  }
})();
