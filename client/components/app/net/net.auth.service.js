(function() {
  'use strict';

  angular
    .module('app.net')
    .service('AuthInterceptor', AuthInterceptor);

  /* @ngInject */
  function AuthInterceptor($q, $injector, configuration, storageAPIservice) {

    this.request = request;
    this.responseError = responseError;

    function request(config) {
      config.headers = config.headers || {};

      var apiVersion = _setApiVersion(config);
      // API version
      config.headers.Accept = "application/vnd.tosslab.jandi-v" + apiVersion + "+json";

      config.headers.authorization = "bearer " + (storageAPIservice.getAccessToken());

      return config;
    }

    function _setApiVersion(config) {
      return config.version || configuration.api_version;
    }

    function responseError(rejection) {
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
        console.log('I am so sorry. It is 403 error. You are not supposed to be here.');

        var disabledMemberAccessingTeamCode = 40301;

        var situationCode = rejection.data.code;

        if (situationCode == disabledMemberAccessingTeamCode) {
          // Current member has been disabled from current team!!
          var authAPIservice = $injector.get('authAPIservice');
          if (angular.isUndefined(authAPIservice)) return;
          authAPIservice.onCurrentMemberDisabled();
        } else {
          return $q.reject(rejection);
        }
      } else if (rejection.status == 502) {
        console.log('I am sorry, it is a 502 error. Keep calm and close your console.');
      } else if (rejection.status == 503) {
        var authAPIservice = $injector.get('authAPIservice');
        authAPIservice.handleConstructionErr();
        return $q.reject(rejection);
      } else if (rejection.status === 401) {
        // Unauthorized Access.
        // What to do? - get new access_token using refresh_token
        console.log('I am so sorry. It is 401 error.');
        var authAPIservice = $injector.get('authAPIservice');

        if (angular.isUndefined(authAPIservice)) return;
        authAPIservice.requestAccessTokenWithRefreshToken();
        return $q.reject(rejection);
      }
    }
  }
})();
