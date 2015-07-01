(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerChatInputBox', centerChatInputBox);

  function centerChatInputBox($filter, integrationService, fileAPIservice, configuration, ImagePaste) {
    var multiple = true;    // multiple upload 여부

    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      templateUrl: 'app/center/view_components/center_chat_input_box/center.chat.input.box.html'
    };

    function link(scope, element, attrs) {
      var menu = element.find('#file-upload-menu');
      var primaryFileBtn = element.children('#primary_file_button');
      var messageInput = $('#message-input');
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

      menu
        .on('click', 'li', function(evt) {
          var className = this.className;
          var fn;

          if (fn = uploadMap[className]) {
            fn(evt);
          }
        });

      if (configuration.name !== 'staging') {
        ImagePaste.createInstance(messageInput, {
          // image data 되기 직전 event handler
          onImageLoading: function() {
            scope.$apply(function(scope) {
              scope.isLoading = true;
            });
          },
          // image load 된 후 event handler
          onImageLoad: function(data) {
            scope.onFileSelect([data], {
              createFileObject: function _createFileObject(data) {
                var blob = fileAPIservice.dataURItoBlob(data);
                // message-input에 입력된 text를 file comment로 설정함
                var comment = messageInput.val();

                messageInput.val('');

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
          },
          // image load 된 후 image load시 변경된 상태가 정리된 후 event handler
          onImageLoaded: function() {
            scope.$apply(function(scope) {
              scope.isLoading = false;
            });
          }
        });
      }
    }
  }
})();
