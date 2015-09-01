/**
 * @fileoverview unread badge 의 위치 정보를 담고 있는 service
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderModel', TopicFolderModel);

  function TopicFolderModel($q, EntityMapManager, jndPubSub, TopicFolderAPI) {
    var _raw = {
      folderList: [],
      entityList: []
    };
    var _folderData = {};
    var _folderList = [];
    var _entityList = [];
    var _tempFolderList = [];

    var _folderStructure = [];

    this.set = set;
    this.push = push;
    this.update = update;
    this.load = load;
    this.reload = reload;
    this.getFolderData = getFolderData;

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
      _.forEach(_raw.entityList, function(entity) {
        if (entity.folderId === folderId) {
          tempEntity = EntityMapManager.get(mapType, entity.roomId);
          if (tempEntity) {
            tempEntity.extFolderId = folderId;
            tempEntity.extHasFolder = (folderId !== -1);
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
      return _folderList;
    }

    function getFolderData() {
      return _folderData;
    }

    function load() {
      return $q.all([
        TopicFolderAPI.getFolders().then(function(result) {
          _raw.folderList = result.data;
        }),
        TopicFolderAPI.getEntities().then(function(result) {
          _raw.entityList = result.data;
        })
      ]);
    }

    function reload() {
      load().then(function() {
        update();
      });
    }

    function update() {
      _folderList = _.sortBy(_raw.folderList, 'seq');
      _.forEach(_folderList, function(folder) {
        folder.entityList = getEntityList(folder.id, 'joined');
      });

      _folderData.folderList = _folderList;
      _folderData.folderList.push({
        name: '',
        id: -1,
        entityList: getEntityList(-1, 'joined')
      });
      jndPubSub.pub('topic-folder:update', _folderData);
    }

    function push(folderId, entityId) {
      _.forEach(_raw.entityList, function(entity) {
        if (entity.roomId === entityId) {
          entity.folderId = folderId;
          return false;
        }
      });
      update();
    }

    function _find(folderId) {
      var result = {
        index: -1,
        folder: null
      };
      _.forEach(_folderData.folderList, function(folder, index) {
        if (folder.id === folderId) {
          result = {
            index: index,
            folder: folder
          };
          return false;
        }
      });
      return result;
    }
    /**
     *
     * @param obj
     */
    function set(obj) {
      _raw.folderList = obj.folderList;
      _raw.entityList = obj.entityList;
      update();
    }
  }
})();
