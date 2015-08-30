'use strict';

var app = angular.module('jandiApp');

app.factory('authAPIservice', function($http, $rootScope, $state, $location, storageAPIservice,
                                       accountService, $filter, configuration, publicService, Dialog) {
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

  /**
   * When signed out, account variable under $rootScope gets deleted.
   * Thus, when there is account under $rootScope, it means user stays signed in.
   *
   * @returns {boolean}
   */
  authAPI.isSignedIn = function() {
    return accountService.hasAccount();
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
      updateAccessToken(response, refresh_token);
    }).error(function(err) {
      // bad refresh_token.
      _signOut();
    })
  };

  function _signOut() {
    publicService.signOut();
  }


  function updateAccessToken(response, refresh_token) {
    response.refresh_token = refresh_token;
    storageAPIservice.setTokenCookie(response);

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
      teamName + ' ' +
      $filter('translate')('@current-member-disabled-notice-msg-post');

    Dialog.toast('warning', {
      title: disabledMsg,
      onClose: function() {
        location.href = mainTeamAddr;
      }
    });
  };

  return authAPI;
});
