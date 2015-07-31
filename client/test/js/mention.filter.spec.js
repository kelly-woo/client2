(function() {
  'use strict';

  //@JiHoon 291
  //@Young Park 11153801
  //@mak pak 3017772

  describe('mention.filter', function() {
    var $filter;
    var mentionFilter;
    var message;

    beforeEach(module('jandiApp'));
    beforeEach(inject(function(_$filter_) {
      $filter = _$filter_;
      mentionFilter = $filter('mention');
    }));

    describe('mention 리스트가 있는 경우 hasEventHandler 옵션에 따른 동작 확인', function() {

      beforeEach(function() {
        message = {
          content: '@Young Park Check this out, @Hugo, @JiHoon,@mak pak!important!',
          mentions: [
            {
              id: 3017772,
              type: 'member',
              offset: 43,
              length: 8
            },
            {
              id: 291,
              type: 'member',
              offset: 35,
              length: 7
            },
            {
              id: 11153801,
              type: 'member',
              offset: 0,
              length: 11
            }
          ]
        };
      });
      it('hasEventHandler 옵션이 true 일 경우 정상 동작 확인.', function() {
        var expectStr = '<a mention-view="11153801" mention-type="member" mention-active="on">@Young Park</a> Check this out, @Hugo, <a mention-view="291" mention-type="member" mention-active="on">@JiHoon</a>,<a mention-view="3017772" mention-type="member" mention-active="on">@mak pak</a>!important!';
        expect(mentionFilter(message.content, message.mentions)).toEqual(expectStr);
        expect(mentionFilter(message.content, message.mentions, true)).toEqual(expectStr);
      });
      it('hasEventHandler 옵션이 false 일 경우 정상 동작 확인.', function() {
        var expectStr = '<a mention-view="11153801" mention-type="member" mention-active="off">@Young Park</a> Check this out, @Hugo, <a mention-view="291" mention-type="member" mention-active="off">@JiHoon</a>,<a mention-view="3017772" mention-type="member" mention-active="off">@mak pak</a>!important!';
        expect(mentionFilter(message.content, message.mentions, false)).toEqual(expectStr);
      });
    });
    describe('mention 리스트가 없는 경우 동작 확인', function() {
      it('hasEventHandler 옵션을 주었을 경우(true) 정상 동작 확인.', function() {
        message = {
          content: '@Young Park Check this out, @Hugo, @JiHoon,@mak pak!important!',
          expect: '@Young Park Check this out, @Hugo, @JiHoon,@mak pak!important!'
        };
        expect(mentionFilter(message.content, message.mentions)).toEqual(message.expect);
      });
    });


  });
})();
