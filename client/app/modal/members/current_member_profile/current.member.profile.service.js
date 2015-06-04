(function() {
  'use strict';

  angular
    .module('jandiApp')
    .service('CurrentMemberProfile', CurrentMemberProfile);

  /* @ngInject */
  function CurrentMemberProfile(memberService) {
    var that = this;
    
    that.isNamePristine = isNamePristine;
    that.isEmailPristine = isEmailPristine;
    that.isStatusMessagePristine = isStatusMessagePristine;
    that.isPhoneNumberPristine = isPhoneNumberPristine;
    that.isDepartmentPristine = isDepartmentPristine;
    that.isPositionPristine = isPositionPristine;
    that.replaceProfilePicture = replaceProfilePicture;

    function isNamePristine(currentMember) {
      return memberService.getName(currentMember) === memberService.getName(memberService.getMember());
    }
    function isEmailPristine(currentMember) {
      return memberService.getEmail(currentMember) === memberService.getEmail(memberService.getMember());
    }
    function isStatusMessagePristine(currentMember) {
      return memberService.getStatusMessage(currentMember) === memberService.getStatusMessage(memberService.getMember());
    }
    function isPhoneNumberPristine(currentMember) {
      return memberService.getPhoneNumber(currentMember) === memberService.getPhoneNumber(memberService.getMember());
    }
    function isDepartmentPristine(currentMember) {
      return memberService.getDepartment(currentMember) === memberService.getDepartment(memberService.getMember());
    }
    function isPositionPristine(currentMember) {
      return memberService.getPosition(currentMember) === memberService.getPosition(memberService.getMember());
    }

    function replaceProfilePicture(currentMember) {
      var updatedMember = memberService.getMember();
      currentMember.u_photoUrl = memberService.getPhotoUrl(updatedMember);
      currentMember.u_photoThumnailUrl = updatedMember.u_photoThumnailUrl;

      return currentMember;
    }
  }
})();