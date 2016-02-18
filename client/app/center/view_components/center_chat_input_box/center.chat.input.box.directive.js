(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerChatInputBox', centerChatInputBox);

  function centerChatInputBox($state, $filter, $timeout, integrationService, fileAPIservice, ImagePaste, Browser,
                              jndPubSub, currentSessionHelper, entityAPIservice, MentionExtractor) {
    var multiple = true;    // multiple upload 여부

    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      templateUrl: 'app/center/view_components/center_chat_input_box/center.chat.input.box.html'
    };

    function link(scope, el) {
      var jqMenu = el.find('#file-upload-menu');
      var jqMessageInput = el.find('#message-input');
      var uploadMap = {
        'computer': function() {
          $('<input type="file" ' + (multiple ? 'multiple' : '') + ' />')
            .on('change', function(evt) {
              scope.onFileSelect(evt.target.files);
            })
            .trigger('click');
        },
        'google-drive': function() {
          integrationService.createGoogleDrive(scope, {multiple: multiple});
        },
        'dropbox': function(evt) {
          integrationService.createDropBox(scope, {multiple: multiple, event: evt});
        }
      };

      var entityId = $state.params.entityId;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        scope.onMentionIconClick = onMentionIconClick;

        _attachEvents();
        _attachDomEvents();

        if (Browser.chrome) {
          _setImagePaste();
        }

        _setMentionList();
      }

      /**
       * attach events
       * @private
       */
      function _attachEvents() {
        scope.$on('hotkey-upload', _onHotkeyUpload);
        scope.$on('onCurrentEntityChanged', _onCurrentEntityChanged);
        scope.$watch('msgLoadStatus.loading', _onChangeLoading);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        jqMenu.on('click', 'li', _onMenuItemClick);
      }

      /**
       * current entity changed event handler
       * @private
       */
      function _onCurrentEntityChanged() {
        _setMentionList();
      }

      /**
       * mention 가능한 member 설정한다.
       * @private
       */
      function _setMentionList() {
        var currentEntity = currentSessionHelper.getCurrentEntity();
        var users;
        var mentionMembers;

        if (currentEntity) {
          users = entityAPIservice.getUserList(currentEntity);
          if (users) {
            mentionMembers = MentionExtractor.getMentionListForTopic(users, entityId);
            jndPubSub.pub('mentionahead:message', mentionMembers);
          }
        }
      }

      function _onHotkeyUpload() {
        uploadMap['computer']();
      }

      /**
       * loading status change event handler
       * @param {boolean} loading
       * @private
       */
      function _onChangeLoading(loading) {
        if (loading === false && !scope.isDisabledMember(scope.currentEntity)) {
          setTimeout(function() {
            jqMessageInput.focus();
          });
        }
      }

      /**
       * menu item click event handler
       * @param {object} event
       * @private
       */
      function _onMenuItemClick(event) {
        var className = this.className;
        var fn;

        if (fn = uploadMap[className]) {
          fn(event);
        }
      }

      /**
       * mention icon click event handler
       */
      function onMentionIconClick() {
        jndPubSub.pub('mentionahead:show:message');
      }

      /**
       * image 붙여넣기 가능하도록 설정한다.
       * @private
       */
      function _setImagePaste() {
        ImagePaste.createInstance(jqMessageInput, {
          // content data 되기 직전 event handler
          onContentLoading: function() {
            scope.isLoading = true;
          },
          // content load 된 후 event handler
          onContentLoad: function(type, data) {
            var comment = jqMessageInput.val();
            jqMessageInput.val('').trigger('change');

            if (type === 'text') {
              jqMessageInput.val(data).trigger('change');
            } else if (type === 'image') {
              scope.onFileSelect([data], {
                createFileObject: function(data) {
                  var blob = fileAPIservice.dataURItoBlob(data);
                  // message-input에 입력된 text를 file comment로 설정함

                  return {
                    name: 'Image_' + $filter('date')((new Date()).getTime(), 'yyyy-MM-dd HH:mm:ss') + '.png',
                    type: 'image/png',
                    blob: blob,
                    size: blob.size,
                    uploadType: 'clipboard',
                    dataUrl: data,

                    comment: comment
                  };
                }
              });
            }
          },
          // content load 된 후 image load시 변경된 상태가 정리된 후 event handler
          onContentLoaded: function() {
            scope.isLoading = false;
          }
        });
      }
    }
  }
})();
