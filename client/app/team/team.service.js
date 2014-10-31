'use strict';

var app = angular.module('jandiApp');

app.factory('teamAPIservice', function($http, $rootScope) {
    var teamAPI = {};

    teamAPI.inviteToTeam = function(inviteMembers) {
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'invitation/team',
            data    : { "inviteMembers" : inviteMembers,
                        "lang" : $rootScope.preferences.lang
                        }
        });
    };

    return teamAPI;
});
