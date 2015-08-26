(function() {
  'use strict';

  describe('template.filter', function() {
    var filter ;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      filter = _$filter_('template');
    }));
    describe('Mapper 가 1 depth 일 때', function() {
      var mapper;
      var templateList;

      beforeEach(function() {
        templateList = [
          '<div id="{{id}}"> <span class="{{ class }}"> {{number }}</span></div>',
          '<div><span>{{body}}</span></div>'
        ];
      });

      it('template 을 잘 치환하는지 확인한다.', function() {
        mapper = {
          'id': 112121,
          'class': 'design_class',
          'body': 'test',
          'number': '101101'
        };
        var expectString = '<div id="112121"> <span class="design_class"> 101101</span></div><div><span>test</span></div>';
        expect(filter(templateList.join(''), mapper)).toEqual(expectString);
      });

      it('mapper 가 정의되어 있지 않을때 정상동작을 확인한다.', function() {
        mapper = undefined;
        var expectString = '<div id=""> <span class=""> </span></div><div><span></span></div>';
        expect(filter(templateList.join(''), mapper)).toEqual(expectString);
      });

      it('mapper 에 매칭되지 않은 값이 있을 때 정상동작을 확인한다.', function() {
        mapper = {
          'class': 'design_class',
          'body': 'test',
          'number': '101101'
        };
        var expectString = '<div id=""> <span class="design_class"> 101101</span></div><div><span>test</span></div>';
        expect(filter(templateList.join(''), mapper)).toEqual(expectString);
      });
    });

    describe('Mapper 가  n depth 일 때', function() {
      var mapper;
      var templateList;

      beforeEach(function() {
        templateList = [
          '<div id="{{msg.content.id}}"> <span class="{{ msg.content.class }}"> {{msg.content.number }}</span></div>',
          '<div><span>{{msg.content.body.text}}</span></div>'
        ];
      });

      it('template 을 잘 치환하는지 확인한다.', function() {
        mapper = {
          'msg': {
            'content': {
              'id': 112121,
              'class': 'design_class',
              'body': {
                text: 'test'
              },
              'number': '101101'
            }
          }
        };
        var expectString = '<div id="112121"> <span class="design_class"> 101101</span></div><div><span>test</span></div>';
        expect(filter(templateList.join(''), mapper)).toEqual(expectString);
      });

      it('mapper 가 정의되어 있지 않을때 정상동작을 확인한다.', function() {
        mapper = undefined;
        var expectString = '<div id=""> <span class=""> </span></div><div><span></span></div>';
        expect(filter(templateList.join(''), mapper)).toEqual(expectString);
      });

      it('mapper 에 매칭되지 않은 값이 있을 때 정상동작을 확인한다.', function() {
        mapper = {
          'class': 'design_class',
          'body': 'test',
          'number': '101101',
          'msg': {
            'content': {
              'id': 112121
            }
          }
        };
        var expectString = '<div id="112121"> <span class=""> </span></div><div><span></span></div>';
        expect(filter(templateList.join(''), mapper)).toEqual(expectString);
      });
    });
  });
})();
