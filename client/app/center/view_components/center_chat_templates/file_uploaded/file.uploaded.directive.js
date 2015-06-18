(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('fileUploaded', fileUploaded);

  function fileUploaded() {
    return {
      restrict: 'E',
      scope: false,
      link: link,
      templateUrl: 'app/center/view_components/center_chat_templates/file_uploaded/file.uploaded.html',
      controller: 'FileUploadedCtrl',
    };

    function link(scope, element, attrs) {
    }
  }
})();
