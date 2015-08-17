/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerMessagesDirective', centerMessagesDirective);

  function centerMessagesDirective($compile, CenterRenderer, MessageCollection) {
    return {
      restrict: 'E',
      link: link
    };

    function link(scope, el, attrs) {


      //CenterRenderer.
      _init();
      function _init() {
        _attachEvents();
        _renderAll();
      }

      function _attachEvents() {
        scope.$on('messages:reset', _renderAll);
        scope.$on('messages:append', _onAppend);
        scope.$on('messages:prepend', _onPrepend);
        scope.$on('messages:remove', _onRemove);
        scope.$on('messages:set', _renderAll);

        scope.$on('messages:updateUnread', _onUpdateUnread);
      }

      function _onUpdateUnread(angularEvent, data) {
        $('#' + data.msg.id).replaceWith(CenterRenderer.render(data.index));
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
        //var end = new Date();
        //var elapsed = end - start;
        //alert(elapsed);
      }
      function _onRemove(angularEvent, index) {

      }
      function _renderAll() {
        var htmlList = [];
        var list = MessageCollection.list;
        _.forEach(list, function(message, index) {
          if (MessageCollection.isNewDate(index)) {

          }
          htmlList.push(CenterRenderer.renderMsg(index));
        });
        console.log('htmlList', htmlList);
        el.html(htmlList.join(''));

        scope.onRepeatDone();
      }
      scope.onRepeatDone();
    }

  }
})();
