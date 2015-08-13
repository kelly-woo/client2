/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerMessagesDirective', centerMessagesDirective);

  function centerMessagesDirective(CenterRenderer, MessageCollection) {
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
      }

      function _onAppend(angularEvent, list) {
        var length = list.length;
        var htmlList = [];
        var index = MessageCollection.list.length - length;
        _.forEach(list, function(message) {
          if (MessageCollection.isNewDate(index)) {

          }
          htmlList.push(CenterRenderer.renderMessage(index));
          index++;
        });
        el.append(htmlList.join(''));
      }
      function _onPrepend(angularEvent, list) {
        console.log('_onPrepend', list);
        var htmlList = [];
        _.forEach(list, function(message, index) {
          if (MessageCollection.isNewDate(index)) {

          }
          console.log(index);
          htmlList.push(CenterRenderer.renderMessage(index));
        });
        el.prepend(htmlList.join(''));
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
