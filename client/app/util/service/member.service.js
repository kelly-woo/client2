(function(){
    'use strict';

    angular
        .module('jandiApp')
        .factory('memberService', memberService);

    memberService.$inject = ['$location', 'configuration', '$http', '$rootScope', 'storageAPIservice', 'entityAPIservice', '$upload'];

    function memberService($location, configuration, $http, $rootScope, storageAPIservice, entityAPIservice, $upload) {
        var noUExtraData = "i dont have u_extraData";

        var service = {
            getMemberInfo: getMemberInfo,
            setMember: setMember,
            getMember: getMember,
            removeMember: removeMember,
            updateProfilePic: updateProfilePic,
            updateProfile: updateProfile,
            getTeamId: getTeamId,
            getStarredEntities: getStarredEntities,
            getMemberId: getMemberId,
            getName: getName,
            setName: setName,
            setEmail: setEmail,
            getStatusMessage: getStatusMessage,
            getDepartment: getDepartment,
            getPosition: getPosition,
            getPhoneNumber: getPhoneNumber,
            getEmail: getEmail,
            getNameById: getNameById,
            isAuthorized: isAuthorized
        } ;

        return service;

        function getMemberInfo(memberId) {
            return $http({
                method: 'GET',
                url: $rootScope.server_address + 'account/members/' + memberId
            });
        }
        function setMember(member) {
            $rootScope.member = member;
            storageAPIservice.setLastEmail(member.u_email);
        }
        function getMember() {
            return $rootScope.member;
        }
        function removeMember() {
            $rootScope.member = null;
        }

        function updateProfilePic(image, supportHTML) {
            var flash_url = supportHTML ? '' : 'v2/';
            return $upload.upload({
                method: 'PUT',
                url: $rootScope.server_address + flash_url + 'members/' + this.getMemberId() + '/profile/photo',
                file: image,
                fileFormDataName : 'photo'
            });
        }
        function updateProfile(member) {
            return $http({
                method: 'PUT',
                url: $rootScope.server_address + 'members/' + this.getMemberId() + '/profile',
                data: {
                    statusMessage   :   member.u_statusMessage,
                    phoneNumber     :   member.u_extraData.phoneNumber,
                    department      :   member.u_extraData.department,
                    position        :   member.u_extraData.position
                }
            });

        }
        function getTeamId() {
            if (angular.isUndefined(this.getMember())) {
                return storageAPIservice.getTeamIdLocal() || storageAPIservice.getTeamIdSession();
            }
            return this.getMember().teamId;
        }
        function getStarredEntities() {
            return this.getMember().u_starredEntities;
        }
        function getMemberId() {
            return this.getMember().id;
        }
        function getName(member) {
            if (angular.isUndefined(member)) return 'deactivated user';
            return member.name;
        }
        function setName(name) {
            return $http({
                method: 'PUT',
                url: $rootScope.server_address + 'members/' + this.getMemberId() + '/name',
                data: {
                    name: name
                }
            });
        }
        function setEmail(email) {
            return $http({
                method: 'PUT',
                url: $rootScope.server_address + 'members/' + this.getMemberId() + '/email',
                data: {
                    email: email
                }
            });

        }
        function getEmail(member) {
            return member.u_email;
        }
        function getStatusMessage(member) {
            return member.u_statusMessage;
        }


        function getPhoneNumber(member) {
            if (angular.isUndefined(member.u_extraData)) return noUExtraData;
            return member.u_extraData.phoneNumber || '';
        }
        function getDepartment(member) {
            if (angular.isUndefined(member.u_extraData)) return noUExtraData;
            return member.u_extraData.department || '';
        } 
        function getPosition(member) {
            if (angular.isUndefined(member.u_extraData)) return noUExtraData;
            return member.u_extraData.position || '';
        } 

        function getNameById(entityId) {
            return this.getName(entityAPIservice.getEntityFromListById($rootScope.totalEntities, entityId));
        }
        function isAuthorized() {
            return  getMember().u_authority === 'owner';
        }
    }
})();