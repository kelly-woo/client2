/**
 * @fileoverview jandi tooltip directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicDraggable', topicDraggable);

  /**
   *
   */
  function topicDraggable(jndPubSub) {


    return {
      restrict: 'A',
      replace: true,
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
      _init();

      /**
       * 초기화 함수
       * @private
       */
      function _init() {
        _template = Handlebars.templates['topic.draggable'];
        _attachEvents();
        _attachDomEvents();
      }

      function _attachEvents() {
        scope.$on('topic:drag', _onDrag);
      }

      function _onDrag(angularEvent, draggingScope) {
        _draggingScope = draggingScope;
        if (!_draggingScope) {
          el.css('background', 'transparent');
        }
      }

      function _attachDomEvents() {
        el.on('mousedown', _onMouseDown);
        el.on('mouseover', _onMouseOver);
        el.on('mouseout', _onMouseOut);
        el.on('mouseup', _onMouseUp);
      }

      function _onMouseUp(mouseEvent) {
        if (scope === _draggingScope) {
          console.log('###yes');
          mouseEvent.preventDefault();
          mouseEvent.stopPropagation();
          //_onWindowMouseUp();
        } else {
          console.log('###no');
        }
      }
      
      function _onMouseOver() {
        if (_draggingScope) {
          el.css('background', 'red');
        }
      }

      function _onMouseOut() {
        if (_draggingScope) {
          el.css('background', 'transparent');
        }
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
        jndPubSub.pub('topic:drag', scope);
        _cursor = $('#lpanel-list-container').css('cursor');
        $('#lpanel-list-container').css('cursor', 'pointer');
        _showDraggable(mouseEvent);
      }

      function _endDrag() {
        jndPubSub.pub('topic:drag', scope);
        $('#lpanel-list-container').css('cursor', _cursor);
        _hideDraggable();
      }

      function _showDraggable(mouseEvent) {
        _jqDraggable = $(_template({
          currentRoom: scope.currentRoom
        }));
        $('body').append(_jqDraggable);
        _width = _jqDraggable.width();
        _height = _jqDraggable.height();
        _setDraggablePosition(mouseEvent);
      }

      function _setDraggablePosition(mouseEvent) {
        var top = mouseEvent.pageY;
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
          var targetScope = angular.element(mouseEvent.target).scope();
          if (targetScope.currentRoom) {
            console.log(targetScope.currentRoom);
          }
        } else {
          if (_getDistance(mouseEvent) > 10) {
            _startDrag(mouseEvent);
          }
        }
      }
    }
  }
})();
