(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicFolder', topicFolder);

  function topicFolder(memberService, jndKeyCode, TopicFolderModel, TopicFolderStorage) {
    return {
      restrict: 'E',
      controller: 'TopicFolderCtrl',
      templateUrl: 'app/left/topics/folder/topic.folder.html',
      link: link,
      replace: true
    };

    function link(scope, el, attrs) {
      var _draggingTopicScope;
      var _teamId;
      var _jqTitle;
      var _jqInput;
      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _teamId = memberService.getTeamId();
        scope.hasEmptyArea = scope.folder.id === -1 && !scope.folder.entityList.length;

        scope.startEdit = startEdit;
        scope.collapse = collapse;
        scope.isOpened = TopicFolderStorage.getOpenStatus(scope.folder.id);
        _attachEvents();
        _attachDomEvents();

      }

      /**
       * scope event 를 attach 한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('topic:drag', _onTopicDragStatusChange);
        scope.$on('topic-folder:rename', _onRename);
      }

      /**
       * dom 이벤트를 attach 한다.
       * @private
       */
      function _attachDomEvents() {
        el.on('mouseover', _onMouseOver);
        el.on('mouseout', _onMouseOut);
        el.on('mouseup', _onMouseUp);
      }

      /**
       * rename 이벤트 핸들러
       * @param {object} angularEvent
       * @param {number} folderId
       * @private
       */
      function _onRename(angularEvent, folderId) {
        if (folderId === scope.folder.id) {
          startEdit();
        }
      }

      function _onMouseUp() {
        if (_draggingTopicScope && _isFolderPushable()) {
          TopicFolderModel.push(scope.folder.id, _draggingTopicScope.currentRoom.id);
        }
      }

      function _onMouseOver() {
        if (_draggingTopicScope && _isFolderPushable()) {
          el.addClass('hover');
        }
      }

      function _isFolderPushable() {
        return scope.folder.id !== -1 ||
          (scope.folder.id === -1  && _draggingTopicScope.currentRoom.extHasFolder);
      }

      function _onMouseOut(){
        if (_draggingTopicScope) {
          el.removeClass('hover');
        }
      }

      function _onTopicDragStatusChange(angularEvent, draggingScope) {
        _draggingTopicScope = draggingScope;
        if (!_draggingTopicScope) {
          el.removeClass('hover');
        }
      }

      function startEdit() {
        el.find('._folderTitle').hide();
        el.find('input:first')
          .val(scope.folder.name)
          .show()
          .on('keydown', _onKeydownInput)
          .on('blur', _endEdit)
          .focus()
          .select();
      }

      function _onKeydownInput(keyDownEvent) {
        if (jndKeyCode.match('ENTER', keyDownEvent.keyCode)) {
          _endEdit(keyDownEvent);
        }
      }

      function _endEdit(blurEvent) {
        var jqTarget = $(blurEvent.target);
        var text = _.trim(jqTarget.val());
        TopicFolderModel.modify(scope.folder.id, {
          name: text
        });
        el.find('._folderTitle').text(text).show();
        jqTarget.hide()
          .off('blur', _endEdit)
          .off('keydown', _onKeydownInput);
      }

      function collapse() {
        var jqUl = el.find('ul');
        var hasEntity = !!scope.folder.entityList.length;
        var callback = function() {
          _safeApply(function() {
            scope.isOpened = !scope.isOpened;
          });
        };

        TopicFolderStorage.setOpenStatus(scope.folder.id, !scope.isOpened);
        if (hasEntity) {
          if (scope.isOpened) {
            el.find('ul').slideUp(callback);
          } else {
            el.find('ul').slideDown(callback);
          }
        } else {
          callback();
        }
      }

      function _safeApply(fn) {
        if (scope.$$phase !== '$apply' && scope.$$phase !== '$digest') {
          scope.$apply(fn);
        } else {
          fn();
        }
      }
    }
  }
})();
