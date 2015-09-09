this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};

this["Handlebars"]["templates"]["center.date.divider"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper;

  return "<div class=\"msgs-group__divider\">\r\n  "
    + this.escapeExpression(((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"date","hash":{},"data":data}) : helper)))
    + "\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.file.comment"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <!--    WRITER  -->\r\n        <span class=\"msg-item-header__name cursor_pointer "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + " _user\">\r\n          <span> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extWriterName : stack1), depth0))
    + " </span>\r\n        </span>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <div>\r\n          <img class=\"sticker size_5\" src=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.url : stack1), depth0))
    + "\"/>\r\n          <!--    CREATED TIME    -->\r\n          <span class=\"msg-item-header__created\">\r\n            "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "\r\n          </span>\r\n          <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n        </div>\r\n";
},"5":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "        <!--    CONTENT(MESSAGE)    -->\r\n        <span>\r\n          <span class=\"keep _compile\"> "
    + ((stack1 = alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n          <!--    CREATED TIME    -->\r\n          <span class=\"msg-item-header__created\">\r\n            "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "\r\n          </span>\r\n          <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n        </span>\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return "        <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n          <i class=\"icon-star-on\"></i>\r\n        </span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"msg-item "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.wrapper : stack1), depth0))
    + "\">\r\n  <!--    HEADER PART -->\r\n  <!--    DISPLAYS WRITER WHEN IT IS NOT TITLE COMMENT    -->\r\n  <!--    WHEN IT IS TITLE COMMENT, APPLIES DIFFERENT CSS FORMAT  -->\r\n  <div class=\"msg-item-header\">\r\n    <!--    CONTINUED COMMENT ON SAME FILE  -->\r\n    <span class=\"continue-comment-body\">\r\n      <!--    COMMENT CONTENT -->\r\n      <p>\r\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.isChild : depth0),{"name":"unless","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isSticker : depth0),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.program(5, data, 0),"data":data})) != null ? stack1 : "")
    + "      </p>\r\n    </span>\r\n    <!-- Star -->\r\n    <div class=\"msg-extra msg-extra-comment-continue\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasStar : depth0),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n  <div class=\"msg-item-body\">\r\n  </div>\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.file.comment.title"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "        <div class=\"msg-file-body__thumbnail\">\r\n          <img class=\"fileicon\" src=\"assets/images/fileicon_archived.png\"/>\r\n        </div>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return "        <div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.hasPreview : stack1),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.program(6, data, 0),"data":data})) != null ? stack1 : "")
    + "        </div>\r\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <!--    IMAGE THUMBNAIL -->\r\n          <div class=\"image_wrapper msg-file-body__img__background\">\r\n            <div class=\"opac-zero msg-file-body__img cursor_pointer jnd-text-center _compile\"\r\n                 image-loader=\""
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.imageUrl : stack1), depth0))
    + "\"\r\n                 image-max-height=\"63\" image-max-width=\"63\" image-is-square=\"true\">\r\n            </div>\r\n          </div>\r\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <!--    FILE THUMBNAIL  -->\r\n          <div class=\"msg-file-body__thumbnail\">\r\n            <div class=\"fileicon fileicon-"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\" ></div>\r\n          </div>\r\n";
},"8":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <div>\r\n            <a class=\"archived-msg-file-meta__title _compile\" ui-sref=\"files({ userName: '"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.feedback : stack1)) != null ? stack1.writer : stack1)) != null ? stack1.name : stack1), depth0))
    + "', itemId: '"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.feedback : stack1)) != null ? stack1.id : stack1), depth0))
    + "' })\">\r\n              <span>"
    + alias2((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@common-deleted-file-title",{"name":"translate","hash":{},"data":data}))
    + "</span>\r\n            </a>\r\n          </div>\r\n";
},"10":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <!--    FILE TITLE/NAME  -->\r\n          <div>\r\n            <a class=\"msg-file-meta__title file__name break-word _compile\" ui-sref=\"files({ userName: '"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.feedback : stack1)) != null ? stack1.writer : stack1)) != null ? stack1.name : stack1), depth0))
    + "', itemId: '"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.feedback : stack1)) != null ? stack1.id : stack1), depth0))
    + "' })\">\r\n              "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.title : stack1), depth0))
    + "\r\n            </a>\r\n          </div>\r\n";
},"12":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <div>\r\n            <img class=\"sticker size_5\" src=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.url : stack1), depth0))
    + "\"/>\r\n\r\n                <span class=\"msg-item-header__created\">\r\n                  "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "\r\n                </span>\r\n\r\n            <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n          </div>\r\n";
},"14":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <span>\r\n            <span class=\"keep _compile\">"
    + ((stack1 = alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n            <span class=\"msg-item-header__created\">\r\n              "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extTime : stack1), depth0))
    + "\r\n            </span>\r\n\r\n            <span class=\"badge unread-badge\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.unreadCount : stack1), depth0))
    + "</span>\r\n          </span>\r\n";
},"16":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n            <i class=\"icon-star-on\"></i>\r\n          </span>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "<div class=\"msg-item\">\r\n  <div class=\"msg-item-float cursor_pointer "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + "\">\r\n    <!--    DEFAULT   -->\r\n    <img class=\"user-profile user-thumb _user\" src=\""
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.exProfileImg : stack1), depth0))
    + "\"/>\r\n  </div>\r\n\r\n  <div class=\"msg-item-body\">\r\n    <!--    COMMENT\r\n            최초 댓글\r\n            DISPLAY COMMENT BODY WHEN IT IS TITLE\r\n            IF CURRENT COMMENT IS NOT TITLE, CONTENT GETS DISPLAYED WITHIN HEADER -->\r\n    <div class=\"msg-comment msg-comment-with-thumbnail "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.archived : stack1), depth0))
    + "\">\r\n      <!--    LEFT PART OF BODY CONTENT\r\n              IMAGE/FILE THUMBNAIL    -->\r\n      <div class=\"msg-file-body-float pull-left\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isArchived : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "        <!--    COMMENT ICON    -->\r\n        <i class=\"icon-comment\"></i>\r\n      </div>\r\n\r\n\r\n      <!--    RIGHT PART OF BODY CONTENT  -->\r\n      <div class=\"msg-file-meta\">\r\n        <div class=\"msg-comment-header\">\r\n          Commented on\r\n\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isArchived : depth0),{"name":"if","hash":{},"fn":this.program(8, data, 0),"inverse":this.program(10, data, 0),"data":data})) != null ? stack1 : "")
    + "        </div>\r\n      </div>\r\n\r\n      <!--    COMMENT MESSAGE -->\r\n      <div class=\"msg-comment-body\">\r\n\r\n        <p>\r\n          <!--    WRITER  -->\r\n          <span class=\"msg-item-header__name cursor_pointer "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.disabledMember : stack1), depth0))
    + " _user\">\r\n            <!-- TODO: WHAT IS THIS??   정책상 항상 댓글의 작성자가 다 보여야 한다면 extWriterName을 그냥 무조건 사용합시다. -->\r\n            <span> "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.extWriterName : stack1), depth0))
    + " </span>\r\n          </span>\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isSticker : depth0),{"name":"if","hash":{},"fn":this.program(12, data, 0),"inverse":this.program(14, data, 0),"data":data})) != null ? stack1 : "")
    + "        </p>\r\n        <!-- Star -->\r\n        <div class=\"msg-extra msg-extra-comment-title\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.hasStar : depth0),{"name":"if","hash":{},"fn":this.program(16, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.file"] = Handlebars.template({"1":function(depth0,helpers,partials,data) {
    return "        <!--  ARCHIVED FILE -->\r\n        <div>\r\n          <!--    FILE TYPE THUMBNAIL -->\r\n          <div class=\"msg-file-body__thumbnail\">\r\n            <img class=\"fileicon\" src=\"assets/images/fileicon_archived.png\"/>\r\n          </div>\r\n        </div>\r\n";
},"3":function(depth0,helpers,partials,data) {
    var stack1;

  return "        <div>\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.hasPreview : stack1),{"name":"if","hash":{},"fn":this.program(4, data, 0),"inverse":this.program(6, data, 0),"data":data})) != null ? stack1 : "")
    + "        </div>\r\n";
},"4":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <!--    IMAGE THUMBNAIL -->\r\n          <div>\r\n            <!-- thumbnail parent -->\r\n            <div class=\"image_wrapper msg-file-body__img__background jnd-text-center\">\r\n              <!-- large thumbnail add-->\r\n              <div class=\"_fileSmallThumb\">\r\n                <div class=\"opac-zero msg-file-body__img cursor_pointer _compile\"\r\n                    image-loader=\""
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.imageUrl : stack1)) != null ? stack1.small : stack1), depth0))
    + "\"\r\n                     image-max-height=\"65\"\r\n                     image-max-width=\"65\"\r\n                     image-is-square=\"true\"\r\n                    jnd-thumbnail-scale-up>\r\n                </div>\r\n              </div>\r\n              <div class=\"_fileLargeThumb\" style=\"display:none\">\r\n                <div class=\"cursor_pointer opac-zero large-thumbnail _compile\"\r\n                  image-loader=\""
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.imageUrl : stack1)) != null ? stack1.large : stack1), depth0))
    + "\"\r\n                  image-max-width=\"700\">\r\n                </div>\r\n                <div class=\"large-thumbnail-full-screen _fileExpand\">\r\n                  <i class=\"icon-minimize\"></i>\r\n                </div>\r\n              </div>\r\n            </div>\r\n          </div>\r\n";
},"6":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <!--    FILE TYPE THUMBNAIL -->\r\n          <div class=\"msg-file-body__thumbnail\">\r\n            <div class=\"fileicon fileicon-"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.icon : stack1), depth0))
    + "\" ></div>\r\n          </div>\r\n";
},"8":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "          <div class=\"archived-file-title\">\r\n            <a class=\"msg-file-meta__title file__name _compile\"\r\n               ui-sref=\"files({ userName: '"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.writer : stack1)) != null ? stack1.name : stack1), depth0))
    + "', itemId: '"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.id : stack1), depth0))
    + "' })\">\r\n              <span>"
    + alias2((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@common-deleted-file-title",{"name":"translate","hash":{},"data":data}))
    + "</span>\r\n            </a>\r\n          </div>\r\n";
},"10":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression, alias3=helpers.helperMissing;

  return "          <!--  NOT ARCHIVED FILE -->\r\n          <div>\r\n            <!--    TITLE   -->\r\n            <a class=\"msg-file-meta__title file__name break-word _compile\"\r\n               ui-sref=\"files({ userName: '"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.writer : stack1)) != null ? stack1.name : stack1), depth0))
    + "', itemId: '"
    + alias2(alias1(((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.id : stack1), depth0))
    + "' })\">\r\n              "
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.title : stack1), depth0))
    + "\r\n            </a>\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1),{"name":"if","hash":{},"fn":this.program(11, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "            <span class=\"msg-file-meta-info\">"
    + alias2(alias1(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.type : stack1), depth0))
    + "</span>\r\n          </div>\r\n        </div>\r\n        <div class=\"msg-file-meta-down\">\r\n"
    + ((stack1 = helpers.unless.call(depth0,((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.isIntegrateFile : stack1),{"name":"unless","hash":{},"fn":this.program(13, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "          <!--  SHARE -->\r\n          <i class=\"icon-share-right-fill cursor_pointer file-action _compile _fileShare\"\r\n             jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias3).call(depth0,"@btn-share",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n             data-direction=\"top\"></i>\r\n\r\n          <span class=\"separator\"></span>\r\n\r\n          <!--  MORE  -->\r\n          <span class=\"file-uploaded-more _fileMore\">\r\n            <i class=\"icon-cog-fill cursor_pointer file-action _compile\"\r\n               jnd-tooltip-trigger=\""
    + alias2((helpers.translate || (depth0 && depth0.translate) || alias3).call(depth0,"@file-action-more",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n               data-direction=\"top\"></i>\r\n          </span>\r\n\r\n        </div>\r\n";
},"11":function(depth0,helpers,partials,data) {
    var stack1;

  return "            <span class=\"bullet\">•</span>\r\n            <!--    SIZE AND FILE TYPE  -->\r\n            <span class=\"msg-file-meta-info\">"
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.file : depth0)) != null ? stack1.size : stack1), depth0))
    + "</span>\r\n";
},"13":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <!--  DOWNLOAD  -->\r\n          <span class=\"file-uploaded-download\">\r\n            <a class=\"_fileDownload\" "
    + ((stack1 = this.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.download : stack1), depth0)) != null ? stack1 : "")
    + ">\r\n              <i class=\"icon-download-fill cursor_pointer file-action _compile\"\r\n                 jnd-tooltip-trigger=\""
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@common-download",{"name":"translate","hash":{},"data":data}))
    + "\"\r\n                 data-direction=\"top\"></i>\r\n            </a>\r\n          </span>\r\n          <span class=\"separator\"></span>\r\n";
},"15":function(depth0,helpers,partials,data) {
    var stack1;

  return "      <!-- Star -->\r\n      <div class=\"msg-extra file-uploaded-extra\">\r\n        <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
    + "\">\r\n          <i class=\"icon-star-on\"></i>\r\n        </span>\r\n      </div>\r\n";
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
    + "</span>\r\n      </span>\r\n  </div>\r\n\r\n  <div class=\"msg-item-body\">\r\n    <!-- FILE -->\r\n    <div class=\"msg-file\">\r\n\r\n      <!--  FILE PREVIEW IMAGE  -->\r\n      <div class=\"msg-file-body-float pull-left preview-container\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isArchived : depth0),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.program(3, data, 0),"data":data})) != null ? stack1 : "")
    + "      </div>\r\n\r\n      <!--  FILE INFO -->\r\n      <div class=\"msg-file-meta\">\r\n        <div class=\"msg-file-meta-up\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,(depth0 != null ? depth0.isArchived : depth0),{"name":"if","hash":{},"fn":this.program(8, data, 0),"inverse":this.program(10, data, 0),"data":data})) != null ? stack1 : "")
    + "      </div>\r\n"
    + ((stack1 = helpers.unless.call(depth0,(depth0 != null ? depth0.isArchived : depth0),{"name":"unless","hash":{},"fn":this.program(15, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\r\n\r\n  </div>\r\n</div>\r\n\r\n";
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

  return "          <span class=\"keep msg-text-body _compile\">"
    + ((stack1 = this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n";
},"5":function(depth0,helpers,partials,data) {
    return "          <span class=\"msg-item-icon _textMore\">\r\n            <i class=\"icon-more-fill msg-item__action msg-item-circle msg-item-more cursor_pointer _textMore\"></i>\r\n          </span>\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
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

  return "          <span class=\"keep msg-text-body _compile\">"
    + ((stack1 = this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.content : stack1)) != null ? stack1.body : stack1), depth0)) != null ? stack1 : "")
    + "</span>\r\n";
},"5":function(depth0,helpers,partials,data) {
    return "          <span class=\"msg-item-icon _textMore\">\r\n            <span class=\"_textMore\">\r\n              <i class=\"icon-more-fill msg-item__action msg-item-circle msg-item-more cursor_pointer _textMore\"></i>\r\n            </span>\r\n          </span>\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1;

  return "          <span class=\"cursor_pointer msg-item-star msg-item-icon msg-item-circle _star "
    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.css : depth0)) != null ? stack1.star : stack1), depth0))
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
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "    <div class=\"social-image\">\r\n      <a href=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.linkUrl : stack1), depth0))
    + "\" target=\"_blank\">\r\n        <img src=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.imageUrl : stack1), depth0))
    + "\"/>\r\n      </a>\r\n    </div>\r\n";
},"3":function(depth0,helpers,partials,data) {
    return "      <div class=\"social-body has-image\">\r\n";
},"5":function(depth0,helpers,partials,data) {
    return "      <div class=\"social-body\">\r\n";
},"7":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return "      <div class=\"social-title neighbor\">\r\n        <a href=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.linkUrl : stack1), depth0))
    + "\" target=\"_blank\">\r\n          <span>"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.title : stack1), depth0))
    + "</span>\r\n        </a>\r\n      </div>\r\n";
},"9":function(depth0,helpers,partials,data) {
    var stack1, alias1=this.lambda, alias2=this.escapeExpression;

  return ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.domain : stack1),{"name":"if","hash":{},"fn":this.program(10, data, 0),"inverse":this.program(12, data, 0),"data":data})) != null ? stack1 : "")
    + "          <a href=\""
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.linkUrl : stack1), depth0))
    + "\" target=\"_blank\">\r\n            <span>"
    + alias2(alias1(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.description : stack1), depth0))
    + "</span>\r\n          </a>\r\n        </div>\r\n";
},"10":function(depth0,helpers,partials,data) {
    return "        <div class=\"social-desc neighbor has-domain\">\r\n";
},"12":function(depth0,helpers,partials,data) {
    return "        <div class=\"social-desc neighbor\">\r\n";
},"14":function(depth0,helpers,partials,data) {
    var stack1;

  return "      <div class=\"social-domain\">\r\n        <span>"
    + this.escapeExpression(this.lambda(((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.domain : stack1), depth0))
    + "</span>\r\n      </div>\r\n";
},"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1;

  return "<div class=\"attachment-content-wrapper\">\r\n  <div class=\"attachment-content-bar\"></div>\r\n  <div class=\"attachment-content\">\r\n"
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.imageUrl : stack1),{"name":"if","hash":{},"fn":this.program(1, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.imageUrl : stack1),{"name":"if","hash":{},"fn":this.program(3, data, 0),"inverse":this.program(5, data, 0),"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.title : stack1),{"name":"if","hash":{},"fn":this.program(7, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.description : stack1),{"name":"if","hash":{},"fn":this.program(9, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + ((stack1 = helpers['if'].call(depth0,((stack1 = ((stack1 = ((stack1 = (depth0 != null ? depth0.msg : depth0)) != null ? stack1.message : stack1)) != null ? stack1.linkPreview : stack1)) != null ? stack1.domain : stack1),{"name":"if","hash":{},"fn":this.program(14, data, 0),"inverse":this.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\r\n  </div>\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["center.unread.bookmark"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    return "<!-- UNREAD BOOKMARK  -->\r\n<div class=\"msg-item\" id=\"unread-bookmark\">\r\n  <div class=\" msg-unread-bookmark system-event-msg\">\r\n    <div class=\"msg-item-float cursor_pointer\">\r\n      <img class=\"user-profile user-thumb\"/>\r\n    </div>\r\n\r\n    <div class=\"msg-item-body\">\r\n      <span>"
    + this.escapeExpression((helpers.translate || (depth0 && depth0.translate) || helpers.helperMissing).call(depth0,"@unread-bookmark-message",{"name":"translate","hash":{},"data":data}))
    + "</span>\r\n    </div>\r\n  </div>\r\n</div>";
},"useData":true});

this["Handlebars"]["templates"]["topic.item"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var helper, alias1=helpers.helperMissing, alias2="function", alias3=this.escapeExpression;

  return "<div class=\"join-modal-channel_container file-item-meta__listview cursor_pointer white_background\">\r\n  <div class=\"join-modal-channel_title\">\r\n    <span class=\"join-modal-channel_title_area inline-overflow-ellipsis cursor_pointer\">\r\n      <i class=\"icon-topic\"></i>"
    + alias3(((helper = (helper = helpers.topicName || (depth0 != null ? depth0.topicName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"topicName","hash":{},"data":data}) : helper)))
    + "\r\n    </span>\r\n    <span class=\"pull-right\">\r\n      <i class=\"icon-clock\"></i>"
    + alias3(((helper = (helper = helpers.createTime || (depth0 != null ? depth0.createTime : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"createTime","hash":{},"data":data}) : helper)))
    + "\r\n    </span>\r\n  </div>\r\n  <div class=\"topic-description display-2-lines\">"
    + alias3(((helper = (helper = helpers.topicDescription || (depth0 != null ? depth0.topicDescription : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"topicDescription","hash":{},"data":data}) : helper)))
    + "</div>\r\n  <div class=\"topic-general-info\">\r\n    <i class=\"icon-user\"></i>\r\n    <span class=\"join-modal-channel_creator inline-overflow-ellipsis\"> "
    + alias3(((helper = (helper = helpers.creatorName || (depth0 != null ? depth0.creatorName : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"creatorName","hash":{},"data":data}) : helper)))
    + "</span>\r\n    <span class=\"bullet\"> • </span>"
    + alias3(((helper = (helper = helpers.memberCount || (depth0 != null ? depth0.memberCount : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"memberCount","hash":{},"data":data}) : helper)))
    + "<span>"
    + alias3(((helper = (helper = helpers.commonJoinedMessage || (depth0 != null ? depth0.commonJoinedMessage : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{"name":"commonJoinedMessage","hash":{},"data":data}) : helper)))
    + "</span>\r\n  </div>\r\n</div>\r\n";
},"useData":true});

this["Handlebars"]["templates"]["topic.list"] = Handlebars.template({"compiler":[6,">= 2.0.0-beta.1"],"main":function(depth0,helpers,partials,data) {
    var stack1, helper;

  return ((stack1 = ((helper = (helper = helpers.items || (depth0 != null ? depth0.items : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0,{"name":"items","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\r\n";
},"useData":true});