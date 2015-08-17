/**
 * @fileoverview Text renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TextRenderer', TextRenderer);

  /* @ngInject */
  function TextRenderer($templateRequest, memberService, MessageCollection, currentSessionHelper, jndPubSub) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/text/text.html';
    var TEMPLATE_URL_CHILD = 'app/center/messages/services/renderers/text/text.child.html';

    var _template;
    var _templateChild;

    this.render = render;
    this.delegateHandler = {
      'click': _onClick
    };

    _init();

    /**
     *
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL_CHILD).then(function(template) {
        _templateChild =  Handlebars.compile(template);
      });
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
    }


    function _onClick(clickEvent) {
      var msg;
      var jqTarget = $(clickEvent.target);
      var id = jqTarget.closest('.msgs-group').attr('id');
      if (jqTarget.hasClass('_textStar')) {

      } else if (jqTarget.hasClass('_textMore')) {
        _showMore(jqTarget, MessageCollection.get(id));
      }
    }

    function _showMore(jqTarget, msg) {
      var entityType = currentSessionHelper.getCurrentEntityType();
      var showAnnouncement = (msg.message.contentType !== 'sticker' && entityType !== 'users');
      jndPubSub.pub('show:center-item-dropdown', {
        target: jqTarget,
        msg: msg,
        hasStar: msg.hasStar,
        isMyMessage: _isMyMessage(msg),
        showAnnouncement: showAnnouncement
      });
    }

    function _isMyMessage(msg) {
      return (memberService.getMemberId() === msg.fromEntity);
    }

    function render(index) {
      var msg = MessageCollection.list[index];
      var isChild = MessageCollection.isChildText(index);
      var template = isChild ? _templateChild : _template;
      var isSticker = msg.message.contentType === 'sticker';
      var hasStar = !isSticker;
      var hasMore = !isSticker || _isMyMessage(msg);
      var starClass = msg.message.isStarred ? '' : 'off msg-item__action';

      return template({
        starClass: starClass,
        hasMore: hasMore,
        hasStar: hasStar,
        isSticker: isSticker,
        isChild: isChild,
        msg: msg
      });
    }
  }
})();
