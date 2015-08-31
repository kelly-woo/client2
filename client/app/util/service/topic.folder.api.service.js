/**
 * @fileoverview unread badge 의 위치 정보를 담고 있는 service
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderAPI', TopicFolderAPI);

  function TopicFolderAPI($http, configuration, memberService) {
    var server_address = configuration.server_address;

    this.getFolders = getFolders;
    this.getEntities = getEntities;
    this.create = create;
    this.remove = remove;
    this.push = push;
    this.pop = pop;
    this.modify = modify;

    /**
     * folder 정보를 받아온다.
     * @param [teamId]
     * @returns {*}
     */
    function getFolders(teamId) {
      teamId = teamId || memberService.getTeamId();
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + teamId + '/folders'
      });
    }

    /**
     *
     * @param {string} [teamId]
     */
    function getEntities(teamId) {
      teamId = teamId || memberService.getTeamId();
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + teamId + '/folders/items'
      });
    }

    /**
     * folder 를 생성한다.
     * @param {number} teamId
     * @param {string} name
     * @returns {*}
     */
    function create(teamId, name) {
      return $http({
        method: 'POST',
        url: server_address + 'teams/' + teamId + '/folders',
        data: {
          name: name
        }
      });
    }

    /**
     * folder 를 삭제한다.
     * @param {number} teamId
     * @param {number} folderId
     * @returns {*}
     */
    function remove(teamId, folderId) {
      return $http({
        method: 'DELETE',
        url: server_address + 'teams/' + teamId + '/folders/' + folderId
      });
    }

    /**
     * folder 에 토픽을 추가한다.
     * @param {number} teamId
     * @param {number} folderId
     * @param {number} entityId
     */
    function push(teamId, folderId, entityId) {
      return $http({
        method: 'POST',
        url: server_address + 'teams/' + teamId + '/folders/' + folderId + '/items',
        data: {
          itemId: entityId
        }
      });
    }

    /**
     * folder 에서 entityId 에 해당하는 아이템을 제거한다.
     * @param {number} teamId
     * @param {number} folderId
     * @param {number} entityId
     * @returns {*}
     */
    function pop(teamId, folderId, entityId) {
      return $http({
        method: 'DELETE',
        url: server_address + 'teams/' + teamId + '/folders/' + folderId + '/items/' + entityId
      });
    }

    /**
     * folder 정보를 변경한다.
     * @param {number} teamId
     * @param {number} folderId
     * @param {{seq: {number}, name: {string}}} updateItems
     * @returns {*}
     */
    function modify(teamId, folderId, updateItems) {
      return $http({
        method: 'PUT',
        url: server_address + 'teams/' + teamId + '/folders/' + folderId,
        data: {
          updateItems: updateItems
        }
      });
    }
  }
})();
