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

    teamAPI.updateTeamName = function(name) {
        return $http({
            method  : 'PUT',
            url     : $rootScope.server_address  + 'teams/' + $rootScope.team.id + '/name',
            data    : {
                'name'  : name
            }
        });
    };

    teamAPI.updatePrefixDomain = function(domain) {
      return $http({
          method    : 'PUT',
          url       : $rootScope.server_address  + 'teams/' + $rootScope.team.id + '/domain',
          data      : {
              'domain'  : domain,
              'lang'    : $rootScope.preferences.serverLang
          }
      });
    };

    teamAPI.deleteTeam = function() {
        return $http({
            method  : 'DELETE',
            url     : $rootScope.server_address  + 'teams/' + $rootScope.team.id,
            data    : {
                'lang'    : $rootScope.preferences.serverLang
            }
        });
    };

    return teamAPI;
});
