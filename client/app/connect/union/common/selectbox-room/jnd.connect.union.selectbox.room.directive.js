/**
 * @fileoverview union 에서 사용할 토픽 선택 셀렉트 박스 + 생성 버튼 디렉티브
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('jndConnectUnionSelectboxRoom', jndConnectUnionSelectboxRoom);

  function jndConnectUnionSelectboxRoom($timeout, JndConnect, EntityMapManager, TopicFolderModel, currentSessionHelper) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        model: '=jndDataModel'
      },
      templateUrl: 'app/connect/union/common/selectbox-room/jnd.connect.union.selectbox.room.html',
      link: link
    };

    function link(scope, el, attrs) {
      var _timer;
      scope.openTopicCreateModal = JndConnect.openTopicCreateModal;

      _init();

      /**
       * 초기화 메서드
       * @private
       */
      function _init() {
        _setList();
        scope.model = scope.model || currentSessionHelper.getCurrentEntityId();
        scope.$on('topic-folder:update', _onUpdate);
      }

      /**
       *
       * @private
       */
      function _onUpdate() {
        $timeout.cancel(_timer);
        _timer = $timeout(_setList, 50);
      }

      /**
       * 업데이트된 리스트를 반영한다.
       * @private
       */
      function _setList() {
        var list = _.union(
          EntityMapManager.toArray('joined'),
          EntityMapManager.toArray('private'),
          EntityMapManager.toArray('bot')
        );
        list = _.filter(list, function(entity) {
          return entity.type !== 'users';
        });
        scope.list = TopicFolderModel.getNgOptions(list);
      }
    }
  }
})();
