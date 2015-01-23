'use strict';

var app = angular.module('jandiApp');

app.factory('authAPIservice', function($http, $rootScope, $state, $location, storageAPIservice, accountService, publicService) {
  var authAPI = {};

  authAPI.signIn = function(userdata) {
    return $http({
      method: "POST",
      url: $rootScope.server_address + 'token',
      data: userdata
    });
  };

  authAPI.requestPasswordEmail = function(email) {
    return $http({
      method: 'POST',
      url: $rootScope.server_address + 'accounts/password/resetToken',
      data: {
        email: email,
        lang: accountService.getAccountLanguage()
      }
    });
  };

  authAPI.validatePasswordToken = function(teamId, token) {
    return $http({
      method  : 'POST',
      url     : $rootScope.server_address + 'validation/passwordResetToken',
      data    : {
        'teamId'    : parseInt(teamId),
        'token'     : token
      }
    });
  };

  authAPI.resetPassword = function(token, password) {
    return $http({
      method  : 'PUT',
      url     : $rootScope.server_address + 'accounts/password',
      data    : {
        token: token,
        password: password,
        lang: accountService.getAccountLanguage()
      }
    });
  };

  authAPI.isSignedIn = function() {
    if (angular.isDefined(storageAPIservice.getRefreshTokenLocal()) || angular.isDefined(storageAPIservice.getRefreshTokenSession())){
      return true;
    }
    return false;
  };

  authAPI.requestAccessTokenWithRefreshToken = function() {
    var refresh_token = storageAPIservice.getRefreshToken();

    return $http({
      method  : "POST",
      url     : $rootScope.server_address + 'token',
      data    : {
        'grant_type'    : 'refresh_token',
        'refresh_token' : refresh_token
      }
    });
  };

  authAPI.updateAccessToken = function(response) {
    if (storageAPIservice.isValidValue(storageAPIservice.getRefreshTokenLocal())) {
      storageAPIservice.setAccessTokenLocal(response.access_token)
    }
    else if (storageAPIservice.isValidValue(storageAPIservice.getRefreshTokenSession())) {
      storageAPIservice.setAccessTokenSession(response.access_token);
    }
    else {
      storageAPIservice.setAccessTokenCookie(response.access_token);
    }


    $state.go($state.current, {}, {reload: true}); //second parameter is for $stateParams
  };


  function DeleteToken() {
    return $http({
      method: 'DELETE',
      url: $rootScope.server_address + 'token',
      data: {
        refresh_token: storageAPIservice.getRefreshTokenLocal() || storageAPIservice.getRefreshTokenSession()
      },
      headers : { "Content-Type": "application/json;charset=utf-8" }

    });
  }



  return authAPI;
});

app.factory('authInterceptor', function ($rootScope, $q, $window, $injector, configuration, localStorageService, storageAPIservice) {
  return {
    request: function (config) {
      config.headers = config.headers || {};

      // API version
      config.headers.Accept = "application/vnd.tosslab.jandi-v"+$rootScope.api_version+"+json";

      //if (config.method === 'POST' && config.fileFormDataName === 'userFile') {
      //    // file upload api.
      //    if (angular.isUndefined(FileAPI.support)) {
      //    // since browser supports html5 file upload feature, FileAPI.support has not been initialized.
      //    // console.log('browser supports html5 not including authorization in header.');
      //        return config;
      //    }
      //}

      config.headers.authorization = "bearer " + (storageAPIservice.getAccessToken());
      return config;
    },

    responseError: function (rejection) {
      if (rejection.status === 0) {
        // net::ERR_CONNECTION_REFUSED
        // what should i do?
        return $q.reject(rejection);

      }
      if (rejection.status === 400) {
        // This is just bad request.
        //console.debug('BAD REQUEST');
        //console.debug(rejection.config.method, rejection.config.url);
        //console.debug(rejection);

        return $q.reject(rejection);

      }
      if (rejection.status === 403) {
        return $q.reject(rejection);

      }

        if (rejection.status === 401) {
          console.log('401')
          // Unauthorized Access.
          // What to do? - get new access_token using refresh_token
          var authAPIservice = $injector.get('authAPIservice');

          if (angular.isUndefined(authAPIservice)) return;

          authAPIservice.requestAccessTokenWithRefreshToken()
            .success(function(response) {
              authAPIservice.updateAccessToken(response);
            })
            .error(function(error) {
              console.log('whaty')
              // bad refresh_token.
              var publicService = $injector.get('publicService');

              publicService.signOut();
            });
        }

    }
  };
});
