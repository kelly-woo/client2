/**
 * @fileoverview Text renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TextRenderer', TextRenderer);

  /* @ngInject */
  function TextRenderer($templateRequest, memberService, MessageCollection) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/text/text.html';
    var TEMPLATE_URL_CHILD = 'app/center/messages/services/renderers/text/text.child.html';

    var _template;
    var _templateChild;
    var _myId;

    this.render = render;

    _init();

    /**
     *
     * @private
     */
    function _init() {
      _myId = memberService.getMemberId();
      $templateRequest(TEMPLATE_URL_CHILD).then(function(template) {
        _templateChild =  Handlebars.compile(template);
      });
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }


    function _onClick(clickEvent) {

    }

    function render(index) {
      var msg = MessageCollection.list[index];
      var isChild = MessageCollection.isChildText(index);
      var template = isChild ? _templateChild : _template;
      var isSticker = msg.message.contentType === 'sticker';
      var isMyMessage = (_myId === msg.fromEntity);
      var hasStar = !isSticker && isMyMessage;

      return template({
        hasStar: hasStar,
        isSticker: isSticker,
        isChild: isChild,
        msg: msg
      });
    }
  }
})();
