(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerChatInputBox', centerChatInputBox);

  function centerChatInputBox(integrationService) {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      templateUrl: 'app/center/center_chat_input_box/center.chat.input.box.html'
    };

    function link(scope, element, attrs) {
      var menu = element.find('#integration-menu'),
          integraitonMap = {
            'client': function(ele) {
              // XMLHttpRequestUpload, FileReader, FormData 지원해야 upload 가능
              $("<input type=file multiple />")
                .on("change", function(evt) {
                  scope.onFileSelect(evt.target.files);
                })
                .trigger("click");
            },
            'google-drive': function(ele) {
              integrationService.createGoogleDrive(scope, ele);
            },
            'dropbox': function(ele) {
              integrationService.createDropBox(scope, ele);
            }
          };

      menu
        .on('click', 'li', function() {
          var className = this.className,
              fn;

          if (fn = integraitonMap[className]) {
            fn(this);
          }
        });
    }
  }
})();
