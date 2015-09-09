/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicList', topicList);

  function topicList($state, Viewport, TopicListRenderer, entityheaderAPIservice, analyticsService, jndPubSub) {
    return {
      restrict: 'E',
      replace: true,
      link: link
    };

    function link(scope, el, attrs) {
      var model = attrs.model;
      var jqFilter = $(attrs.filter);
      var list = scope.$eval(attrs.list);
      var type = attrs.type;

      var jqViewport = el.parent();
      var jqList = $('<div class="list"></div>').appendTo(el);
      var viewport = Viewport.create(jqViewport, jqList, {
        viewport: '.list',
        viewportMaxHeight: 662,
        itemHeight: 139,
        bufferLength: 5,
        onCreateItem: function(jqElement, data) {
          jqElement.data('entity', data);
        }
      });

      var matches;

      function getMatches(value) {
        return _.chain(list).filter(function (item) {
          return item.name.indexOf(value) > -1;
        }).sortBy('name').value();
      }

      function updateList(value) {
        matches = getMatches(value);
        scope[type + 'Length'] = matches.length;

        TopicListRenderer.render(type, matches, viewport);
      }

      function onClick(event) {
        var entity = $(event.currentTarget).data('entity');
        var entityId;

        if (entity) {
          entityId = entity.id;
          if (type === 'joinable') {
            if (!scope.isLoading) {
              jndPubSub.showLoading();

              entityheaderAPIservice.joinChannel(entityId)
                .success(function() {
                  topicJoin(entityId);
                })
                .finally(function() {
                  jndPubSub.hideLoading();
                });
            }
          } else if (type === 'joined') {
            topicJoin(entityId);
          }
        }
      }

      function topicJoin(entityId) {
        // analytics
        analyticsService.mixpanelTrack( "topic Join" );

        //jndPubSub.updateLeftPanel();

        // TODO: REFACTOR -> ROUTE SERVICE
        $state.go('archives', {entityType: 'channels', entityId: entityId});

        scope.cancel();
      }

      function onScroll() {
        TopicListRenderer.render(type, matches, viewport);
      }

      updateList('');

      jqFilter.on('keyup', function() {
        updateList(scope.$eval(model));
      });

      jqViewport
        .on('scroll', onScroll)
        .on('mousewheel', onScroll)
        .on('click', '.join-modal-channel_container', onClick);
    }
  }
})();
