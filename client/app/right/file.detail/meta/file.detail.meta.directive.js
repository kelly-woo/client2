/**
 * @fileoverview file detail의 meta directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailMeta', fileDetailMeta);

  /* @ngInject */
  function fileDetailMeta($state, $filter, fileAPIservice, entityAPIservice, entityheaderAPIservice, EntityMapManager,
                          AnalyticsHelper, analyticsService, Dialog, jndPubSub) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        isArchivedFile: '=',
        isInvalidRequest: '='
      },
      templateUrl : 'app/right/file.detail/meta/file.detail.meta.html',
      link: link
    };

    function link(scope) {
      var unsharedForMe;

      _init();

      function _init() {
        var file = scope.file;

        scope.fileIcon = $filter('fileIcon')(file.content);

        scope.onClickSharedEntity = onClickSharedEntity;
        scope.onClickUnshare = onClickUnshare;

        _setShared();

        _on();
      }

      function _on() {
        scope.$on('fileShared', _onFileShared);
        scope.$on('fileUnshared', _onFileUnshared);

        scope.$watch('file', _onChangeFile);
      }

      /**
       * shared entity 클릭시 이벤트 핸들러
       * @param {object} entityId
       */
      function onClickSharedEntity(entity) {
        var entityId = entity.id;
        var entityType = entity.type;

        if (entityType === 'users') {
          _goDm(entityId);
        } else {
          var targetEntity = EntityMapManager.get('total', entityId);

          if (entityAPIservice.isJoinedTopic(targetEntity)) {
            _goTopic(targetEntity);
          } else {
            _goWithJoinTopic(entityId);
          }
        }
      }

      /**
       * go dm
       * @param {number|string} entityId
       * @private
       */
      function _goDm(entityId) {
        $state.go('archives', {entityType: 'users', entityId: entityId});
      }

      /**
       * joined topic and go
       * @param {number|string} entityId
       * @private
       */
      function _goWithJoinTopic(entityId) {
        entityheaderAPIservice.joinChannel(entityId)
          .success(function() {
            $state.go('archives', {entityType: 'channels',  entityId: entityId });
          });
      }

      /**
       * go public topic
       * @param {object} targetEntity
       * @private
       */
      function _goTopic(targetEntity) {
        $state.go('archives', { entityType: targetEntity.type, entityId: targetEntity.id });
      }

      /**
       * 공유 해제 클릭시 이벤트 핸들러
       * @param {object} entity
       */
      function onClickUnshare(entity) {
        var file = scope.file;

        fileAPIservice.unShareEntity(file.id, entity.id)
          .success(function() {
            unsharedForMe = true;

            // 곧 지워짐
            var share_target = "";
            switch (entity.type) {
              case 'channel':
                share_target = "topic";
                break;
              case 'privateGroup':
                share_target = "private group";
                break;
              case 'user':
                share_target = "direct message";
                break;
              default:
                share_target = "invalid";
                break;
            }
            var file_meta = (file.content.type).split("/");
            var share_data = {
              "entity type": share_target,
              "category": file_meta[0],
              "extension": file.content.ext,
              "mime type": file.content.type,
              "size": file.content.size
            };
            analyticsService.mixpanelTrack( "File Unshare", share_data );

            try {
              //analytics
              AnalyticsHelper.track(AnalyticsHelper.EVENT.FILE_UNSHARE, {
                'RESPONSE_SUCCESS': true,
                'FILE_ID': file.id,
                'TOPIC_ID': entity.id
              });
            } catch (e) {
            }
          });
      }

      /**
       * file이 공유된 topic명 설정
       */
      function _setShared() {
        var file = scope.file;

        file.extShared = fileAPIservice.updateShared(file);
        scope.hasTopic = !!file.extShared.length;
      }

      /**
       * file shared event handler
       * @param {object} $event
       * @param {object} data
       * @private
       */
      function _onFileShared($event, data) {
        var file = scope.file;

        if (data.file.id == file.id) {
          jndPubSub.pub('right:updateFile');
        }
      }

      /**
       * file unshared event handler
       * @param {object} $event
       * @param {object} data
       * @private
       */
      function _onFileUnshared($event, data) {
        var file = scope.file;

        if (data.file.id == file.id) {
          jndPubSub.pub('right:updateFile');
        }
      }

      function _onChangeFile(newFile, oldFile) {
        if (newFile && oldFile !== newFile) {

          // 공유된 room 갱신
          _setShared();

          if (unsharedForMe) {
            // unshared된 다음 바로 list가 갱신되지 않기때문에 unshared되고 file detail이 새로 생성된 다음 dialog.success를 호출함
            Dialog.success({
              title: $filter('translate')('@success-file-unshare').replace('{{filename}}', newFile.content.title)
            });
          }

          unsharedForMe = false;
        }
      }
    }
  }
})();
