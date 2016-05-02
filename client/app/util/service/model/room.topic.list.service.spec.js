/**
 * @fileoverview extract mention spec
 */
(function() {
  'use strict';

  describe('room.topic.list.service', function () {
    var RoomTopicList;
    var data = {
      publicTopic: {
        "id": 1,
        "type": "channel",
        "name": "Design—Web",
        "status": "active",
        "lastLinkId": -1,
        "description": "",
        "autoJoin": false,
        "ch_members": [
          1,
          2,
          3,
          4,
          5
        ],
        "ch_creatorId": 283,
        "ch_createTime": 1411450097081
      },
      privateTopic: {
        "id": 2,
        "type": "privateGroup",
        "name": "API",
        "status": "active",
        "lastLinkId": 21100780,
        "description": "",
        "autoJoin": false,
        "pg_members": [
          1,
          2,
          3,
          4,
          5
        ],
        "pg_creatorId": 282,
        "pg_createTime": 1431942216612
      }
    };

    beforeEach(module('jandiApp'));
    beforeEach(inject(function (_RoomTopicList_) {
      RoomTopicList = _RoomTopicList_;
    }));

    describe('room 의 멤버 추가 삭제에 대한 정상 동작을 확인한다.', function () {
      beforeEach(function() {
        RoomTopicList.add(_.cloneDeep(data.publicTopic));
        RoomTopicList.add(_.cloneDeep(data.privateTopic));
      });
      describe('멤버 추가 - addMember', function () {
        it('단일 item 일 경우 정상 동작하는지 확인한다.', function () {
          RoomTopicList.addMember(1, 6);
          RoomTopicList.addMember(2, 6);

          expect(RoomTopicList.getMemberIdList(1)).toEqual([1, 2, 3, 4, 5, 6]);
          expect(RoomTopicList.getMemberIdList(2)).toEqual([1, 2, 3, 4, 5, 6]);
        });
        it('복수 item 일 경우 정상 동작하는지 확인한다.', function () {
          RoomTopicList.addMember(1, [6, 7, 8, 9]);
          RoomTopicList.addMember(2, [10, 11, 12, 13]);

          expect(RoomTopicList.getMemberIdList(1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          expect(RoomTopicList.getMemberIdList(2)).toEqual([1, 2, 3, 4, 5, 10, 11, 12, 13]);
        });

        it('복수 item 중 기존에 이미 있는 id 가 있을 경우에도 정상 동작하는지 확인한다.', function () {
          RoomTopicList.addMember(1, [1, 2, 3, 4, 6, 7, 8, 9]);
          RoomTopicList.addMember(2, [1, 2, 3, 4, 10, 11, 12, 13]);

          expect(RoomTopicList.getMemberIdList(1)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          expect(RoomTopicList.getMemberIdList(2)).toEqual([1, 2, 3, 4, 5, 10, 11, 12, 13]);
        });
      });
      describe('멤버 삭제 - removeMember', function () {
        it('단일 item 일 경우 정상 동작하는지 확인한다.', function () {
          RoomTopicList.removeMember(1, 3);
          RoomTopicList.removeMember(2, 2);

          expect(RoomTopicList.getMemberIdList(1)).toEqual([1, 2, 4, 5]);
          expect(RoomTopicList.getMemberIdList(2)).toEqual([1, 3, 4, 5]);
        });
        it('복수 item 일 경우 정상 동작하는지 확인한다.', function () {
          RoomTopicList.removeMember(1, [1, 2, 3]);
          RoomTopicList.removeMember(2, [4, 5]);

          expect(RoomTopicList.getMemberIdList(1)).toEqual([4, 5]);
          expect(RoomTopicList.getMemberIdList(2)).toEqual([1, 2, 3]);
        });
      });
    });

  });
})();
