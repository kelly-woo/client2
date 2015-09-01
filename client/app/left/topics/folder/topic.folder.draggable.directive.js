/**
 * @fileoverview jandi tooltip directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicFolderDraggable', topicFolderDraggable);

  /**
   *
   */
  function topicFolderDraggable(jndPubSub, memberService, TopicFolderModel, TopicFolderAPI) {


    return {
      restrict: 'A',
      replace: true,
      link: link
    };

    function link(scope, el, attrs) {

    }
  }
})();
