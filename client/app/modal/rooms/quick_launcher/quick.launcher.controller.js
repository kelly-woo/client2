/**
 * @fileoverview quick launcher controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('QuickLauncherCtrl', QuickLauncherCtrl);

  /* @ngInject */
  function QuickLauncherCtrl($rootScope, $scope, $state, UnreadBadge, EntityMapManager, centerService, memberService,
                              currentSessionHelper, entityheaderAPIservice, jndPubSub, modalHelper) {
    _init();

    /**
     * init
     * @private
     */
    function _init() {
      $scope.list = [];

      $scope.openCreateTopicModal = openCreateTopicModal;
      $scope.openBrowseTopicModal = openBrowseTopicModal;

      $scope.getMatches = getMatches;
      $scope.getRooms = getRooms;
      $scope.getFilteredRooms = getFilteredRooms;

      $scope.onRoomSelect = onRoomSelect;
    }

    /**
     * open create topic modal
     * @param {string} query - 토픽 생성 모달 오픈시 설정될 토픽명
     */
    function openCreateTopicModal(query) {
      modalHelper.openTopicCreateModal({
        topicName: query
      });
    }

    /**
     * open browse topic modal
     */
    function openBrowseTopicModal() {
      modalHelper.openTopicJoinModal();
    }

    /**
     * list에서 filter된 list를 전달한다.
     * @param {array} list
     * @param {string} value
     * @returns {*}
     */
    function getMatches(list, value) {
      var matches = value === '' ? getRooms() : getFilteredRooms(value);

      if (value !== '' && matches.length === 0) {
        $scope.isEmptyMatches = true;
      } else {
        $scope.isEmptyMatches = false;
      }
      //console.log('get matches ::: ', list);
      return matches;
    }

    /**
     * room select event handler
     * @param {object} room
     */
    function onRoomSelect(room) {
      if (room.type === 'channels') {
        if (EntityMapManager.contains('joined', room.id)) {
          // join한 topic

          _joinRoom(room);
        } else {
          if (!$scope.isLoading) {
            jndPubSub.showLoading();

            entityheaderAPIservice.joinChannel(room.id)
              .success(function () {
                _joinRoom(room);
              })
              .finally(function() {
                jndPubSub.hideLoading();
              });
          }
        }
      } else {
        _joinRoom(room);
      }
    }

    /**
     * join room
     * @param room
     * @private
     */
    function _joinRoom(room) {
      $state.go('archives', {entityType: room.type, entityId: room.id});
    }

    /**
     * filter 되지 않은 room list를 전달한다.
     * @returns {*|Array}
     */
    function getRooms() {
      return _.uniq([].concat(_getHadBadgeRooms(), _getResentWorkRooms()), 'id');
    }

    /**
     * badge를 가진 room list를 전달한다.
     * @returns {Array|{criteria, index, value}}
     * @private
     */
    function _getHadBadgeRooms() {
      var rooms = [];
      var room;
      var unreadBadgeMap = UnreadBadge.get();
      var entity;
      var e;

      for (e in unreadBadgeMap) {
        if (unreadBadgeMap.hasOwnProperty(e)) {
          entity = JSON.parse(unreadBadgeMap[e].entity);

          room = {
            type: entity.type,
            id: entity.id,
            name: entity.name,
            count: entity.alarmCnt
          };
          entity.type === 'users' && (room.profileImage = memberService.getSmallThumbnailUrl(entity));
          rooms.push(room);
        }
      }

      return _.sortBy(rooms, 'name');
    }

    /**
     *
     * @returns {Array}
     * @private
     */
    function _getResentWorkRooms() {
      var rooms = [];
      var centerHistory = centerService.getHistory();
      var entity;
      var i;
      var len;

      for (i = 0, len = centerHistory.length; i < len; i++) {
        if (entity = EntityMapManager.get('total', centerHistory[i].entityId)) {
          rooms.push({
            type: entity.type,
            id: entity.id,
            name: entity.name
          });
        }
      }

      return rooms;
    }

    function getFilteredRooms(value) {
      value = value || '';
      return [].concat(_getEnabledMembers(value), _getJoinedRooms(value), _getUnJoinedChannels(value));
    }

    function _getEnabledMembers(value) {
      var members = [];

      _.forEach(currentSessionHelper.getCurrentTeamMemberList(), function(member) {
        if (member.name.toLowerCase().indexOf(value.toLowerCase()) > -1 && !memberService.isDeactivatedMember(member) && memberService.getMemberId() !== member.id) {
        //if (memberService.getMemberId() !== member.id && member.name.indexOf(value) > -1) {
          members.push({
            type: member.type,
            id: member.id,
            name: member.name,
            status: member.status,
            profileImage: memberService.getSmallThumbnailUrl(member),
            query: value,
            count: member.alarmCnt
          });
        }
      });

      return _.sortBy(members, function (member) {
        return member.name.toLowerCase();
      });
    }

    function _getJoinedRooms(value) {
      var rooms = [];

      _.forEach($rootScope.joinedChannelList, function(channel) {
        if (channel.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          rooms.push({
            type: channel.type,
            id: channel.id,
            name: channel.name,
            query: value,
            count: channel.alarmCnt
          });
        }
      });

      _.forEach($rootScope.privateGroupList, function(privategroup) {
        if (privategroup.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          rooms.push({
            type: privategroup.type,
            id: privategroup.id,
            name: privategroup.name,
            query: value,
            count: privategroup.alarmCnt
          });
        }
      });

      return _.sortBy(rooms, 'name');
    }

    function _getUnJoinedChannels(value) {
      var channels = [];

      _.forEach($rootScope.unJoinedChannelList, function(channel) {
        if (channel.name.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          channels.push({
            type: channel.type,
            id: channel.id,
            name: channel.name,
            query: value,
            isUnjoinedChannel: true
          });
        }
      });

      return _.sortBy(channels, 'name');
    }
  }
})();
