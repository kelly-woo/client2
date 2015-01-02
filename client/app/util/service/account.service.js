(function(){
    'use strict';

    angular
        .module('jandiApp')
        .factory('accountService', accountService);

    accountService.$inject = ['$location', 'configuration', '$http', '$rootScope', 'storageAPIservice'];

    function accountService($location, configuration, $http, $rootScope) {
        var accountLanguage;

        var service = {
            getAccountInfo: getAccountInfo,
            getAccount: getAccount,
            setAccount: setAccount,
            removeAccount: removeAccount,
            getCurrentMemberId: getCurrentMemberId,
            hasSeenTutorial: hasSeenTutorial,
            getAccountLanguage: getAccountLanguage
        };

        return service;

        function getAccountInfo() {
            return $http({
                method: 'GET',
                url: $rootScope.server_address + 'account'
            });
        }

        function getAccount() {
            return $rootScope.account;
        }
        function setAccount(account) {
            $rootScope.account = account;
            accountLanguage = account.lang;
        }
        function removeAccount() {
            $rootScope.account = null;
        }
        // TODO: CURRENTLY THIS IS O(N) ALGORITHM.  WHEN FOUND MATCH, BREAK OUT OF FOR LOOP AND RETURN RIGHT AWAY!
        // Returns memberId of current team from Account.
        function getCurrentMemberId(memberships) {
            var signInInfo = {
                memberId    : -1,
                teamId      : -1
            };

            var prefix = $location.host().split('.')[0];
            if (configuration.name == 'development') {
                if (prefix == 'local') {
                    prefix = 'tosslab'
                    //prefix = 'jihoon'
                }
            }

            console.log(prefix)

            _.forEach(memberships, function(membership, index) {
                if (membership.t_domain == prefix) {
                    signInInfo.memberId = membership.memberId;
                    signInInfo.teamId   = membership.teamId;
                }
            });
            return signInInfo;
        }
        function hasSeenTutorial() {
            if (angular.isUndefined(getAccount().tutoredAt) || getAccount().tutoredAt === null)
                return false;
            else
                return true;
        }


        function getAccountLanguage() {
            return accountLanguage || $rootScope.preferences.serverLang;
        }
    }
})();