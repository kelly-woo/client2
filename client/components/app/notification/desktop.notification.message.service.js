/**
 * @fileoverview Center Message Notification 생성하는 service
 */
(function() {
  'use strict';

  angular
    .module('app.desktop.notification')
    .service('MessageNotification', MessageNotification);

  /* @ngInject */
  function MessageNotification($filter, memberService, DesktopNotificationUtil, DesktopNotification) {
    var that = this;

    that.show = show;

    /**
     * show message notification
     * @param {object} data - message
     * @param {object} writerEntity - message 작성한 작성자의 entity
     * @param {object} roomEntity - message 전달한 room의 entity
     * @param {boolean} isFileComment
     */
    function show(data, writerEntity, roomEntity, isFileComment) {
      var isUser;
      var options = {};
      var message;

      if (DesktopNotificationUtil.validateNotificationParams(data, writerEntity, roomEntity)) {
        isUser = roomEntity.type === 'users';
        message = data.message;
        message = decodeURIComponent(message);

        if (isFileComment) {
          options = _getOptionsForFileComment(data, writerEntity);
        } else {
          options = _getOptionsForMessage(data, isUser, writerEntity, roomEntity, message);
        }

        options.icon = memberService.getProfileImage(writerEntity.id, 'small');

        DesktopNotification.show(options);
      }
    }

    /**
     * options에 들어갈 정보들을 file comment case에 맞춰서 재설정한다.
     * @param {object} socketEvent - socket으로부터 받은 param과 동일
     * @param {object} writerEntity - 작성자 entity
     * @returns {{body: *, tag: *, data: {id: *, type: string}}}
     * @private
     */
    function _getOptionsForFileComment(socketEvent, writerEntity) {
      return {
        body: _getBodyForFileComment(socketEvent, writerEntity),
        tag: socketEvent.file.id,
        data: _.extend(socketEvent, {
          id: socketEvent.file.id,
          type: 'file_comment',
          commentId: socketEvent.comment.id
        })
      };
    }

    /**
     * file에 comment가 달렸을 때 보여지는 notification이다.
     * @param {object} data - socket으로부터 들어온 object과 동일하다.
     * @param {object} writerEntity - comment를 작성한 사람의 엔티티
     * @returns {*}
     * @private
     */
    function _getBodyForFileComment(data, writerEntity) {
      var _body;

      if (DesktopNotificationUtil.getShowNotificationContentFlag()) {
        _body = '<' + data.file.title + '> ' + writerEntity.name + ' : ' + data.message;
      } else {
        _body = writerEntity.name
          + $filter('translate')('@web-notification-body-message-file-comment-mid')
          + '<'+data.file.title+'>'
          + $filter('translate')('@web-notification-body-message-file-comment-post');
      }

      return _body;
    }

    /**
     * options에 들어갈 정보들을 message case에 맞춰서 재설정한다.
     * @param {object} socketEvent - socket으로부터 받은 param과 동일
     * @param {boolean} isUser - 1:1 dm인지 아닌지 알려주는 flag
     * @param {object} writerEntity - 작성자 entity
     * @param {object} roomEntity - 메세지가 작성된 방의 entity
     * @param {string} message - 작성된 message의 내용
     * @returns {{body: string, tag: *, data: {id: *, type: *}}}
     * @private
     */
    function _getOptionsForMessage(socketEvent, isUser, writerEntity, roomEntity, message) {
      return {
        body: _getOptionsBody(isUser, writerEntity, roomEntity, message),
        tag: isUser ? writerEntity.id : roomEntity.id,
        data: _.extend(socketEvent, {
          id: roomEntity.id,
          type: roomEntity.type
        })
      };
    }

    /**
     * 유져인지 아닌지 확인 후 알맞는 포맷에 맞게 바디를 만든다.
     * @param {boolean} isUser - 유져인지 아닌지 분별
     * @param {object} writerEntity - 메세지를 보낸이
     * @param {object} roomEntity - 메세지가 전공된 곳
     * @param {string} message - 메세지 내용
     * @returns {string} body - 바디에 들어갈 내용
     * @private
     */
    function _getOptionsBody(isUser, writerEntity, roomEntity, message) {
      return DesktopNotificationUtil.getShowNotificationContentFlag() ?
        _getBodyWithMessage(isUser, writerEntity, roomEntity, message) :
        DesktopNotificationUtil.getBodyWithoutMessage(isUser, writerEntity, roomEntity);
    }

    /**
     * 유져인지 아닌지 확인 후, 메세지를 포함한 바디를 맞는 포맷으로 만든다.
     * @param {boolean} isUser - 유져인지 아닌지 분별
     * @param {object} writerEntity - 메세지를 보낸이
     * @param {object} roomEntity - 메세지가 전공된 곳
     * @param {string} message - 메세지 내용
     * @returns {string} body - 바디에 들어갈 내용}
     * @private
     */
    function _getBodyWithMessage(isUser, writerEntity, roomEntity, message) {
      if (isUser) {
        return writerEntity.name + ' : ' + message;
      }
      return '[' + roomEntity.name + '] ' + writerEntity.name + ' : '+ message;
    }
  }
})();
