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
  function memberService($http, $rootScope, storageAPIservice, entityAPIservice, $upload,
                         jndPubSub, currentSessionHelper, EntityMapManager, JndUtil) {
    var noUExtraData = "i dont have u_extraData";

    var _messageMarkers = {};
    var _announcementOpened = 'announcementOpened';
    var _subscribe = 'subscribe';

    // 현재 멤버의 marker 정보를 {entityId: marker} 로 가지고 있다.
    var lastMessageReadMarkerMap = {};

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

      getDefaultPhotoUrl: getDefaultPhotoUrl,

      isAnnouncementOpen: isAnnouncementOpen,
      removeAnnouncementStatus: removeAnnouncementStatus,
      updateAnnouncementStatus: updateAnnouncementStatus,

      initLastReadMessageMarker: initLastReadMessageMarker,
      setLastReadMessageMarker: setLastReadMessageMarker,
      getLastReadMessageMarker: getLastReadMessageMarker,
      
      isTopicNotificationOn: isTopicNotificationOn,
      setTopicNotificationStatus: setTopicNotificationStatus,

      isAdmin: isAdmin,
      isActiveMember: isActiveMember,
      isDeactivatedMember: isDeactivatedMember,
      isDisabled: isDisabled,
      isDeleted: isDeleted
    };


    return service;

    /**
     * 현재 로그인되어 있는 멤버의 정보를 서버로부터 새로 받아서 넘겨준다.
     * @returns {object}
     */
    function updateCurrentMember() {
      return getMemberInfo(this.getMemberId());
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
      $rootScope.member = currentMember = member;
      storageAPIservice.setLastEmail(member.u_email);


      _initMessageMarkersMap(member.u_messageMarkers);
      initLastReadMessageMarker(member.u_messageMarkers);

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
    function getMemberInfo(memberId, code) {
      return $http({
        method: 'GET',
        url: $rootScope.server_address + 'account/members/' + memberId + '?code=' + code
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
      return _.isUndefined(member) ? 'deactivated user' : member.name;
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
        member = EntityMapManager.get('total', member);
      }
      return JndUtil.pick(member, 'u_photoThumbnailUrl', 'smallThumbnailUrl') || getPhotoUrl(member);
    }

    /**
     * 멤버 프로필 사진의 medium thumbnail 주소를 리턴한다.
     * @param {object} member - 프로필 사진의 주인
     * @returns {string} url - medium thumbnail url
     */
    function getMediumThumbnailUrl(member) {
      if (_isNumber(member)) {
        member = EntityMapManager.get('total', member);
      }
      return JndUtil.pick(member, 'u_photoThumbnailUrl', 'mediumThumbnailUrl') || getPhotoUrl(member);
    }

    /**
     * 멤버 프로필 사진의 large thumbnail 주소를 리턴한다.
     * @param {object} member - 프로필 사진의 주인
     * @returns {string} url - large thumbnail url
     */
    function getLargeThumbnailUrl(member) {
      if (_isNumber(member)) {
        member = EntityMapManager.get('total', member);
      }
      return JndUtil.pick(member, 'u_photoThumbnailUrl', 'largeThumbnailUrl') || getPhotoUrl(member);
    }

    /**
     * 현재 멤버의 프로필 사진 주소를 리턴한다.
     * @param {object} member - 프로필 사진의 주인
     * @returns {string} url - profile photo url
     */
    function getPhotoUrl(member) {
      return JndUtil.pick(member, 'u_photoUrl');
    }

    /**
     * 아이디를 사용해 해당하는 유저의 이름을 리턴한다.
     * @param {number} entityId - 아이디
     * @returns {string} name - 아이디를 가진 유져의 이름
     */
    function getNameById(entityId) {
      return this.getName(EntityMapManager.get('total', entityId));
    }

    /**
     * 현재 멤버의 프로필이 변경됐다는 소켓이벤트가 오면 호출된다.
     */
    function onMemberProfileUpdated() {
      getMemberInfo(getMemberId(), 'member_profile_update')
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
      return (typeof member === 'number');
    }

    /**
     * announcement 가 열려있는지 닫혀있는지 확인값을 리턴한다.
     * 'undefined'도 true로 리턴한다.
     * @param {number} entityId - 확인하려는 토픽의 아이디
     * @returns {*}
     */
    function isAnnouncementOpen(entityId) {
      return _getBooleanValue(entityId, _announcementOpened);
    }

    /**
     * announcementOpenStatusMap 에서 entityId 에 해당하는 값을 지운다.
     * @param {number} entityId - 지우려는 key 값
     */
    function removeAnnouncementStatus(entityId) {
      delete _messageMarkers[entityId][_announcementOpened];
    }

    /**
     * announcementOpenStatusMap 에서 값을 바꾼다.
     * @param {number} entityId - 바꾸려는 키
     * @param {boolean} toBeValue - 값
     */
    function updateAnnouncementStatus(entityId, toBeValue) {
      _addToMessageMarkerMap(entityId, toBeValue, _announcementOpened);
    }

    /**
     * entityId 의 토픽의 notification setting 이 true 인지 아닌지 확인한다.
     * @param {number} entityId - 확인하고싶은 토픽의 아이디
     * @returns {boolean}
     */
    function isTopicNotificationOn(entityId) {
      return _getBooleanValue(entityId, _subscribe);
    }

    /**
     * entityId를 가진 토픽의 subscribe field를 'toBeValue'로 바꾼다.
     * @param {number} entityId - 바꾸고싶은 토픽의 아이이
     * @param {boolean} toBeValue - 덮어쓰고싶은 value
     */
    function setTopicNotificationStatus(entityId, toBeValue) {
      _addToMessageMarkerMap(entityId, toBeValue, _subscribe);
    }

    /**
     * leftSideMenu api call에서 받은 response 중 'user' field 중 'u_messageMarkers'를 Map 형태로 바꾼다.
     *
     * @param u_messageMarkers
     * @private
     */
    function _initMessageMarkersMap(messageMarkersList) {
      _messageMarkers = {};
      _.forEach(messageMarkersList, function(messageMarker) {
        _messageMarkers[messageMarker.entityId] = messageMarker;
      });
    }

    /**
     * _messageMarkers map에 새로 추가하거나 기존 값을 update한다.
     * @param entityId
     * @param toBeValue
     * @param field
     * @private
     */
    function _addToMessageMarkerMap(entityId, toBeValue, field) {
      if (_hasValidArguments(arguments)) {

        var _tempObj = _messageMarkers[entityId];

        if (_.isUndefined(_tempObj)) {
          _tempObj = {};
        }

        _tempObj[field] = toBeValue;

        _messageMarkers[entityId] = _tempObj;
      }

    }

    /**
     * entityId object를 찾아서 field의 값을 리턴한다.
     * 'undefined'도 true로 리턴한다.
     * @param {number} entityId - 찾으려하는 엔티티의 아이디
     * @param {string} field - 찾으려는 오브젝트의 field 값
     * @returns {boolean}
     * @private
     */
    function _getBooleanValue(entityId, field) {
      if (_messageMarkers[entityId]) {
        var _tempMessageMarker = _messageMarkers[entityId][field];
        if (_.isUndefined(_tempMessageMarker) || !!_tempMessageMarker) {
          return true;
        }
      }
      return false;
    }

    /**
     * args안에 있는 element들중 undefined 가 있는지 없는지만 체크한다.
     * @param {array} args - 체크할 엘레멘트들의 array
     * @returns {boolean}
     * @private
     */
    function _hasValidArguments(args) {
      var _foundUndefined = true;
      _.forEach(args, function(arg) {
        if (_.isUndefined(arg)) {
          _foundUndefined = false;
          return false;
        }
      });

      return _foundUndefined;
    }


    /**
     * message markers를 가지고 있는 맵을 생성한다.
     * @param {array} markers - 유저의 message markers list
     */
    function initLastReadMessageMarker(markers) {
      _.forEach(markers, function(marker) {
        setLastReadMessageMarker(marker.entityId, marker.lastLinkId);
      });
    }

    /**
     * 맵에 entityId - lastLinkId pair를 추가한다.
     * @param {number} entityId - entity의 id
     * @param {number} lastLinkId - 해당하는 entity의 유져가 가지고 있는 link의 id
     */
    function setLastReadMessageMarker(entityId, lastLinkId) {
      lastMessageReadMarkerMap[entityId] = lastLinkId;
    }

    /**
     * entityId에 해당하는 lastLinkId를 리턴한다.
     * @param {number} entityId - 찾고싶은 entity의 id
     * @returns {nubmer} - lastLinkId
     */
    function getLastReadMessageMarker(entityId) {
      if (_.isUndefined(entityId)) {
        return lastMessageReadMarkerMap;
      } else {
        return lastMessageReadMarkerMap[entityId];
      }
    }

    /**
     * admin 여부를 반환한다.
     */
    function isAdmin() {
      var admin = currentSessionHelper.getCurrentTeamAdmin();
      return admin && (admin.id === getMemberId());
    }

    /**
     * member가 active(enabled)상태인지 아닌지 확인한다.
     * 외부 서비스에서 사용하기 편하려고 만들었다.
     * @param {object} member - member object
     * @returns {*|*|boolean}
     */
    function isActiveMember(member) {
      return !isDeactivatedMember(member);
    }

    /**
     * member가 disabled이거나 deleted인지 확인한다.
     * 외부 서비스에서 사용하기 편하려고 만들었다.
     * @param {object} member - member object
     * @returns {*|*|boolean}
     */
    function isDeactivatedMember(member) {
      return isDisabled(member) || isDeleted(member);
    }

    /**
     * member의 status가 disabled인지 아닌지 확인한다.
     * @param {object} member - member object
     * @returns {*|*|boolean}
     */
    function isDisabled(member) {
      return member && member.status === 'disabled';
    }

    /**
     * member의 status가 deleted인지 아닌지 확인한다.
     * @param {object} member - member object
     * @returns {*|boolean}
     */
    function isDeleted(member) {
      return member && member.status === 'deleted';
    }
  }
})();
