/**
 * @fileoverview file detail의 comment input directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileDetailCommentInput', fileDetailCommentInput);

  /* @ngInject */
  function fileDetailCommentInput($rootScope, $filter, EntityMapManager, entityAPIservice, memberService, jndKeyCode,
                                  jndPubSub, JndMessageStorage, fileAPIservice) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        file: '=',
        hasInitialLoaded: '=',
        onUserClick: '='
      },
      templateUrl : 'app/right/file.detail/comment_input/file.detail.comment.input.html',
      link: link
    };

    function link(scope) {
      var jqCommentInput = $('#file-detail-comment-input');

      var sticker;
      var stickerType = 'file';

      var timerScrollBottom;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.postComment = postComment;
        scope.onKeyUp = onKeyUp;
        scope.watchFileDetail = watchFileDetail;

        _setProfileImage(memberService.getMember());
        _setCommentFocus();

        _on();
      }

      /**
       * on listener
       * @private
       */
      function _on() {
        scope.$on('$destroy', _onDestroy);
        scope.$on('window:unload', _onWindowUnload);

        scope.$on('setCommentFocus', _onFocusInput);
        scope.$on('onChangeSticker:' + stickerType, _onChangeSticker);

        scope.$on('topicInvite', _onTopicInvite);
        scope.$on('topicLeave', _onTopicLeave);

        scope.$on('rightFileDetailOnFileDeleted', _onRightFileDetailOnFileDeleted);
        scope.$on('updateMemberProfile', _onUpdateMemberProfile);

        scope.$on('elasticResize:comment', _onElasticResize)
      }

      /**
       * comment 를 posting 한다.
       */
      function postComment() {
        var fileId = scope.file.id;
        var msg = jqCommentInput.val().trim();
        var content;
        var mentions;

        if (msg || sticker) {
          _hideSticker();

          if (scope.getMentions) {
            if (content = scope.getMentions()) {
              msg = content.msg;
              mentions = content.mentions;
            }
          }

          fileAPIservice.postComment(fileId, msg, sticker, mentions)
            .success(function() {
              JndMessageStorage.removeCommentInput(fileId);

              setTimeout(function() {
                jqCommentInput.val('').focus()[0].removeAttribute('style');
              });
            });
        } else if (msg === '') {
          setTimeout(function() {
            jqCommentInput.val('').focus()[0].removeAttribute('style');
          });
        }
      }

      /**
       * keyDown 핸들러
       * @param keyUpEvent
       */
      function onKeyUp(keyUpEvent) {
        if (jndKeyCode.match('ESC', keyUpEvent.keyCode)) {
          _hideSticker();
        }
      }

      /**
       * file_detail이 변경되면 mentionList 갱신
       * @param {object} $mentionScope
       */
      function watchFileDetail($mentionScope, $mentionCtrl) {
        var currentMemberId = memberService.getMemberId();

        // file_detail 변경시 마다 mention list 변경
        scope.$watch('file', function(value) {
          var sharedEntities;
          var entity;
          var members;
          var member;
          var i;
          var iLen;
          var j;
          var jLen;

          var mentionList = [];

          if (value) {
            sharedEntities = value.shareEntities;
            for (i = 0, iLen = sharedEntities.length; i < iLen; i++) {
              entity = EntityMapManager.get('total', sharedEntities[i]);
              if (entity && /channels|privategroups/.test(entity.type)) {
                members = entityAPIservice.getMemberList(entity);
                if (members) {
                  for (j = 0, jLen = members.length; j < jLen; j++) {
                    member = EntityMapManager.get('total', members[j]);
                    if (member && currentMemberId !== member.id && member.status === 'enabled') {
                      member.extViewName = '[@' + member.name + ']';
                      member.extSearchName = member.name;
                      mentionList.push(member);
                    }
                  }
                }
              }
            }

            $mentionCtrl.setMentions(_.chain(mentionList).uniq('id').sortBy(function (item) {
              return item.name.toLowerCase();
            }).value());
          }
        });
      }

      function _onFocusInput() {
        _focusInput();
      }

      function _focusInput() {
        jqCommentInput.focus();
      }

      function _onChangeSticker(event, item) {
        sticker = item;

        _focusInput();
      }

      /**
       * 스티커 레이어를 숨긴다.
       * @private
       */
      function _hideSticker() {
        jndPubSub.pub('deselectSticker:' + stickerType);
      }

      /**
       * scope 의 $destroy 이벤트 발생 시 이벤트 핸들러
       * @private
       */
      function _onDestroy() {
        _saveCommentInput();
      }

      /**
       * window unload event handler
       * @private
       */
      function _onWindowUnload() {
        _saveCommentInput();
      }

      /**
       * comment input 저장
       * @private
       */
      function _saveCommentInput() {
        scope.file && JndMessageStorage.setCommentInput(scope.file.id, jqCommentInput.val());
      }

      /**
       * topic invite event handler
       * @param {object} event
       * @param {object} data
       * @private
       */
      function _onTopicInvite(event, data) {
        _addMentionMember(data);

        jndPubSub.pub('right:updateFile');
      }

      /**
       * topic leave event handler
       * @param {object} event
       * @param {object} data
       * @private
       */
      function _onTopicLeave(event, data) {
        _removeMentionMember(data);

        jndPubSub.pub('right:updateFile');
      }

      /**
       * add mention member
       * @param {object} data
       * @private
       */
      function _addMentionMember(data) {
        var room = EntityMapManager.get('total', data.room.id);
        var members = data.inviter;
        var joinMembers;

        if (room && (joinMembers = entityAPIservice.getMemberList(room))) {
          _.each(members, function(member) {
            joinMembers.indexOf(member) < 0 && joinMembers.push(member);
          });
        }
      }

      /**
       * remove mention member
       * @param {object} data
       * @private
       */
      function _removeMentionMember(data) {
        var room = EntityMapManager.get('total', data.room.id);
        var member = data.writer;
        var joinMembers;
        var index;

        if (room && (joinMembers = entityAPIservice.getMemberList(room))) {
          if (index = joinMembers.indexOf(member)) {
            index > -1 && joinMembers.splice(index, 1);
          }
        }
      }

      function _setCommentFocus() {
        if ($rootScope.setFileDetailCommentFocus) {
          $rootScope.setFileDetailCommentFocus = false;

          _focusInput();
        }
      }

      /**
       * 현재 사용자의 profile image를 설정한다.
       * @param {object} member
       * @private
       */
      function _setProfileImage(member) {
        scope.profileImage = $filter('getSmallThumbnail')(member);
      }

      /**
       * updateMemberProfile 이벤트 발생시 이벤트 핸들러
       * @param {object} event
       * @param {{event: object, member: object}} data
       * @private
       */
      function _onUpdateMemberProfile(event, data) {
        var currentMember = memberService.getMember();
        var member = data.member;
        var id = member.id;

        if (currentMember.id === id) {
          _setProfileImage(member);
        }
      }

      function _onRightFileDetailOnFileDeleted(event, param) {
        var deletedFileId = param.file.id;

        if (scope.file.id == deletedFileId) {
          JndMessageStorage.removeCommentInput(deletedFileId);
        }
      }

      function _onElasticResize() {
        var jqFileDetail = $('.file-detail');

        clearTimeout(timerScrollBottom);
        if (jqFileDetail[0] && jqFileDetail.height() + jqFileDetail.scrollTop() >= jqFileDetail[0].scrollHeight) {
          timerScrollBottom = setTimeout(function() {
            jqFileDetail.scrollTop(jqFileDetail[0].scrollHeight);
          }, 100);
        }
      }
    }
  }
})();
