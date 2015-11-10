/**
 * @fileoverview file detail controller
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('fileDetailCtrl', FileDetailCtrl);

  /* @ngInject */
  function FileDetailCtrl($scope, $state, $q, $filter, fileAPIservice, Router, RouterHelper, entityAPIservice,
                           EntityMapManager, jndPubSub, memberService, publicService, JndMessageStorage) {
    var fileId;
    var abortFileDetailDeferred;

    _init();

    function _init() {
      if (_isRedirectFileDetail()) {
        _setRightPanelTail(true);

        $state.go('messages.detail.' + (RouterHelper.getRightPanelTail() || 'files') + '.item', $state.params);
      } else {
        _setRightPanelTail(false);

        if (fileId = $state.params.itemId) {
          $scope.hasInitialLoaded = false;
          $scope.errorComments = [];

          $scope.onUserClick = onUserClick;
          $scope.postComment = postComment;
          _getFileDetail();

          _on();
        }
      }
    }

    function _on() {
      $scope.$on('right:updateFile', _onUpdateFile);
      $scope.$on('right:updateComments', _onUpdateComments);

      $scope.$on('rightFileDetailOnFileDeleted', _onRightFileDetailOnFileDeleted);
      $scope.$on('updateMemberProfile', _onUpdateMemberProfile);
    }

    function _onUpdateFile(event, fn) {
      _requestFileDetail('file', fn);
    }

    function _onUpdateComments(event, fn) {
      _requestFileDetail('comment', fn);
    }

    function _getFileDetail() {
      var fileDetail = fileAPIservice.dualFileDetail;

      if (fileDetail) {
        _onSuccessFileDetail(fileDetail);
      } else {
       _requestFileDetail();
      }
    }

    function _requestFileDetail(updateType, fn) {
      var deferred;

      if (_isFileDetailActive()) {
        deferred = $q.defer();

        abortFileDetailDeferred ? abortFileDetailDeferred.resolve() : (abortFileDetailDeferred = $q.defer());
        fileAPIservice.getFileDetail(fileId, {timeout: abortFileDetailDeferred})
          .success(function(response) {
            _onSuccessFileDetail(response, updateType);

            fn && fn();
          })
          .error(_onErrorFileDetail)
          .finally(function() {
            abortFileDetailDeferred = null;

            deferred.resolve();
          });
      }
    }

    function _onSuccessFileDetail(response, updateType) {
      var messageDetails;
      var fileDetail;

      if (response) {
        messageDetails = response.messageDetails;
        updateType = updateType ? updateType : 'all';

        fileDetail = _getFileDetailData(messageDetails, updateType);

        if (updateType === 'file') {
          _setFile(fileDetail.file);
        } else if (updateType === 'comment') {
          _setComments(fileDetail.comments);
        } else {
          _setFile(fileDetail.file);
          _setComments(fileDetail.comments);
        }
      }

      $scope.hasInitialLoaded = true;
    }

    function _getFileDetailData(messageDetails, updateType) {
      var file;
      var comments = [];

      _.each(messageDetails, function(item) {
        if (updateType === 'all' || item.contentType.indexOf(updateType) > -1) {
          if (item.contentType === 'file') {
            // file

            file = item;
            _setExtraData(item, item.writerId);
            $scope.isArchivedFile = _isArchivedFile(item);
          } else if (!_isArchivedFile(item)) {
            // etc

            _pushComment(item, comments);
          }
        }
      });

      return {
        file: file,
        comments: comments
      };
    }

    /**
     * 삭제 상태인지 확인한다.
     * @param {object} file
     * @returns {boolean}
     * @private
     */
    function _isArchivedFile(file) {
      return file.status == 'archived';
    }

    function _setFile(file) {
      $scope.file = file;

      $scope.isExternalShared = file.content.externalShared;
      $scope.isAdmin = memberService.isAdmin();
    }

    function _setComments(comments) {
      comments = _.sortBy(comments, 'createTime');

      _setCreateTime(comments);
      $scope.comments = comments;
    }

    function _pushComment(item, comments) {
      var type = item.contentType;

      if (type === 'comment' || type === 'comment_sticker') {
        if (item.content && item.content.body) {
          item.content.body = _getSafeBody(item);
        }

        item.extIsSticker = type === 'comment_sticker';
        _setExtraData(item, item.writerId);

        comments.push(item);
      }
    }

    /**
     * safeBody 를 반환한다.
     * @param {object} item
     * @returns {*}
     * @private
     */
    function _getSafeBody(item) {
      var body = item.content.body;

      if (_.isObject(body)) {
        body = body.valueOf();
      }

      if (item.mentions && item.mentions.length > 0) {
        body = $filter('mention')(body, item.mentions);
        body = $filter('parseAnchor')(body);
        body = $filter('mentionHtmlDecode')(body);
      } else {
        body = $filter('parseAnchor')(body);
      }
      body = $filter('markdown')(body);
      return body;
    }

    /**
     * message에 추가 데이터를 가공하여 설정한다.
     * @param {object} target - 덧붙일 대상 message
     * @param {number|string} writerId - 작성자 ID
     * @private
     */
    function _setExtraData(target, writerId) {
      var writer = entityAPIservice.getEntityById('user', writerId);
      if (_.isObject(target)) {
        target.extWriter = writer;
        target.extWriterName = $filter('getName')(writer);
        target.extProfileImg = $filter('getSmallThumbnail')(writerId);
        target.extIsDisabledMember = publicService.isDisabledMember(writer);
      }
    }

    function _onErrorFileDetail() {
      $scope.hasInitialLoaded = $scope.isInvalidRequest = true;
      $state.go('messages.detail.files.item', $state.params);
    }

    function _isRedirectFileDetail() {
      return /redirect/.test($state.current.name);
    }

    function _setRightPanelTail(isRedirect) {
      var activeMenu;

      if (isRedirect) {
        // 왼쪽 상단에 표시되는 back to list해야되는 target
        if ($state.params.tail != null) {
          RouterHelper.setRightPanelTail($state.params.tail);
        }
      } else if (activeMenu = Router.getActiveRightTabName($state.current)) {
        RouterHelper.setRightPanelTail(activeMenu);
      }
    }

    /**
     * user 이미지 클릭시 이벤트 핸들러
     * @param {object} user
     */
    function onUserClick(user) {
      if (_.isNumber(user)) {
        user = EntityMapManager.get('member', user);
      }
      jndPubSub.pub('onUserClick', user);
    }

    /**
     * comment가 작성된 날짜 get
     * @param {number} index - current index
     * @param {object} comment - current comment
     * @returns {string} comment 작성 날짜
     */
    function _setCreateTime(comments) {
      var prevComment;

      _.each(comments, function(comment, index) {
        var createTime;

        comment.extCreateTime = new Date(comment.createTime);
        prevComment = comments[index -1];

        if (!prevComment ||
          prevComment.extCreateTime.getYear() !== comment.extCreateTime.getYear() ||
          prevComment.extCreateTime.getMonth() !== comment.extCreateTime.getMonth() ||
          prevComment.extCreateTime.getDate() !== comment.extCreateTime.getDate()) {
          createTime = $filter('getyyyyMMddformat')(comment.createTime);
        } else {
          createTime = $filter('date')(comment.createTime, 'h:mm a');
        }

        comment.extCreateTimeView = createTime;
      });
    }

    /**
     * updateMemberProfile 이벤트 발생시 이벤트 핸들러
     * @param {object} event
     * @param {{event: object, member: object}} data
     * @private
     */
    function _onUpdateMemberProfile(event, data) {
      var file = $scope.file;
      var comments = $scope.comments;
      var id = data.member.id;

      if (file && file.writerId === id) {
        _setExtraData(file, id);
      }

      _.forEach(comments, function(comment) {
        if (comment.writerId === id) {
          _setExtraData(comment, id);
        }
      });
    }

    function _onRightFileDetailOnFileDeleted(event, param) {
      var deletedFileId = param.file.id;

      if (fileId == deletedFileId) {
        _getFileDetail();
      }
    }

    /**
     * 현재 file detail tab 을 보고있는지 안 보고있는지 알려준다.
     * @returns {boolean} true - file deatil tab 을 보고 있을 경우
     * @private
     */
    function _isFileDetailActive() {
      return fileId && $state.params.itemId != null && $state.params.itemId !== '';
    }

    function _addSendingComment(data) {
      var comments = $scope.comments;
      var sendingComment;
      var sendingSticker;
      var sticker;
      var comment;

      if (sticker = data.sticker) {
        sendingSticker = _getSendingComment('comment_sticker', sticker);
        _pushComment(sendingSticker, comments);
      }

      if (comment = data.comment) {
        sendingComment = _getSendingComment('comment', comment);
        _pushComment(sendingComment, comments);

        sendingComment.content.body += '';
      }

      // comments에 추가함
      _setComments(comments);

      return {
        sticker: sendingSticker,
        comment: sendingComment
      };
    }

    function _getSendingComment(type, value) {
      var currentMember = memberService.getMember();
      var sendingComment = {
        writerId: currentMember.id,
        contentType: type,
        createTime: new Date(),
        isSendingComment: true
      };

      if (type === 'comment') {
        sendingComment.content = {body: value};
      } else if (type === 'comment_sticker') {
        sendingComment.content = {url: value.url};
        sendingComment.originSticker = value;
      }

      return sendingComment;
    }

    /**
     * comment 를 posting 한다.
     */
    function postComment(comment, sticker) {
      var deferred = $q.defer();
      var fileId = $scope.file.id;
      var content;
      var mentions;

      var result;

      if (comment || sticker) {
        if ($scope.getMentions) {
          if (content = $scope.getMentions()) {
            comment = content.comment;
            mentions = content.mentions;
          }
        }

        result = _addSendingComment({comment: comment, sticker: sticker});
        fileAPIservice.postComment(fileId, comment, sticker, mentions)
          .error(function() {
            result.comment && _setErrorComments(result.comment);
            result.sticker && _setErrorComments(result.sticker);
          })
          .finally(function() {
            JndMessageStorage.removeCommentInput(fileId);
            deferred.resolve();
          });
      }

      return deferred.promise;
    }

    function _setErrorComments(comment) {
      var index = $scope.comments.indexOf(comment);

      if (index > -1) {
        $scope.comments.splice(index, 1);
      }
      $scope.errorComments.push(comment);
    }
  }
})();
