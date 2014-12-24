'use strict';

var app = angular.module('jandiApp');

app.factory('userAPIservice', function($http, $rootScope, $filter, $upload, memberService) {
    var userAPI = {};


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

        console.log(list, value)
        if (value === $rootScope.member.id) return $rootScope.member;



        var entity = $filter('filter')(list, { 'id' : value }, function(actual, expected) {
            return actual === expected;
        });

        if (angular.isUndefined(entity) || entity.length != 1) return;

        return entity[0];
    }

    userAPI.getNameFromUserId = function(userId) {
        return memberService.getNameFromMember(getEntityFromListById($rootScope.memberList, userId));
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

    userAPI.isAuthorized = function() {
        return  memberService.getMember().u_authority === 'owner'
    };

    userAPI.getUserLanguage = function() {
        if ($rootScope.preferences.serverLang == 'ko')
            return 'ko';

        return 'en'
    };

    return userAPI;
});
