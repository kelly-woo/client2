angular.module('gettext').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('en_US', {"@alert-empty-ch-belong":"You have not joined any channels yet","@alert-empty-ch-can-join":"No channels to join","@alert-empty-file":"No files uploaded","@alert-empty-file-search":"No files found matching on","@alert-empty-file-shared":"File has not been shared in any other chats","@alert-invalid-password":"invalid password","@alert-missing-info":"Missing Information","@alert-no-result":"No Result","@alert-required":"required","@alert-send-mail-fail":"Failed to send email","@alert-send-mail-invalid":"is invalid email address","@alert-send-mail-success":"Sent the invitation mail successfully","@alert-send-mail-taken":"is already member of your team","@alert-update-fail":"fail to update","@alert-update-success":"update complete","@btn-add":"Add","@btn-cancel":"Cancel","@btn-change":"Change","@btn-close":"Close","@btn-comment":"Comment","@btn-confirm":"Confirm","@btn-create":"Create","@btn-edit":"Edit","@btn-invite":"Invite","@btn-join":"Join","@btn-share":"Share","@btn-update-name":"Update Name","@btn-update-password":"Update Password","@btn-upload":"Upload","@ch-menu-delete":"Delete this channel","@ch-menu-invite":"Invite members to this channel","@ch-menu-leave":"Leave channel","@ch-menu-rename":"Rename this channel","@common-account-settings":"Account Settings","@common-add":"Add","@common-channels":"Channels","@common-chat-dm":"1:1 Chat","@common-comment":"Comment","@common-create-ch":"Create New Channel","@common-create-pg":"Create New Private Group","@common-current-password":"Current Password","@common-customer-service":"Customer Service","@common-department":"Department","@common-desktop-noti":"Desktop Notifications","@common-direct-messages":"Direct Messages","@common-dm-invite-to":"Invite to","@common-download":"Download","@common-email":"Email","@common-faq":"FAQ","@common-file":"File","@common-file-list":"File List","@common-file-type":"File Type","@common-files":"Files","@common-info-basic":"Basic Information","@common-info-optional":"Optional Information","@common-joined":"members","@common-language":"Language","@common-member":"Member","@common-more":"More","@common-name":"Name","@common-new-name":"New Name","@common-new-password":"New Password","@common-password":"Password","@common-phone":"Phone","@common-position":"Position","@common-privacy-policy":"Privacy Policy","@common-private-groups":"Private Groups","@common-profile-settings":"Profile Settings","@common-purpose":"Purpose","@common-rename":"Rename","@common-send-mail":"Send Email","@common-service-settings":"Service Preferences","@common-share-file":"Share File","@common-share-in":"Share in","@common-shared-in":"Shared in","@common-sign-in":"Sign In","@common-sign-out":"Sign Out","@common-status-msg":"Today's Feeling","@common-terms-of-service":"Terms of Service","@common-title":"Title","@common-upload-file":"Upload File","@common-visit-homepage":"Visit Homepage","@dm-menu-file":"View Files","@dm-menu-invite":"Invite this member to others","@dm-menu-profile":"View Profile","@error-404-message":"The page you were looking for could not be found","@error-404-title":"That’s an error","@file-all":"All Files","@file-audio":"Audio Files","@file-image":"Images","@file-pdf":"PDF Files","@file-video":"Video Files","@file-your":"Your Files","@header-file":"File","@header-help":"Help","@header-menu":"Menu","@header-setting":"Setting","@input-create-ch":"Enter new channel name","@input-create-pg":"Enter new private group name","@input-invite-email":"Enter email address to invite","@input-rename":"Enter name to change","@input-search-channel-name":"Search channel by name","@input-search-file-title":"Search file by title","@input-search-user-name":"Search users by name","@login-invalid":"Invalid email or password","@login-message":"Enter your email and password","@login-reset-password":"Forgot Password?","@login-welcome {{teamInfo.name}}":"Welcome to {{teamInfo.name}}","@modal-browse-ch":"Browse Channels","@modal-create-ch-msg1":"Creating a new channel.","@modal-create-ch-msg2":"Anyone can join.","@modal-create-ch-msg3":"Please use Private Group for a closed channel.","@modal-create-pg-msg1":"A private group is only visible to its members, and only members of a private group can read or search its contents.","@modal-dm-invite":"Join member to others","@modal-dm-invite-msg1":"You can invite this user to chat room(private group/channel).","@modal-invite-members":"Invite Members","@modal-join-ch-you-belong":"Channels you belong to","@modal-join-ch-you-can":"Channels you can join","@modal-profile-picture":"Profile Picture","@modal-setting-account-email":"Change your email address","@modal-setting-account-msg1":"You can change account settings such as full name, password","@modal-setting-account-name":"Change your name","@modal-setting-account-name-msg":"Please keep in mind when changing your name that other members can mention and search your name","@modal-setting-account-password":"Change your password","@modal-setting-profile-msg1":"You can set or change basic information such as nickname, phone number and position.","@modal-setting-service-msg1":"You can change service preferences such as language, notifications.","@modal-team-invite-msg1":"You can invite others to Jandi by email.","@modal-upload-title-msg1":"For search file by title","@msg-create-ch":"created current channel","@msg-create-pg":"created current private group","@msg-file":"File","@msg-invited":"invited","@msg-invited-postfix":" ","@msg-joined":"has joined","@msg-left":"has left","@msg-open-original":"Open original","@msg-shared":"Shared","@msg-unshared":"Unshared","@msg-whose":"'s","@option-all-members":"All","@option-all-rooms":"All","@option-choose":"Choose","@option-noti-all":"For all messages","@option-noti-dm":"Only for direct messages","@option-noti-none":"Never","@pg-menu-delete":"Delete this group","@pg-menu-invite":"Invite members to this group","@pg-menu-leave":"Leave group","@pg-menu-rename":"Rename this group","@team-invite":"Invite Others to Team","@team-members":"Team Members","@team-switch":"Switch Teams","@file-upload":"File Upload"});
    gettextCatalog.setStrings('ko_KR', {"@alert-empty-ch-belong":"참여중인 채널이 없습니다","@alert-empty-ch-can-join":"참여 가능한 채널이 없습니다","@alert-empty-file":"업로드된 파일이 없습니다","@alert-empty-file-search":"검색 결과가 없습니다","@alert-empty-file-shared":"공유된 대화방이 없습니다","@alert-invalid-password":"비밀번호가 일치하지 않습니다","@alert-missing-info":"모든 정보를 입력하세요","@alert-no-result":"결과가 없습니다","@alert-required":"필수 항목 입니다","@alert-send-mail-fail":"다음 주소로 이메일 보내기를 실패하였습니다","@alert-send-mail-invalid":"은(는) 올바르지 않은 이메일 주소입니다","@alert-send-mail-success":"정상적으로 초대 이메일을 보냈습니다.","@alert-send-mail-taken":"은(는) 이미 가입된 이메일입니다","@alert-update-fail":"업데이트 중 오류가 발생했습니다","@alert-update-success":"정상적으로 변경되었습니다","@btn-add":"추가","@btn-cancel":"취소","@btn-change":"변경하기","@btn-close":"닫기","@btn-comment":"댓글남기기","@btn-confirm":"확인","@btn-create":"생성하기","@btn-edit":"수정하기","@btn-invite":"초대하기","@btn-join":"참여하기","@btn-share":"공유하기","@btn-update-name":"이름 변경하기","@btn-update-password":"비밀번호 변경하기","@btn-upload":"업로드","@ch-menu-delete":"채널 삭제하기","@ch-menu-invite":"이 채널에 멤버 초대하기","@ch-menu-leave":"채널 나가기","@ch-menu-rename":"채널 이름 변경하기","@common-account-settings":"계정 설정","@common-add":"추가","@common-channels":"채널","@common-chat-dm":"1:1 메시지","@common-comment":"댓글","@common-create-ch":"새 채널 생성","@common-create-pg":"비공개 그룹 생성","@common-current-password":"현재 비밀번호","@common-customer-service":"고객 센터","@common-department":"부서","@common-desktop-noti":"데스크탑 알림","@common-direct-messages":"1:1 메시지","@common-dm-invite-to":"대화방 목록","@common-download":"다운로드","@common-email":"이메일","@common-faq":"FAQ","@common-file":"파일","@common-file-list":"파일 리스트","@common-file-type":"파일 타입","@common-files":"파일","@common-info-basic":"기본 정보","@common-info-optional":"추가 정보","@common-joined":"명 참여중","@common-language":"언어","@common-member":"멤버","@common-more":"더보기","@common-name":"이름","@common-new-name":"변경할 이름","@common-new-password":"새 비밀번호","@common-password":"비밀번호","@common-phone":"전화번호","@common-position":"직책","@common-privacy-policy":"개인정보취급방침","@common-private-groups":"비공개 그룹","@common-profile-settings":"프로필 수정","@common-purpose":"목적","@common-rename":"이름 변경","@common-send-mail":"메일 보내기","@common-service-settings":"서비스 설정","@common-share-file":"파일 공유","@common-share-in":"공유 대화방","@common-shared-in":"공유된 곳","@common-sign-in":"로그인","@common-sign-out":"로그아웃","@common-status-msg":"오늘의 기분","@common-terms-of-service":"이용약관","@common-title":"타이틀","@common-upload-file":"파일 업로드","@common-visit-homepage":"홈페이지 방문하기","@dm-menu-file":"파일 보기","@dm-menu-invite":"대화방으로 초대하기","@dm-menu-profile":"프로필 보기","@error-404-message":"존재하지 않는 링크이거나 삭제된 페이지 입니다","@error-404-title":".. 길을 잃었습니다","@file-all":"모든 파일","@file-audio":"오디오","@file-image":"이미지","@file-pdf":"PDF","@file-video":"비디오","@file-your":"내 파일","@header-file":"파일","@header-help":"도움말","@header-menu":"메뉴","@header-setting":"설정","@input-create-ch":"생성할 채널 이름을 입력하세요","@input-create-pg":"생성할 그룹 이름을 입력하세요","@input-invite-email":"초대할 이메일 주소를 입력하세요","@input-rename":"변경할 이름을 입력하세요","@input-search-channel-name":"채널 이름을 검색하세요","@input-search-file-title":"파일 타이틀을 검색하세요","@input-search-user-name":"멤버 이름을 검색하세요","@login-invalid":"이메일 또는 비밀번호를 확인해주세요","@login-message":"이메일과 비밀번호를 입력하세요","@login-reset-password":"비밀번호 찾기","@login-welcome {{teamInfo.name}}":"{{teamInfo.name}} 환영합니다","@modal-browse-ch":"채널 목록","@modal-create-ch-msg1":"새로운 채널을 생성합니다.","@modal-create-ch-msg2":"채널은 팀의 멤버 누구나 참여할 수 있습니다.","@modal-create-ch-msg3":"특정 멤버들과만 공유하고 싶은 채널을 만들고 싶은 경우에는 비공개 그룹을 생성해 초대해 주시기 바랍니다.","@modal-create-pg-msg1":"비공개 그룹은 그룹에 가입된 멤버만 볼 수 있으며, 해당 파일, 내용들도 가입된 멤버에게만 공개됩니다.","@modal-dm-invite":"대화방으로 초대","@modal-dm-invite-msg1":"1:1 대화 중에 간편하게 해당 멤버를 다른 대화방으로 초대할 수 있습니다.","@modal-invite-members":"사용자 초대","@modal-join-ch-you-belong":"이미 참여중인 채널 목록","@modal-join-ch-you-can":"참여 가능한 채널 목록","@modal-profile-picture":"프로필 사진","@modal-setting-account-email":"이메일 변경하기","@modal-setting-account-msg1":"이름, 비밀번호 등 계정 설정을 할 수 있습니다.","@modal-setting-account-name":"이름 변경하기","@modal-setting-account-name-msg":"사용자 이름은 다른 멤버들에 의해 멘션과 검색 등에 사용되기 때문에 변경에 주의해 주세요.","@modal-setting-account-password":"비밀번호 변경하기","@modal-setting-profile-msg1":"닉네임, 전화번호, 직책 등 기본적인 프로필 정보를 수정할 수 있습니다.","@modal-setting-service-msg1":"언어, 데스크탑 알림 등 서비스 설정을 할 수 있습니다.","@modal-team-invite-msg1":"이메일을 통해 다른 멤버들을 잔디로 초대할 수 있습니다.","@modal-upload-title-msg1":"타이틀로 파일을 쉽게 검색할 수 있습니다","@msg-create-ch":"님이 채널을 생성했습니다","@msg-create-pg":"님이 비공개 그룹을 생성했습니다","@msg-file":"파일","@msg-invited":"님이","@msg-invited-postfix":"님을 초대했습니다","@msg-joined":"님이 참여했습니다","@msg-left":"님이 떠났습니다","@msg-open-original":"원본 파일 보기","@msg-shared":"공유된","@msg-unshared":"공유 해제된","@msg-whose":"님의","@option-all-members":"모든 멤버","@option-all-rooms":"모든 대화방","@option-choose":"선택","@option-noti-all":"모든 메시지","@option-noti-dm":"1:1 메시지","@option-noti-none":"없음","@pg-menu-delete":"그룹 삭제하기","@pg-menu-invite":"이 그룹에 멤버 초대하기","@pg-menu-leave":"그룹 나가기","@pg-menu-rename":"그룹 이름 변경하기","@team-invite":"멤버 초대","@team-members":"전체 멤버 보기","@team-switch":"팀 변경","Add Comment":"댓글 남기기","Click to view":"파일 보기","Comment":"댓글 남기기","Delete":"삭제","Download":"다운로드","File has not been shared in any other channels":"공유된 채널이 없습니다","Share":"공유하기","shift+enter to multiline":"멀티라인 입력: shift+enter","File Type":"파일 형식","Files":"파일","Location":"공유된 곳","No files found matching on":"검색 결과가 없습니다","No files uploaded":"업로드된 파일이 없습니다","Open original":"원본 보기","Search by title":"제목으로 검색","Upload File":"파일 업로드","Writer":"작성자","@file-upload":"파일 업로드","Cancel":"취소","For search file by title":"타이틀로 파일을 쉽게 검색할 수 있습니다","Share in":"공유 대상","Title":"타이틀","Upload":"업로드","File":"파일","Share File":"파일 공유","Close":"닫기","Confirm":"확인","Desktop Notifications":"데스크탑 알림","For all messages":"모든 메세지","Language":"언어","Never":"없음","Only for direct messages":"1:1 메세지","Preferences":"서비스 설정","You can change service preferences such as language, notifications.":"언어, 데스크탑 알림 등 서비스 설정을 할 수 있습니다.","Basic Information":"기본 정보","Change":"변경","Department":"부서","Edit":"수정하기","Email":"이메일","Full Name":"실명","Nickname":"닉네임","Optional Information":"추가 정보","Phone":"전화번호","Position":"직책","Profile Setting":"프로필 수정","You can set or change basic information such as nickname, phone number and position.":"닉네임, 전화번호, 직책 등 기본적인 프로필 정보를 수정할 수 있습니다.","Account Setting":"계정 설정","Change your email address":"이메일 변경하기","Change your full name":"이름 변경하기","Change your password":"비밀번호 변경하기","Current Password":"현재 비밀번호","New Password":"새 비밀번호","New Username":"변경할 이름","Update Username":"이름 변경","You can change account settings such as full name, password":"이름, 비밀번호 등 계정 설정을 할 수 있습니다","fail to update":"업데이트 중 오류가 발생했습니다","update complete":"올바로 변경되었습니다","Name":"이름","Rename":"이름 변경","Direct Message":"1:1 메세지","Search users by name":"이름으로 검색","Browse channels":"채널 목록","Channels you belong to":"참여한 채널 목록","Channels you can join":"참여 가능한 채널 목록","Create Channel":"채널 생성","Create New Channel":"새 채널 생성","Join":"참여","No Result":"결과가 없습니다","No channels to join":"참여 가능한 채널이 없습니다","Search channel by name":"이름으로 검색","You have not joined any channels yet":"참여한 채널이 없습니다","Add":"추가","Each fields(Email, Last Name, First Name) are all required.":"이메일, 성 그리고 이름 세 정보를 모두 기입하셔야 초대 이메일이 전송됩니다.","Failed to send email":"다음 주소로 이메일 보내기를 실패하였습니다.","First Name":"이름","Invite":"초대","Invite others to team":"새로운 팀원 초대하기","Last Name":"성","Missing Information":"모든 정보를 입력해주세요","Sent the invitation mail successfully":"정상적으로 초대 이메일을 보냈습니다.","You can invite others to Jandi by email.":"이메일을 통해 다른 팀원을 잔디로 초대할 수 있습니다.","is already member of your team":"은(는) 이미 가입된 이메일입니다","is invalid email address":"은(는) 올바르지 않은 이메일 주소입니다","Choose":"선택","Invite to":"채널/그룹 목록","Invite {{ currentEntity | getFirstLastNameOfUser }} to a channel/group":"{{ currentEntity | getFirstLastNameOfUser }}님 초대하기","Invite Others":"팀원 초대","A private group is only visible to its members, and only members of a private group can read or search its contents.":"비공개 그룹은 그룹에 가입된 멤버만 볼 수 있으며, 해당 파일, 내용들도 가입된 멤버에게만 공개됩니다.","Create Group":"그룹 생성","Create a private group":"비공개 그룹 생성","Private Group Name":"비공개 그룹 이름","Purpose":"목적","Anyone can join.":"채널은 팀의 멤버 누구나 참여할 수 있습니다.","Channel Name":"채널 이름","Create new channel":"새 채널 생성","Creating a new channel.":"새로운 채널을 생성합니다.","Please use Private Group for a closed channel.":"특정 멤버들과만 공유하고 싶은 채널을 만들고 싶은 경우에는 비공개 그룹을 생성하여 초대해 주시기 바랍니다.","'s":"님의","Delete this channel":"채널 삭제하기","Delete this group":"비공개 그룹 삭제하기","Invite others to this channel":"채널 초대하기","Invite others to this group":"그룹 초대하기","Invite to channel/group":"채널/비공개 그룹으로 초대하기","Leave channel":"채널 나가기","Leave group":"비공개 그룹 나가기","Rename this channel":"채널 이름 변경하기","Rename this group":"비공개 그룹 이름 변경하기","Shared":"공유","View files":"파일 보기","View profile":"프로필 보기","created current channel":"님이 채널을 생성했습니다","created current private group":"님이 비공개 그룹을 생성했습니다","has left":"님이 떠났습니다","invited":"님이","Account":"계정 설정","All Files":"모든 파일","Images":"이미지","Menu":"메뉴","PDF":"PDF","Privacy Policy":"개인정보취급방침","Profile":"프로필 수정","Settings":"설정","Sign Out":"로그아웃","Starred Items":"즐겨찾기","Team Directory":"팀","Terms of Service":"이용약관","Your Files":"내 파일","Channels":"채널","Direct Messages":"1:1 메세지","More":"더보기","Private Groups":"비공개 그룹","Customer Service":"고객 센터","That’s an error":"..길을 잃었습니다","The page you were looking for could not be found.":"존재하지 않는 링크이거나 삭제된 페이지 입니다","Visit Homepage":"잔디 홈페이지","Email address":"이메일 주소","Enter your email and password":"이메일과 비밀번호를 입력하세요","Forgot Password?":"비밀번호 찾기","Invalid email or password":"이메일 또는 비밀번호를 확인해주세요","Password":"비밀번호","Sign In":"로그인","Audio":"음악 파일","EVERYONE":"모든 팀원","Video":"동영상 파일","YOU":"나","Activity Feed":"활동 기록","Recent Mentions":"최근 멘션","Rename Channel":"채널 이름 변경","For activity of any kind":"모든 메세지","joined this channel":"님이 참여했습니다","left this channel":"님이 떠났습니다","Create channel":"채널 생성","Create private group":"비공개 그룹 생성","Search":"검색","more...":"더 보기...","----- choose -----":"----- 선택 -----","JUST YOU":"나","Add New File":"파일 업로드","Please sign in":"잔디 회원이라면 로그인 하세요"});
/* jshint +W100 */
}]);