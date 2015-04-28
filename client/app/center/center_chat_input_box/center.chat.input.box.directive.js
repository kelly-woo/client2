(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('centerChatInputBox', centerChatInputBox);

  function centerChatInputBox(integrationService) {
    var multiple = true;    // multiple upload 여부

    return {
      restrict: 'E',
      scope: false,
      link: link,
      replace: true,
      templateUrl: 'app/center/center_chat_input_box/center.chat.input.box.html'
    };

    function link(scope, element, attrs) {
      var menu = element.find('#integration-menu'),
          uploadMap = {
            'client': function() {
              $('<input type="file" ' + (multiple ? 'multiple' : '') + ' />')
                .on('change', function(evt) {
                  scope.onFileSelect(evt.target.files);
                })
                .trigger('click');
            },
            'google-drive': function() {
              integrationService.createGoogleDrive(scope, {multiple: multiple});
            },
            'dropbox': function() {
              integrationService.createDropBox(scope, {multiple: multiple});
            }
          };

      menu
        .on('click', 'li', function() {
          var className = this.className,
              fn;

          if (fn = uploadMap[className]) {
            fn();
          }
        });
    }
  }
})();
