/**
 * @fileoverview jandi tooltip directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicFolderDraggable', topicFolderDraggable);

  /**
   *
   */
  function topicFolderDraggable(jndPubSub, memberService, TopicFolderModel) {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        folder: '=topicFolderDraggable'
      },
      link: link
    };

    function link(scope, el, attrs) {
      var _draggingScope;
      var _pageX;
      var _pageY;
      var _template;
      var _width;
      var _height;
      var _jqDraggable;
      var _cursor;
      var _teamId;
      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _attachEvents();
        _attachDomEvents();
      }

      function _attachEvents() {
        scope.$on('topic-folder:drag', _onDragStatusChange);
      }

      function _onDragStatusChange(angularEvent, draggingScope) {
        _draggingScope = draggingScope;
        if (!_draggingScope) {
          jndPubSub.pub('topic-update-lock', false);
          el.removeClass('topic-folder-dropzone-active');
          _hideBorder();
        } else {
          jndPubSub.pub('topic-update-lock', true);
          el.addClass('topic-folder-dropzone-active');
        }
      }

      function _attachDomEvents() {
        el.on('mousedown', _onMouseDown);
        el.on('mouseover', _onMouseOver);
        el.on('mouseout', _onMouseOut);
        el.on('mouseup', _onMouseUp);
      }

      function _onMouseUp(mouseEvent) {
        if (_isFolderMovable()) {
          var seq = _draggingScope.folder.seq < scope.folder.seq ? scope.folder.seq - 1 : scope.folder.seq;
          TopicFolderModel.modify(_draggingScope.folder.id, {
            seq: seq
          });
        }
      }

      function _onMouseOver() {
        if (_isFolderMovable()) {
          _showBorder();
        }
      }

      function _onMouseOut() {
        if (_isFolderMovable()) {
          _hideBorder();
        }
      }

      function _isFolderMovable() {
        return _draggingScope && _draggingScope !== scope && _draggingScope.folder.seq + 1 !== scope.folder.seq;
      }
      function _showBorder() {
        el.closest('.topic-folder').find('._border').addClass('on');
      }
      function _hideBorder() {
        el.closest('.topic-folder').find('._border').removeClass('on');
      }

      function _onMouseDown(mouseEvent) {
        _setStartPosition(mouseEvent);
        _attachDraggableEvents();
      }

      function _setStartPosition(mouseEvent) {
        _pageX = mouseEvent.pageX;
        _pageY = mouseEvent.pageY;
      }

      function _startDrag(mouseEvent) {
        _draggingScope = scope;
        jndPubSub.pub('topic-folder:drag', scope);
        _cursor = $('#lpanel-list-container').css('cursor');
        $('#lpanel-list-container').css('cursor', 'pointer');
        _showDraggable(mouseEvent);
        el.parent().addClass('topic-dragging');
      }

      function _endDrag() {
        if (_draggingScope) {
          _draggingScope = null;
          jndPubSub.pub('topic-folder:drag', null);
          $('#lpanel-list-container').css('cursor', _cursor);
          _hideDraggable();
          el.parent().removeClass('topic-dragging');
        }
      }

      function _showDraggable(mouseEvent) {
        _jqDraggable = $('<div class="lpanel-list topic-folder-draggable"></div>')
          .append(el.parent().html());

        $('body').append(_jqDraggable);
        _width = _jqDraggable.width();
        _height = _jqDraggable.height();

        _setDraggablePosition(mouseEvent);
        $(mouseEvent.target).trigger('mouseover');
      }

      function _setDraggablePosition(mouseEvent) {
        var top = mouseEvent.pageY + 3;
        var left = mouseEvent.pageX + 3;
        _jqDraggable.css({
          top: top + 'px',
          left: left + 'px'
        });
      }

      function _hideDraggable() {
        _jqDraggable.remove();
      }

      /**
       * mousedown 이 일어난 지점부터의 거리를 구한다.
       * @param {event} mouseMoveEvent 이벤트 객체
       * @return {number} 처음 위치좌표로 부터의 거리.
       * @private
       */
      function _getDistance(mouseMoveEvent) {
        var pageX = mouseMoveEvent.pageX;
        var pageY = mouseMoveEvent.pageY;
        var x = Math.abs(_pageX - pageX);
        var y = Math.abs(_pageY - pageY);
        return Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
      }


      function _attachDraggableEvents() {
        $(window).on('mousemove', _onWindowMouseMove);
        $(window).on('selectstart', _onWindowSelectStart);
        $(window).on('mouseup', _onWindowMouseUp);
      }

      function _detachDraggableEvents() {
        $(window).off('mousemove', _onWindowMouseMove);
        $(window).off('selectstart', _onWindowSelectStart);
        $(window).off('mouseup', _onWindowMouseUp);
      }

      function _onWindowSelectStart(mouseEvent) {
        mouseEvent.preventDefault();
      }

      function _onWindowMouseUp() {
        _endDrag();
        _detachDraggableEvents();
      }

      function _onWindowMouseMove(mouseEvent) {
        if (_draggingScope) {
          _setDraggablePosition(mouseEvent);
        } else {
          if (_getDistance(mouseEvent) > 5) {
            _startDrag(mouseEvent);
          }
        }
      }
    }
  }
})();
