// @GENERATOR:play-routes-compiler
// @SOURCE:/home/benjaminclark964/app.ystemandchess.com/conf/routes
// @DATE:Tue Mar 10 14:11:49 MDT 2020

import play.api.mvc.Call


import _root_.controllers.Assets.Asset

// @LINE:2
package controllers {

  // @LINE:403
  class ReverseForumPost(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:403
    def search(text:String = "", page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "forum/search" + play.core.routing.queryString(List(if(text == "") None else Some(implicitly[play.api.mvc.QueryStringBindable[String]].unbind("text", text)), if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:414
    def edit(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "forum/post/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:413
    def delete(categSlug:String, id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categSlug", categSlug)) + "/delete/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:415
    def redirect(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "forum/redirect/post/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:412
    def create(categSlug:String, slug:String, page:Int = 1): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categSlug", categSlug)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/new" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
  }

  // @LINE:442
  class ReverseClas(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:465
    def studentUpdate(id:String, username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/edit")
    }
  
    // @LINE:446
    def show(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:458
    def studentCreate(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/new")
    }
  
    // @LINE:447
    def edit(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/edit")
    }
  
    // @LINE:455
    def archived(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/archived")
    }
  
    // @LINE:461
    def studentArchive(id:String, username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/archive" + play.core.routing.queryString(List(Some(implicitly[play.api.mvc.QueryStringBindable[Boolean]].unbind("v", v)))))
    }
  
    // @LINE:444
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/new")
    }
  
    // @LINE:450
    def wallEdit(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/news/edit")
    }
  
    // @LINE:460
    def studentShow(id:String, username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:459
    def studentInvite(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/invite")
    }
  
    // @LINE:453
    def notifyPost(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/notifyPost")
    }
  
    // @LINE:445
    def verifyTeacher(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/verify-teacher")
    }
  
    // @LINE:464
    def studentEdit(id:String, username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/edit")
    }
  
    // @LINE:443
    def form(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/new")
    }
  
    // @LINE:463
    def studentSetKid(id:String, username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/set-kid" + play.core.routing.queryString(List(Some(implicitly[play.api.mvc.QueryStringBindable[Boolean]].unbind("v", v)))))
    }
  
    // @LINE:462
    def studentResetPassword(id:String, username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/reset-password")
    }
  
    // @LINE:451
    def wallUpdate(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/news/edit")
    }
  
    // @LINE:466
    def studentRelease(id:String, username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/release")
    }
  
    // @LINE:457
    def studentForm(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/add")
    }
  
    // @LINE:454
    def archive(id:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/archive" + play.core.routing.queryString(List(Some(implicitly[play.api.mvc.QueryStringBindable[Boolean]].unbind("v", v)))))
    }
  
    // @LINE:448
    def update(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/edit")
    }
  
    // @LINE:449
    def wall(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/news")
    }
  
    // @LINE:456
    def progress(id:String, pt:String, days:Int): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/progress/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("pt", pt)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("days", days)))
    }
  
    // @LINE:442
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class")
    }
  
    // @LINE:467
    def studentReleasePost(id:String, username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/student/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/release")
    }
  
    // @LINE:452
    def notifyStudents(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "class/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/notify")
    }
  
  }

  // @LINE:570
  class ReverseOAuthToken(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:573
    def delete(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/oauth/token/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/delete")
    }
  
    // @LINE:571
    def create(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/oauth/token/create")
    }
  
    // @LINE:572
    def createApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/oauth/token/create")
    }
  
    // @LINE:570
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/oauth/token")
    }
  
  }

  // @LINE:536
  class ReverseBot(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:537
    def move(id:String, uci:String, offeringDraw:Option[Boolean] = None): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/bot/game/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/move/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("uci", uci)) + play.core.routing.queryString(List(if(offeringDraw == None) None else Some(implicitly[play.api.mvc.QueryStringBindable[Option[Boolean]]].unbind("offeringDraw", offeringDraw)))))
    }
  
    // @LINE:538
    def command(cmd:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/bot/" + implicitly[play.api.mvc.PathBindable[String]].unbind("cmd", cmd))
    }
  
    // @LINE:536
    def gameStream(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/bot/game/stream/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:539
    def online(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "player/bots")
    }
  
  }

  // @LINE:162
  class ReversePractice(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:170
    def showChapter(sectionId:String, studySlug:String, studyId:String, chapterId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "practice/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("sectionId", sectionId)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("studySlug", studySlug)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("studyId", studyId)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("chapterId", chapterId)))
    }
  
    // @LINE:169
    def show(sectionId:String, studySlug:String, studyId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "practice/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("sectionId", sectionId)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("studySlug", studySlug)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("studyId", studyId)))
    }
  
    // @LINE:164
    def config(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "practice/config")
    }
  
    // @LINE:165
    def configSave(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "practice/config")
    }
  
    // @LINE:171
    def complete(chapterId:String, moves:Int): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "practice/complete/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("chapterId", chapterId)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("moves", moves)))
    }
  
    // @LINE:163
    def chapter(studyId:String, chapterId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "practice/load/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("studyId", studyId)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("chapterId", chapterId)))
    }
  
    // @LINE:167
    def showSection(sectionId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "practice/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("sectionId", sectionId)))
    }
  
    // @LINE:166
    def reset(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "practice/reset")
    }
  
    // @LINE:168
    def showStudySlug(sectionId:String, studySlug:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "practice/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("sectionId", sectionId)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("studySlug", studySlug)))
    }
  
    // @LINE:162
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "practice")
    }
  
  }

  // @LINE:151
  class ReversePlan(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:155
    def cancel(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "patron/cancel")
    }
  
    // @LINE:156
    def webhook(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "patron/webhook")
    }
  
    // @LINE:157
    def stripeCheckout(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "patron/stripe-checkout")
    }
  
    // @LINE:153
    def list(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "patron/list")
    }
  
    // @LINE:152
    def thanks(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "patron/thanks")
    }
  
    // @LINE:154
    def switch(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "patron/switch")
    }
  
    // @LINE:151
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "patron")
    }
  
    // @LINE:159
    def features(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "features")
    }
  
    // @LINE:158
    def payPalIpn(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "patron/ipn")
    }
  
  }

  // @LINE:473
  class ReverseImporter(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:475
    def masterGame(id:String, color:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "import/master/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("color", color)))
    }
  
    // @LINE:473
    def importGame(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "paste")
    }
  
    // @LINE:474
    def sendGame(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "import")
    }
  
  }

  // @LINE:331
  class ReverseI18n(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:331
    def select(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "translation/select")
    }
  
  }

  // @LINE:582
  class ReverseEvent(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:582
    def show(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "event/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:586
    def cloneE(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "event/manager/clone/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:584
    def edit(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "event/manager/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:588
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "event/manager")
    }
  
    // @LINE:583
    def manager(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "event/manager")
    }
  
    // @LINE:587
    def form(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "event/manager/new")
    }
  
    // @LINE:585
    def update(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "event/manager/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
  }

  // @LINE:47
  class ReverseUserTournament(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:47
    def path(username:String, path:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/tournaments/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("path", path)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
  }

  // @LINE:174
  class ReverseStreamer(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:174
    def index(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "streamer" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:182
    def pictureDelete(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "streamer/picture/delete")
    }
  
    // @LINE:183
    def show(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "streamer/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:176
    def edit(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "streamer/edit")
    }
  
    // @LINE:180
    def picture(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "streamer/picture/edit")
    }
  
    // @LINE:177
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "streamer/new")
    }
  
    // @LINE:179
    def approvalRequest(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "streamer/approval/request")
    }
  
    // @LINE:175
    def live(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "streamer/live")
    }
  
    // @LINE:181
    def pictureApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "streamer/picture/upload")
    }
  
    // @LINE:178
    def editApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "streamer/edit")
    }
  
  }

  // @LINE:9
  class ReverseTimeline(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:10
    def unsub(channel:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "timeline/unsub/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("channel", channel)))
    }
  
    // @LINE:9
    def home(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "timeline")
    }
  
  }

  // @LINE:40
  class ReverseInsight(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:43
    def path(username:String, metric:String, dimension:String, filters:String): Call = {
    
      (username: @unchecked, metric: @unchecked, dimension: @unchecked, filters: @unchecked) match {
      
        // @LINE:43
        case (username, metric, dimension, filters) if filters == "" =>
          implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("filters", ""))); _rrc
          Call("GET", _prefix + { _defaultPrefix } + "insights/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("metric", metric)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("dimension", dimension)))
      
        // @LINE:44
        case (username, metric, dimension, filters)  =>
          
          Call("GET", _prefix + { _defaultPrefix } + "insights/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("metric", metric)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("dimension", dimension)) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("filters", filters))
      
      }
    
    }
  
    // @LINE:42
    def index(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "insights/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:40
    def refresh(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "insights/refresh/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:41
    def json(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "insights/data/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
  }

  // @LINE:108
  class ReverseStudy(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:118
    def show(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:131
    def multiBoard(id:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/multi-board" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:109
    def all(order:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/all/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("order", order)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:127
    def chapterMeta(id:String, chapterId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("chapterId", chapterId) + "/meta")
    }
  
    // @LINE:117
    def search(q:String = "", page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/search" + play.core.routing.queryString(List(if(q == "") None else Some(implicitly[play.api.mvc.QueryStringBindable[String]].unbind("q", q)), if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:122
    def chapterPgn(id:String, chapterId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("chapterId", chapterId) + ".pgn")
    }
  
    // @LINE:119
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "study")
    }
  
    // @LINE:120
    def createAs(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "study/as")
    }
  
    // @LINE:110
    def mine(order:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/mine/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("order", order)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:130
    def importPgn(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/import-pgn")
    }
  
    // @LINE:129
    def clearChat(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/clear-chat")
    }
  
    // @LINE:113
    def minePrivate(order:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/private/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("order", order)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:116
    def byOwner(username:String, order:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/by/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("order", order)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:121
    def pgn(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + ".pgn")
    }
  
    // @LINE:111
    def mineMember(order:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/member/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("order", order)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:126
    def chapter(id:String, chapterId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("chapterId", chapterId))
    }
  
    // @LINE:123
    def delete(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/delete")
    }
  
    // @LINE:112
    def minePublic(order:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/public/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("order", order)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:124
    def cloneStudy(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/clone")
    }
  
    // @LINE:108
    def allDefault(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:125
    def cloneApply(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "study/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/cloneAplly")
    }
  
    // @LINE:128
    def embed(id:String, chapterId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/embed/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("chapterId", chapterId))
    }
  
    // @LINE:114
    def mineLikes(order:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/likes/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("order", order)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:115
    def byOwnerDefault(username:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "study/by/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
  }

  // @LINE:301
  class ReverseSetup(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:309
    def filter(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "setup/filter")
    }
  
    // @LINE:307
    def hook(sri:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "setup/hook/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("sri", sri)))
    }
  
    // @LINE:305
    def hookForm(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "setup/hook")
    }
  
    // @LINE:310
    def validateFen(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "setup/validate-fen")
    }
  
    // @LINE:304
    def friend(user:Option[String] = None): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "setup/friend" + play.core.routing.queryString(List(if(user == None) None else Some(implicitly[play.api.mvc.QueryStringBindable[Option[String]]].unbind("user", user)))))
    }
  
    // @LINE:306
    def like(sri:String, gameId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "setup/hook/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("sri", sri)) + "/like/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId)))
    }
  
    // @LINE:308
    def filterForm(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "setup/filter")
    }
  
    // @LINE:302
    def ai(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "setup/ai")
    }
  
    // @LINE:303
    def friendForm(user:Option[String] = None): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "setup/friend" + play.core.routing.queryString(List(if(user == None) None else Some(implicitly[play.api.mvc.QueryStringBindable[Option[String]]].unbind("user", user)))))
    }
  
    // @LINE:301
    def aiForm(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "setup/ai")
    }
  
  }

  // @LINE:89
  class ReverseExport(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:285
    def png(gameId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "game/export/png/" + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + ".png")
    }
  
    // @LINE:89
    def puzzlePng(id:Int): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/export/png/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("id", id)) + ".png")
    }
  
  }

  // @LINE:79
  class ReverseCoordinate(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:80
    def score(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "training/coordinate/score")
    }
  
    // @LINE:79
    def home(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/coordinate")
    }
  
    // @LINE:81
    def color(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "training/coordinate/color")
    }
  
  }

  // @LINE:71
  class ReverseBlog(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:75
    def show(id:String, slug:String, ref:Option[String] = None): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "blog/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + play.core.routing.queryString(List(if(ref == None) None else Some(implicitly[play.api.mvc.QueryStringBindable[Option[String]]].unbind("ref", ref)))))
    }
  
    // @LINE:634
    def preview(token:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "prismic-preview" + play.core.routing.queryString(List(Some(implicitly[play.api.mvc.QueryStringBindable[String]].unbind("token", token)))))
    }
  
    // @LINE:71
    def index(page:Int = 1, ref:Option[String] = None): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "blog" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)), if(ref == None) None else Some(implicitly[play.api.mvc.QueryStringBindable[Option[String]]].unbind("ref", ref)))))
    }
  
    // @LINE:72
    def all(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "blog/all")
    }
  
    // @LINE:76
    def atom(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "blog.atom")
    }
  
    // @LINE:74
    def discuss(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "blog/discuss/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:73
    def year(year:Int): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "blog/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("year", year)))
    }
  
  }

  // @LINE:429
  class ReverseCoach(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:435
    def pictureDelete(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "coach/picture/delete")
    }
  
    // @LINE:438
    def show(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "coach/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:431
    def edit(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "coach/edit")
    }
  
    // @LINE:436
    def approveReview(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "coach/approve-review/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:430
    def all(order:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "coach/sort/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("order", order)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:433
    def picture(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "coach/picture/edit")
    }
  
    // @LINE:439
    def review(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "coach/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/review")
    }
  
    // @LINE:437
    def modReview(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "coach/mod-review/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:429
    def allDefault(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "coach" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:434
    def pictureApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "coach/picture/upload")
    }
  
    // @LINE:432
    def editApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "coach/edit")
    }
  
  }

  // @LINE:399
  class ReverseBookmark(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:399
    def toggle(gameId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "bookmark/" + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId))
    }
  
  }

  // @LINE:334
  class ReverseAuth(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:341
    def fixEmail(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "signup/fix-email")
    }
  
    // @LINE:345
    def passwordResetSent(email:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "password/reset/sent/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("email", email)))
    }
  
    // @LINE:352
    def magicLinkApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "auth/magic-link/send")
    }
  
    // @LINE:343
    def passwordReset(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "password/reset")
    }
  
    // @LINE:353
    def magicLinkSent(email:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "auth/magic-link/sent/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("email", email)))
    }
  
    // @LINE:346
    def passwordResetConfirm(token:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "password/reset/confirm/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("token", token)))
    }
  
    // @LINE:354
    def magicLinkLogin(token:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "auth/magic-link/login/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("token", token)))
    }
  
    // @LINE:350
    def loginWithToken(token:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "auth/token/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("token", token)))
    }
  
    // @LINE:338
    def signup(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "signup")
    }
  
    // @LINE:340
    def checkYourEmail(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "signup/check-your-email")
    }
  
    // @LINE:344
    def passwordResetApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "password/reset/send")
    }
  
    // @LINE:337
    def logout(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "logout")
    }
  
    // @LINE:351
    def magicLink(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "auth/magic-link")
    }
  
    // @LINE:347
    def passwordResetConfirmApply(token:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "password/reset/confirm/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("token", token)))
    }
  
    // @LINE:339
    def signupPost(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "signup")
    }
  
    // @LINE:342
    def signupConfirmEmail(token:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "signup/confirm/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("token", token)))
    }
  
    // @LINE:335
    def authenticate(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "login")
    }
  
    // @LINE:348
    def setFingerPrint(fp:String, ms:Int): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "auth/set-fp/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("fp", fp)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("ms", ms)))
    }
  
    // @LINE:336
    def logoutGet(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "logout")
    }
  
    // @LINE:334
    def login(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "login")
    }
  
    // @LINE:349
    def makeLoginToken(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "auth/token")
    }
  
  }

  // @LINE:102
  class ReverseUserAnalysis(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:102
    def help(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "analysis/help")
    }
  
    // @LINE:198
    def forecasts(fullId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("fullId", fullId) + "/forecasts")
    }
  
    // @LINE:197
    def game(gameId:String, color:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("color", color) + "/analysis")
    }
  
    // @LINE:199
    def forecastsOnMyTurn(fullId:String, uci:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("fullId", fullId) + "/forecasts/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("uci", uci)))
    }
  
    // @LINE:103
    def parseArg(something:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "analysis/" + implicitly[play.api.mvc.PathBindable[String]].unbind("something", something))
    }
  
    // @LINE:105
    def pgn(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "analysis/pgn")
    }
  
    // @LINE:104
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "analysis")
    }
  
  }

  // @LINE:196
  class ReverseEditor(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:479
    def load(urlFen:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "editor/" + implicitly[play.api.mvc.PathBindable[String]].unbind("urlFen", urlFen))
    }
  
    // @LINE:478
    def data(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "editor.json")
    }
  
    // @LINE:480
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "editor")
    }
  
    // @LINE:196
    def game(gameId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/edit")
    }
  
  }

  // @LINE:313
  class ReverseChallenge(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:314
    def show(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "challenge/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:527
    def apiAccept(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/challenge/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/accept")
    }
  
    // @LINE:317
    def cancel(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "challenge/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/cancel")
    }
  
    // @LINE:318
    def toFriend(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "challenge/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/to-friend")
    }
  
    // @LINE:526
    def apiCreate(user:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/challenge/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("user", user)))
    }
  
    // @LINE:316
    def decline(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "challenge/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/decline")
    }
  
    // @LINE:315
    def accept(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "challenge/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/accept")
    }
  
    // @LINE:313
    def all(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "challenge")
    }
  
    // @LINE:319
    def rematchOf(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "challenge/rematch-of/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:528
    def apiDecline(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/challenge/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/decline")
    }
  
  }

  // @LINE:31
  class ReverseRelation(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:35
    def following(username:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/following" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:37
    def blocks(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "rel/blocks" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:34
    def unblock(userId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "rel/unblock/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("userId", userId)))
    }
  
    // @LINE:33
    def block(userId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "rel/block/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("userId", userId)))
    }
  
    // @LINE:505
    def apiFollowers(name:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)) + "/followers")
    }
  
    // @LINE:504
    def apiFollowing(name:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)) + "/following")
    }
  
    // @LINE:32
    def unfollow(userId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "rel/unfollow/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("userId", userId)))
    }
  
    // @LINE:36
    def followers(username:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/followers" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:31
    def follow(userId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "rel/follow/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("userId", userId)))
    }
  
  }

  // @LINE:68
  class ReverseDasher(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:68
    def get(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "dasher")
    }
  
  }

  // @LINE:186
  class ReverseRound(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:200
    def resign(fullId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("fullId", fullId) + "/resign")
    }
  
    // @LINE:189
    def sides(gameId:String, color:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("color", color) + "/sides")
    }
  
    // @LINE:195
    def miniFullId(fullId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("fullId", fullId) + "/mini")
    }
  
    // @LINE:192
    def writeNote(gameId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/note")
    }
  
    // @LINE:207
    def next(gameId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "round-next/" + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId))
    }
  
    // @LINE:190
    def continue(gameId:String, mode:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/continue/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("mode", mode)))
    }
  
    // @LINE:191
    def readNote(gameId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/note")
    }
  
    // @LINE:208
    def whatsNext(fullId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "whats-next/" + implicitly[play.api.mvc.PathBindable[String]].unbind("fullId", fullId))
    }
  
    // @LINE:186
    def watcher(gameId:String, color:String): Call = {
    
      (gameId: @unchecked, color: @unchecked) match {
      
        // @LINE:186
        case (gameId, color) if color == "white" =>
          implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("color", "white"))); _rrc
          Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId))
      
        // @LINE:187
        case (gameId, color)  =>
          
          Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("color", color))
      
      }
    
    }
  
    // @LINE:188
    def player(fullId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("fullId", fullId))
    }
  
    // @LINE:193
    def mini(gameId:String, color:String): Call = {
    
      (gameId: @unchecked, color: @unchecked) match {
      
        // @LINE:193
        case (gameId, color) if color == "white" =>
          implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("color", "white"))); _rrc
          Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/mini")
      
        // @LINE:194
        case (gameId, color)  =>
          
          Call("GET", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("color", color) + "/mini")
      
      }
    
    }
  
  }

  // @LINE:608
  class ReversePush(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:610
    def webSubscribe(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "push/subscribe")
    }
  
    // @LINE:609
    def mobileUnregister(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mobile/unregister")
    }
  
    // @LINE:608
    def mobileRegister(platform:String, deviceId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mobile/register/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("platform", platform)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("deviceId", deviceId)))
    }
  
  }

  // @LINE:288
  class ReverseFishnet(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:290
    def abort(workId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "fishnet/abort/" + implicitly[play.api.mvc.PathBindable[String]].unbind("workId", workId))
    }
  
    // @LINE:288
    def acquire(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "fishnet/acquire")
    }
  
    // @LINE:291
    def keyExists(key:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "fishnet/key/" + implicitly[play.api.mvc.PathBindable[String]].unbind("key", key))
    }
  
    // @LINE:292
    def status(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "fishnet/status")
    }
  
    // @LINE:289
    def analysis(workId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "fishnet/analysis/" + implicitly[play.api.mvc.PathBindable[String]].unbind("workId", workId))
    }
  
  }

  // @LINE:418
  class ReverseMsg(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:424
    def convoDelete(username:String): Call = {
      
      Call("DELETE", _prefix + { _defaultPrefix } + "inbox/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:426
    def apiPost(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "inbox/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:421
    def search(q:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "inbox/search" + play.core.routing.queryString(List(Some(implicitly[play.api.mvc.QueryStringBindable[String]].unbind("q", q)))))
    }
  
    // @LINE:422
    def unreadCount(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "inbox/unread-count")
    }
  
    // @LINE:418
    def compatCreate(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "inbox/new")
    }
  
    // @LINE:420
    def home(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "inbox")
    }
  
    // @LINE:423
    def convo(username:String, before:Option[Long] = None): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "inbox/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + play.core.routing.queryString(List(if(before == None) None else Some(implicitly[play.api.mvc.QueryStringBindable[Option[Long]]].unbind("before", before)))))
    }
  
  }

  // @LINE:5
  class ReverseLobby(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:5
    def home(): Call = {
      
      Call("GET", _prefix)
    }
  
    // @LINE:6
    def seeks(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "lobby/seeks")
    }
  
  }

  // @LINE:256
  class ReverseTeam(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:273
    def kick(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/kick")
    }
  
    // @LINE:275
    def changeOwnerForm(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/changeOwner")
    }
  
    // @LINE:262
    def search(text:String = "", page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/search" + play.core.routing.queryString(List(if(text == "") None else Some(implicitly[play.api.mvc.QueryStringBindable[String]].unbind("text", text)), if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:266
    def quit(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/quit")
    }
  
    // @LINE:276
    def changeOwner(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/changeOwner")
    }
  
    // @LINE:274
    def kickUser(id:String, user:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/kick/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("user", user)))
    }
  
    // @LINE:270
    def edit(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/edit")
    }
  
    // @LINE:258
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/new")
    }
  
    // @LINE:269
    def requestProcess(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/request/process")
    }
  
    // @LINE:259
    def mine(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/me")
    }
  
    // @LINE:278
    def users(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/users")
    }
  
    // @LINE:268
    def requestCreate(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/request/new")
    }
  
    // @LINE:256
    def home(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:277
    def close(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/close")
    }
  
    // @LINE:272
    def kickForm(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/kick")
    }
  
    // @LINE:257
    def form(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/new")
    }
  
    // @LINE:267
    def requestForm(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/request/new")
    }
  
    // @LINE:265
    def join(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/join")
    }
  
    // @LINE:261
    def requests(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/requests")
    }
  
    // @LINE:260
    def all(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/all" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:271
    def update(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/edit")
    }
  
    // @LINE:263
    def autocomplete(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/autocomplete")
    }
  
    // @LINE:264
    def show(id:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
  }

  // @LINE:641
  class ReverseExternalAssets(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:641
    def at(file:String): Call = {
      implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("path", "public"))); _rrc
      Call("GET", _prefix + { _defaultPrefix } + "assets/" + implicitly[play.api.mvc.PathBindable[String]].unbind("file", file))
    }
  
  }

  // @LINE:613
  class ReversePage(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:628
    def variant(key:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "variant/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("key", key)))
    }
  
    // @LINE:631
    def help(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "help/contribute")
    }
  
    // @LINE:632
    def master(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "help/master")
    }
  
    // @LINE:615
    def privacy(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "privacy")
    }
  
    // @LINE:623
    def howToCheat(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "how-to-cheat")
    }
  
    // @LINE:617
    def about(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "about")
    }
  
    // @LINE:627
    def variantHome(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "variant")
    }
  
    // @LINE:614
    def tos(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "terms-of-service")
    }
  
    // @LINE:613
    def thanks(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "thanks")
    }
  
    // @LINE:624
    def ads(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "ads")
    }
  
    // @LINE:619
    def source(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "source")
    }
  
  }

  // @LINE:16
  class ReverseGame(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:530
    def apiExportByUser(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/games/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:17
    def exportByUser(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "games/export/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:283
    def exportOne(gameId:String): Call = {
    
      (gameId: @unchecked) match {
      
        // @LINE:283
        case (gameId)  =>
          
          Call("GET", _prefix + { _defaultPrefix } + "game/export/" + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId))
      
      }
    
    }
  
    // @LINE:205
    def delete(gameId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/delete")
    }
  
    // @LINE:16
    def exportByIds(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "games/export/_ids")
    }
  
  }

  // @LINE:211
  class ReverseTournament(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:229
    def shields(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/shields")
    }
  
    // @LINE:217
    def teamBattleUpdate(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "tournament/team-battle/edit/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:219
    def show(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:228
    def leaderboard(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/leaderboard")
    }
  
    // @LINE:220
    def standing(id:String, page:Int): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/standing/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("page", page)))
    }
  
    // @LINE:214
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "tournament/new")
    }
  
    // @LINE:226
    def terminate(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "tournament/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/terminate")
    }
  
    // @LINE:212
    def featured(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/featured")
    }
  
    // @LINE:230
    def categShields(categ:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/shields/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categ", categ)))
    }
  
    // @LINE:216
    def teamBattleEdit(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/team-battle/edit/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:223
    def pause(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "tournament/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/withdraw")
    }
  
    // @LINE:211
    def home(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:213
    def form(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/new")
    }
  
    // @LINE:227
    def help(system:Option[String] = None): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/help" + play.core.routing.queryString(List(if(system == None) None else Some(implicitly[play.api.mvc.QueryStringBindable[Option[String]]].unbind("system", system)))))
    }
  
    // @LINE:222
    def join(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "tournament/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/join")
    }
  
    // @LINE:225
    def teamInfo(id:String, team:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/team/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("team", team)))
    }
  
    // @LINE:221
    def pageOf(id:String, userId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/page-of/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("userId", userId)))
    }
  
    // @LINE:513
    def apiCreate(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/tournament")
    }
  
    // @LINE:224
    def player(id:String, user:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/player/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("user", user)))
    }
  
    // @LINE:215
    def teamBattleForm(teamId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/team-battle/new/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("teamId", teamId)))
    }
  
    // @LINE:218
    def calendar(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/calendar")
    }
  
  }

  // @LINE:295
  class ReversePref(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:297
    def formApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/preferences")
    }
  
    // @LINE:298
    def verifyTitle(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/preferences/verify-title")
    }
  
    // @LINE:295
    def set(name:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "pref/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)))
    }
  
    // @LINE:525
    def apiGet(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/account/preferences")
    }
  
    // @LINE:296
    def form(categ:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/preferences/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categ", categ)))
    }
  
  }

  // @LINE:134
  class ReverseRelay(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:134
    def index(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "broadcast" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:136
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "broadcast/new")
    }
  
    // @LINE:140
    def update(slug:String, id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "broadcast/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/edit")
    }
  
    // @LINE:143
    def push(slug:String, id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "broadcast/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/push")
    }
  
    // @LINE:135
    def form(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "broadcast/new")
    }
  
    // @LINE:138
    def chapter(slug:String, id:String, chapterId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "broadcast/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("chapterId", chapterId))
    }
  
    // @LINE:139
    def edit(slug:String, id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "broadcast/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/edit")
    }
  
    // @LINE:137
    def show(slug:String, id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "broadcast/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:142
    def cloneRelay(slug:String, id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "broadcast/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/clone")
    }
  
    // @LINE:141
    def reset(slug:String, id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "broadcast/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/reset")
    }
  
  }

  // @LINE:405
  class ReverseForumTopic(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:409
    def close(categSlug:String, slug:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categSlug", categSlug)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/close")
    }
  
    // @LINE:410
    def hide(categSlug:String, slug:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categSlug", categSlug)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/hide")
    }
  
    // @LINE:407
    def participants(topicId:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "forum/participants/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("topicId", topicId)))
    }
  
    // @LINE:411
    def sticky(categSlug:String, slug:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categSlug", categSlug)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + "/sticky")
    }
  
    // @LINE:406
    def create(categSlug:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categSlug", categSlug)) + "/new")
    }
  
    // @LINE:408
    def show(categSlug:String, slug:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categSlug", categSlug)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:405
    def form(categSlug:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("categSlug", categSlug)) + "/form")
    }
  
  }

  // @LINE:357
  class ReverseMod(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:363
    def warn(username:String, subject:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/warn" + play.core.routing.queryString(List(Some(implicitly[play.api.mvc.QueryStringBindable[String]].unbind("subject", subject)))))
    }
  
    // @LINE:360
    def troll(username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/troll/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Boolean]].unbind("v", v)))
    }
  
    // @LINE:385
    def publicChat(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/public-chat")
    }
  
    // @LINE:373
    def impersonate(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/impersonate")
    }
  
    // @LINE:375
    def refreshUserAssess(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/refreshUserAssess")
    }
  
    // @LINE:380
    def gamifyPeriod(period:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/leaderboard/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("period", period)))
    }
  
    // @LINE:369
    def communicationPublic(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/communication")
    }
  
    // @LINE:391
    def eventStream(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/stream/mod")
    }
  
    // @LINE:377
    def notifySlack(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/notify-slack")
    }
  
    // @LINE:389
    def print(fh:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/print/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("fh", fh)))
    }
  
    // @LINE:384
    def savePermissions(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/permissions")
    }
  
    // @LINE:358
    def engine(username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/engine/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Boolean]].unbind("v", v)))
    }
  
    // @LINE:367
    def setTitle(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/title")
    }
  
    // @LINE:368
    def spontaneousInquiry(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/inquiry")
    }
  
    // @LINE:383
    def permissions(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/permissions")
    }
  
    // @LINE:359
    def booster(username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/booster/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Boolean]].unbind("v", v)))
    }
  
    // @LINE:379
    def gamify(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/leaderboard")
    }
  
    // @LINE:366
    def reopenAccount(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/reopen")
    }
  
    // @LINE:357
    def alt(username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/alt/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Boolean]].unbind("v", v)))
    }
  
    // @LINE:372
    def reportban(username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/reportban/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Boolean]].unbind("v", v)))
    }
  
    // @LINE:382
    def chatUser(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/chat-user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:362
    def deletePmsAndChats(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/delete-pms-and-chats")
    }
  
    // @LINE:361
    def ipBan(username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/ban/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Boolean]].unbind("v", v)))
    }
  
    // @LINE:371
    def rankban(username:String, v:Boolean): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/rankban/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Boolean]].unbind("v", v)))
    }
  
    // @LINE:364
    def disableTwoFactor(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/disable-2fa")
    }
  
    // @LINE:387
    def chatPanic(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/chat-panic")
    }
  
    // @LINE:365
    def closeAccount(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/close")
    }
  
    // @LINE:388
    def chatPanicPost(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/chat-panic")
    }
  
    // @LINE:378
    def ipIntel(ip:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/ip-intel" + play.core.routing.queryString(List(Some(implicitly[play.api.mvc.QueryStringBindable[String]].unbind("ip", ip)))))
    }
  
    // @LINE:376
    def setEmail(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/email")
    }
  
    // @LINE:374
    def log(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/log")
    }
  
    // @LINE:381
    def search(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/search")
    }
  
    // @LINE:386
    def emailConfirm(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/email-confirm")
    }
  
    // @LINE:370
    def communicationPrivate(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mod/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/communication/private")
    }
  
    // @LINE:390
    def printBan(v:Boolean, fh:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "mod/print/ban/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Boolean]].unbind("v", v)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("fh", fh)))
    }
  
  }

  // @LINE:84
  class ReversePuzzle(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:92
    def show(id:Int): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("id", id)))
    }
  
    // @LINE:94
    def vote(id:Int): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "training/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("id", id)) + "/vote")
    }
  
    // @LINE:91
    def batchSolve(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "training/batch")
    }
  
    // @LINE:85
    def newPuzzle(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/new")
    }
  
    // @LINE:97
    def round2(id:Int): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "training/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("id", id)) + "/round2")
    }
  
    // @LINE:500
    def activity(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/user/puzzle-activity")
    }
  
    // @LINE:88
    def frame(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/frame")
    }
  
    // @LINE:93
    def load(id:Int): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("id", id)) + "/load")
    }
  
    // @LINE:95
    def round(id:Int): Call = {
    
      (id: @unchecked) match {
      
        // @LINE:95
        case (id)  =>
          
          Call("POST", _prefix + { _defaultPrefix } + "training/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("id", id)) + "/round")
      
      }
    
    }
  
    // @LINE:87
    def embed(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/embed")
    }
  
    // @LINE:84
    def home(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training")
    }
  
    // @LINE:86
    def daily(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/daily")
    }
  
    // @LINE:90
    def batchSelect(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "training/batch")
    }
  
  }

  // @LINE:202
  class ReverseAnalyse(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:281
    def requestAnalysis(gameId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/request-analysis")
    }
  
    // @LINE:202
    def embed(gameId:String, color:String): Call = {
    
      (gameId: @unchecked, color: @unchecked) match {
      
        // @LINE:202
        case (gameId, color) if color == "white" =>
          implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("color", "white"))); _rrc
          Call("GET", _prefix + { _defaultPrefix } + "embed/" + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId))
      
        // @LINE:203
        case (gameId, color)  =>
          
          Call("GET", _prefix + { _defaultPrefix } + "embed/" + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("color", color))
      
      }
    
    }
  
  }

  // @LINE:646
  class ReverseOptions(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:646
    def root(): Call = {
      
      Call("OPTIONS", _prefix)
    }
  
    // @LINE:647
    def all(url:String): Call = {
      
      Call("OPTIONS", _prefix + { _defaultPrefix } + implicitly[play.api.mvc.PathBindable[String]].unbind("url", url))
    }
  
  }

  // @LINE:50
  class ReverseUser(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:59
    def show(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)))
    }
  
    // @LINE:506
    def apiWriteNote(name:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)) + "/note")
    }
  
    // @LINE:58
    def games(username:String, filterName:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("filterName", filterName)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:507
    def ratingHistory(name:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)) + "/rating-history")
    }
  
    // @LINE:54
    def tv(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/tv")
    }
  
    // @LINE:55
    def studyTv(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/studyTv")
    }
  
    // @LINE:56
    def perfStat(username:String, perfKey:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/perf/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("perfKey", perfKey)))
    }
  
    // @LINE:65
    def online(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "player/online")
    }
  
    // @LINE:63
    def topNb(nb:Int, perfKey:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "player/top/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("nb", nb)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("perfKey", perfKey)))
    }
  
    // @LINE:60
    def myself(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "player/myself")
    }
  
    // @LINE:50
    def mod(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/stream/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/mod")
    }
  
    // @LINE:53
    def showMini(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/mini")
    }
  
    // @LINE:51
    def writeNote(username:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/note")
    }
  
    // @LINE:57
    def gamesAll(username:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "@/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/all" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:61
    def opponents(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "player/opponents")
    }
  
    // @LINE:62
    def list(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "player")
    }
  
    // @LINE:66
    def autocomplete(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "player/autocomplete")
    }
  
    // @LINE:64
    def topWeek(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "player/top/week")
    }
  
    // @LINE:52
    def deleteNote(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "note/delete/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
  }

  // @LINE:394
  class ReverseIrwin(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:394
    def dashboard(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "irwin")
    }
  
    // @LINE:396
    def eventStream(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/stream/irwin")
    }
  
    // @LINE:395
    def saveReport(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "irwin/report")
    }
  
  }

  // @LINE:241
  class ReverseSimul(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:245
    def show(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:250
    def abort(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/abort")
    }
  
    // @LINE:251
    def join(id:String, variant:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/join/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("variant", variant)))
    }
  
    // @LINE:243
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/new")
    }
  
    // @LINE:249
    def start(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/start")
    }
  
    // @LINE:242
    def form(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "simul/new")
    }
  
    // @LINE:248
    def reject(id:String, user:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/reject/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("user", user)))
    }
  
    // @LINE:244
    def homeReload(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "simul/reload")
    }
  
    // @LINE:514
    def apiList(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/simul")
    }
  
    // @LINE:241
    def home(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "simul")
    }
  
    // @LINE:247
    def accept(id:String, user:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/accept/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("user", user)))
    }
  
    // @LINE:253
    def setText(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/set-text")
    }
  
    // @LINE:252
    def withdraw(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/withdraw")
    }
  
    // @LINE:246
    def hostPing(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "simul/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id) + "/host-ping")
    }
  
  }

  // @LINE:402
  class ReverseForumCateg(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:404
    def show(slug:String, page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "forum/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)) + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:402
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "forum")
    }
  
  }

  // @LINE:2
  class ReverseMain(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:594
    def lag(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "lag")
    }
  
    // @LINE:592
    def webmasters(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "developers")
    }
  
    // @LINE:470
    def image(id:String, hash:String, name:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "image/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("hash", hash)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)))
    }
  
    // @LINE:635
    def jslog(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "jslog/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:595
    def getFishnet(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "get-fishnet")
    }
  
    // @LINE:591
    def captchaCheck(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "captcha/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:622
    def legacyQaQuestion(id:Int, slug:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "qa/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[Int]].unbind("id", id)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("slug", slug)))
    }
  
    // @LINE:593
    def mobile(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "mobile")
    }
  
    // @LINE:597
    def verifyTitle(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "verify-title")
    }
  
    // @LINE:644
    def robots(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "robots.txt")
    }
  
    // @LINE:618
    def faq(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "faq")
    }
  
    // @LINE:596
    def costs(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "costs")
    }
  
    // @LINE:620
    def movedPermanently(to:String): Call = {
    
      (to: @unchecked) match {
      
        // @LINE:620
        case (to) if to == "/faq" =>
          implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("to", "/faq"))); _rrc
          Call("GET", _prefix + { _defaultPrefix } + "qa")
      
        // @LINE:621
        case (to) if to == "/contact" =>
          implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("to", "/contact"))); _rrc
          Call("GET", _prefix + { _defaultPrefix } + "help")
      
        // @LINE:638
        case (to) if to == "https://shop.spreadshirt.com/lichess-org" =>
          implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("to", "https://shop.spreadshirt.com/lichess-org"))); _rrc
          Call("GET", _prefix + { _defaultPrefix } + "swag")
      
      }
    
    }
  
    // @LINE:643
    def manifest(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "manifest.json")
    }
  
    // @LINE:598
    def instantChess(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "InstantChess.com")
    }
  
    // @LINE:616
    def contact(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "contact")
    }
  
    // @LINE:636
    def jsmon(event:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "jsmon/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("event", event)))
    }
  
    // @LINE:2
    def toggleBlindMode(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "toggle-blind-mode")
    }
  
    // @LINE:640
    def devAsset(v:String, file:String): Call = {
      implicit lazy val _rrc = new play.core.routing.ReverseRouteContext(Map(("path", "public"))); _rrc
      Call("GET", _prefix + { _defaultPrefix } + "assets/_" + implicitly[play.api.mvc.PathBindable[String]].unbind("v", v) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("file", file))
    }
  
  }

  // @LINE:483
  class ReverseReport(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:490
    def process(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "report/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/process")
    }
  
    // @LINE:485
    def flag(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "report/flag")
    }
  
    // @LINE:491
    def xfiles(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "report/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/xfiles")
    }
  
    // @LINE:484
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "report")
    }
  
    // @LINE:488
    def listWithFilter(room:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "report/list/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("room", room)))
    }
  
    // @LINE:486
    def thanks(reported:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "report/thanks" + play.core.routing.queryString(List(Some(implicitly[play.api.mvc.QueryStringBindable[String]].unbind("reported", reported)))))
    }
  
    // @LINE:492
    def currentCheatInquiry(username:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "report/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("username", username)) + "/cheat-inquiry")
    }
  
    // @LINE:483
    def form(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "report")
    }
  
    // @LINE:489
    def inquiry(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "report/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/inquiry")
    }
  
    // @LINE:487
    def list(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "report/list")
    }
  
  }

  // @LINE:20
  class ReverseTv(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:27
    def games(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "games")
    }
  
    // @LINE:25
    def onChannel(chanKey:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tv/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("chanKey", chanKey)))
    }
  
    // @LINE:23
    def feed(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tv/feed")
    }
  
    // @LINE:22
    def frame(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tv/frame")
    }
  
    // @LINE:26
    def sides(gameId:String, color:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tv/" + implicitly[play.api.mvc.PathBindable[String]].unbind("gameId", gameId) + "/" + implicitly[play.api.mvc.PathBindable[String]].unbind("color", color) + "/sides")
    }
  
    // @LINE:21
    def embed(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tv/embed")
    }
  
    // @LINE:28
    def gamesChannel(chanKey:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "games/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("chanKey", chanKey)))
    }
  
    // @LINE:20
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tv")
    }
  
    // @LINE:24
    def channels(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tv/channels")
    }
  
  }

  // @LINE:13
  class ReverseSearch(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:13
    def index(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "games/search" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
  }

  // @LINE:495
  class ReverseStat(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:495
    def ratingDistribution(perf:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "stat/rating/distribution/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("perf", perf)))
    }
  
  }

  // @LINE:498
  class ReverseApi(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:502
    def user(name:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)))
    }
  
    // @LINE:508
    def game(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/game/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:510
    def tournament(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/tournament/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:519
    def eventStream(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/stream/event")
    }
  
    // @LINE:517
    def crosstable(u1:String, u2:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/crosstable/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("u1", u1)) + "/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("u2", u2)))
    }
  
    // @LINE:509
    def currentTournaments(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/tournament")
    }
  
    // @LINE:512
    def tournamentResults(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/tournament/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/results")
    }
  
    // @LINE:499
    def usersByIds(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/users")
    }
  
    // @LINE:503
    def activity(name:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)) + "/activity")
    }
  
    // @LINE:518
    def gamesByUsersStream(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/stream/games-by-users")
    }
  
    // @LINE:516
    def usersStatus(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/users/status")
    }
  
    // @LINE:501
    def tournamentsByOwner(name:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)) + "/tournament/created")
    }
  
    // @LINE:515
    def status(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/status")
    }
  
    // @LINE:498
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api")
    }
  
    // @LINE:533
    def userGames(name:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/user/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("name", name)) + "/games")
    }
  
    // @LINE:511
    def tournamentGames(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/tournament/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/games")
    }
  
  }

  // @LINE:233
  class ReverseTournamentCrud(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:233
    def index(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/manager" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
    // @LINE:235
    def edit(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/manager/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:238
    def create(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "tournament/manager")
    }
  
    // @LINE:234
    def cloneT(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/manager/clone/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
    // @LINE:237
    def form(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "tournament/manager/new")
    }
  
    // @LINE:236
    def update(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "tournament/manager/" + implicitly[play.api.mvc.PathBindable[String]].unbind("id", id))
    }
  
  }

  // @LINE:322
  class ReverseNotify(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:322
    def recent(page:Int = 1): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "notify" + play.core.routing.queryString(List(if(page == 1) None else Some(implicitly[play.api.mvc.QueryStringBindable[Int]].unbind("page", page)))))
    }
  
  }

  // @LINE:574
  class ReverseOAuthApp(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:577
    def edit(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/oauth/app/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/edit")
    }
  
    // @LINE:575
    def create(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/oauth/app/create")
    }
  
    // @LINE:576
    def createApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/oauth/app/create")
    }
  
    // @LINE:579
    def delete(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/oauth/app/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/delete")
    }
  
    // @LINE:578
    def update(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/oauth/app/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)) + "/edit")
    }
  
    // @LINE:574
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/oauth/app")
    }
  
  }

  // @LINE:601
  class ReverseDev(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:601
    def cli(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "dev/cli")
    }
  
    // @LINE:602
    def cliPost(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "dev/cli")
    }
  
    // @LINE:605
    def settingsPost(id:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "dev/settings/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:603
    def command(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "cli")
    }
  
    // @LINE:604
    def settings(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "dev/settings")
    }
  
  }

  // @LINE:325
  class ReverseVideo(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:328
    def show(id:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "video/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("id", id)))
    }
  
    // @LINE:326
    def tags(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "video/tags")
    }
  
    // @LINE:327
    def author(author:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "video/author/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("author", author)))
    }
  
    // @LINE:325
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "video")
    }
  
  }

  // @LINE:520
  class ReverseAccount(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:565
    def signout(sessionId:String): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/signout/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("sessionId", sessionId)))
    }
  
    // @LINE:520
    def apiMe(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/account")
    }
  
    // @LINE:555
    def kidPost(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/kid")
    }
  
    // @LINE:552
    def username(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/username")
    }
  
    // @LINE:544
    def email(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/email")
    }
  
    // @LINE:562
    def reopenLogin(token:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/reopen/login/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("token", token)))
    }
  
    // @LINE:557
    def setupTwoFactor(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/twofactor/setup")
    }
  
    // @LINE:545
    def emailApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/email")
    }
  
    // @LINE:521
    def apiNowPlaying(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/account/playing")
    }
  
    // @LINE:561
    def reopenSent(email:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/reopen/sent/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("email", email)))
    }
  
    // @LINE:550
    def profile(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/profile")
    }
  
    // @LINE:567
    def nowPlaying(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/now-playing")
    }
  
    // @LINE:543
    def passwdApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/passwd")
    }
  
    // @LINE:564
    def security(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/security")
    }
  
    // @LINE:548
    def close(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/close")
    }
  
    // @LINE:554
    def kid(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/kid")
    }
  
    // @LINE:522
    def apiEmail(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/account/email")
    }
  
    // @LINE:524
    def apiKidPost(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "api/account/kid")
    }
  
    // @LINE:556
    def twoFactor(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/twofactor")
    }
  
    // @LINE:546
    def emailConfirmHelp(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "contact/email-confirm/help")
    }
  
    // @LINE:542
    def passwd(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/passwd")
    }
  
    // @LINE:558
    def disableTwoFactor(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/twofactor/disable")
    }
  
    // @LINE:553
    def usernameApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/username")
    }
  
    // @LINE:523
    def apiKid(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "api/account/kid")
    }
  
    // @LINE:549
    def closeConfirm(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/closeConfirm")
    }
  
    // @LINE:560
    def reopenApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/reopen/send")
    }
  
    // @LINE:559
    def reopen(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/reopen")
    }
  
    // @LINE:566
    def info(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/info")
    }
  
    // @LINE:551
    def profileApply(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "account/profile")
    }
  
    // @LINE:547
    def emailConfirm(token:String): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "account/email/confirm/" + play.core.routing.dynamicString(implicitly[play.api.mvc.PathBindable[String]].unbind("token", token)))
    }
  
  }

  // @LINE:146
  class ReverseLearn(_prefix: => String) {
    def _defaultPrefix: String = {
      if (_prefix.endsWith("/")) "" else "/"
    }

  
    // @LINE:147
    def score(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "learn/score")
    }
  
    // @LINE:146
    def index(): Call = {
      
      Call("GET", _prefix + { _defaultPrefix } + "learn")
    }
  
    // @LINE:148
    def reset(): Call = {
      
      Call("POST", _prefix + { _defaultPrefix } + "learn/reset")
    }
  
  }


}
