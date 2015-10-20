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
                              currentSessionHelper, entityheaderAPIservice, jndPubSub, modalHelper, accountService) {
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

      return matches;
    }

    /**
     * room select event handler
     * @param {object} room
     */
    function onRoomSelect(room) {
      if (currentSessionHelper.getCurrentEntityId() === room.id) {
        // 현재 room과 같은 room인 경우

        modalHelper.closeModal();
      } else {
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
      var hasBadgeRooms = _getHadBadgeRooms();
      var resentWorkRooms = _getResentWorkRooms();
      var hasBadgeRoomsBeginIndex = 0;
      var resentWorkRoomBeginIndex = 0;
      var rooms = _.uniq([].concat(hasBadgeRooms, resentWorkRooms), function (room) {
        room.count == null ? resentWorkRoomBeginIndex++ : hasBadgeRoomsBeginIndex++;
        return room.id;
      });

      _setJumpListIndexs(hasBadgeRoomsBeginIndex, resentWorkRoomBeginIndex);

      return rooms;
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
          if (unreadBadgeMap[e].entity) {
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
      }

      return _.sortBy(rooms, function (room) {
        return room.name.toLowerCase();
      });
    }

    /**
     * 최근 방문한 topic list를 전달한다.
     * @returns {Array}
     * @private
     */
    function _getResentWorkRooms() {
      var rooms = [];
      var centerHistory = centerService.getHistory();
      var entity;
      var i;
      var room;

      for (i = centerHistory.length - 1; i > -1; i--) {
        if (entity = EntityMapManager.get('total', centerHistory[i].entityId)) {
          room = {
            type: entity.type,
            id: entity.id,
            name: entity.name
          };
          entity.type === 'users' && (room.profileImage = memberService.getSmallThumbnailUrl(entity));
          rooms.push(room);
        }
      }

      return rooms;
    }

    /**
     * filter 된 room list를 전달한다.
     * @param {string} value - filter 문자열
     * @returns {Array.<T>}
     */
    function getFilteredRooms(value) {
      var filterText = value || '';
      var enableMembers = _getEnabledMembers(filterText);
      var joinedRooms = _getJoinedRooms(filterText);
      var unjoinedChannels = _getUnJoinedChannels(filterText);

      _setJumpListIndexs(enableMembers.length, joinedRooms.length, unjoinedChannels.length);

      return [].concat( enableMembers, joinedRooms, unjoinedChannels);
    }

    /**
     * enabled member list를 전달한다.
     * @param value -  filter 문자열
     * @returns {Array|{criteria, index, value}}
     * @private
     */
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

    /**
     * 참여중인 room list를 전달한다.
     * @param {string} value - filter 문자열
     * @returns {Array|{criteria, index, value}}
     * @private
     */
    function _getJoinedRooms(value) {
      var rooms = [];

      // 참여 channel list filtering
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

      // 참여 privategroup list filtering
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

      return _.sortBy(rooms, function (room) {
        return room.name.toLowerCase();
      });
    }

    /**
     * 참여하지 않은 channel list를 전달한다.
     * @param {string} value - filter 문자열
     * @returns {Array|{criteria, index, value}}
     * @private
     */
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

      return _.sortBy(channels, function (channel) {
        return channel.name.toLowerCase();
      });
    }

    /**
     * item 분류마다 첫 item index를 설정하여 item 분류별 jump가 가능하도록 jump list index를 설정한다.
     * @private
     */
    function _setJumpListIndexs() {
      var jumpListIndexs = $scope.jumpListIndexs = [];
      var args = arguments;

      _.forEach(args, function(value, index) {
        if (value > 0) {
          jumpListIndexs.push((jumpListIndexs[index - 1] || 0) + (args[index - 1] || 0));
        }
      });
    }
  }
})();
