this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};

this["Handlebars"]["templates"]["center.date.divider"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"msgs-group__divider\">\r\n  "
    + this.escapeExpression(((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"date","hash":{},"data":data}) : helper)))
    + "\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.file.comment"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <!--  User Thumbnail -->\r\n          <img class=\"comment-writer cursor_pointer user-profile user-thumb _user\" src=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.exProfileImg : stack1), depth0))
    + "\"/>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <!--    WRITER  -->\r\n        <span class=\"msg-item-header__name cursor_pointer "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + " _user\">\r\n          <span> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extWriterName : stack1), depth0))
    + " </span>\r\n        </span>\r\n";
},"5":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <div>\r\n          <img class=\"sticker size_5\" src=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.url : stack1), depth0))
    + "\"/>\r\n          <!--    CREATED TIME    -->\r\n          <span class=\"msg-item-header__created\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "</span>\r\n          <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n        </div>\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <!--    CONTENT TEXT    -->\r\n        <span class=\"comment-text\">\r\n          <span class=\"keep _compile\" jnd-ignore-braces>"
    + ((stack1 = alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n          <!--    CREATED TIME    -->\r\n          <span class=\"msg-item-header__created\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "</span>\r\n          <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n        </span>\r\n";
},"9":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star _star-"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.id : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n          <i class=\"icon-star-on\"></i>\r\n        </span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"msg-item "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.wrapper : stack1), depth0))
    + "\">\r\n  <!--    HEADER PART -->\r\n  <!--    DISPLAYS WRITER WHEN IT IS NOT TITLE COMMENT    -->\r\n  <!--    WHEN IT IS TITLE COMMENT, APPLIES DIFFERENT CSS FORMAT  -->\r\n  <div class=\"msg-item-header\">\r\n    <!--    CONTINUED COMMENT ON SAME FILE  -->\r\n    <div class=\"continue-comment-body\">\r\n      <!-- COMMENT GUIDE LINE -->\r\n      <div class=\"comment-guide\">\r\n        <div class=\"guide-line\"></div>\r\n        <div class=\"guide-line-bg\"></div>\r\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.isChild : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n      <!--    COMMENT CONTENT -->\r\n      <div class=\"comment-content\">\r\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.isChild : depth0),{"name":"unless","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isSticker : depth0),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n    <!-- Star -->\r\n    <div class=\"msg-extra msg-extra-comment-continue\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasStar : depth0),{"name":"if","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.file.comment.title"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "          <!--  ARCHIVED FILE PREVIEW IMAGE  -->\r\n          <div class=\"preview-container\">\r\n            <div class=\"preview-card cursor_pointer _compile _fileGo\">\r\n              <div class=\"msg-file-actions-content actions-dimmed\"></div>\r\n              <div class=\"msg-file-actions-content non-selectable\">\r\n                <div class=\"msg-file-actions\">\r\n                  <div class=\"action-group\">\r\n                    <div class=\"action-item\"\r\n                         jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@btn-file-detail",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                         data-direction=\"top\">\r\n                      <!--  FILE DETAIL -->\r\n                      <i class=\"action-file-detail icon-arrow-right _fileDetail\"></i>\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n\r\n              <!--  ARCHIVED FILE -->\r\n              <div class=\"card-type\">\r\n                <img class=\"fileicon\" src=\"assets/images/fileicon_archived.png\">\r\n              </div>\r\n              <div class=\"card-info card-archived\">\r\n                <span class=\"info-title\">"
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@common-deleted-file-title",{"name":"translate","hash":{},"data":data}))
    + "</span>\r\n              </div>\r\n            </div>\r\n          </div>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.hasPermission : stack1),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.program(21, data, 0),"data":data})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.mustPreview : stack1),{"name":"unless","hash":{},"fn":this.program(23, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.mustPreview : stack1),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"5":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "              <!--  FILE INFO -->\r\n              <div class=\"msg-file-meta\">\r\n                <div class=\"msg-file-meta-up\">\r\n                  <!--  NOT ARCHIVED FILE -->\r\n                  <!--    TITLE   -->\r\n                  <a class=\"msg-file-meta__title file__name break-word cursor_pointer _fileGo\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.title : stack1), depth0))
    + "</a>\r\n                  <span class=\"bullet\">•</span>\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                  <span class=\"msg-file-meta-info\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.type : stack1), depth0))
    + "</span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.hasPreview : stack1),{"name":"if","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                </div>\r\n              </div>\r\n              <!--  FILE PREVIEW IMAGE  -->\r\n              <div class=\"preview-container\">\r\n                <!-- MEDIUM SIZE IMAGE THUMBNAIL -->\r\n                <div class=\"jnd-text-center _compile _fileToggleTarget\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.hasPreview : stack1),{"name":"if","hash":{},"fn":this.program(11, data, 0),"inverse":this.program(15, data, 0),"data":data})) != null ? stack1 : "")
    + "                </div>\r\n\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isUnshared : stack1),{"name":"unless","hash":{},"fn":this.program(17, data, 0),"inverse":this.program(19, data, 0),"data":data})) != null ? stack1 : "")
    + "              </div>\r\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return "                    <!--    SIZE AND FILE TYPE  -->\r\n                    <span class=\"msg-file-meta-info\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1), depth0))
    + "</span>\r\n";
},"9":function(depth0,helpers,partials,data) {
    return "                  <i class=\"preview-icon icon-angle-down non-selectable _fileToggle\"></i>\r\n";
},"11":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "                    <div class=\"image_wrapper medium-thumbnail medium-thumbnail-wrapper cursor_pointer _fileExpand\"\r\n                         image-view=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.imageUrl : stack1), depth0))
    + "\"\r\n                         image-width=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.width : stack1), depth0))
    + "\"\r\n                         image-height=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.height : stack1), depth0))
    + "\"\r\n                         image-max-width=\"360\"\r\n                         image-max-height=\"270\"\r\n                         has-loading-bar=\"true\">\r\n                      <div class=\"msg-file-actions-content non-selectable\">\r\n                        <div class=\"msg-file-actions\">\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isUnshared : stack1),{"name":"unless","hash":{},"fn":this.program(12, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                          <div class=\"action-group\">\r\n                            <div class=\"action-item\"\r\n                                 jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@btn-file-detail",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                                 data-direction=\"top\">\r\n                              <!--  FILE DETAIL -->\r\n                              <i class=\"action-file-detail icon-arrow-right _fileDetail\"></i>\r\n                            </div>\r\n                          </div>\r\n                        </div>\r\n                      </div>\r\n                    </div>\r\n";
},"12":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "                          <div class=\"action-group\">\r\n                            <div class=\"action-item\"\r\n                                 jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@btn-comment",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                                 data-direction=\"top\">\r\n                              <!--  MORE  -->\r\n                              <span class=\"action-comment _fileDetailComment\">\r\n                                <i class=\"icon-comment\"></i>\r\n                                <span class=\"comment-count-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.id : stack1), depth0))
    + "\">"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.commentCount : stack1), depth0))
    + "</span>\r\n                              </span>\r\n                            </div>\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(13, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                            <div class=\"action-item\"\r\n                                 jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@file-action-more",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                                 data-direction=\"top\">\r\n                              <!--  MORE  -->\r\n                              <i class=\"action-file-more icon-cog _fileMore\"></i>\r\n                            </div>\r\n                          </div>\r\n";
},"13":function(depth0,helpers,partials,data) {
    var stack1;

  return "                              <div class=\"action-item\"\r\n                                   jnd-tooltip-trigger=\""
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@common-download",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                                   data-direction=\"top\">\r\n                                <!--  DOWNLOAD  -->\r\n                                <a class=\"action-file-download file_action _fileDownload\" "
    + ((stack1 = this.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.download : stack1), depth0)) != null ? stack1 : "")
    + ">\r\n                                  <i class=\"icon-download\"></i>\r\n                                </a>\r\n                              </div>\r\n";
},"15":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "                    <div class=\"image_wrapper medium-thumbnail msg-file-body__img__background cursor_pointer\"\r\n                         image-view\r\n                         image-width=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.width : stack1), depth0))
    + "\"\r\n                         image-height=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.height : stack1), depth0))
    + "\"\r\n                         image-max-width=\"360\"\r\n                         image-max-height=\"270\"\r\n                         has-loading-bar=\"true\"></div>\r\n";
},"17":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "                  <!-- Star -->\r\n                  <div class=\"msg-extra file-uploaded-extra\">\r\n                    <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _fileStar _feedbackStar _star-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.id : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.fileStar : stack1), depth0))
    + "\">\r\n                      <i class=\"icon-star-on\"></i>\r\n                    </span>\r\n                  </div>\r\n";
},"19":function(depth0,helpers,partials,data) {
    return "\r\n";
},"21":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression;

  return "            <!--  UNSHARED FILE  -->\r\n            <div class=\"preview-container\">\r\n              <div class=\"preview-card cursor_pointer _compile _fileGo\">\r\n                <div class=\"msg-file-actions-content actions-dimmed\"></div>\r\n                <div class=\"msg-file-actions-content non-selectable\">\r\n                  <div class=\"msg-file-actions\">\r\n                    <div class=\"action-group\">\r\n                      <div class=\"action-item\"\r\n                           jnd-tooltip-trigger=\""
    + alias1((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@btn-file-detail",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                           data-direction=\"top\">\r\n                        <!--  FILE DETAIL -->\r\n                        <i class=\"action-file-detail icon-arrow-right _fileDetail\"></i>\r\n                      </div>\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n\r\n                <!--    FILE TYPE THUMBNAIL -->\r\n                <div class=\"card-type\">\r\n                  <div class=\"fileicon fileicon-unshared\"></div>\r\n                </div>\r\n                <div class=\"card-info card-unshared\">\r\n                  <span class=\"info-title break-word\">"
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.title : stack1), depth0))
    + "</span>\r\n                </div>\r\n              </div>\r\n            </div>\r\n";
},"23":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression, alias2=this.lambda;

  return "            <!--  FILE PREVIEW IMAGE  -->\r\n            <div class=\"preview-container\">\r\n              <div class=\"preview-card cursor_pointer _compile _fileGo\">\r\n                <div class=\"msg-file-actions-content actions-dimmed\"></div>\r\n                <div class=\"msg-file-actions-content non-selectable\">\r\n                  <div class=\"msg-file-actions\">\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isUnshared : stack1),{"name":"unless","hash":{},"fn":this.program(24, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                    <div class=\"action-group\">\r\n                      <div class=\"action-item\"\r\n                           jnd-tooltip-trigger=\""
    + alias1((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@btn-file-detail",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                           data-direction=\"top\">\r\n                        <!--  FILE DETAIL -->\r\n                        <i class=\"action-file-detail icon-arrow-right _fileDetail\"></i>\r\n                      </div>\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n\r\n                <!--    FILE TYPE THUMBNAIL -->\r\n                <div class=\"card-type\">\r\n                  <div class=\"fileicon fileicon-"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\" ></div>\r\n                </div>\r\n                <div class=\"card-info\">\r\n                  <div class=\"info-group\">\r\n                    <span class=\"info-writer inline-overflow-ellipsis\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.writerName : stack1), depth0))
    + "</span>\r\n                    <span class=\"info-created-time\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.time : stack1), depth0))
    + "</span>\r\n                    <span class=\"info-comment-count\">\r\n                      <i class=\"icon-comment\"></i>\r\n                      <span class=\"comment-count-"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.id : stack1), depth0))
    + "\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.commentCount : stack1), depth0))
    + "</span>\r\n                    </span>\r\n                  </div>\r\n                  <div class=\"info-group-bottom\">\r\n                    <span class=\"info-title break-word\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.title : stack1), depth0))
    + "</span>\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(29, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                    <span class=\"info-type\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.type : stack1), depth0))
    + "</span>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isUnshared : stack1),{"name":"unless","hash":{},"fn":this.program(32, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            </div>\r\n";
},"24":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "                    <div class=\"action-group\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isImageIcon : stack1),{"name":"if","hash":{},"fn":this.program(25, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                      <div class=\"action-item\"\r\n                           jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@btn-comment",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                           data-direction=\"top\">\r\n                        <!--  MORE  -->\r\n                      <span class=\"action-comment _fileDetailComment\">\r\n                        <i class=\"icon-comment\"></i>\r\n                        <span class=\"comment-count-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.id : stack1), depth0))
    + "\">"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.commentCount : stack1), depth0))
    + "</span>\r\n                      </span>\r\n                      </div>\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(27, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                      <div class=\"action-item\"\r\n                           jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@file-action-more",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                           data-direction=\"top\">\r\n                        <!--  MORE  -->\r\n                        <i class=\"action-file-more icon-cog _fileMore\"></i>\r\n                      </div>\r\n                    </div>\r\n";
},"25":function(depth0,helpers,partials,data) {
    return "                        <div class=\"action-item\"\r\n                             jnd-tooltip-trigger=\""
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@btn-image-expand",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                             data-direction=\"top\">\r\n                          <!--  file expand  -->\r\n                          <span class=\"action-comment _fileExpand\">\r\n                            <i class=\"fa-search-plus\"></i>\r\n                          </span>\r\n                        </div>\r\n";
},"27":function(depth0,helpers,partials,data) {
    var stack1;

  return "                        <div class=\"action-item\"\r\n                             jnd-tooltip-trigger=\""
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@common-download",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                             data-direction=\"top\">\r\n                          <!--  DOWNLOAD  -->\r\n                          <a class=\"action-file-download file_action _fileDownload\" "
    + ((stack1 = this.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.download : stack1), depth0)) != null ? stack1 : "")
    + ">\r\n                            <i class=\"icon-download\"></i>\r\n                          </a>\r\n                        </div>\r\n";
},"29":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1),{"name":"if","hash":{},"fn":this.program(30, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"30":function(depth0,helpers,partials,data) {
    var stack1;

  return "                        <!--    SIZE AND FILE TYPE  -->\r\n                        <span class=\"info-size\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1), depth0))
    + "</span>\r\n";
},"32":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "                <!-- Star -->\r\n                <div class=\"msg-extra file-uploaded-extra\">\r\n                  <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _fileStar _feedbackStar _star-"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.id : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.fileStar : stack1), depth0))
    + "\">\r\n                    <i class=\"icon-star-on\"></i>\r\n                  </span>\r\n                </div>\r\n";
},"34":function(depth0,helpers,partials,data) {
    var stack1;

  return "      <div class=\"msg-item comment-all\">\r\n        <div class=\"continue-comment-body\">\r\n          <!--    COMMENT CONTENT -->\r\n          <div class=\"comment-content\">\r\n            <span class=\"comment-all-desc _fileGo\">\r\n              "
    + ((stack1 = this.lambda(((stack1 = (depth0 != null ? depth0.translate : depth0)) != null ? stack1.commentAllDesc : stack1), depth0)) != null ? stack1 : "")
    + "\r\n            </span>\r\n          </div>\r\n        </div>\r\n      </div>\r\n";
},"36":function(depth0,helpers,partials,data) {
    var stack1;

  return "              <!--  User Thumbnail -->\r\n              <img class=\"comment-writer cursor_pointer user-profile user-thumb _user\" src=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.exProfileImg : stack1), depth0))
    + "\"/>\r\n";
},"38":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "            <div>\r\n              <img class=\"sticker size_5\" src=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.url : stack1), depth0))
    + "\"/>\r\n              <span class=\"msg-item-header__created\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "</span>\r\n              <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n            </div>\r\n";
},"40":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "            <!--    CONTENT TEXT    -->\r\n            <span class=\"comment-text\">\r\n              <span class=\"keep _compile\" jnd-ignore-braces>"
    + ((stack1 = alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n              <!--    CREATED TIME    -->\r\n              <span class=\"msg-item-header__created\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "</span>\r\n              <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n            </span>\r\n";
},"42":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star _star-"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.id : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n            <i class=\"icon-star-on\"></i>\r\n          </span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.wrapper : stack1), depth0))
    + "\">\r\n  <div class=\"msg-item-body\">\r\n    <!--    COMMENT\r\n            최초 댓글\r\n            DISPLAY COMMENT BODY WHEN IT IS TITLE\r\n            IF CURRENT COMMENT IS NOT TITLE, CONTENT GETS DISPLAYED WITHIN HEADER -->\r\n    <div class=\"msg-item\">\r\n      <i class=\"icon-file\"></i>\r\n      <!-- FILE -->\r\n      <div class=\"msg-file "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.unshared : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.archived : stack1), depth0))
    + "\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isArchived : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasCommentAllDesc : depth0),{"name":"if","hash":{},"fn":this.program(34, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\r\n    <div class=\"msg-item comment-continue\">\r\n      <!--    HEADER PART -->\r\n      <!--    DISPLAYS WRITER WHEN IT IS NOT TITLE COMMENT    -->\r\n      <!--    WHEN IT IS TITLE COMMENT, APPLIES DIFFERENT CSS FORMAT  -->\r\n      <div class=\"msg-item-header\">\r\n        <!--    CONTINUED COMMENT ON SAME FILE  -->\r\n        <div class=\"continue-comment-body\">\r\n          <!-- COMMENT GUIDE LINE -->\r\n          <div class=\"comment-guide\">\r\n            <div class=\"guide-line\"></div>\r\n            <div class=\"guide-line-bg\"></div>\r\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.isChild : depth0),{"name":"unless","hash":{},"fn":this.program(36, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "          </div>\r\n          <!--    COMMENT CONTENT -->\r\n          <div class=\"comment-content\">\r\n            <!--    WRITER  -->\r\n            <span class=\"msg-item-header__name cursor_pointer "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + " _user\">\r\n              <!-- TODO: WHAT IS THIS??   정책상 항상 댓글의 작성자가 다 보여야 한다면 extWriterName을 그냥 무조건 사용합시다. -->\r\n              <span> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extWriterName : stack1), depth0))
    + " </span>\r\n            </span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isSticker : depth0),{"name":"if","hash":{},"fn":this.program(38, data, 0),"inverse":this.program(40, data, 0),"data":data})) != null ? stack1 : "")
    + "          </div>\r\n        </div>\r\n        <!-- Star -->\r\n        <div class=\"msg-extra msg-extra-comment-continue\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasStar : depth0),{"name":"if","hash":{},"fn":this.program(42, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.file"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var alias1=helpers.helperMissing, alias2=this.escapeExpression;

  return "        <!--  ARCHIVED FILE PREVIEW IMAGE  -->\r\n        <div class=\"preview-container\">\r\n          <div class=\"preview-card cursor_pointer _compile _fileGo\">\r\n            <div class=\"msg-file-actions-content actions-dimmed\"></div>\r\n            <div class=\"msg-file-actions-content non-selectable\">\r\n              <div class=\"msg-file-actions\">\r\n                <div class=\"action-group\">\r\n                  <div class=\"action-item\"\r\n                       jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@btn-file-detail",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                       data-direction=\"top\">\r\n                    <!--  FILE DETAIL -->\r\n                    <i class=\"action-file-detail icon-arrow-right _fileDetail\"></i>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n            </div>\r\n\r\n            <!--  ARCHIVED FILE -->\r\n            <div class=\"card-type\">\r\n              <img class=\"fileicon\" src=\"assets/images/fileicon_archived.png\">\r\n            </div>\r\n            <div class=\"card-info card-archived\">\r\n              <span class=\"info-title\">"
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@common-deleted-file-title",{"name":"translate","hash":{},"data":data}))
    + "</span>\r\n            </div>\r\n          </div>\r\n        </div>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.hasPermission : stack1),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.program(28, data, 0),"data":data})) != null ? stack1 : "");
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.mustPreview : stack1),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.program(17, data, 0),"data":data})) != null ? stack1 : "");
},"5":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <!--  FILE INFO -->\r\n          <div class=\"msg-file-meta\">\r\n            <div class=\"msg-file-meta-up\">\r\n              <!--  NOT ARCHIVED FILE -->\r\n              <!--    TITLE   -->\r\n              <a class=\"msg-file-meta__title file__name break-word cursor_pointer _fileGo\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.title : stack1), depth0))
    + "</a>\r\n              <span class=\"bullet\">•</span>\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(6, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "              <span class=\"msg-file-meta-info\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.type : stack1), depth0))
    + "</span>\r\n              <i class=\"preview-icon icon-angle-down non-selectable _fileToggle\"></i>\r\n            </div>\r\n          </div>\r\n\r\n          <!--  FILE PREVIEW IMAGE  -->\r\n          <div class=\"preview-container\">\r\n            <!-- MEDIUM SIZE IMAGE THUMBNAIL -->\r\n            <div class=\"jnd-text-center _compile _fileToggleTarget\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.hasPreview : stack1),{"name":"if","hash":{},"fn":this.program(9, data, 0),"inverse":this.program(13, data, 0),"data":data})) != null ? stack1 : "")
    + "            </div>\r\n\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isUnshared : stack1),{"name":"unless","hash":{},"fn":this.program(15, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "          </div>\r\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return "                  <!--    SIZE AND FILE TYPE  -->\r\n                  <span class=\"msg-file-meta-info\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1), depth0))
    + "</span>\r\n";
},"9":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "                <div class=\"image_wrapper medium-thumbnail medium-thumbnail-wrapper cursor_pointer _fileExpand\"\r\n                     image-view=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.imageUrl : stack1), depth0))
    + "\"\r\n                     image-width=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.width : stack1), depth0))
    + "\"\r\n                     image-height=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.height : stack1), depth0))
    + "\"\r\n                     image-max-width=\"360\"\r\n                     image-max-height=\"270\"\r\n                     has-loading-bar=\"true\">\r\n                  <div class=\"msg-file-actions-content non-selectable\">\r\n                    <div class=\"msg-file-actions\">\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isUnshared : stack1),{"name":"unless","hash":{},"fn":this.program(10, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                      <div class=\"action-group\">\r\n                        <div class=\"action-item\"\r\n                             jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@btn-file-detail",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                             data-direction=\"top\">\r\n                          <!--  FILE DETAIL -->\r\n                          <i class=\"action-file-detail icon-arrow-right _fileDetail\"></i>\r\n                        </div>\r\n                      </div>\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n";
},"10":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "                      <div class=\"action-group\">\r\n                        <div class=\"action-item\"\r\n                             jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@btn-comment",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                             data-direction=\"top\">\r\n                          <!--  MORE  -->\r\n                          <span class=\"action-comment _fileDetailComment\">\r\n                            <i class=\"icon-comment\"></i>\r\n                            <span class=\"comment-count-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.id : stack1), depth0))
    + "\">"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.commentCount : stack1), depth0))
    + "</span>\r\n                          </span>\r\n                        </div>\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(11, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                        <div class=\"action-item\"\r\n                             jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@file-action-more",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                             data-direction=\"top\">\r\n                          <!--  MORE  -->\r\n                          <i class=\"action-file-more icon-cog _fileMore\"></i>\r\n                        </div>\r\n                      </div>\r\n";
},"11":function(depth0,helpers,partials,data) {
    var stack1;

  return "                        <div class=\"action-item\"\r\n                             jnd-tooltip-trigger=\""
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@common-download",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                             data-direction=\"top\">\r\n                          <!--  DOWNLOAD  -->\r\n                          <a class=\"action-file-download file_action _fileDownload\" "
    + ((stack1 = this.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.download : stack1), depth0)) != null ? stack1 : "")
    + ">\r\n                            <i class=\"icon-download\"></i>\r\n                          </a>\r\n                        </div>\r\n";
},"13":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "                <div class=\"image_wrapper medium-thumbnail medium-thumbnail-wrapper cursor_pointer\"\r\n                     image-view\r\n                     image-width=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.width : stack1), depth0))
    + "\"\r\n                     image-height=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.height : stack1), depth0))
    + "\"\r\n                     image-max-width=\"360\"\r\n                     image-max-height=\"270\"\r\n                     has-loading-bar=\"true\"></div>\r\n";
},"15":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "              <!-- Star -->\r\n              <div class=\"msg-extra file-uploaded-extra\">\r\n                <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _fileStar _star-"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.id : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n                  <i class=\"icon-star-on\"></i>\r\n                </span>\r\n              </div>\r\n";
},"17":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression, alias2=this.lambda;

  return "              <!--  FILE PREVIEW IMAGE  -->\r\n              <div class=\"preview-container\">\r\n                <div class=\"preview-card cursor_pointer _compile _fileGo\">\r\n                  <div class=\"msg-file-actions-content actions-dimmed\"></div>\r\n                  <div class=\"msg-file-actions-content non-selectable\">\r\n                    <div class=\"msg-file-actions\">\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isUnshared : stack1),{"name":"unless","hash":{},"fn":this.program(18, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                      <div class=\"action-group\">\r\n                        <div class=\"action-item\"\r\n                             jnd-tooltip-trigger=\""
    + alias1((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@btn-file-detail",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                             data-direction=\"top\">\r\n                          <!--  FILE DETAIL -->\r\n                          <i class=\"action-file-detail icon-arrow-right _fileDetail\"></i>\r\n                        </div>\r\n                      </div>\r\n                    </div>\r\n                  </div>\r\n\r\n                  <!--    FILE TYPE THUMBNAIL -->\r\n                  <div class=\"card-type\">\r\n                    <div class=\"fileicon fileicon-"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\" ></div>\r\n                  </div>\r\n                  <div class=\"card-info\">\r\n                    <div class=\"info-group\">\r\n                      <span class=\"info-writer inline-overflow-ellipsis\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extWriterName : stack1), depth0))
    + "</span>\r\n                      <span class=\"info-created-time\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.time : stack1), depth0))
    + "</span>\r\n                    <span class=\"info-comment-count\">\r\n                      <i class=\"icon-comment\"></i>\r\n                      <span class=\"comment-count-"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.id : stack1), depth0))
    + "\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.commentCount : stack1), depth0))
    + "</span>\r\n                    </span>\r\n                    </div>\r\n                    <div class=\"info-group-bottom\">\r\n                      <span class=\"info-title break-word\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.title : stack1), depth0))
    + "</span>\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(23, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                      <span class=\"info-type\">"
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.type : stack1), depth0))
    + "</span>\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isUnshared : stack1),{"name":"unless","hash":{},"fn":this.program(26, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "              </div>\r\n";
},"18":function(depth0,helpers,partials,data) {
    var stack1, alias1=helpers.helperMissing, alias2=this.escapeExpression, alias3=this.lambda;

  return "                        <div class=\"action-group\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isImageIcon : stack1),{"name":"if","hash":{},"fn":this.program(19, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                          <div class=\"action-item\"\r\n                               jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@btn-comment",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                               data-direction=\"top\">\r\n                            <!--  MORE  -->\r\n                      <span class=\"action-comment _fileDetailComment\">\r\n                        <i class=\"icon-comment\"></i>\r\n                        <span class=\"comment-count-"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.id : stack1), depth0))
    + "\">"
    + alias2(alias3(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.commentCount : stack1), depth0))
    + "</span>\r\n                      </span>\r\n                          </div>\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(21, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "                          <div class=\"action-item\"\r\n                               jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias1).call(depth0,"@file-action-more",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                               data-direction=\"top\">\r\n                            <!--  MORE  -->\r\n                            <i class=\"action-file-more icon-cog _fileMore\"></i>\r\n                          </div>\r\n                        </div>\r\n";
},"19":function(depth0,helpers,partials,data) {
    return "                            <div class=\"action-item\"\r\n                                 jnd-tooltip-trigger=\""
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@btn-image-expand",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                                 data-direction=\"top\">\r\n                              <!--  file expand  -->\r\n                      <span class=\"action-comment _fileExpand\">\r\n                        <i class=\"fa-search-plus\"></i>\r\n                      </span>\r\n                            </div>\r\n";
},"21":function(depth0,helpers,partials,data) {
    var stack1;

  return "                            <div class=\"action-item\"\r\n                                 jnd-tooltip-trigger=\""
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@common-download",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                                 data-direction=\"top\">\r\n                              <!--  DOWNLOAD  -->\r\n                              <a class=\"action-file-download file_action _fileDownload\" "
    + ((stack1 = this.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.download : stack1), depth0)) != null ? stack1 : "")
    + ">\r\n                                <i class=\"icon-download\"></i>\r\n                              </a>\r\n                            </div>\r\n";
},"23":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1),{"name":"if","hash":{},"fn":this.program(24, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"24":function(depth0,helpers,partials,data) {
    var stack1;

  return "                          <!--    SIZE AND FILE TYPE  -->\r\n                          <span class=\"info-size\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1), depth0))
    + "</span>\r\n";
},"26":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "                  <!-- Star -->\r\n                  <div class=\"msg-extra file-uploaded-extra\">\r\n              <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _fileStar _star-"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.id : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n                <i class=\"icon-star-on\"></i>\r\n              </span>\r\n                  </div>\r\n";
},"28":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.escapeExpression;

  return "          <!--  UNSHARED FILE  -->\r\n          <div class=\"preview-container\">\r\n            <div class=\"preview-card cursor_pointer _compile _fileGo\">\r\n              <div class=\"msg-file-actions-content actions-dimmed\"></div>\r\n              <div class=\"msg-file-actions-content non-selectable\">\r\n                <div class=\"msg-file-actions\">\r\n                  <div class=\"action-group\">\r\n                    <div class=\"action-item\"\r\n                         jnd-tooltip-trigger=\""
    + alias1((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@btn-file-detail",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                         data-direction=\"top\">\r\n                      <!--  FILE DETAIL -->\r\n                      <i class=\"action-file-detail icon-arrow-right _fileDetail\"></i>\r\n                    </div>\r\n                  </div>\r\n                </div>\r\n              </div>\r\n\r\n              <!--    FILE TYPE THUMBNAIL -->\r\n              <div class=\"card-type\">\r\n                <div class=\"fileicon fileicon-unshared\"></div>\r\n              </div>\r\n              <div class=\"card-info card-unshared\">\r\n                <span class=\"info-title break-word\">"
    + alias1(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.title : stack1), depth0))
    + "</span>\r\n              </div>\r\n            </div>\r\n          </div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div id=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.id : stack1), depth0))
    + "\" class=\"msg-item "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.wrapper : stack1), depth0))
    + "\">\r\n  <!--  User Thumbnail -->\r\n  <div class=\"msg-item-float cursor_pointer "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + " _user\">\r\n    <img class=\"user-profile user-thumb\" src=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.exProfileImg : stack1), depth0))
    + "\"/>\r\n  </div>\r\n\r\n  <div class=\"msg-item-header "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + "\">\r\n    <!--    WRITER-->\r\n      <span class=\"msg-item-header__name cursor_pointer _user\">\r\n        <span class=\"msg-item-header__nameSpace\">\r\n          "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extWriterName : stack1), depth0))
    + "\r\n        </span>\r\n\r\n        <!--    CREATED TIME    -->\r\n        <span class=\"msg-item-header__created\">\r\n          "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "\r\n        </span>\r\n\r\n        <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n      </span>\r\n  </div>\r\n\r\n  <div class=\"msg-item-body\">\r\n    <!-- FILE -->\r\n    <div class=\"msg-file "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.unshared : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.archived : stack1), depth0))
    + "\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isArchived : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.main"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div id=\""
    + alias3(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"id","hash":{},"data":data}) : helper)))
    + "\" class=\"msgs-group\" content-type=\""
    + alias3(((helper = (helper = helpers.contentType || (depth0 != null ? depth0.contentType : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"contentType","hash":{},"data":data}) : helper)))
    + "\">\r\n  "
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.system.event"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda;

  return "        <!--1-->\r\n            <span class=\"msg-comment_userType\">"
    + this.escapeExpression(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.actionOwner : stack1), depth0))
    + "</span>\r\n            <span class=\"keep\">"
    + ((stack1 = alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n"
    + ((stack1 = helpers.each.call(depth0,(depth0 != null ? depth0.invitees : depth0),{"name":"each","hash":{},"fn":this.program(2, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasPostfix : depth0),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "");
},"2":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return "                    <span class=\"msg-comment_userType\">\r\n                      <span>"
    + this.escapeExpression(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"name","hash":{},"data":data}) : helper)))
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.isLast : depth0),{"name":"unless","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</span>\r\n                    </span>\r\n";
},"3":function(depth0,helpers,partials,data) {
    return "<span style=\"padding-right: 4px;\">, </span>";
},"5":function(depth0,helpers,partials,data) {
    return "            <span>"
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@msg-invited-postfix",{"name":"translate","hash":{},"data":data}))
    + "</span>\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.status : depth0)) != null ? stack1.isAnnouncementDeleted : stack1),{"name":"if","hash":{},"fn":this.program(8, data, 0),"inverse":this.program(10, data, 0),"data":data})) != null ? stack1 : "");
},"8":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <span>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.text : depth0)) != null ? stack1.announcement : stack1)) != null ? stack1.deleted : stack1), depth0))
    + "</span>\r\n";
},"10":function(depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.status : depth0)) != null ? stack1.isAnnouncementCreated : stack1),{"name":"if","hash":{},"fn":this.program(11, data, 0),"inverse":this.program(13, data, 0),"data":data})) != null ? stack1 : "");
},"11":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <span>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = (depth0 != null ? depth0.text : depth0)) != null ? stack1.announcement : stack1)) != null ? stack1.created : stack1), depth0))
    + "</span>\r\n";
},"13":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda;

  return "            <span class=\"msg-comment_userType\">"
    + this.escapeExpression(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.actionOwner : stack1), depth0))
    + "</span>\r\n            <span class=\"keep\">"
    + ((stack1 = alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n          ";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"msg-item system-event-msg\">\r\n  <!-- SYSTEM EVENT -->\r\n  <div class=\"msg-item-float cursor_pointer\">\r\n    <img class=\"user-profile user-thumb\"/>\r\n  </div>\r\n\r\n  <div class=\"msg-item-body\">\r\n    <div class=\"msg-text\">\r\n      <div class=\"msg-comment-header\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.status : depth0)) != null ? stack1.isInvite : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "        <span class=\"msg-item-header__created\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "</span>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.text.child"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <img class=\"sticker size_5\" src=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.url : stack1), depth0))
    + "\"/>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <span class=\"keep msg-text-body _compile\" jnd-ignore-braces>"
    + ((stack1 = this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n";
},"5":function(depth0,helpers,partials,data) {
    return "          <span class=\"msg-item-icon _textMore\">\r\n            <i class=\"icon-more-fill msg-item__action msg-item-circle msg-item-more cursor_pointer _textMore\"></i>\r\n          </span>\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star _star-"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.id : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n            <i class=\"icon-star-on\"></i>\r\n          </span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"msg-item text text-child\">\r\n  <div class=\"text-msg-item-container\">\r\n    <div class=\"msg-item-body\">\r\n      <!-- TEXT -->\r\n      <div class=\"msg-text\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isSticker : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "        <!--  TIME  -->\r\n        <span class=\"msg-item-header__created\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "</span>\r\n\r\n        <!--  UNREAD COUNT  -->\r\n        <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n      </div>\r\n      <div class=\"msg-extra\">\r\n        <!--More -->\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasMore : depth0),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        <!--Star -->\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasStar : depth0),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n  </div>\r\n  "
    + ((stack1 = alias1(((stack1 = (depth0 != null ? depth0.html : depth0)) != null ? stack1.linkPreview : stack1), depth0)) != null ? stack1 : "")
    + "\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.text"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <img class=\"sticker size_5\" src=\""
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.url : stack1), depth0))
    + "\"/>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <span class=\"keep msg-text-body _compile\" jnd-ignore-braces>"
    + ((stack1 = this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n";
},"5":function(depth0,helpers,partials,data) {
    return "          <span class=\"msg-item-icon _textMore\">\r\n            <span class=\"_textMore\">\r\n              <i class=\"icon-more-fill msg-item__action msg-item-circle msg-item-more cursor_pointer _textMore\"></i>\r\n            </span>\r\n          </span>\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star _star-"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.id : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n            <i class=\"icon-star-on\"></i>\r\n          </span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"msg-item text\">\r\n  <div class=\"text-msg-item-container\">\r\n    <!--  User Thumbnail -->\r\n    <div class=\"msg-item-float cursor_pointer "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + " _user\">\r\n      <img class=\"user-profile user-thumb\" src=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.exProfileImg : stack1), depth0))
    + "\"/>\r\n    </div>\r\n\r\n    <div class=\"msg-item-header "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + "\">\r\n      <!--    WRITER-->\r\n      <span class=\"msg-item-header__name cursor_pointer\">\r\n        <span class=\"msg-item-header__nameSpace _user\">\r\n          <span>"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extWriterName : stack1), depth0))
    + "</span>\r\n        </span>\r\n      </span>\r\n    </div>\r\n    <div class=\"msg-item-body\">\r\n      <!-- TEXT -->\r\n      <div class=\"msg-text\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isSticker : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "        <!--  TIME  -->\r\n        <span class=\"msg-item-header__created\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "</span>\r\n\r\n        <!--  UNREAD COUNT  -->\r\n        <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n      </div>\r\n      <div class=\"msg-text-extra\">\r\n         <!--More -->\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasMore : depth0),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "         <!--Star -->\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasStar : depth0),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </div>\r\n    </div>\r\n  </div>\r\n  "
    + ((stack1 = alias1(((stack1 = (depth0 != null ? depth0.html : depth0)) != null ? stack1.linkPreview : stack1), depth0)) != null ? stack1 : "")
    + "\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.text.link.preview"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "      <div class=\"social-image loading\">\r\n        <div class=\"loading_bar\">\r\n          <span class=\"three-quarters-loader jnd-three-quarters-loader\"></span>\r\n        </div>\r\n      </div>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "      <div class=\"social-image\">\r\n        <a href=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.linkUrl : stack1), depth0))
    + "\" target=\"_blank\">\r\n          <img src=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.imageUrl : stack1), depth0))
    + "\"/>\r\n        </a>\r\n      </div>\r\n";
},"5":function(depth0,helpers,partials,data) {
    return "    <div class=\"social-body has-image\">\r\n";
},"7":function(depth0,helpers,partials,data) {
    return "    <div class=\"social-body\">\r\n";
},"9":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "      <div class=\"social-title neighbor\">\r\n        <a href=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.linkUrl : stack1), depth0))
    + "\" target=\"_blank\">\r\n          <span>"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.title : stack1), depth0))
    + "</span>\r\n        </a>\r\n      </div>\r\n";
},"11":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.domain : stack1),{"name":"if","hash":{},"fn":this.program(12, data, 0),"inverse":this.program(14, data, 0),"data":data})) != null ? stack1 : "")
    + "      <a href=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.linkUrl : stack1), depth0))
    + "\" target=\"_blank\">\r\n        <span>"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.description : stack1), depth0))
    + "</span>\r\n      </a>\r\n    </div> <!-- end of social-desc  -->\r\n";
},"12":function(depth0,helpers,partials,data) {
    return "      <div class=\"social-desc neighbor has-domain\">\r\n";
},"14":function(depth0,helpers,partials,data) {
    return "      <div class=\"social-desc neighbor\">\r\n";
},"16":function(depth0,helpers,partials,data) {
    var stack1;

  return "      <div class=\"social-domain\">\r\n        <span>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.domain : stack1), depth0))
    + "</span>\r\n      </div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"attachment-content-wrapper\">\r\n  <div class=\"attachment-content-bar\"></div>\r\n\r\n  <div class=\"attachment-content\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.extThumbnail : stack1)) != null ? stack1.isWaiting : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.extThumbnail : stack1)) != null ? stack1.hasSuccess : stack1),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\r\n\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.extThumbnail : stack1)) != null ? stack1.hasSuccess : stack1),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.title : stack1),{"name":"if","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.description : stack1),{"name":"if","hash":{},"fn":this.program(11, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.domain : stack1),{"name":"if","hash":{},"fn":this.program(16, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  </div> <!-- end of social-body -->\r\n  </div>  <!-- end of attachment-content  -->\r\n  </div>  <!--  end of attachment-content-wrapper -->\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.unread.bookmark"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<!-- UNREAD BOOKMARK  -->\r\n<div class=\"msg-item\" id=\"unread-bookmark\">\r\n  <div class=\" msg-unread-bookmark system-event-msg\">\r\n    <div class=\"msg-item-float cursor_pointer\">\r\n      <img class=\"user-profile user-thumb\"/>\r\n    </div>\r\n\r\n    <div class=\"msg-item-body\">\r\n      <span>"
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@unread-bookmark-message",{"name":"translate","hash":{},"data":data}))
    + "</span>\r\n    </div>\r\n  </div>\r\n</div>";
},"useData":true});

this["Handlebars"]["templates"]["topic.draggable"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "        <i class=\"icon-private-group topic-setting-icon\"></i>\r\n";
},"3":function(depth0,helpers,partials,data) {
    return "        <i class=\"off-topic-notification-indicator fa fa-bell-slash-o topic-setting-icon\"></i>\r\n";
},"5":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <span class=\"badge left-panel_badge red_badge pull-right\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.currentRoom : depth0)) != null ? stack1.alarmCnt : stack1), depth0))
    + "</span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"lpanel-list topic-draggable\">\r\n  <ul>\r\n    <li>\r\n      <a>\r\n        <i class=\"icon-star left-star "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\"></i>\r\n          <span class=\"inline-overflow-ellipsis left-panel__name "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.unread : stack1), depth0))
    + " "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.bell : stack1), depth0))
    + "\">\r\n            "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.currentRoom : depth0)) != null ? stack1.name : stack1), depth0))
    + "\r\n          </span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isPrivate : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isNotificationOff : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.currentRoom : depth0)) != null ? stack1.alarmCnt : stack1),{"name":"if","hash":{},"fn":this.program(5, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "      </a>\r\n    </li>\r\n  </ul>\r\n</div>";
},"useData":true});

this["Handlebars"]["templates"]["modal.member.list.item"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "    <i class=\"icon-star-off right-star opac-zero "
    + this.escapeExpression(((helper = (helper = helpers.starClass || (depth0 != null ? depth0.starClass : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"starClass","hash":{},"data":data}) : helper)))
    + "\"></i>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"member-item cursor_pointer\" style=\"height: "
    + alias3(((helper = (helper = helpers.itemHeight || (depth0 != null ? depth0.itemHeight : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"itemHeight","hash":{},"data":data}) : helper)))
    + "px;\">\r\n  <img class=\"member-profile-image\" src=\""
    + alias3(((helper = (helper = helpers.profileImage || (depth0 != null ? depth0.profileImage : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"profileImage","hash":{},"data":data}) : helper)))
    + "\"/>\r\n  <span class=\"member-name inline-overflow-ellipsis\">"
    + alias3(((helper = (helper = helpers.userName || (depth0 != null ? depth0.userName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"userName","hash":{},"data":data}) : helper)))
    + "</span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isShowStar : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["modal.room.list.item"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1;

  return "    <span class=\"unjoined-channel-label\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.html : depth0)) != null ? stack1.unjoinedChannel : stack1), depth0))
    + "</span>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var helper;

  return "    <span class=\"badge red_badge pull-right\">"
    + this.escapeExpression(((helper = (helper = helpers.count || (depth0 != null ? depth0.count : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"count","hash":{},"data":data}) : helper)))
    + "</span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=this.escapeExpression, alias2=this.lambda;

  return "<div class=\"room-item cursor_pointer\" style=\"height: "
    + alias1(((helper = (helper = helpers.itemHeight || (depth0 != null ? depth0.itemHeight : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"itemHeight","hash":{},"data":data}) : helper)))
    + "px;\">\r\n  "
    + ((stack1 = alias2(((stack1 = (depth0 != null ? depth0.html : depth0)) != null ? stack1.roomTypeImage : stack1), depth0)) != null ? stack1 : "")
    + "\r\n  <span class=\"room-name inline-overflow-ellipsis pull-left "
    + alias1(alias2(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.unjoinedChannel : stack1), depth0))
    + "\">"
    + ((stack1 = alias2(((stack1 = (depth0 != null ? depth0.html : depth0)) != null ? stack1.content : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isUnjoinedChannel : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasCount : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["modal.topic.list.item"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var helper;

  return "    <div class=\"topic-description display-2-lines\">"
    + this.escapeExpression(((helper = (helper = helpers.topicDescription || (depth0 != null ? depth0.topicDescription : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"topicDescription","hash":{},"data":data}) : helper)))
    + "</div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"join-modal-channel_container file-item-meta__listview cursor_pointer white_background modal-list-item\" style=\"height: "
    + alias3(((helper = (helper = helpers.itemHeight || (depth0 != null ? depth0.itemHeight : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"itemHeight","hash":{},"data":data}) : helper)))
    + "px;\">\r\n  <div class=\"join-modal-channel_title\">\r\n    <span class=\"join-modal-channel_title_area inline-overflow-ellipsis cursor_pointer\">\r\n      <i class=\"icon-topic\"></i>"
    + alias3(((helper = (helper = helpers.topicName || (depth0 != null ? depth0.topicName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"topicName","hash":{},"data":data}) : helper)))
    + "\r\n    </span>\r\n    <span class=\"pull-right\">\r\n      <i class=\"icon-clock\"></i>"
    + alias3(((helper = (helper = helpers.createTime || (depth0 != null ? depth0.createTime : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"createTime","hash":{},"data":data}) : helper)))
    + "\r\n    </span>\r\n  </div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.topicDescription : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "  <div class=\"topic-general-info\">\r\n    <i class=\"icon-user\"></i>\r\n    <span class=\"join-modal-channel_creator inline-overflow-ellipsis\"> "
    + alias3(((helper = (helper = helpers.creatorName || (depth0 != null ? depth0.creatorName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"creatorName","hash":{},"data":data}) : helper)))
    + "</span>\r\n    <span class=\"bullet\"> • </span>"
    + alias3(((helper = (helper = helpers.memberCount || (depth0 != null ? depth0.memberCount : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"memberCount","hash":{},"data":data}) : helper)))
    + "<span>"
    + alias3(((helper = (helper = helpers.commonJoinedMessage || (depth0 != null ? depth0.commonJoinedMessage : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"commonJoinedMessage","hash":{},"data":data}) : helper)))
    + "</span>\r\n  </div>\r\n</div>\r\n";
},"useData":true});