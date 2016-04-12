/**
 * @fileoverview 토픽 폴더 directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicFolder', topicFolder);
  
  function topicFolder($filter, memberService, jndKeyCode, TopicFolderModel, JndTopicFolderStorage, jndPubSub, JndUtil,
                       TopicUpdateLock) {
    return {
      restrict: 'E',
      templateUrl: 'app/left/topics/folder/topic.folder.html',
      link: link,
      replace: true
    };

    function link(scope, el, attrs) {
      var SLIDE_DURATION = 300;
      var _draggingTopicScope;
      var _teamId;
      var _more = $filter('translate')('@file-action-more');
      var _isShowBadge = false;
      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _teamId = memberService.getTeamId();
        scope.collapse = collapse;
        scope.showTooltip = showTooltip;
        scope.hideTooltip = hideTooltip;
        
        scope.hasEmptyArea = scope.folder.id === -1 && !scope.folder.entityList.length;
        scope.alarmCnt = _getTotalAlarmCnt();
        scope.isOpen = scope.isExpand = JndTopicFolderStorage.getOpenStatus(scope.folder.id);
        _isShowBadge = !scope.isOpen;

        _attachEvents();
        _attachDomEvents();
        _setFolderBadgeVisibility();
      }

      /**
       * tooltip 더보기를 노출한다.
       * @param {Event} mouseEvent
       */
      function showTooltip(mouseEvent) {
        jndPubSub.pub('tooltip:show', {
          direction: 'top',
          content: _more,
          target: $(mouseEvent.target)
        });
      }

      /**
       * tooltip 더보기를 숨긴다.
       * @param mouseEvent
       */
      function hideTooltip(mouseEvent) {
        jndPubSub.pub('tooltip:hide');
      }

      /**
       * 해당 folder 의 전체 alarmCount 를 계산한다.
       * @returns {number}
       * @private
       */
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
        scope.$on('topic-folder:update', _onBadgeCountChange);
        scope.$on('onBeforeEntityChange', _onBeforeEntityChange);
      }

      /**
       * currentEntity 가 변경되기 직전 수행된다.
       * @param {event} angularEvent
       * @param {object} entity
       * @private
       */
      function _onBeforeEntityChange(angularEvent, entity) {
        TopicFolderModel.setCurrentEntity(entity.id);
      }

      /**
       * badgeCountChange 변경시 이벤트 핸들러
       * @param angularEvent
       * @param data
       * @private
       */
      function _onBadgeCountChange(angularEvent, data) {
        scope.alarmCnt = _getTotalAlarmCnt();
        _isShowBadge = !scope.isExpand;
        _setFolderBadgeVisibility();
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
          _startEdit();
        }
      }

      /**
       * mouse-up 이벤트 핸들러
       * @private
       */
      function _onMouseUp() {
        if (_draggingTopicScope && _isFolderInsertable()) {
          TopicFolderModel.push(scope.folder.id, _draggingTopicScope.currentRoom.id);
        }
      }

      /**
       * mouse-over 이벤트 핸들러
       * @private
       */
      function _onMouseOver() {
        if (_draggingTopicScope && _isFolderInsertable()) {
          el.addClass('hover');
        }
        _isShowBadge = false;
        _setFolderBadgeVisibility();
      }

      /**
       * folder badge 의 노출 여부를 결정한다.
       * @private
       */
      function _setFolderBadgeVisibility() {
        var jqBadge = el.find('._badge');

        if (!scope.isOpen && _isShowBadge && scope.alarmCnt) {
          jqBadge.show();
        } else {
          jqBadge.hide();
        }
      }

      /**
       * 현재 scope 의 폴더에 토픽 추가 가능한지 여부를 반환한다.
       * @returns {boolean|*}
       * @private
       */
      function _isFolderInsertable() {
        var currentRoom = _draggingTopicScope.currentRoom;
        var currentFolder = scope.folder;
        return (currentFolder.id !== -1  && currentFolder.id !== currentRoom.extFolderId) ||
            (scope.folder.id === -1  && currentRoom.extHasFolder);
      }

      /**
       * mouseout 이벤트 핸들러
       * @private
       */
      function _onMouseOut(){
        if (_draggingTopicScope) {
          el.removeClass('hover');
        }
        _isShowBadge = true;
        _setFolderBadgeVisibility();
      }

      /**
       * drag 상태 변경시 이벤트 핸들러
       * @param {event} angularEvent
       * @param {object} draggingScope
       * @private
       */
      function _onTopicDragStatusChange(angularEvent, draggingScope) {
        _draggingTopicScope = draggingScope;
        if (!_draggingTopicScope) {
          el.removeClass('hover');
        }
      }

      /**
       * 폴더 이름 변경을 시작한다.
       * @private
       */
      function _startEdit() {
        el.find('._folderTitle').hide();
        el.find('input:first')
          .val(scope.folder.name)
          .show()
          .on('keydown', _onKeydownInput)
          .on('blur', _endEdit)
          .focus()
          .select();
      }

      /**
       * 폴더 이름 변경 시작시 input keydown 이벤트 핸들러
       * @param {Event} keyDownEvent
       * @private
       */
      function _onKeydownInput(keyDownEvent) {
        var keyCode = keyDownEvent.keyCode;
        if (jndKeyCode.match('ENTER', keyCode)) {
          _endEdit(keyDownEvent);
        } else if(jndKeyCode.match('ESC', keyCode)) {
          _cancelEdit(keyDownEvent);
        }
      }

      /**
       * 폴더 이름 변경 완료
       * @param {Event} domEvent
       * @private
       */
      function _endEdit(domEvent) {
        var jqTarget = $(domEvent.target);
        var text = _.trim(jqTarget.val());
        text = text.length ? text : scope.folder.name;
        
        if (scope.folder.name !== text) {
          TopicFolderModel.modify(scope.folder.id, {
            name: text
          });
        }
        el.find('._folderTitle').text(text).show();
        jqTarget.hide()
          .off('blur', _endEdit)
          .off('keydown', _onKeydownInput);
      }

      /**
       * 폴더 이름 변경 취소
       * @param {Event} domEvent
       * @private
       */
      function _cancelEdit(domEvent) {
        var jqTarget = $(domEvent.target);
        jqTarget.val(scope.folder.name);
        _endEdit(domEvent);
      }

      /**
       * 폴더의 collapse 를 toggle 한다.
       */
      function collapse() {
        var hasEntity = !!scope.folder.entityList.length;
        var callback = function() {
          scope.alarmCnt = _getTotalAlarmCnt();
          scope.isExpand = scope.isOpen;
          _isShowBadge = !scope.isExpand;
          JndTopicFolderStorage.setOpenStatus(scope.folder.id, scope.isExpand);
          _setFolderBadgeVisibility();
        };
        var animationCallback = function() {
          callback();
          el.find('ul').css('height', '');
          jndPubSub.updateBadgePosition();
          TopicUpdateLock.unlock();
          _setFolderBadgeVisibility();
        };

        if (scope.isOpen) {
          _isShowBadge = false;
        }
        scope.isOpen = !scope.isOpen;
        _setFolderBadgeVisibility();

        if (hasEntity) {
          TopicUpdateLock.lock();
          el.addClass('animate-background');
          if (!scope.isOpen) {
            el.find('ul').stop().slideUp(SLIDE_DURATION, animationCallback);
          } else {
            el.find('ul').stop().slideDown(SLIDE_DURATION, animationCallback);
          }
        } else {
          callback();
        }
      }
    }
  }
})();
