'use strict';

var app = angular.module('jandiApp');

app.factory('userAPIservice', function($http, $rootScope, $filter, $upload) {
    var userAPI = {};

    userAPI.updateUserProfile = function(user) {
        return $http({
            method: 'PUT',
            url: $rootScope.server_address + 'settings/profile',
            data: {
                statusMessage   :   user.u_statusMessage,
                phoneNumber     :   user.u_extraData.phoneNumber,
                department      :   user.u_extraData.department,
                position        :   user.u_extraData.position
            }
        });
    };

    userAPI.updateProfilePic = function(image) {
        return $upload.upload({
            method: 'POST',
            url: $rootScope.server_address + 'settings/profiles/photo',
            file: image,
            fileFormDataName : 'photo'
        });
    };


    function getEntityFromListById(list, value) {
        value = parseInt(value);

        if (value === $rootScope.user.id) return $rootScope.user;



        var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
            return actual === expected;
        });

        if (angular.isUndefined(entity) || entity.length != 1) return;

        return entity[0];
    }

    userAPI.getNameFromUserId = function(userId) {
        return this.getNameFromUser(getEntityFromListById($rootScope.userList, userId));
    };

    userAPI.getNameFromUser = function(user) {
        return user.name;
    };

    userAPI.getStatusMessage = function(user) {
        return user.u_statusMessage;
    };

    userAPI.getDepartment = function(user) {
        return user.u_extraData.department;
    };
    userAPI.getPositiion = function(user) {
        return user.u_extraData.position ;
    };
    userAPI.getPhoneNumber = function(user) {
        return user.u_extraData.phoneNumber ;
    };
    userAPI.getEmail = function(user) {
        return user.u_email;
    };


    userAPI.validateCurrentPassword = function(cur_password) {
        cur_password = cur_password || '';
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'validation/password',
            data    : {
                password: cur_password
            }
        });
    };

    userAPI.updateUserName = function(new_name) {
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'settings/name',
            data    : {
                name    : new_name
            }
        });
    };

    userAPI.updatePassword = function(new_password) {
        if (!new_password) return;
        return $http({
            method  : 'POST',
            url     : $rootScope.server_address + 'settings/password',
            data    : {
                password: new_password
            }
        });
    };

    return userAPI;
});
