'use strict';

var app = angular.module('jandiApp');

app.controller('authController', function($scope, $state, $window, $location, $modal, loginAPI, localStorageService, analyticsService, storageAPIservice, userAPIservice) {

    // local test purpose
    var localHost = false;

    $scope.hasToken = true;

    $scope.error = {
        status      : false,
        messsage    : ''
    };

    $scope.teamInfo = {
        id          : -1,
        name        : ''
    };

    $scope.logout = function() {
        removeAccessInfo();
        mixpanel.cookie.clear();
        $state.go('signin');
    };

    $scope.signin = function(user) {
        user.grant_type = "password";
        user.username = user.email;

        loginAPI.login(user)
            .success(function(data) {
                console.info(
                    'sign in good'
                );

                var memberId = getCurrentMemberId(data.account.memberships, $scope.teamInfo.id);

                // If localStorage has all info, there is no need to store exact same info on $window.sessionStorage.
                // Store all data on $window.sessionStorage only when user decides not to 'keep logged in'.
                if (user.rememberMe) {

                    // Store token in local storage.
                    storageAPIservice.setTokenLocal(data);

                    // Store account id, team id, member id in localStorage for analytics usage.
                    storageAPIservice.setAccountInfoLocal(data.account.id, $scope.teamInfo.id, memberId);
                }
                else {

                    // Store token in window session.
                    storageAPIservice.setTokenSession(data);
                    // Store account id, team id, member id in session for analytics usage.
                    storageAPIservice.setAcountInfoSession(data.account.id, $scope.teamInfo.id, memberId);

                }

                // TODO: store token in cookie.
                //storageAPIservice.setTokenCookie(data);

                autoLogin();

            }).error(function(err) {
                $scope.error.status = true;
                $scope.error.message = err.message;

                $scope.user.password = "";

                removeAccessInfo();

                return false;
            });
    };


    // Returns memberId of current team from Account.
    function getCurrentMemberId(memberships, teamId) {
        var memberId = -1;
        _.forEach(memberships, function(membership) {
            if (membership.teamId == teamId) {
                memberId = membership.memberId;
                return false;
            }
        });

        return memberId;
    }

    onSignInEnter();

    // Entry point.
    // EVERYTHING STARTS FROM HERE.
    function onSignInEnter() {
        //if (storageAPIservice.hasAccessTokenLocal()) {
        //    // User has localStorage.
        //    // Import all necessary info.
        //    setTokenSessionStorage();
        //
        //    autoLogin();
        //    return;
        //}

        //if (storageAPIservice.hasAccessTokenSession()) {
        //    // User has alive session.
        //    // Just proceed to next step.
        //    autoLogin();
        //    return;
        //}

        getTeamInfo();

        $scope.user = {
            email       : '',
            password    : '',
            rememberMe  : true
        };
        var testing = true;
        if (testing) {
            $scope.user.password = '123456aB';
            $scope.user.email = 'jihoonk@tosslab.com'
            $scope.user.rememberMe = false;
        }
        $scope.testing = testing;

        removeAccessInfo();

        $scope.hasToken = false;

    }

    // 최초 로드시 팀정보 받아오기
    function getTeamInfo() {
        var prefix = getPrefix();

        if (prefix === 'local' || prefix === 'dev') {
            if (localHost) prefix = 'tosslab';
            else prefix = 'abcd';
        }

        loginAPI.getTeamInfo(prefix)
            .success(function(data) {
                $scope.teamInfo.id = data.teamInfo.teamId;
                $scope.teamInfo.name = data.teamInfo.name;
            })
            .error(function(err) {
                console.error(err);

                removeAccessInfo();

                $state.go('404');
            });
    }

    // Retrieves prefix of current URL.
    function getPrefix() {
        return $location.host().split('.')[0];
    }


    // Import all necessary data from 'localstorage' to '$window.sessionStorage'.
    function setTokenSessionStorage() {
        var tokenData = {
            'access_token'  : storageAPIservice.getAccessTokenLocal(),
            'refresh_token' : storageAPIservice.getRefreshTokenLocal(),
            'token_type'    : storageAPIservice.getTokenTypeLocal()
        };
        storageAPIservice.setTokenSession(tokenData);
    }

    function autoLogin() {
        setStatics();
        $state.go('messages.home');
    }

    function setStatics() {
        var user_identify = getUserIdentify();

        analyticsService.mixpanelIdentify(user_identify);
        analyticsService.mixpanelTrack("Sign In");

        ga('set', 'userId', user_identify);
        ga('global_tracker.set', 'userId', user_identify);
    }

    // Generate 'memberId-teamId' format string for google analytics.
    function getUserIdentify() {
        return (storageAPIservice.getMemberIdLocal() || storageAPIservice.getMemberIdSession()) + '-' + (storageAPIservice.getTeamIdLocal() || storageAPIservice.getTeamIdSession());
    }

    // Removes all token related info in both 'LocalStorage' and '$window.sessionStorage'.
    function removeAccessInfo() {
        storageAPIservice.removeSession();
        storageAPIservice.removeLocal();
    }

    $scope.openModal = function(selector) {
        if (selector == 'agreement') {

            var agreement = 'app/modal/terms/agreement';
            agreement = agreement + '_' + userAPIservice.getUserLanguage() + '.html';

            $modal.open({
                scope       :   $scope,
                templateUrl :   agreement,
                size        :   'lg'
            });
        }
        else if (selector == 'privacy') {
            var privacy = 'app/modal/terms/privacy';
            privacy = privacy + '_' + userAPIservice.getUserLanguage() + '.html';

            $modal.open({
                scope       :   $scope,
                templateUrl :   privacy,
                size        :   'lg'
            });
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

});
