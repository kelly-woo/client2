/**
 * @fileoverview Text renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TextRenderer', TextRenderer);

  /* @ngInject */
  function TextRenderer($templateRequest, MessageCollection, currentSessionHelper, jndPubSub, RendererUtil) {
    var TEMPLATE_URL = 'app/center/messages/services/renderers/text/text.html';
    var TEMPLATE_URL_CHILD = 'app/center/messages/services/renderers/text/text.child.html';
    var TEMPLATE_URL_LINKPREVIEW = 'app/center/messages/services/renderers/text/text.link.preview.html';

    var _template;
    var _templateChild;
    var _templateLinkPreview;

    this.render = render;
    this.delegateHandler = {
      'click': _onClick
    };

    _init();

    /**
     * 생성자
     * @private
     */
    function _init() {
      $templateRequest(TEMPLATE_URL_CHILD).then(function(template) {
        _templateChild =  Handlebars.compile(template);
      });
      $templateRequest(TEMPLATE_URL).then(function(template) {
        _template =  Handlebars.compile(template);
      });
      $templateRequest(TEMPLATE_URL_LINKPREVIEW).then(function(template) {
        _templateLinkPreview =  Handlebars.compile(template);
      });

    }


    /**
     * click 이벤트 핸들러
     * @param clickEvent
     * @private
     */
    function _onClick(clickEvent) {
      var jqTarget = $(clickEvent.target);
      var id = jqTarget.closest('.msgs-group').attr('id');

      if (jqTarget.hasClass('_textMore')) {
        _showMore(jqTarget, MessageCollection.get(id));
      }
    }

    function _showMore(jqTarget, msg) {
      var entityType = currentSessionHelper.getCurrentEntityType();
      var showAnnouncement = (RendererUtil.isSticker(msg) && entityType !== 'users');
      jndPubSub.pub('show:center-item-dropdown', {
        target: jqTarget,
        msg: msg,
        hasStar: msg.hasStar,
        isMyMessage: RendererUtil.isMyMessage(msg),
        showAnnouncement: showAnnouncement
      });
    }

    function render(index) {
      var msg = MessageCollection.list[index];
      var isChild = MessageCollection.isChildText(index);
      var hasLinkPreview = MessageCollection.hasLinkPreview(index);
      var linkPreview = hasLinkPreview ? _templateLinkPreview({msg: msg}) : '';
      var template = isChild ? _templateChild : _template;

      //console.log('hasLinkPreview', hasLinkPreview, msg);
      return template({
        html: {
          linkPreview: linkPreview
        },
        css: {
          star: RendererUtil.getStarCssClass(msg)
        },
        hasMore: RendererUtil.hasMore(msg),
        hasStar: RendererUtil.hasStar(msg),
        isSticker: RendererUtil.isSticker(msg),
        isChild: isChild,
        msg: msg
      });
    }
  }
})();
