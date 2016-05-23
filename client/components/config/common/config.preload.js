/**
 * @fileoverview preload 할 image 를 모아놓은 PRELOAD_LIST 상수. build 시 생성 됨
 * @author Young Park <young.park@tosslab.com>
 */
(function() {
  'use strict';

  /**
   * preload constant
   */
  angular
    .module('jandi.config')
    .constant('PRELOAD_LIST', ["/assets/images/no_image_available_center.png","/assets/images/no_image_available.png","/assets/images/icon_settings.png","/assets/images/icon_add_member.png","/assets/images/icon_user.png","/assets/images/icon_search.png","/assets/images/icon_verti_menu.png","/assets/images/icon_close.png","/assets/images/icon_downmenu.png","/assets/images/icon_invite_dark.png","/assets/images/icon_invite.png","/assets/images/icon_team_dark.png","/assets/images/icon_team.png","/assets/images/icon_signout_dark.png","/assets/images/icon_signout.png","/assets/images/icon_network_error.png","/assets/images/fileicons.png","/assets/images/icon_more_member.png","/assets/images/jd_loading.gif","/assets/images/checkered.png","/assets/images/icon-comment.png","/assets/images/private-topic.svg","/assets/images/googledrive-share.png","/assets/images/googledrive-filetype.png","/assets/images/googledrive-popup.png","/assets/images/dropbox-share.png","/assets/images/dropbox-link.png","/assets/images/dropbox-popup.png","/assets/images/icon_google_drive.png","/assets/images/icon_google_drive_white.png","/assets/images/icon_dropbox.png","/assets/images/icon_dropbox_white.png","/assets/images/center/help-enter-a-message.png","/assets/images/center/help-invite-members.png","/assets/images/center/help-send-invitations.png","/assets/images/center/help-upload-a-file.png","/assets/images/flags/flags.png","/assets/images/img-zoom-status.svg","/assets/images/Mr.J_left.png","assets/images/icon-disabled-members-alert.png","../../../assets/images/icon_loading.gif","/assets/images/service-logo-jnd-connect-active.png","/assets/images/service-logo-jnd-connect-inactive.png","../../assets/images/service-logo-jnd-connect-active.png","../../assets/images/jnd-connect-banner-img.png","/assets/images/circle-mask.png","assets/images/jnd-connect-introduction-webhook-example.png","assets/images/jnd-connect-introduction-jira-01.png","assets/images/jnd-connect-introduction-jira-02.png","assets/images/jnd-connect-introduction-jira-03.png","assets/images/img-error-404.png","assets/images/blank.gif","../assets/images/center/help-dm.png","assets/images/header-signature-mobile.svg","assets/images/badge_appstore_kr.svg","assets/images/badge_appstore_en.svg","assets/images/badge_appstore_jp.svg","assets/images/badge_appstore_cn.svg","assets/images/badge_appstore_tw.svg","assets/images/badge_android_kr.svg","assets/images/badge_android_en.svg","assets/images/badge_android_jp.svg","assets/images/badge_android_cn.svg","assets/images/badge_android_tw.svg","assets/images/gm_line.svg","assets/images/no_image_available.png","assets/images/mrj-profile.png","../assets/images/checkered.png","assets/images/app_notification_w.png","assets/images/app_notification_m.png","assets/images/email_notification_m.png","assets/images/invite-disabled.png","assets/images/invite-done.png","assets/images/invite-members.png","assets/images/no_preview_available.png","../assets/images/preview_audio.png","../assets/images/preview_video.png","../assets/images/preview_pdf.png","../assets/images/preview_hwp.png","../assets/images/preview_zip.png","../assets/images/preview_document.png","../assets/images/preview_spreadsheet.png","../assets/images/preview_presentation.png","../assets/images/preview_google_docs.png","../assets/images/preview_dropbox.png","../assets/images/preview_other.png","assets/images/file-search-no-result.png","assets/images/mention-empty.png","assets/images/star-message-empty.png","assets/images/star-file-empty.png","assets/images/message-search-no-result.png","assets/images/icon-search.png","../../assets/images/sticker/pangya_pangya_off.svg","../../assets/images/sticker/pangya_pangya_on.svg","../../assets/images/sticker/kiyomi_off.svg","../../assets/images/sticker/kiyomi_on.svg","../../assets/images/sticker/dingo_off.svg","../../assets/images/sticker/dingo_on.svg","assets/images/img-error-503.png","assets/images/header-signature.png","assets/images/tutorial/popover/topic-foldering.gif","assets/images/tutorial/popover/star.gif","assets/images/tutorial/popover/mention.gif","assets/images/tutorial/popover/msg-search.gif","assets/images/tutorial/popover/jump.gif","assets/images/tutorial/popover/shortcut.gif","assets/images/tutorial/popover/connect.gif","assets/images/center/help-create-a-new-team.gif","../../../assets/images/tutorial/welcome_01.png","../../../assets/images/tutorial/welcome_02.png","../../../assets/images/tutorial/welcome_03.png","../../../assets/images/fonts/jandi-icon.svg","assets/images/file-empty.png","/assets/images/jnd-logo-only.png","../assets/images/favicon/favicon_noti.png","../assets/images/favicon/favicon.png","assets/StateGoExamples.png","assets/images/mention_profile_all.png","assets/images/jandi-logo-200x200.png","../assets/images/no_image_available_center.png","../assets/images/no_image_available.png","../assets/images/icon_settings.png","../assets/images/icon_add_member.png","../assets/images/icon_user.png","../assets/images/icon_search.png","../assets/images/icon_verti_menu.png","../assets/images/icon_close.png","../assets/images/icon_downmenu.png","../assets/images/icon_invite_dark.png","../assets/images/icon_invite.png","../assets/images/icon_team_dark.png","../assets/images/icon_team.png","../assets/images/icon_signout_dark.png","../assets/images/icon_signout.png","../assets/images/icon_network_error.png","../assets/images/fileicons.png","../assets/images/icon_more_member.png","../assets/images/jd_loading.gif","../assets/images/icon-comment.png","../assets/images/private-topic.svg","../assets/images/googledrive-share.png","../assets/images/googledrive-filetype.png","../assets/images/googledrive-popup.png","../assets/images/dropbox-share.png","../assets/images/dropbox-link.png","../assets/images/dropbox-popup.png","../assets/images/icon_google_drive.png","../assets/images/icon_google_drive_white.png","../assets/images/icon_dropbox.png","../assets/images/icon_dropbox_white.png","../assets/images/center/help-enter-a-message.png","../assets/images/center/help-invite-members.png","../assets/images/center/help-send-invitations.png","../assets/images/center/help-upload-a-file.png","../assets/images/flags/flags.png","../assets/images/img-zoom-status.svg","../assets/images/Mr.J_left.png","assets/images/sticker/pangya_pangya_off.svg","assets/images/sticker/pangya_pangya_on.svg","assets/images/sticker/kiyomi_off.svg","assets/images/sticker/kiyomi_on.svg","assets/images/sticker/dingo_off.png","assets/images/sticker/dingo_on.png","../assets/images/sticker/pangya_pangya_off.svg","../assets/images/sticker/pangya_pangya_on.svg","../assets/images/sticker/kiyomi_off.svg","../assets/images/sticker/kiyomi_on.svg","/assets/images/pdfjs/shadow.png","/assets/images/pdfjs/loading-icon.gif"]);

})();

