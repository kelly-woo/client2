(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('authController', authController);

  authController.$inject = ['$scope', '$rootScope', '$state', '$modal', 'authAPIservice', 'analyticsService', 'storageAPIservice', 'accountService', 'memberService', 'publicService'];

  function authController($scope, $rootScope, $state, $modal, authAPIservice, analyticsService, storageAPIservice, accountService, memberService, publicService) {

    var vm = this;

    $scope.toggleLoading = function() {
      $scope.isLoading = !$scope.isLoading;
    };

    (function(){
      // Handling users with token info in localstorage.
      // Move token info from 'local Storage' -> to 'Cookie'
      if (storageAPIservice.hasAccessTokenLocal()) {
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

      if (!storageAPIservice.shouldAutoSignIn()) {
        storageAPIservice.removeLocal();
        storageAPIservice.removeSession();
        storageAPIservice.removeCookie();
        return;
      }

      // Auto sign-in using cookie.
      if (storageAPIservice.shouldAutoSignIn() || storageAPIservice.isValidValue(storageAPIservice.hasAccessTokenSession())) {
        $scope.toggleLoading();

        //console.log('trying to auto sign in')

        accountService.getAccountInfo()
          .success(function(response) {
            //console.log('got account info')
            accountService.setAccount(response);
            analyticsService.accountIdentifyMixpanel(response);
            analyticsService.accountMixpanelTrack("Sign In");

            getCurrentMember();
          })
          .error(function(err) {
            console.log('error on getAccountinfo from authController');
            storageAPIservice.removeLocal();
            storageAPIservice.removeSession();
            storageAPIservice.removeCookie();
            $scope.toggleLoading();
          });
      }

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

      //console.log(signInInfo)
      if (curMemberId == -1) {
        console.log('no memberid')
        // Could not find member id that is associated with current team.
        var main_team = $scope.configuration.main_address + 'team';
        publicService.redirectTo(main_team);
        return;
      }

      storageAPIservice.setAccountInfoLocal(account.id, signInInfo.teamId, signInInfo.memberId);
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

          $state.go('messages.home');
        })
        .error(function(err) {
          console.log('getMemberInfo bad')
          console.log('err')
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

      $scope.toggleLoading();

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

          publicService.getLanguageSetting();
          publicService.setCurrentLanguage();

          analyticsService.accountIdentifyMixpanel(response.account);
          analyticsService.accountMixpanelTrack("Sign In");

          storageAPIservice.setTokenCookie(response);

          if (user.rememberMe) {
            storageAPIservice.setShouldAutoSignIn(true);
          }

          // Get information about team and member id.
          var signInInfo = accountService.getCurrentMemberId(response.account.memberships);

          if (signInInfo.memberId == -1) {
            console.log('no memberid')
            // Could not find member id that is associated with current team.
            // Direct user to landing page!
            var main_team = $scope.configuration.main_address + 'team';
            publicService.redirectTo(main_team);

            storageAPIservice.removeSession();
            storageAPIservice.removeLocal();

            return;
          }

          // Store account id, team id, member id in localStorage for analytics usage.
          storageAPIservice.setAccountInfoLocal(response.account.id, signInInfo.teamId, signInInfo.memberId);

          memberService.getMemberInfo(signInInfo.memberId)
            .success(function(response) {
              // Set local member.
              memberService.setMember(response);

              setStatics();

              $state.go('messages.home');
            })
            .error(function(err) {
              console.log(err)
              $scope.signInFailed = true;
              storageAPIservice.removeSession();
              storageAPIservice.removeLocal();
              accountService.removeAccount();
              memberService.removeMember();

              $scope.toggleLoading();

            })
            .finally(function() {

            });
        })
        .error(function(err) {
          $scope.signInFailed = true;
          $scope.toggleLoading();
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
      if (selector == 'agreement') {
        publicService.openAgreementModal();
      }
      else if (selector == 'privacy') {
        publicService.openPrivacyModal();
      }
      else if (selector == 'resetPassword') {
        publicService.openPasswordResetRequestModal($scope);
      }
    };

  }
})();
