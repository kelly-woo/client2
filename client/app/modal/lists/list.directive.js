/**
 * @fileoverview member list directive
 */
(function() {
  'use strict';

  angular
    .module('jandiApp')
    .directive('listOnModal', listOnModal);

  function listOnModal($timeout, Viewport, ListRenderer, jndKeyCode, jndPubSub) {
    return {
      restrict: 'E',
      link: link
    };

    function link(scope, el, attrs) {
      var originScope = scope.$parent;

      // model
      var model = attrs.model;

      // multitab일 경우 구분 type
      var type = attrs.type;

      // list property name
      var list = attrs.list;

      // item의 type(member, topic)
      var itemType = attrs.itemType;

      // item element의 class
      var itemClass = attrs.itemClass;

      // create list callback
      var getMatches = scope.$eval(attrs.getMatches);

      // item select callback
      var onSelect = scope.$eval(attrs.onSelect);

      // viewport의 height
      var height = parseInt(attrs.viewportHeight, 10);

      // viewport의 최대 height
      var maxHeight = parseInt(attrs.viewportMaxHeight || $(window).height() / 2, 10);

      // item의 height
      var itemHeight = _.isString(attrs.itemHeight) ? scope.$eval(attrs.itemHeight) : parseInt(attrs.itemHeight, 10);

      // 자연스러운 scrollring을 위한 buffer length
      var bufferLength = parseInt(attrs.bufferLength, 10);

      // filter element
      var jqFilter = $(attrs.filter);

      // viewport element
      var jqViewport = el.parent();

      // list element
      var jqList = $('<div class="list"></div>').appendTo(jqViewport);
      
      var viewport = Viewport.create(jqViewport, jqList, {
        viewportHeight: height,
        viewportMaxHeight: maxHeight,
        itemHeight: itemHeight,
        bufferLength: bufferLength,
        // create imte callback
        onCreateItem: function(jqElement, data) {
          jqElement.data('entity', data);
        },
        // rendered callback
        onRendered: function() {
          _setActiveClass();
        }
      });
      
      // active 상태인 item의 index
      var activeIndex;
      
      // filter 값에 matche되는 list
      var matches;
      
      // 이전 active 상태였던 dom element
      var prevActiveElement;

      // 이전 mouse point;
      var _prevMousePoint;

      _init();

      /**
       * init
       * @private
       */
      function _init() {
        activeIndex = 0;

        // 최초 list 갱신
        _updateList('');

        // list가 생성된 후 focus item을 설정
        _focusItem(activeIndex);

        $timeout(function() {
          el.remove();
        });

        _attachScopeEvents();
        _attachDomEvents();

        originScope.getActiveIndex = getActiveIndex;
        originScope.setActiveIndex = setActiveIndex;
      }

      /**
       * attach scope events
       * @private
       */
      function _attachScopeEvents() {
        if (type != null) {
          scope.$on('setActiveIndex:' + type, _onSetActiveIndex);
          scope.$on('updateList:' + type, _onUpdateList);
        }

        scope.$on('$destroy', _onDestroy);
        scope.$watch(model, _onFilterValueChanged);
      }

      /**
       * attach dom events
       * @private
       */
      function _attachDomEvents() {
        jqFilter.on('keydown', _onKeydown);

        jqViewport
          .on('scroll', _onScroll)
          .on('mousewheel', _onScroll)
          .on('click', '.' + itemClass, _onClick)
          .on('mousemove', '.' + itemClass, _onMouseMove);
      }
  
      /**
       * get active index
       * @returns {*}
       */
      function getActiveIndex() {
        return activeIndex;
      }
  
      /**
       * set active index
       * @param index
       */
      function setActiveIndex(index) {
        activeIndex = index;
        _focusItem(activeIndex);
      }

      /**
       * update list event handler
       * @private
       */
      function _onUpdateList() {
        _updateList(jqFilter.val());
      }

      /**
       * set active index event handler
       * @param {object} event
       * @param {number} index
       * @private
       */
      function _onSetActiveIndex(event, index) {
        _setActiveItem(index);
      }

      /**
       * scope desctroy event handler
       * @private
       */
      function _onDestroy() {

        //ToDo: listOnModal directive가 element가 아닌 container의 attribute로 제공 되어야 dom select 문제가 해결됨.
        // scope destroy시 jqFilter를 제거하여 scope 생성시 이전 jqFilter가 선택되지 않도록 한다.
        jqFilter.remove();
      }

      /**
       * filter value changed event handler
       * @param {string} newValue
       * @param {string} oldValue
       * @private
       */
      function _onFilterValueChanged(newValue, oldValue) {
        newValue = newValue || '';
        oldValue = oldValue || '';

        if (newValue !== oldValue) {
          // model value changed

          setActiveIndex(0);
          _updateList(newValue);
        }
      }

      /**
       * key down event handler
       * @param event
       * @private
       */
      function _onKeydown(event) {
        var which = event.which;
        var index;

        if (scope.$eval(attrs.activeted)) {
          if (jndKeyCode.match('UP_ARROW', which)) {
            event.preventDefault();

            index = (activeIndex > 0 ? activeIndex : matches.length) - 1;
            _setActiveItem(index);
          } else if (jndKeyCode.match('DOWN_ARROW', which)) {
            event.preventDefault();

            index = ((activeIndex + 1) % matches.length);
            _setActiveItem(index);
          } else if (!event.metaKey && !event.ctrlKey && jndKeyCode.match('ENTER', which)) {
            event.preventDefault();

            _select();
          }
        }
      }

      /**
       * click event handler
       * @param {object} event
       * @private
       */
      function _onClick(event) {
        var item;

        if (itemType === 'member' && event.target.className.indexOf('star') > -1) {
          // item type이 'member'이고 star icon click 시 처리
          if (item = matches[activeIndex]) {
            jndPubSub.pub('onStarClick', {
              entityType: 'user',
              entityId: item.id
            });
          }
        } else {
          _select();
        }
      }

      /**
       * 특정 topic에 join한다.
       * @param {number} entityId
       * @private
       */
      function _select() {
        var item;

        item = matches[activeIndex];
        if (item != null && onSelect) {
          onSelect(item);
        }
      }

      /**
       * scroll event handler
       * @private
       */
      function _onScroll() {
        ListRenderer.render({
          type: itemType,
          list: matches,
          viewport: viewport,
          filterText: jqFilter.val()
        });
      }

      /**
       * mousemove event handler
       * @param {object} event
       * @private
       */
      function _onMouseMove(event) {
        var target = event.currentTarget;
        var index;

        if (_prevMousePoint && (_prevMousePoint.x != event.clientX || _prevMousePoint.y != event.clientY)) {
          index = +$(target).data('viewport-index');
          if (activeIndex != index) {
            activeIndex = index;

            // scrolling에 영향을 주므로 주석 처리
            // _focusItem(activeIndex);

            _setActiveClass();
          }
        }

        _prevMousePoint = {
          x: event.clientX,
          y: event.clientY
        };
      }

      /**
       * 특정 item focus하기 위해 container의 scroll top 값을 조정한다.
       * @param {number} activeIndex
       * @private
       */
      function _focusItem(activeIndex) {
        var scrollTop = viewport.getFocusableScrollTop(activeIndex);

        if (_.isNumber(scrollTop)) {
          jqViewport.scrollTop(scrollTop);
        }
      }

      /**
       * 현재 focus된 item에 active class를 설정하고, 이전에 focus 되었던 imte에 active class를 제거한다.
       * @private
       */
      function _setActiveClass() {
        var element;

        prevActiveElement && prevActiveElement.removeClass('active');
        if (element = viewport.getItemElement(activeIndex)) {
          prevActiveElement = element.addClass('active');
        }
      }

      /**
       * topic list를 갱신한다.
       * @param {string} filterText
       * @private
       */
      function _updateList(filterText) {
        matches = getMatches(scope.$eval(list), filterText);
        ListRenderer.render({
          type: itemType,
          list: matches,
          viewport: viewport,
          filterText: filterText
        }, true);
      }

      /**
       * 활성 아이템을 설정함.
       * @param {number} activeIndex
       * @private
       */
      function _setActiveItem(index) {
        setActiveIndex(index);
        ListRenderer.render({
          type: itemType,
          list: matches,
          viewport: viewport,
          filterText: jqFilter.val()
        });
      }
    }
  }
})();
