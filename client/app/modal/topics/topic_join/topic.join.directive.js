/**
 * @fileoverview 각 토픽마다 생성되는 announcement directive
 * @author JiHoon Kim <jihoonk@tosslab.com>
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('topicList', topicList);

  function topicList($timeout, $state, Viewport, TopicListRenderer, entityheaderAPIservice,
                     analyticsService, jndPubSub, jndKeyCode) {
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
        // viewport의 최대 height
        viewportMaxHeight: 662,
        // item의 height
        itemHeight: 130,
        // 자연스러운 scrollring을 위한 buffer length
        bufferLength: 5,
        // create imte callback
        onCreateItem: function(jqElement, data) {
          jqElement.data('entity', data);
        },
        // rendered callback
        onRendered: function() {
          setActiveClass();
        }
      });

      var activeIndex;
      var matches;
      var prevFocusElement;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        activeIndex = 0;

        // 최초 list 갱신
        updateList('');

        // list가 생성된 후 focus item을 설정
        focusItem(activeIndex);

        $timeout(function() {
          jqFilter.focus();
        });

        _on();
      }

      /**
       * event on
       * @private
       */
      function _on() {
        jqFilter
          .on('keydown', function (event) {
            var which = event.which;
            var item;

            if (scope.$eval(attrs.activeted)) {
              if (jndKeyCode.match('UP_ARROW', which)) {
                event.preventDefault();

                activeIndex = (activeIndex > 0 ? activeIndex : matches.length) - 1;
                focusItem(activeIndex);
              } else if (jndKeyCode.match('DOWN_ARROW', which)) {
                event.preventDefault();

                activeIndex = ((activeIndex + 1) % matches.length)
                focusItem(activeIndex);
              } else if (jndKeyCode.match('ENTER', which)) {
                event.preventDefault();

                if (item = viewport.getItem(activeIndex)) {
                  onClick({extData: item});
                }
              } else {
                activeIndex = 0;
                focusItem(activeIndex);
              }
            }
          })
          .on('keyup', function() {
            updateList(scope.$eval(model));
          });

        jqViewport
          .on('scroll', onScroll)
          .on('mousewheel', onScroll)
          .on('click', '.join-modal-channel_container', onClick)
          .on('mouseenter', '.join-modal-channel_container', onMouseEnter);
      }

      /**
       * 특정 문자열과 match되는 list를 전달한다.
       * @param {string} value
       * @returns {*}
       */
      function getMatches(value) {
        value = value.toLowerCase();
        return _.chain(list).filter(function (item) {
          return item.name.toLowerCase().indexOf(value) > -1;
        }).sortBy('name').value();
      }

      /**
       * topic list를 갱신한다.
       * @param {array} value
       */
      function updateList(value) {
        matches = getMatches(value);
        scope[type + 'Length'] = matches.length;

        TopicListRenderer.render(type, matches, viewport, true);
      }

      /**
       * click event handler
       * @param {object} event
       */
      function onClick(event) {
        var entity = event.extData || $(event.currentTarget).data('entity');
        var entityId;

        if (entity) {
          entityId = entity.id;
          if (type === 'joinable') {
            // join하지 않은 topic이므로 join 가능한지 requst 후 topic에 join 함

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
            // join한 topic

            topicJoin(entityId);
          }
        }
      }

      /**
       * 특정 topic에 join한다.
       * @param {number} entityId
       */
      function topicJoin(entityId) {
        // analytics
        analyticsService.mixpanelTrack( "topic Join" );

        //jndPubSub.updateLeftPanel();

        // TODO: REFACTOR -> ROUTE SERVICE
        $state.go('archives', {entityType: 'channels', entityId: entityId});

        scope.cancel();
      }

      /**
       * scroll event handler
       */
      function onScroll() {
        TopicListRenderer.render(type, matches, viewport);
      }

      /**
       * mouseenter event handler
       * @param {object} event
       */
      function onMouseEnter(event) {
        var target = event.currentTarget;

        activeIndex = $(target).data('viewport-index');
        focusItem(activeIndex);
        setActiveClass()
      }

      /**
       * 특정 item focus하기 위해 container의 scroll top 값을 조정한다.
       * @param {number} activeIndex
       */
      function focusItem(activeIndex) {
        var scrollTop = viewport.getFocusableScrollTop(activeIndex);

        if (_.isNumber(scrollTop)) {
          jqViewport.scrollTop(scrollTop);
        }
      }

      /**
       * 현재 focus된 item에 active class를 설정하고, 이전에 focus 되었던 imte에 active class를 제거한다.
       */
      function setActiveClass() {
        var element;

        prevFocusElement && prevFocusElement.removeClass('active');
        if (element = viewport.getItemElement(activeIndex)) {
          prevFocusElement = element.addClass('active');
        }
      }
    }
  }
})();
