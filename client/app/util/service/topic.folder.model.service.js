/**
 * @fileoverview unread badge 의 위치 정보를 담고 있는 service
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderModel', TopicFolderModel);

  function TopicFolderModel(EntityMapManager) {
    var _folderList = [];
    var _entityList = [];

    this.set = set;
    this.getFolderList = getFolderList;
    this.getEntityList = getEntityList;

    /**
     *
     * @param {number} folderId
     * @param {string} [mapType] - total|joined|private|member|memberEntityId
     * @returns {Array}
     */
    function getEntityList(folderId, mapType) {
      var entityList = [];
      var tempEntity;
      mapType = mapType || 'total';
      _.forEach(_entityList, function(entity) {
        if (entity.folderId === folderId) {
          tempEntity = EntityMapManager.get(mapType, entity.roomId);
          if (tempEntity) {
            entityList.push(tempEntity);
          }
        }
      });
      return entityList;
    }

    /**
     *
     * @returns {Array|{criteria, index, value}}
     */
    function getFolderList() {
      return _.sortBy(_folderList,'seq');
    }

    /**
     *
     * @param obj
     */
    function set(obj) {
      _folderList = obj.folderList;
      _entityList = obj.entityList;
    }
  }
})();
