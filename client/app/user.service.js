'use strict';

var app = angular.module('jandiApp');

app.factory('userAPIservice', function($http, $rootScope, $filter, $upload) {
    var userAPI = {};

    userAPI.updateUserProfile = function(user) {
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

    userAPI.updateProfilePic = function(image) {
        return $upload.upload({
            method: 'POST',
            url: $rootScope.server_address + 'settings/profiles/photo',
            file: image,
            fileFormDataName : 'photo'
        });
    };


    function getEntityFromListById(list, value) {
        if (value == $rootScope.user.id) return $rootScope.user;

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
        if ($rootScope.displayNickname)
            return getNickname(user);

        return getFullName(user);
    };

    function getFullName(user) {
        return user.u_lastName + user.u_firstName;
    }

    function getNickname(user) {
        return user.u_nickname;
    }

    return userAPI;
});
