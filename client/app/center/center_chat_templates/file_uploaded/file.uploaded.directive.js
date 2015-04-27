(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileUploaded', fileUploaded);

  function fileUploaded($filter) {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/center_chat_templates/file_uploaded/file.uploaded.html'
    };

    function link(scope, element, attrs) {
    }
  }
})();
