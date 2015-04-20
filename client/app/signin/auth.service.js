'use strict';

var app = angular.module('jandiApp');

app.factory('authAPIservice', function($http, $rootScope, $state, $location, storageAPIservice, accountService, $filter, configuration, publicService) {
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
    //console.log('requestAccessTokenWithRefreshToken')

    var refresh_token = storageAPIservice.getRefreshToken();

    if (!refresh_token) {
      _signOut();
      return;
    }

    $http({
      method  : "POST",
      url     : $rootScope.server_address + 'token',
      data    : {
        'grant_type'    : 'refresh_token',
        'refresh_token' : refresh_token
      }
    }).success(function(response) {
      updateAccessToken(response);
    }).error(function(err) {
      // bad refresh_token.
      _signOut();
    })
  };

  function _signOut() {
    publicService.signOut();
  }


  function updateAccessToken(response) {
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
  }


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


  authAPI.handleConstructionErr = function() {
    $state.go('503');
  };

  authAPI.on40300Err = function() {
    $state.go('messages.home');
  };
  /**
   * Pop up alert window saying current member has been disabled from current team.
   * Keep member logged in but redirect to main.
   */
  authAPI.onCurrentMemberDisabled = function() {
    var teamName = storageAPIservice.getTeamName();
    var mainTeamAddr = configuration.main_address+'team';

    var disabledMsg = $filter('translate')('@current-member-disabled-notice-msg-pre') +
      teamName +
      $filter('translate')('@current-member-disabled-notice-msg-post');

    confirm(disabledMsg);

    location.href = mainTeamAddr;

  };

  return authAPI;
});

app.factory('authInterceptor', function ($rootScope, $q, $window, $injector, configuration, localStorageService, storageAPIservice) {
  return {
    request: function (config) {
      config.headers = config.headers || {};

      // API version
      config.headers.Accept = "application/vnd.tosslab.jandi-v"+$rootScope.api_version+"+json";

      // Add version control to 'messages/update' api.
      if (config.url.indexOf('messages/update') > 0 ) {
        config.headers.Accept = "application/vnd.tosslab.jandi-v3+json";
      }

      config.headers.authorization = "bearer " + (storageAPIservice.getAccessToken());

      return config;
    },
    responseError: function (rejection) {
      if (rejection.status === 0) {
        // net::ERR_CONNECTION_REFUSED
        // what should i do?
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
});
