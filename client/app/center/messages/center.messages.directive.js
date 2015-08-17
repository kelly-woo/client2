/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerMessagesDirective', centerMessagesDirective);

  function centerMessagesDirective($compile, CenterRenderer, CenterRendererFactory, MessageCollection, memberService, StarAPIService) {
    return {
      restrict: 'E',
      link: link
    };

    function link(scope, el, attrs) {
      var _teamId;

      //CenterRenderer.
      _init();
      function _init() {
        _teamId = memberService.getTeamId();
        _attachEvents();
        _attachDelegatedDomEvents();
        _renderAll();
      }

      function _attachDelegatedDomEvents() {
        var renderers = CenterRendererFactory.getAll();
        _.forEach(renderers, function(renderer) {
          if (renderer.delegateHandler) {
            _attachEachHandler(renderer.delegateHandler);
          }
        });
      }

      function _attachEachHandler(handlers) {
        _.each(handlers, function(handler, eventName) {
          el.on(eventName, handler);
        });
        el.on('click', _onClick);
      }

      function _onClick(clickEvent) {
        var jqTarget = $(clickEvent.target);
        var id = jqTarget.closest('.msgs-group').attr('id');
        var msg = MessageCollection.get(id);
        var index;
        if (jqTarget.hasClass('_textStar')) {
          msg.message.isStarred = !msg.message.isStarred;
          index = MessageCollection.at(msg.messageId);
          _refresh(msg.id, index);
          if (msg.message.isStarred) {
            StarAPIService.star(msg.messageId, _teamId);
          } else {
            StarAPIService.unStar(msg.messageId, _teamId);
          }
        }
      }

      function _attachEvents() {
        scope.$on('messages:reset', _renderAll);
        scope.$on('messages:append', _onAppend);
        scope.$on('messages:prepend', _onPrepend);
        scope.$on('messages:beforeRemove', _onBeforeRemove);
        scope.$on('messages:remove', _onRemove);
        scope.$on('messages:set', _renderAll);

        scope.$on('messages:updateUnread', _onUpdateUnread);

        scope.$on('starred', _onStarred);
        scope.$on('unStarred', _onUnStarred);
      }

      /**
       * socket 에서 starred 이벤트 발생시
       * @param {Object} event - angular 이벤트
       * @param {Object} param
       *     @param {Number|String} param.teamId - team id
       *     @param {Number|String} param.messageId - message id
       * @private
       */
      function _onStarred(event, param) {
        var msg = MessageCollection.getByMessageId(param.messageId);
        var index;

        if (_teamId.toString() === param.teamId.toString()) {
          if (!msg.message.isStarred) {
            msg.message.isStarred = true;
            index = MessageCollection.at(msg.messageId);
            _refresh(msg.id, index);
          }
        }
      }

      /**
       * socket 에서 un-starred 이벤트 발생시
       * @param {Object} event - angular 이벤트
       * @param {Object} param
       *     @param {Number|String} param.teamId - team id
       *     @param {Number|String} param.messageId - message id
       * @private
       */
      function _onUnStarred(event, param) {
        var msg = MessageCollection.getByMessageId(param.messageId);
        var index;
        if (_teamId.toString() === param.teamId.toString()) {
          if (msg.message.isStarred) {
            msg.message.isStarred = false;
            index = MessageCollection.at(msg.messageId);
            _refresh(msg.id, index);
          }
        }
      }

      function _onUpdateUnread(angularEvent, data) {
        _refresh(data.msg.id, data.index);
      }

      /**
       * message append 이벤트 핸들러
       * @param {Object} angularEvent
       * @param {Array} list
       * @private
       */
      function _onAppend(angularEvent, list) {
        var length = list.length;
        var htmlList = [];
        var index = MessageCollection.list.length - length;
        _.forEach(list, function(message) {
          if (MessageCollection.isNewDate(index)) {
            htmlList.push(CenterRenderer.render(index, 'date'));
          }
          htmlList.push(CenterRenderer.render(index));
          index++;
        });
        el.append(htmlList.join(''));
        //$compile(el.contents())(scope);
      }

      function _refresh(id, index) {
        $('#' + id).replaceWith(CenterRenderer.render(index));
      }


      /**
       * prepend 이벤트 핸들러
       * @param {Object} angularEvent
       * @param {Array} list
       * @private
       */
      function _onPrepend(angularEvent, list) {
        var start = new Date();
        var htmlList = [];
        _.forEach(list, function(message, index) {
          if (MessageCollection.isNewDate(index)) {
            htmlList.push(CenterRenderer.render(index, 'date'));
          }
          htmlList.push(CenterRenderer.render(index));
        });
        el.prepend(htmlList.join(''));
        //$compile(el.contents())(scope);
      }

      function _onBeforeRemove(angularEvent, index) {
        var msg = MessageCollection.list[index];
        var jqTarget = $('#' + msg.id);
        jqTarget.remove();
      }

      function _onRemove(angularEvent, index) {
        var msg = MessageCollection.list[index];
        _refresh(msg.id, index);
      }


      function _renderAll() {
        var htmlList = [];
        var list = MessageCollection.list;
        _.forEach(list, function(message, index) {
          if (MessageCollection.isNewDate(index)) {
            htmlList.push(CenterRenderer.render(index, 'date'));
          }
          htmlList.push(CenterRenderer.renderMsg(index));
        });
        el.html(htmlList.join(''));
        //$compile(el.contents())(scope);
        scope.onRepeatDone();
      }
      scope.onRepeatDone();
    }

  }
})();
