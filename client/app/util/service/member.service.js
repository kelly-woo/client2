(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('memberService', memberService);

  memberService.$inject = ['$http', '$rootScope', 'storageAPIservice', 'entityAPIservice', '$upload'];

  function memberService($http, $rootScope, storageAPIservice, entityAPIservice, $upload) {
    var noUExtraData = "i dont have u_extraData";
    var currentMember;

    var service = {
      updateCurrentMember: updateCurrentMember,
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
      isAuthorized: isAuthorized,
      getSmallThumbnailUrl: getSmallThumbnailUrl,
      getMediumThumbnailUrl: getMediumThumbnailUrl,
      getLargeThumbnailUrl: getLargeThumbnailUrl,
      getPhotoUrl: getPhotoUrl,

      getDefaultPhotoUrl: getDefaultPhotoUrl
    } ;


    return service;

    function updateCurrentMember() {
      return this.getMemberInfo(this.getMemberId());
    }

    function getMemberInfo(memberId) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'account/members/' + memberId
      });
    }
    function setMember(member) {
      currentMember = member;
      $rootScope.member = member;
      storageAPIservice.setLastEmail(member.u_email);
    }
    function getMember() {
      return currentMember;
    }
    function removeMember() {
      currentMember = null;
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
      return currentMember.teamId;
    }
    function getStarredEntities() {
      return currentMember.u_starredEntities;
    }
    function getMemberId() {
      return currentMember.id;
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
      return  currentMember.u_authority === 'owner';
    }

    function getSmallThumbnailUrl(member) {
      if (_isNumber(member)) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member)
      }
      return member.u_photoThumbnailUrl.smallThumbnailUrl || getPhotoUrl(member);
    }
    function getMediumThumbnailUrl(member) {
      if (_isNumber(member)) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member)
      }
      return member.u_photoThumbnailUrl.MediumThumbnailUrl || getPhotoUrl(member);
    }
    function getLargeThumbnailUrl(member) {
      if (_isNumber(member)) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member)
      }
      return member.u_photoThumbnailUrl.largeThumbnailUrl || getPhotoUrl(member);
    }
    function getPhotoUrl(member) {
      return member.u_photoUrl;
    }

    function _isNumber(member) {
      return (typeof member == 'number')
    }

    // TODO: TO BE IMPLEMENTED.
    function getDefaultPhotoUrl() {

    }

  }
})();