/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerMessagesDirective', centerMessagesDirective);

  function centerMessagesDirective($compile, CenterRenderer, CenterRendererFactory, MessageCollection, memberService,
                                   StarAPIService, jndPubSub) {
    return {
      restrict: 'E',
      link: link
    };

    function link(scope, el, attrs) {
      var _teamId;

      _init();

      /**
       * 생성자
       * @private
       */
      function _init() {
        _teamId = memberService.getTeamId();
        _attachEvents();
        _attachDomEvents();
        _renderAll();
      }

      /**
       * angular event 를 바인딩한다.
       * @private
       */
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
       * dom event 를 바인딩한다.
       * @private
       */
      function _attachDomEvents() {
        _attachDelegateDomHandlers();
        el.on('click', _onClick);
      }

      /**
       * delegate 로 처리할 dom event handler 를 추가한다.
       * @private
       */
      function _attachDelegateDomHandlers() {
        var renderers = CenterRendererFactory.getAll();
        _.forEach(renderers, function(renderer) {
          if (renderer.delegateHandler) {
            _attachEachDelegateHandler(renderer.delegateHandler);
          }
        });
      }

      /**
       * 각각의 dom event handler 를 추가한다.
       * @param {Object} handlers
       * @private
       */
      function _attachEachDelegateHandler(handlers) {
        _.each(handlers, function(handler, eventName) {
          el.on(eventName, handler);
        });
      }

      /**
       * 공통 click 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onClick(clickEvent) {
        var jqTarget = $(clickEvent.target);
        var id = jqTarget.closest('.msgs-group').attr('id');
        var msg = MessageCollection.get(id);

        //star 클릭 시
        if (jqTarget.hasClass('_star')) {
          _onStarClick(msg);
        } else if (jqTarget.closest('._user').length) {
          _onUserClick(msg);
        }
      }

      /**
       * star click 핸들러
       * @param msg
       * @private
       */
      function _onStarClick(msg) {
        var index = MessageCollection.at(msg.messageId);
        msg.message.isStarred = !msg.message.isStarred;
        _refresh(msg.id, index);
        if (msg.message.isStarred) {
          StarAPIService.star(msg.messageId, _teamId);
        } else {
          StarAPIService.unStar(msg.messageId, _teamId);
        }
      }

      function _onUserClick(msg) {
        jndPubSub.pub('onUserClick', msg.extWriter);
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

      /**
       * id 에 해당하는 dom 을 갱신한다.
       * @param id
       * @param index
       * @private
       */
      function _refresh(id, index) {
        var jqTarget = $('#' + id);
        if (jqTarget.length) {
          jqTarget.replaceWith(CenterRenderer.render(index));
        }
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

      /**
       * 실제 remove 가 발생하기 전 이벤트 핸들러
       * @param angularEvent
       * @param index
       * @private
       */
      function _onBeforeRemove(angularEvent, index) {
        var msg = MessageCollection.list[index];
        var jqTarget = $('#' + msg.id);
        jqTarget.remove();
      }

      /**
       * remove 이벤트 핸들러
       * @param angularEvent
       * @param index
       * @private
       */
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
