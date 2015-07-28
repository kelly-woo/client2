(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicItem', topicItem);

  function topicItem() {
    return {
      restrict: 'E',
      controller: 'TopicItemCtrl',
      templateUrl: 'app/left/topics/topic/topic_item/topic.item.html',
      scope: false,
      link: link
    };

    function link(scope, element, attrs) {
    }
  }
})();