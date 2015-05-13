(function() {
  'use strict';

  angular
    .module('jandiApp')
    .controller('fileUploadedCtrl', fileUploadedCtrl);

  /* @ngInject */
  function fileUploadedCtrl($scope, fileAPIservice) {
    var content = $scope.msg.message.content;

    // integration file 이면 download를 표기하지 않음
    $scope.isIntegrateFile = fileAPIservice.isIntegrateFile(content.serverUrl);
  }
}());
