/**
 * @fileoverview Auth API 서비스
 * @author young.park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .factory('AuthApi', AuthApi);

  function AuthApi($http, $rootScope, $state, storageAPIservice, accountService, publicService) {
    var authAPI = {};
    var _isRefreshTokenLock = false;

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


    /**
     * refresh token 으로 access token 을 조회한다.
     * @important 특별한 경우가 아니라면 Auth.requestAccessTokenWithRefreshToken() 을 사용하길 권장한다.
     */
    authAPI.requestAccessTokenWithRefreshToken = function() {
      var refreshToken = storageAPIservice.getRefreshToken();
      if (!refreshToken) {
        publicService.signOut();
      } else {
        return $http({
          method  : "POST",
          url     : $rootScope.server_address + 'token',
          data    : {
            'grant_type'    : 'refresh_token',
            'refresh_token' : refreshToken
          }
        }).success(_.bind(_onSuccessAccessTokenWithRefreshToken, this, refreshToken))
          .error(publicService.signOut);
      }
    };

    /**
     * refresh token 성공 콜백
     * @param {string} refreshToken
     * @param {object} response
     * @private
     */
    function _onSuccessAccessTokenWithRefreshToken(refreshToken, response) {
      response.refresh_token = refreshToken;
      storageAPIservice.setTokenCookie(response);
    }

    authAPI.handleConstructionErr = function() {
      $state.go('503');
    };

    authAPI.on40300Err = function() {
      $state.go('messages.home');
    };

    return authAPI;
  }
})();
