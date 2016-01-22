/**
 * @fileoverview Text renderer 서비스
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('TextRenderer', TextRenderer);

  /* @ngInject */
  function TextRenderer($filter, MessageCollection, currentSessionHelper, jndPubSub, RendererUtil, memberService) {
    var _template;
    var _templateChild;

    var _templateAttachment;
    var _templateLinkPreview;
    var _templateConnectPreview;

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
      _template = Handlebars.templates['center.text'];
      _templateChild = Handlebars.templates['center.text.child'];

      _templateAttachment = Handlebars.templates['center.text.attachment'];
      _templateLinkPreview = Handlebars.templates['center.text.link.preview'];
      _templateConnectPreview = Handlebars.templates['center.text.connect.preview'];
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
        _showMoreDropdown(jqTarget, MessageCollection.get(id));
      }
    }

    /**
     * '더보기' dropdown 을 노출한다.
     * @param {object} jqTarget
     * @param {object} msg
     * @private
     */
    function _showMoreDropdown(jqTarget, msg) {
      var entityType = currentSessionHelper.getCurrentEntityType();
      var showAnnouncement = _isShowAnnouncement(msg, entityType);
      jndPubSub.pub('show:center-item-dropdown', {
        target: jqTarget,
        msg: msg,
        hasStar: msg.hasStar,
        isMyMessage: RendererUtil.isMyMessage(msg),
        showAnnouncement: showAnnouncement
      });
    }

    /**
     * 공지등록 버튼의 출력 여부
     * @param {object} msg
     * @param {string} entityType
     * @returns {boolean|*|boolean|*}
     * @private
     */
    function _isShowAnnouncement(msg, entityType) {
      // message가 스티커가 아니며 message를 작성한 작성자가 반드시 user(bot이 아님)여야 하고
      // 현재 center의 chat list가 channel(topic)인 경우 공지사항으로 등록 가능하다
      return (!RendererUtil.isSticker(msg) && entityType === 'channels' && memberService.isUser(msg.message.writerId));
    }

    /**
     * index 에 해당하는 메세지를 rendering 한다.
     * @param {number} index
     * @returns {*}
     */
    function render(index) {
      var msg = MessageCollection.list[index];
      var isChild = MessageCollection.isChildText(index);
      var template = isChild ? _templateChild : _template;

      var linkPreview = _getLinkPreview(msg, index);
      var connectPreview = _getConnectPreview(msg, index);
      var profileCursor;

      if (memberService.isConnectBot(msg.message.writerId)) {
        // connect bot이 작성한 message이면 cursor를 default로 설정한다.
        profileCursor = '';
      } else {
        profileCursor = 'cursor_pointer';
      }

      return template({
        html: {
          linkPreview: linkPreview,
          connectPreview: connectPreview
        },
        css: {
          star: RendererUtil.getStarCssClass(msg.message),
          disabledMember: RendererUtil.getDisabledMemberCssClass(msg),
          profileCursor: profileCursor,
          botText: memberService.isConnectBot(msg.message.writerId) ? 'bot-text' : ''
        },
        hasMore: RendererUtil.hasMore(msg),
        hasStar: RendererUtil.hasStar(msg),
        hasLinkPreview: !!linkPreview,
        hasConnectPreview: !!connectPreview,
        isSticker: RendererUtil.isSticker(msg),
        isChild: isChild,
        msg: msg
      });
    }

    /**
     * msg에 보여줄 link preview가 있으면 보여주고 없으면 안보여주는 template을 리턴한다.
     * @param {object} msg - message object
     * @param {number} index - index to look up
     * @returns {string}
     * @private
     */
    function _getLinkPreview(msg, index) {
      var html = '';
      var linkPreview;

      if (MessageCollection.hasLinkPreview(index)) {
        if (msg.message.linkPreview.extThumbnail) {
         msg.message.linkPreview.extThumbnail.hasSuccess = RendererUtil.hasThumbnailCreated(msg.message.linkPreview);
        } else {
          msg.message.linkPreview.extThumbnail = {
            hasSuccess: RendererUtil.hasThumbnailCreated(msg.message.linkPreview)
          };
        }

        linkPreview = _templateLinkPreview({msg: msg});
        html = _templateAttachment({
          html: {
            content: linkPreview
          }
        });
      }

      return html;
    }

    /**
     * msg에 보여줄 connect preview가 있으면 보여주고 없으면 안보여주는 template을 전달한다.
     * @param msg
     * @param index
     * @private
     */
    function _getConnectPreview(msg, index) {
      var html = '';
      var content = msg.message.content;
      var connectPreview;

      //if (memberService.isConnectBot(msg.message.writerId) && MessageCollection.hasIntegrationPreview(index)) {
      if (MessageCollection.hasConnectPreview(index)) {
        connectPreview = '';

        _.each(content.connectInfo, function(info) {
          connectPreview += _getConnectPreviewItem(info);
        });

        if (connectPreview) {
          html = _templateAttachment({
            html: {
              content: connectPreview
            },
            style: {
              bar: 'background-color: ' + (content.connectColor || '#000') + ';'
            }
          });
        }
      }

      return html;
    }

    /**
     * connect preview를 구성하는 개별 item 전달
     * @param {object} info
     * @returns {string}
     * @private
     */
    function _getConnectPreviewItem(info) {
      var markdown = $filter('markdown');
      var result = '';

      var hasTitle;
      var hasDescription;
      var hasImage;

      if (_.isObject(info)) {
        hasTitle = !!info.title;
        hasDescription = !!info.description;
        hasImage = !!info.imageUrl;

        if (hasTitle || hasDescription || hasImage) {
          result = _templateConnectPreview({
            html: {
              title: markdown(info.title),
              description: markdown(info.description),
              image: _getConnectImage(info.imageUrl)
            },
            hasTitle: hasTitle,
            hasDescription: hasDescription,
            hasImage: hasImage,
            hasSubsets: false
          });
        }
      }

      return result;
    }

    /**
     * get connect image
     * @param {string} imageUrl
     * @returns {string}
     * @private
     */
    function _getConnectImage(imageUrl) {
      var html = '';

      if (imageUrl != null) {
        html = '<a href="' + imageUrl + '" target="_blank">' + imageUrl + '</a>';
      }

      return html;
    }
  }
})();
