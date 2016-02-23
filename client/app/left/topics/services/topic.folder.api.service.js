/**
 * @fileoverview unread badge 의 위치 정보를 담고 있는 service
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderAPI', TopicFolderAPI);

  function TopicFolderAPI($q, $http, configuration, memberService) {
    var server_address = configuration.server_address;

    this.getFolders = getFolders;
    this.getEntities = getEntities;
    this.create = create;
    this.remove = remove;
    this.push = push;
    this.pop = pop;
    this.modify = modify;

    this.merge = merge;

    /**
     * folder 정보를 조회한다.
     * @param {string} [teamId] teamId. 생략시 memberService 로부터 조회한다.
     * @param {object} [deferred]
     * @param {string} [trackingCode] - 오류 현상 파악을 위해 임시로 트레킹 코드를 추가한다.
     * @returns {*}
     */
    function getFolders(teamId, deferred, trackingCode) {
      teamId = teamId || memberService.getTeamId();
      console.log(trackingCode);
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + teamId + '/folders?trackingCode=' + trackingCode,
        timeout: !!deferred ? deferred.promise : ''
      });
    }

    /**
     * entities 와 폴더의 연결 정보를 조회한다.
     * @param {string} [teamId] teamId. 생략시 memberService 로부터 조회한다.
     * @param {object} [deferred]
     * @param {string} [trackingCode] - 오류 현상 파악을 위해 임시로 트레킹 코드를 추가한다.
     */
    function getEntities(teamId, deferred, trackingCode) {
      teamId = teamId || memberService.getTeamId();
      return $http({
        method: 'GET',
        url: server_address + 'teams/' + teamId + '/folders/items?trackingCode=' + trackingCode,
        timeout: !!deferred ? deferred.promise : ''
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
     * entity 두개 이상 인자로 넘겨 폴더를 생성한다.
     * @param {number} teamId - 팀 id
     * @param {string} name - 폴더명
     * @param {array} entities - 폴더로 합칠 2개 이상의 entity id
     * @returns {*}
     */
    function merge(teamId, name, entities) {
      return $http({
        method: 'POST',
        url: server_address + 'teams/' + teamId + '/folders/items',
        data: {
          name: name,
          roomIds: entities
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
      if (folderId === -1) {
        return pop(teamId, folderId, entityId);
      } else {
        return $http({
          method: 'POST',
          url: server_address + 'teams/' + teamId + '/folders/' + folderId + '/items',
          data: {
            itemId: entityId
          }
        });
      }
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
