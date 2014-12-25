(function(){
    'use strict';

    angular
        .module('jandiApp')
        .factory('memberService', memberService);

    memberService.$inject = ['$location', 'configuration', '$http', '$rootScope', 'storageAPIservice', 'entityAPIservice', '$upload'];

    function memberService($location, configuration, $http, $rootScope, storageAPIservice, entityAPIservice, $upload) {

        var service = {
            getMemberInfo: getMemberInfo,
            updateMemberProfile: updateMemberProfile,
            updateProfilePic: updateProfilePic,
            setMember: setMember,
            getMember: getMember,
            removeMember: removeMember,
            hasSeenTutorial: hasSeenTutorial,
            getTeamId: getTeamId,
            getStarredEntities: getStarredEntities,
            getMemberId: getMemberId,
            getNameFromMember: getNameFromMember,
            getStatusMessage: getStatusMessage,
            getDepartment: getDepartment,
            getPositiion: getPositiion,
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

        function updateMemberProfile(member) {
            return $http({
                method: 'PUT',
                url: $rootScope.server_address + 'settings/profile',
                data: {
                    statusMessage   :   member.u_statusMessage,
                    phoneNumber     :   member.u_extraData.phoneNumber,
                    department      :   member.u_extraData.department,
                    position        :   member.u_extraData.position
                }
            });
        }

        function updateProfilePic(image, supportHTML) {
            var flash_url = supportHTML ? '' : 'v2/';
            return $upload.upload({
                method: 'POST',
                url: $rootScope.server_address + flash_url + 'settings/profiles/photo',
                file: image,
                fileFormDataName : 'photo'
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

        function hasSeenTutorial() {
            if (angular.isUndefined(this.getMember().u_tutoredAt) || this.getMember().u_tutoredAt === null)
                return false;
            else
                return true;
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
        function getNameFromMember(member) {
            return member.name;
        } 
        function getStatusMessage(member) {
            return member.u_statusMessage;
        } 
        function getDepartment(member) {
            return member.u_extraData.department;
        } 
        function getPositiion(member) {
            return member.u_extraData.position ;
        } 
        function getPhoneNumber(member) {
            return member.u_extraData.phoneNumber ;
        } 
        function getEmail(member) {
            return member.u_email;
        }
        function getNameById(entityId) {
            return this.getNameFromMember(entityAPIservice.getEntityFromListById($rootScope.totalEntities, entityId));
        }
        function isAuthorized() {
            return  getMember().u_authority === 'owner';
        }

    }
})();