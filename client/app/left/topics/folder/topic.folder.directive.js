(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicFolder', topicFolder);

  function topicFolder(memberService, TopicFolderModel, TopicFolderAPI) {
    return {
      restrict: 'E',
      controller: 'TopicFolderCtrl',
      templateUrl: 'app/left/topics/folder/topic.folder.html',
      link: link,
      replace: true
    };

    function link(scope, el, attrs) {
      var _draggingScope;
      var _teamId;
      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _teamId = memberService.getTeamId();
        scope.hasEmptyArea = scope.folder.id === -1 && !scope.folder.entityList.length;
        _attachEvents();
        _attachDomEvents();
      }

      function _attachEvents() {
        scope.$on('topic:drag', _onDragStatusChange);
      }
      function _attachDomEvents() {
        el.on('mouseover', _onMouseOver);
        el.on('mouseout', _onMouseOut);
        el.on('mouseup', _onMouseUp);
      }

      function _onMouseUp() {
        if (_draggingScope && _hasFolderAction()) {
          if (scope.folder.id === -1) {
            TopicFolderAPI.pop(_teamId, _draggingScope.currentRoom.extFolderId, _draggingScope.currentRoom.id);
          } else {
            TopicFolderAPI.push(_teamId, scope.folder.id, _draggingScope.currentRoom.id);
          }
          TopicFolderModel.push(scope.folder.id, _draggingScope.currentRoom.id);
        }
      }

      function _onMouseOver() {
        if (_draggingScope && _hasFolderAction()) {
          el.addClass('topic-folder-push');
        }
      }

      function _hasFolderAction() {
        return scope.folder.id !== -1 ||
          (scope.folder.id === -1  && _draggingScope.currentRoom.extHasFolder);
      }

      function _onMouseOut(){
        if (_draggingScope) {
          el.removeClass('topic-folder-push');
        }
      }

      function _onDragStatusChange(angularEvent, draggingScope) {
        _draggingScope = draggingScope;
        if (!_draggingScope) {
          el.removeClass('topic-folder-push');
        }
      }
    }
  }
})();
