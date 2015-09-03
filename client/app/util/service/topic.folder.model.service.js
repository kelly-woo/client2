/**
 * @fileoverview unread badge 의 위치 정보를 담고 있는 service
 * @author Young Park <young.park@tosslab.com>
 */

(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TopicFolderModel', TopicFolderModel);

  function TopicFolderModel($q, $timeout, memberService, EntityMapManager, jndPubSub, TopicFolderAPI, TopicFolderStorage) {
    var _raw = {
      folderList: [],
      entityList: []
    };
    var FOLDER_NAME = 'New Folder';

    var _folderData = {};
    var _folderList = [];

    this.create = create;
    this.set = set;
    this.push = push;
    this.remove = remove;
    this.modify = modify;
    this.merge = merge;
    this.update = update;
    this.load = load;
    this.reload = reload;
    this.getFolderData = getFolderData;


    function _getAnonymousFolderName() {
      var nameList = [];
      var suffix = 0;
      var folderName = FOLDER_NAME;

      _.forEach(_raw.folderList, function(folder) {
        nameList.push(folder.name);
      });

      while (nameList.indexOf(folderName) !== -1) {
        suffix++;
        folderName = FOLDER_NAME + ' ' + suffix;
      }

      return folderName;
    }

    function create(isRename) {
      var folderName = _getAnonymousFolderName();
      TopicFolderAPI.create(memberService.getTeamId(), folderName)
        .success(_.bind(_onCreateSuccess, this, isRename))
        .error(_onCreateFailed);
    }

    function merge(entities, isRename) {
      var teamId = memberService.getTeamId();
      var folderName = _getAnonymousFolderName();
      return TopicFolderAPI.merge(teamId, folderName, entities)
        .success(_.bind(_onCreateSuccess, this, isRename))
        .error(_onCreateFailed);
    }

    function _onCreateFailed() {
      //todo: error logic
      reload();
    }
    function _onCreateSuccess(isRename, response) {
      reload().then(function() {
        if (isRename) {
          $timeout(function () {
            jndPubSub.pub('topic-folder:rename', response.folderId);
          });
        }
      });
    }
    /**
     * 폴더를 삭제한다.
     * @param {number} folderId
     */
    function remove(folderId) {
      _remove(folderId);
      TopicFolderAPI.remove(memberService.getTeamId(), folderId)
        .error(function() {
          reload();
        });
    }

    /**
     * view 의 폴더를 삭제한다.
     * @param {number} folderId
     * @private
     */
    function _remove(folderId) {
      _.forEach(_raw.entityList, function(entity) {
        if (entity.folderId === folderId) {
          entity.folderId = -1;
        }
      });
      _.forEach(_raw.folderList, function(folder, index) {
        if (folder.id === folderId) {
          _raw.folderList.splice(index, 1);
          return false;
        }
      });
      TopicFolderStorage.removeOpenStatus(folderId);
      update();
    }

    function modify(folderId, updateItems) {
      var seq = updateItems.seq;
      var name = updateItems.name;
      var targetFolder;
      var teamId = memberService.getTeamId();
      _.forEach(_raw.folderList, function(folder) {
        if (folder.id === folderId) {
          targetFolder = folder;
          return false;
        }
      });

      if (name) {
        targetFolder.name = name;
      }

      if (seq) {
        seq = parseInt(seq, 10) - 0.5;
        targetFolder.seq = seq;
        _raw.folderList = _.sortBy(_raw.folderList, 'seq');
        _.forEach(_raw.folderList, function(folder, index) {
          folder.seq = index + 1;
        });
      }
      TopicFolderAPI.modify(teamId, folderId, updateItems)
        .error(reload);
      update();
    }
    /**
     *
     * @param {number} folderId
     * @param {string} [mapType] - total|joined|private|member|memberEntityId
     * @returns {Array}
     */
    function getEntityList(folderId) {
      var entityList = [];
      var tempEntity;
      _.forEach(_raw.entityList, function(entity) {
        if (entity.folderId === folderId) {
          tempEntity = EntityMapManager.get('total', entity.roomId);
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
      return load().then(function() {
        update();
      });
    }

    function update() {
      _folderList = _.sortBy(_raw.folderList, 'seq');
      _.forEach(_folderList, function(folder) {
        folder.entityList = getEntityList(folder.id);
      });

      _folderData.folderList = _folderList;
      _folderData.folderList.push({
        name: '',
        id: -1,
        seq: _folderData.folderList.length + 1,
        entityList: getEntityList(-1)
      });
      jndPubSub.pub('topic-folder:update', _folderData);
    }

    function push(folderId, entityId) {
      var teamId = memberService.getTeamId();
      _.forEach(_raw.entityList, function(entity) {
        if (entity.roomId === entityId) {
          entity.folderId = folderId;
          return false;
        }
      });
      update();

      if (folderId === -1) {
        TopicFolderAPI.pop(teamId, folderId, entityId);
      } else {
        TopicFolderAPI.push(teamId, folderId, entityId);
      }
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
      _raw.folderList = _.sortBy(obj.folderList, 'seq');
      _raw.entityList = obj.entityList;
      update();
    }
  }
})();
