(function() {
    'use strict';

    angular
        .module('jandiApp')
        .controller('authController', authController);

        authController.$inject = ['$scope', '$state', '$modal', 'authAPIservice', 'analyticsService', 'storageAPIservice', 'accountService', 'memberService', 'publicService'];

        function authController($scope, $state, $modal, authAPIservice, analyticsService, storageAPIservice, accountService, memberService, publicService) {

        var vm = this;

        $scope.toggleLoading = function() {
            $scope.isLoading = !$scope.isLoading;
        };

        (function(){
            //console.log('authController')
            if (storageAPIservice.shoudAutoSignIn()) {
                $scope.toggleLoading();

                //console.log('trying to auto sign in')

                accountService.getAccountInfo()
                    .success(function(response) {
                        //console.log('got account info')
                        //console.log(response)

                        accountService.setAccount(response);
                        getCurrentMember();
                    })
                    .error(function(err) {
                        console.log('error on getAccountinfo from authController')
                    })
                    .finally(function() {
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
                publicService.signOut();
                $scope.toggleLoading();

                return;
            }

            storageAPIservice.setAccountInfoLocal(account.id, signInInfo.teamId, signInInfo.memberId);
            storageAPIservice.setShouldAutoSignIn(true);
            // Get information about team and member id.

            console.log('getting member from server')
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
                    // Set account first.
                    accountService.setAccount(response.account);

                    //console.log('signin success');
                    //console.log(response.account)

                    // Get information about team and member id.
                    var signInInfo = accountService.getCurrentMemberId(response.account.memberships);

                    if (signInInfo.memberId == -1) {
                        console.log('no memberid')
                        // Could not find member id that is associated with current team.
                        $scope.signInFailed = true;
                        storageAPIservice.removeSession();
                        storageAPIservice.removeLocal();
                        accountService.removeAccount();
                        memberService.removeMember();
                        return;
                    }

                    // Store all data on $window.sessionStorage only when user decides not to 'keep logged in'.
                    if (user.rememberMe) {
                        // User tends to 'keep logged in'. So tokenInfo should be available in different team domain.

                        // Store token in local storage.
                        //storageAPIservice.setTokenLocal(response);

                        // Store account id, team id, member id in localStorage for analytics usage.
                        storageAPIservice.setAccountInfoLocal(response.account.id, signInInfo.teamId, signInInfo.memberId);
                        storageAPIservice.setAccessTokenLocalCookie(response);
                        storageAPIservice.setShouldAutoSignIn(true);
                    }
                    else {
                        // Store token in window session.
                        storageAPIservice.setTokenSession(response);
                        // Store account id, team id, member id in session for analytics usage.
                        storageAPIservice.setAcountInfoSession(response.account.id, signInInfo.teamId, signInInfo.memberId);
                    }

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
