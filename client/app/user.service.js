'use strict';

var app = angular.module('jandiApp');

app.factory('userAPIservice', function($http, $rootScope, $filter) {
    var userAPI = {};

    userAPI.updateUserProfile = function(user) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'settings/profile',
            data: {
                firstName   :   user.u_firstName,
                lastName    :   user.u_lastName,
                name        :   user.name,
                phoneNumber :   user.u_extraData.phoneNumber,
                department  :   user.u_extraData.department,
                position    :   user.u_extraData.position
            }
        });
    };

    return userAPI;
});
