(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topics', topics);

  function topics($timeout, jndPubSub, TopicFolderModel) {
    return {
      restrict: 'EA',
      scope: false,
      controller: 'topicsCtrl',
      link: link,
      transclude: true,
      replace: true,
      templateUrl: 'app/left/topics/topics.html'
    };

    function link(scope, el, attrs) {
      scope.createTopicFolder = createTopicFolder;

      scope.folderData = TopicFolderModel.getFolderData();
      scope.$on('topic-folder:update', function(e, folderData) {
        scope.folderData = folderData;
      });

      function createTopicFolder(clickEvent) {
        clickEvent.stopPropagation();
        TopicFolderModel.create()
          .success(_onCreateFolderSuccess);
      }
      function _onCreateFolderSuccess(response) {
        TopicFolderModel.reload().then(function() {
          $timeout(function() {
              jndPubSub.pub('topic-folder:rename', response.folderId);
          }, 10);

        });
      }
    }
  }
})();