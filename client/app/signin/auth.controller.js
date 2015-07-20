(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('authController', authController);

  /* @ngInject */
  function authController($scope, $rootScope, $state, authAPIservice, analyticsService,
                          storageAPIservice, accountService, memberService, publicService,
                          pcAppHelper, modalHelper, jndWebSocket, AnalyticsHelper, jndPubSub) {

    var vm = this;
    jndWebSocket.disconnect();


    (function(){
      publicService.hideTransitionLoading();

      // Handling users with token info in localstorage.
      // Move token info from 'local Storage' -> to 'Cookie'
      if (storageAPIservice.hasAccessTokenLocal()) {
        //console.log('hasAccessTokenLocal')
        // User has access_token in LocalStorage meaning we need to move all of token info from localStorage to Cookie.
        // So that new version of auto sign-in could work with current user.
        var newToken = {
          access_token: storageAPIservice.getAccessTokenLocal(),
          refresh_token: storageAPIservice.getRefreshTokenLocal(),
          token_type: storageAPIservice.getTokenTypeLocal()
        };

        storageAPIservice.setTokenCookie(newToken);
        storageAPIservice.setShouldAutoSignIn(true);

        storageAPIservice.removeLocal();
      }


      if (!storageAPIservice.shouldAutoSignIn() && !storageAPIservice.getAccessToken()) return;

      // Auto sign-in using cookie.
      jndPubSub.showLoading();


      accountService.getAccountInfo()
        .success(function(response) {
          //console.log('got account info')
          accountService.setAccount(response);

          publicService.setLanguageConfig();

          analyticsService.accountIdentifyMixpanel(response);
          analyticsService.accountMixpanelTrack("Sign In");

          getCurrentMember();
        })
        .error(function(err) {
          //console.log('error on getAccountinfo from authController');
          storageAPIservice.removeLocal();
          storageAPIservice.removeSession();
          storageAPIservice.removeCookie();

          jndPubSub.hideLoading();

        });
    })();

    function getCurrentMember(memberId) {
      var account = accountService.getAccount();

      var curMemberId;

      if (memberId) {
        curMemberId = memberId;
      }
      else {
        var signInInfo = accountService.getCurrentMemberId(account.memberships);
        curMemberId = signInInfo.memberId;
      }

      if (curMemberId == -1) {
        //console.log('no memberid')
        // Could not find member id that is associated with current team.
        var main_team = $scope.configuration.main_address + 'team';
        publicService.redirectTo(main_team);
        return;
      }

      storageAPIservice.setAccountInfoLocal(account.id, signInInfo.teamId, signInInfo.memberId, signInInfo.teamName);
      storageAPIservice.setShouldAutoSignIn(true);
      // Get information about team and member id.

      //console.log('getting member from server')
      // Now get member information for current team.
      memberService.getMemberInfo(curMemberId)
        .success(function(response) {
          //console.log('getMemberInfo good')
          //console.log(response)
          // Set local member.
          memberService.setMember(response);

          setStatics();

          _goToMessageHome();

          pcAppOnSignedIn();

        })
        .error(function(err) {
          //console.log('getMemberInfo bad')
          //console.log('err')
          $scope.signInFailed = true;
          publicService.signOut();
        })
        .finally(function() {

        });
    }
    $scope.user = {
      username: storageAPIservice.getLastEmail(),
      rememberMe : true
    };

    $scope.onSignIn = function(user) {

      if ($scope.isLoading) return;
      user.grant_type = "password";

      jndPubSub.showLoading();

      // TODO: HAS TO BE BETTER WAY TO DO THIS.
      authAPIservice.signIn(user)
        .success(function(response) {
          if ($rootScope.isMobile) {
            // When signing in from mobile.
            $rootScope.mobileStatus = {
              isSignedIn: true,
              access_token: response.access_token,
              refresh_token: response.refresh_token
            };
            $state.go('mobile');
            return;
          }

          // Set account first.
          accountService.setAccount(response.account);

          publicService.setLanguageConfig();

          analyticsService.accountIdentifyMixpanel(response.account);
          analyticsService.accountMixpanelTrack("Sign In");

          storageAPIservice.setTokenCookie(response);

          if (user.rememberMe) {
            storageAPIservice.setShouldAutoSignIn(true);
          }

          // Get information about team and member id.
          var signInInfo = accountService.getCurrentMemberId(response.account.memberships);

          if (signInInfo.memberId == -1) {
            //console.log('no memberid')
            // Could not find member id that is associated with current team.
            // Direct user to landing page!
            var main_team = $scope.configuration.main_address + 'team';
            publicService.redirectTo(main_team);

            storageAPIservice.removeSession();
            storageAPIservice.removeLocal();

            return;
          }

          pcAppOnSignedIn();

          // Store account id, team id, member id in localStorage for analytics usage.
          storageAPIservice.setAccountInfoLocal(response.account.id, signInInfo.teamId, signInInfo.memberId, signInInfo.teamName);

          memberService.getMemberInfo(signInInfo.memberId)
            .success(function(response) {

              // Set local member.
              memberService.setMember(response);

              setStatics();
              _goToMessageHome();
              try {
                //analytics
                AnalyticsHelper.track(AnalyticsHelper.EVENT.SIGN_IN, {
                  'RESPONSE_SUCCESS': true,
                  'AUTO_SIGN_IN': false
                });
              } catch (e) {
              }
            })
            .error(function(err) {
              //console.log(err)
              $scope.signInFailed = true;
              storageAPIservice.removeSession();
              storageAPIservice.removeLocal();
              accountService.removeAccount();
              memberService.removeMember();

              jndPubSub.hideLoading();

              try {
                //analytics
                AnalyticsHelper.track(AnalyticsHelper.EVENT.SIGN_IN, {
                  'RESPONSE_SUCCESS': false,
                  'AUTO_SIGN_IN': false,
                  'ERROR_CODE': err.code
                });
              } catch (e) {
              }
            })
            .finally(function() {

            });
        })
        .error(function(err) {
          $scope.signInFailed = true;
          jndPubSub.hideLoading();

          try {
            //analytics
            AnalyticsHelper.track(AnalyticsHelper.EVENT.SIGN_IN, {
              'RESPONSE_SUCCESS': false,
              'ERROR_CODE': err.code,
              'AUTO_SIGN_IN': false
            });
          } catch (e) {
          }
        })
        .finally(function() {
        });
    };

    function setStatics() {
      var user_identify = analyticsService.getUserIdentify();

      analyticsService.mixpanelIdentify(user_identify);
      analyticsService.mixpanelTrack("Sign In");

      ga('set', 'userId', user_identify);
      ga('global_tracker.set', 'userId', user_identify);
    }


    $scope.openModal = function(selector) {
      if (selector === 'agreement') {
        modalHelper.openAgreementModal();
      } else if (selector === 'privacy') {
        modalHelper.openPrivacyModal();
      } else if (selector === 'resetPassword') {
        modalHelper.openPasswordResetRequestModal($scope);
      }
    };

    function pcAppOnSignedIn() {
      pcAppHelper.onSignedIn();
    }

    function _goToMessageHome() {
      publicService.showTransitionLoading();
      $state.go('messages.home');
    }

  }
})();
