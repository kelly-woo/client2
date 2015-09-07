(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicFolder', topicFolder);

  function topicFolder($filter, memberService, jndKeyCode, TopicFolderModel, TopicFolderStorage, jndPubSub) {
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
      var _more = $filter('translate')('@file-action-more');
      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _teamId = memberService.getTeamId();
        scope.hasEmptyArea = scope.folder.id === -1 && !scope.folder.entityList.length;
        scope.alarmCnt = _getTotalAlarmCnt();
        scope.isOpened = TopicFolderStorage.getOpenStatus(scope.folder.id);

        scope.startEdit = startEdit;
        scope.collapse = collapse;
        scope.showTooltip = showTooltip;
        scope.hideTooltip = hideTooltip;

        _attachEvents();
        _attachDomEvents();

      }

      function showTooltip(mouseEvent) {
        jndPubSub.pub('tooltip:show', {
          direction: 'top',
          content: _more,
          target: $(mouseEvent.target)
        });
      }

      function hideTooltip(mouseEvent) {
        jndPubSub.pub('tooltip:hide');
      }

      function _getTotalAlarmCnt() {
        var count = 0;
        _.forEach(scope.folder.entityList, function(entity) {
          count += entity.alarmCnt || 0;
        });
        return count;
      }


      /**
       * scope event 를 attach 한다.
       * @private
       */
      function _attachEvents() {
        scope.$on('topic:drag', _onTopicDragStatusChange);
        scope.$on('topic-folder:rename', _onRename);
        scope.$on('badgeCountChange', _onBadgeCountChange);
      }

      function _onBadgeCountChange(angularEvent, data) {
        _safeApply(function() {
          scope.alarmCnt = _getTotalAlarmCnt();
        });
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
        if (_draggingTopicScope && _isFolderInsertable()) {
          TopicFolderModel.push(scope.folder.id, _draggingTopicScope.currentRoom.id);
        }
      }

      function _onMouseOver() {
        if (_draggingTopicScope && _isFolderInsertable()) {
          el.addClass('hover');
        }
        _hideBadge();
      }

      function _isFolderInsertable() {
        var currentRoom = _draggingTopicScope.currentRoom;
        var currentFolder = scope.folder;
        return (currentFolder.id !== -1  && currentFolder.id !== currentRoom.extFolderId) ||
            (scope.folder.id === -1  && currentRoom.extHasFolder);
      }

      function _onMouseOut(){
        if (_draggingTopicScope) {
          el.removeClass('hover');
        }
        _showBadge();
      }

      function _hideBadge() {
        var jqBadge = el.find('badge[group="folder"]');
        if (jqBadge.length) {
          jqBadge.children().hide();
        }
      }
      function _showBadge() {
        var jqBadge = el.find('badge[group="folder"]');
        if (jqBadge.length) {
          jqBadge.children().show();
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
        var keyCode = keyDownEvent.keyCode;
        if (jndKeyCode.match('ENTER', keyCode)) {
          _endEdit(keyDownEvent);
        } else if(jndKeyCode.match('ESC', keyCode)) {
          _cancelEdit(keyDownEvent);
        }
      }

      function _endEdit(domEvent) {
        var jqTarget = $(domEvent.target);
        var text = _.trim(jqTarget.val());
        TopicFolderModel.modify(scope.folder.id, {
          name: text
        });
        el.find('._folderTitle').text(text).show();
        jqTarget.hide()
          .off('blur', _endEdit)
          .off('keydown', _onKeydownInput);
      }

      function _cancelEdit(domEvent) {
        var jqTarget = $(domEvent.target);
        jqTarget.val(scope.folder.name);
        _endEdit(domEvent);
      }

      function collapse() {
        var jqUl = el.find('ul');
        var hasEntity = !!scope.folder.entityList.length;
        var callback = function() {
          _safeApply(function() {
            scope.isOpened = !scope.isOpened;
          });
        };
        var animationCallback = function() {
          callback();
          jndPubSub.updateBadgePosition();
        };

        TopicFolderStorage.setOpenStatus(scope.folder.id, !scope.isOpened);
        if (hasEntity) {
          if (scope.isOpened) {
            el.find('ul').slideUp(animationCallback);
          } else {
            el.find('ul').slideDown(animationCallback);
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
