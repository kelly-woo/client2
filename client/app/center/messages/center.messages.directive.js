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
                                   StarAPIService, jndPubSub, fileAPIservice) {
    return {
      restrict: 'E',
      replace: true,
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

        scope.$on('$destroy', _onDestroy);

        scope.$on('updateCenterForRelatedFile', _onFileUpdated);
        scope.$on('centerOnFileDeleted', _onFileDeleted);
      }

      /**
       * file 의 공유 상황이 update 되었을 때 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} file
       * @private
       */
      function _onFileUpdated(angularEvent, file) {
        var fileId = file.id;
        fileAPIservice.getFileDetail(fileId)
          .success(function() {
            var shareEntities;
            _.forEach(response.messageDetails, function(item) {
              if (item.contentType === 'file') {
                shareEntities = item.shareEntities;
              }
            });
            _.forEach(MessageCollection.list, function(msg, index) {
              if (msg.message.id === fileId) {
                msg.message.shareEntities = shareEntities;
                _refresh(msg.id, index);
              }
            });
          });
      }

      /**
       * file 삭제 이벤트 핸들러
       * @param {object} angularEvent
       * @param {object} param
       * @private
       */
      function _onFileDeleted(angularEvent, param) {
        var deletedFileId = parseInt(param.file.id, 10);
        _.forEach(MessageCollection.list, function(msg, index) {
          if (msg.message.id === deletedFileId) {
            msg.message.status = 'archived';
            _refresh(msg.id, index);
          }
        });
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
       * delegation 을 사용하지 않고,
       * 각각의 Renderer 에 설정된 이벤트 핸들러를 바인딩 한다.
       * (현재 사용하지 않는 함수. 추후 사용 가능성 있음.)
       * @param {object} jqTarget
       * @param {object} renderer
       * @private
       * @deprecated
       */
      function _attachRendererHandler(jqTarget, renderer) {
        if (renderer.eventHandler) {
          _.each(renderer.eventHandler, function(handler, name) {
            var tmp = name.split(' '),
              eventName = tmp[0],
              selector = tmp[1] || '';

            if (selector) {
              jqTarget = jqTarget.find(selector);
            }
            jqTarget.on(eventName, handler);
          });
        }
      }

      /**
       * 소멸자
       * @private
       */
      function _onDestroy() {
        _destroyCompiledScope(el);
        el.remove();
      }

      /**
       * 모든 랜더러 공통 click 이벤트 핸들러
       * @param {Event} clickEvent
       * @private
       */
      function _onClick(clickEvent) {
        var jqTarget = $(clickEvent.target);
        var id = jqTarget.closest('.msgs-group').attr('id');
        var msg = MessageCollection.get(id);

        //star 클릭 시
        if (jqTarget.closest('._star').length) {
          _onClickStar(msg);
        } else if (jqTarget.closest('._user').length) {
          _onClickUser(msg);
        } else if (jqTarget.closest('._fileShare').length) {
          _onClickFileShare(msg);
        }
      }

      function _onClickFileShare(msg) {
        scope.onShareClick(msg.message);
        //fixme: 알 수 없는 이유로 digest cycle 이 수행되지 않기 때문에 apply 를 수행함
        scope.$apply();
      }

      /**
       * star click 핸들러
       * @param msg
       * @private
       */
      function _onClickStar(msg) {
        var index = MessageCollection.at(msg.messageId);
        msg.message.isStarred = !msg.message.isStarred;
        _refreshStar(msg);
        if (msg.message.isStarred) {
          StarAPIService.star(msg.messageId, _teamId);
        } else {
          StarAPIService.unStar(msg.messageId, _teamId);
        }
      }

      function _onClickUser(msg) {
        jndPubSub.pub('onUserClick', msg.extWriter.id);
        //fixme: 알 수 없는 이유로 digest cycle 이 수행되지 않기 때문에 apply 를 수행함
        scope.$apply();
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
          msg.message.isStarred = true;
          _refreshStar(msg);
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
          msg.message.isStarred = false;
          _refreshStar(msg);
        }
      }
      function _refreshStar(msg) {
        var jqTarget = $('#' + msg.id).find('._star');
        if (jqTarget.length) {
          if (msg.message.isStarred) {
            jqTarget.removeClass('off').removeClass('msg-item__action');
          } else {
            jqTarget.addClass('off msg-item__action');
          }
        }
      }

      function _onUpdateUnread(angularEvent, data) {
        var msg = data.msg;
        var jqTarget = $('#' + msg.id);
        if (jqTarget.length) {
          jqTarget.find('.unread-badge').text(msg.unreadCount);
        }
      }

      /**
       * refresh 할 때, 날짜 구분선이 이미 랜더링 되었는지 확인한다.
       * @param id
       * @param index
       * @returns {boolean}
       * @private
       */
      function _isDateRendered(id, index) {
        var jqTarget = $('#' + id);
        if (jqTarget.length) {
          if (MessageCollection.isNewDate(index) && jqTarget.prev().attr('content-type') !== 'date') {
            return false;
          }
        }
        return true;
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
        var headMsg = MessageCollection.list[list.length];

        _.forEach(list, function(message, index) {
          if (MessageCollection.isNewDate(index)) {
            htmlList.push(CenterRenderer.render(index, 'date'));
          }
          htmlList.push(CenterRenderer.render(index));
        });

        if (headMsg) {
          _refresh(headMsg.id, list.length);
        }

        el.prepend(_getCompiledEl(htmlList.join('')));
        var end = new Date();
        console.log('!!!elapsed', end - start);
        scope.onRepeatDone();
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
        el.append(_getCompiledEl(htmlList.join('')));
        scope.onRepeatDone();
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
        var jqPrev = jqTarget.prev();

        if (jqTarget.length) {
          //Date 를 갱신하기 위해 기존 date 를 제거한다.
          if (jqPrev.attr('content-type') === 'date') {
            _destroyCompiledScope(jqPrev);
            jqPrev.remove();
          }
          if (!_isDateRendered(id, index)) {
            jqTarget.before(_getCompiledEl(CenterRenderer.render(index, 'date')));
          }
          _destroyCompiledScope(jqTarget);
          jqTarget.replaceWith(_getCompiledEl(CenterRenderer.render(index)));
        }
      }

      function _getCompiledEl(htmlStr) {
        var jqDummy = $('<div></div>');
        var newScope;
        jqDummy.html(htmlStr);
        _.forEach(jqDummy.find('._compile'), function(targetEl) {
          newScope = scope.$new();
          $(targetEl).data('scope', newScope);
          $compile(targetEl)(newScope);
        });
        return jqDummy.contents();
      }

      function _destroyCompiledScope(jqTarget) {
        var jqCompiledList = jqTarget.find('._compile');
        var targetScope;
        _.forEach(jqCompiledList, function(targetEl) {
          targetScope = $(targetEl).data('scope');
          if (targetScope) {
            targetScope.$destroy();
          }
        });
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
        var jqPrev = jqTarget.prev();

        //Date 를 갱신하기 위해 기존 date 를 제거한다.
        if (jqTarget.length) {
          if (jqPrev.attr('content-type') === 'date') {
            _destroyCompiledScope(jqPrev);
            jqPrev.remove();
          }
          _destroyCompiledScope(jqTarget);
          jqTarget.remove();
        }
      }

      /**
       * remove 이벤트 핸들러
       * @param angularEvent
       * @param index
       * @private
       */
      function _onRemove(angularEvent, index) {
        var msg = MessageCollection.list[index];
        if (msg) {
          _refresh(msg.id, index);
        }
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
        _destroyCompiledScope(el);
        el.empty().html(_getCompiledEl(htmlList.join('')));
        scope.onRepeatDone();
        //$compile(el.contents())(scope);
      }
    }
  }
})();
