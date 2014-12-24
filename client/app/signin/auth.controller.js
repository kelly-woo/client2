(function() {
    'use strict';

    angular
        .module('jandiApp')
        .controller('authController', authController);

    function authController($scope, $state, $modal, authAPIservice, analyticsService, storageAPIservice, accountService, memberService, publicService) {
        var vm = this;

        (function(){
            if (storageAPIservice.hasAccessTokenLocal() || storageAPIservice.hasAccessTokenSession()) {
                accountService.getAccountInfo()
                    .success(function(response) {
                        accountService.setAccount(response);
                        getCurrentMember();
                    })
                    .error(function(err) {

                    })
                    .finally(function() {

                    });
            }

        })();

        function getCurrentMember() {
            var account = accountService.getAccount();

            // Get information about team and member id.
            var signInInfo = accountService.getCurrentMemberId(account.memberships);

            // Now get member information for current team.
            memberService.getMemberInfo(signInInfo.memberId)
                .success(function(response) {
                    // Set local member.
                    memberService.setMember(response);

                    setStatics();

                    $state.go('messages.home');
                })
                .error(function(err) {
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
                    // Set account first.
                    accountService.setAccount(response.account);

                    // Get information about team and member id.
                    var signInInfo = accountService.getCurrentMemberId(response.account.memberships);

                    // Store all data on $window.sessionStorage only when user decides not to 'keep logged in'.
                    if (user.rememberMe) {
                        // Store token in local storage.
                        storageAPIservice.setTokenLocal(response);
                        // Store account id, team id, member id in localStorage for analytics usage.
                        storageAPIservice.setAccountInfoLocal(response.account.id, signInInfo.teamId, signInInfo.memberId);
                    }
                    else {
                        // Store token in window session.
                        storageAPIservice.setTokenSession(response);
                        // Store account id, team id, member id in session for analytics usage.
                        storageAPIservice.setAcountInfoSession(response.account.id, signInInfo.teamId, signInInfo.memberId);
                    }

                    // Now get member information for current team.
                    memberService.getMemberInfo(signInInfo.memberId)
                        .success(function(response) {
                            // Set local member.
                            memberService.setMember(response);

                            setStatics();

                            $state.go('messages.home');
                        })
                        .error(function(err) {
                            $scope.signInFailed = true;
                            storageAPIservice.removeSession();
                            storageAPIservice.removeLocal();
                            accountService.removeAccount();
                            memberService.removeMember();
                        })
                        .finally(function() {

                        });
                })
                .error(function(err) {
                    $scope.signInFailed = true;
                })
                .finally(function() {
                    $scope.toggleLoading();
                });
        };

        function setStatics() {
            var user_identify = analyticsService.getUserIdentify();

            analyticsService.mixpanelIdentify(user_identify);
            analyticsService.mixpanelTrack("Sign In");

            ga('set', 'userId', user_identify);
            ga('global_tracker.set', 'userId', user_identify);
        }


        $scope.toggleLoading = function() {
            $scope.isLoading = !$scope.isLoading;
        };
        $scope.openModal = function(selector) {
            if (selector == 'agreement') {
                publicService.openAgreementModal();
            }
            else if (selector == 'privacy') {
                publicService.openPrivacyModal();
            }
            else if (selector == 'resetPassword') {
                $modal.open({
                    scope       :   $scope,
                    templateUrl :   'app/modal/password.reset.request.html',
                    controller  :   'passwordRequestController',
                    size        :   'lg'
                })
            }
        };
    }
})();
