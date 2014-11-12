'use strict';

var app = angular.module('jandiApp');

app.factory('teamAPIservice', function($http, $rootScope) {
    var teamAPI = {};

    teamAPI.inviteToTeam = function(inviteMembers) {
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'invitation/team',
            data    : { "inviteMembers" : inviteMembers }
        });
    };

    teamAPI.prefixDomainValidator = function(prefixDomain) {
        if (!prefixDomain) return;
        return $http({
            method : 'GET',
            url : $rootScope.server_address + 'validation/domain/' + prefixDomain
        });
    };

    return teamAPI;
});
