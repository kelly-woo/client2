'use strict';

var app = angular.module('jandiApp');

app.factory('userAPIservice', function($http, $rootScope, $filter) {
    var userAPI = {};

    userAPI.updateUserProfile = function(user) {
        console.log(user)
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'settings/profile',
            data: {
                nickname    :   user.u_nickname,
                phoneNumber :   user.u_extraData.phoneNumber,
                department  :   user.u_extraData.department,
                position    :   user.u_extraData.position
            }
        });
    };

    return userAPI;
});
