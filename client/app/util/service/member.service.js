/**
 * @fileoverview 멤버 entitiy와 관련된 api의 집합소.
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function(){
  'use strict';

  angular
    .module('jandiApp')
    .factory('memberService', memberService);

  /* @ngInject */
  function memberService($http, $rootScope, storageAPIservice, entityAPIservice, $upload, jndPubSub) {
    var noUExtraData = "i dont have u_extraData";
    var currentMember;

    var service = {
      updateCurrentMember: updateCurrentMember,

      updateProfilePic: updateProfilePic,
      updateProfile: updateProfile,

      getMemberInfo: getMemberInfo,
      setMember: setMember,
      getMember: getMember,
      removeMember: removeMember,

      getTeamId: getTeamId,
      getMemberId: getMemberId,

      getStarredEntities: getStarredEntities,

      setName: setName,
      getName: getName,
      setEmail: setEmail,
      getEmail: getEmail,

      getStatusMessage: getStatusMessage,
      getDepartment: getDepartment,
      getPosition: getPosition,
      getPhoneNumber: getPhoneNumber,

      isAuthorized: isAuthorized,

      getSmallThumbnailUrl: getSmallThumbnailUrl,
      getMediumThumbnailUrl: getMediumThumbnailUrl,
      getLargeThumbnailUrl: getLargeThumbnailUrl,
      getPhotoUrl: getPhotoUrl,

      getNameById: getNameById,


      onMemberProfileUpdated: onMemberProfileUpdated,

      getDefaultPhotoUrl: getDefaultPhotoUrl
    };


    return service;

    /**
     * 현재 로그인되어 있는 멤버의 정보를 서버로부터 새로 받아서 넘겨준다.
     * @returns {object}
     */
    function updateCurrentMember() {
      return this.getMemberInfo(this.getMemberId());
    }

    /**
     * 현재 멤버의 프로필 사진을 업데이트한다.
     * @param {file} image image file
     * @param {boolean} supportHTML html5 file upload 를 support 하는지 안하는지 알려주는 flag
     * @returns {*}
     */
    function updateProfilePic(image, supportHTML) {
      var flash_url = supportHTML ? '' : 'v2/';
      return $upload.upload({
        method: 'PUT',
        url: $rootScope.server_address + flash_url + 'members/' + this.getMemberId() + '/profile/photo',
        file: image,
        fileFormDataName : 'photo'
      });
    }

    /**
     * 멤버 정보를 업데이트한다.
     * @param {object} member 업데이트 할 멤버
     * @returns {*}
     */
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

    /**
     * 현재 로그인되있는 멤버정보를 설정한다.
     * @param {object} member 새로 설정되어질 member
     */
    function setMember(member) {
      currentMember = member;
      $rootScope.member = member;
      storageAPIservice.setLastEmail(member.u_email);
      jndPubSub.pub('onCurrentMemberChanged');
    }

    /**
     * 현재 멤버를 리턴한다.
     * @returns {*}
     */
    function getMember() {
      return currentMember;
    }

    /**
     * 현재 멤버를 지운다.
     */
    function removeMember() {
      currentMember = null;
    }

    /**
     * 현재 팀의 아이디를 리턴한다.
     * @returns {*}
     */
    function getTeamId() {
      if (angular.isUndefined(this.getMember())) {
        return storageAPIservice.getTeamIdLocal() || storageAPIservice.getTeamIdSession();
      }
      return currentMember.teamId;
    }

    /**
     * 현재 멤버의 아이디를 리턴한다.
     * @returns {*}
     */
    function getMemberId() {
      return currentMember.id;
    }

    /**
     * 현재 맴버의 '스타' 된 엔티티들을 리턴한다.
     * @returns {*}
     */
    function getStarredEntities() {
      return currentMember.u_starredEntities;
    }

    /**
     * 현재 멤버가 팀의 'owner' 인지 아닌지 알아본다.
     * @returns {boolean}
     */
    function isAuthorized() {
      return  currentMember.u_authority === 'owner';
    }

    /**
     * memberId 를 id 로 가지고 있는 user entity를 서버로부터 받아온다.
     * @param {number} memberId - id
     * @returns {object} member - member entity
     */
    function getMemberInfo(memberId) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'account/members/' + memberId
      });
    }

    /**
     * 현재 멤버의 이름을 새로 지정한다.
     * @param {string} name 새로 지정할 이름
     * @returns {*}
     */
    function setName(name) {
      return $http({
        method: 'PUT',
        url: $rootScope.server_address + 'members/' + this.getMemberId() + '/name',
        data: {
          name: name
        }
      });
    }

    /**
     * 멤버의 이름을 리턴한다.
     * @param {object} member 이름을 추출할 멤버
     * @returns {string} 이름
     */
    function getName(member) {
      if (angular.isUndefined(member)) return 'deactivated user';
      return member.name;
    }

    /**
     * 현재 멤버의 이메일을 새로 지정한다.
     * @param {string} email 새로 지정할 이메일
     * @returns {*}
     */
    function setEmail(email) {
      return $http({
        method: 'PUT',
        url: $rootScope.server_address + 'members/' + this.getMemberId() + '/email',
        data: {
          email: email
        }
      });
    }

    /**
     * 멤버의 이메일을 리턴한다.
     * @param {object} member - 리턴할 이메일의 주인
     * @returns {string} email - member 의 이메일
     */
    function getEmail(member) {
      return member.u_email;
    }

    /**
     * 멤버의 상태 메세지를 리턴한다.
     * @param {string} member - 리턴할 상태메세지의 주인
     * @returns {string} statusMessage - member 의 상태 메세지
     */
    function getStatusMessage(member) {
      return member.u_statusMessage;
    }

    /**
     * 멤버의 전화번호를 리턴한다.
     * @param {object} member - 전화번호를 추출할 멤버
     * @returns {string} phoneNumber - member 의 전화번호
     */
    function getPhoneNumber(member) {
      if (angular.isUndefined(member.u_extraData)) return noUExtraData;
      return member.u_extraData.phoneNumber || '';
    }

    /**
     * 멤버의 부서를 리턴한다.
     * @param {object} member - 부서를 추출할 멤버
     * @returns {string} department - member 의 부서
     */
    function getDepartment(member) {
      if (angular.isUndefined(member.u_extraData)) return noUExtraData;
      return member.u_extraData.department || '';
    }

    /**
     * 멤버의 직급를 리턴한다.
     * @param {object} member - 직급를 추출할 멤버
     * @returns {string} position - member 의 직급
     */
    function getPosition(member) {
      if (angular.isUndefined(member.u_extraData)) return noUExtraData;
      return member.u_extraData.position || '';
    }

    /**
     * 멤버 프로필 사진의 small thumbnail 주소를 리턴한다.
     * @param {object} member - 프로필 사진의 주인
     * @returns {string} url - small thumbnail url
     */
    function getSmallThumbnailUrl(member) {
      if (_isNumber(member)) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member)
      }
      return member.u_photoThumbnailUrl.smallThumbnailUrl || getPhotoUrl(member);
    }

    /**
     * 멤버 프로필 사진의 medium thumbnail 주소를 리턴한다.
     * @param {object} member - 프로필 사진의 주인
     * @returns {string} url - medium thumbnail url
     */
    function getMediumThumbnailUrl(member) {
      if (_isNumber(member)) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member)
      }
      return member.u_photoThumbnailUrl.MediumThumbnailUrl || getPhotoUrl(member);
    }

    /**
     * 멤버 프로필 사진의 large thumbnail 주소를 리턴한다.
     * @param {object} member - 프로필 사진의 주인
     * @returns {string} url - large thumbnail url
     */
    function getLargeThumbnailUrl(member) {
      if (_isNumber(member)) {
        member = entityAPIservice.getEntityFromListById($rootScope.memberList, member)
      }
      return member.u_photoThumbnailUrl.largeThumbnailUrl || getPhotoUrl(member);
    }

    /**
     * 현재 멤버의 프로필 사진 주소를 리턴한다.
     * @param {object} member - 프로필 사진의 주인
     * @returns {string} url - profile photo url
     */
    function getPhotoUrl(member) {
      return member.u_photoUrl;
    }

    /**
     * 아이디를 사용해 해당하는 유저의 이름을 리턴한다.
     * @param {number} entityId - 아이디
     * @returns {string} name - 아이디를 가진 유져의 이름
     */
    function getNameById(entityId) {
      return this.getName(entityAPIservice.getEntityFromListById($rootScope.totalEntities, entityId));
    }

    /**
     * 현재 멤버의 프로필이 변경됐다는 소켓이벤트가 오면 호출된다.
     */
    function onMemberProfileUpdated() {
      getMemberInfo(getMemberId())
        .success(function(response) {
          setMember(response);
        })
        .error(function(err) {
          // Do nothing. Pretend like nothing happened.
        })
    }

    // TODO: TO BE IMPLEMENTED.
    function getDefaultPhotoUrl() {

    }

    /**
     * member 가 숫자인지 아닌지 알아본다.
     * @param {*} member - 진위 여부 대상
     * @returns {boolean}
     * @private
     */
    function _isNumber(member) {
      return (typeof member == 'number')
    }
  }
})();