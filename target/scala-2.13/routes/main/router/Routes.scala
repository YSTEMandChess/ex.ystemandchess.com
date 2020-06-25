// @GENERATOR:play-routes-compiler
// @SOURCE:/home/owenoertell/Documents/ystem/app.ystemandchess.com/conf/routes
// @DATE:Wed Jun 17 13:43:21 EDT 2020

package router

import play.core.routing._
import play.core.routing.HandlerInvokerFactory._

import play.api.mvc._

import _root_.controllers.Assets.Asset

class Routes(
  override val errorHandler: play.api.http.HttpErrorHandler, 
  // @LINE:2
  Main_13: controllers.Main,
  // @LINE:5
  Lobby_51: controllers.Lobby,
  // @LINE:9
  Timeline_11: controllers.Timeline,
  // @LINE:13
  Search_39: controllers.Search,
  // @LINE:16
  Game_5: controllers.Game,
  // @LINE:20
  Tv_14: controllers.Tv,
  // @LINE:31
  Relation_57: controllers.Relation,
  // @LINE:40
  Insight_0: controllers.Insight,
  // @LINE:47
  UserTournament_42: controllers.UserTournament,
  // @LINE:50
  User_17: controllers.User,
  // @LINE:68
  Dasher_18: controllers.Dasher,
  // @LINE:71
  Blog_33: controllers.Blog,
  // @LINE:79
  Coordinate_3: controllers.Coordinate,
  // @LINE:84
  Puzzle_44: controllers.Puzzle,
  // @LINE:89
  Export_16: controllers.Export,
  // @LINE:102
  UserAnalysis_35: controllers.UserAnalysis,
  // @LINE:108
  Study_55: controllers.Study,
  // @LINE:134
  Relay_23: controllers.Relay,
  // @LINE:146
  Learn_36: controllers.Learn,
  // @LINE:151
  Plan_37: controllers.Plan,
  // @LINE:162
  Practice_34: controllers.Practice,
  // @LINE:174
  Streamer_20: controllers.Streamer,
  // @LINE:186
  Round_27: controllers.Round,
  // @LINE:196
  Editor_8: controllers.Editor,
  // @LINE:202
  Analyse_21: controllers.Analyse,
  // @LINE:211
  Tournament_2: controllers.Tournament,
  // @LINE:233
  TournamentCrud_24: controllers.TournamentCrud,
  // @LINE:241
  Simul_48: controllers.Simul,
  // @LINE:256
  Team_54: controllers.Team,
  // @LINE:288
  Fishnet_56: controllers.Fishnet,
  // @LINE:295
  Pref_1: controllers.Pref,
  // @LINE:301
  Setup_46: controllers.Setup,
  // @LINE:313
  Challenge_28: controllers.Challenge,
  // @LINE:322
  Notify_59: controllers.Notify,
  // @LINE:325
  Video_25: controllers.Video,
  // @LINE:331
  I18n_12: controllers.I18n,
  // @LINE:334
  Auth_9: controllers.Auth,
  // @LINE:357
  Mod_53: controllers.Mod,
  // @LINE:394
  Irwin_41: controllers.Irwin,
  // @LINE:399
  Bookmark_43: controllers.Bookmark,
  // @LINE:402
  ForumCateg_26: controllers.ForumCateg,
  // @LINE:403
  ForumPost_49: controllers.ForumPost,
  // @LINE:405
  ForumTopic_15: controllers.ForumTopic,
  // @LINE:418
  Msg_31: controllers.Msg,
  // @LINE:429
  Coach_52: controllers.Coach,
  // @LINE:442
  Clas_32: controllers.Clas,
  // @LINE:473
  Importer_10: controllers.Importer,
  // @LINE:483
  Report_38: controllers.Report,
  // @LINE:495
  Stat_45: controllers.Stat,
  // @LINE:498
  Api_58: controllers.Api,
  // @LINE:520
  Account_7: controllers.Account,
  // @LINE:536
  Bot_30: controllers.Bot,
  // @LINE:570
  OAuthToken_47: controllers.OAuthToken,
  // @LINE:574
  OAuthApp_50: controllers.OAuthApp,
  // @LINE:582
  Event_22: controllers.Event,
  // @LINE:601
  Dev_29: controllers.Dev,
  // @LINE:608
  Push_19: controllers.Push,
  // @LINE:613
  Page_6: controllers.Page,
  // @LINE:641
  ExternalAssets_40: controllers.ExternalAssets,
  // @LINE:646
  Options_4: controllers.Options,
  val prefix: String
) extends GeneratedRouter {

   @javax.inject.Inject()
   def this(errorHandler: play.api.http.HttpErrorHandler,
    // @LINE:2
    Main_13: controllers.Main,
    // @LINE:5
    Lobby_51: controllers.Lobby,
    // @LINE:9
    Timeline_11: controllers.Timeline,
    // @LINE:13
    Search_39: controllers.Search,
    // @LINE:16
    Game_5: controllers.Game,
    // @LINE:20
    Tv_14: controllers.Tv,
    // @LINE:31
    Relation_57: controllers.Relation,
    // @LINE:40
    Insight_0: controllers.Insight,
    // @LINE:47
    UserTournament_42: controllers.UserTournament,
    // @LINE:50
    User_17: controllers.User,
    // @LINE:68
    Dasher_18: controllers.Dasher,
    // @LINE:71
    Blog_33: controllers.Blog,
    // @LINE:79
    Coordinate_3: controllers.Coordinate,
    // @LINE:84
    Puzzle_44: controllers.Puzzle,
    // @LINE:89
    Export_16: controllers.Export,
    // @LINE:102
    UserAnalysis_35: controllers.UserAnalysis,
    // @LINE:108
    Study_55: controllers.Study,
    // @LINE:134
    Relay_23: controllers.Relay,
    // @LINE:146
    Learn_36: controllers.Learn,
    // @LINE:151
    Plan_37: controllers.Plan,
    // @LINE:162
    Practice_34: controllers.Practice,
    // @LINE:174
    Streamer_20: controllers.Streamer,
    // @LINE:186
    Round_27: controllers.Round,
    // @LINE:196
    Editor_8: controllers.Editor,
    // @LINE:202
    Analyse_21: controllers.Analyse,
    // @LINE:211
    Tournament_2: controllers.Tournament,
    // @LINE:233
    TournamentCrud_24: controllers.TournamentCrud,
    // @LINE:241
    Simul_48: controllers.Simul,
    // @LINE:256
    Team_54: controllers.Team,
    // @LINE:288
    Fishnet_56: controllers.Fishnet,
    // @LINE:295
    Pref_1: controllers.Pref,
    // @LINE:301
    Setup_46: controllers.Setup,
    // @LINE:313
    Challenge_28: controllers.Challenge,
    // @LINE:322
    Notify_59: controllers.Notify,
    // @LINE:325
    Video_25: controllers.Video,
    // @LINE:331
    I18n_12: controllers.I18n,
    // @LINE:334
    Auth_9: controllers.Auth,
    // @LINE:357
    Mod_53: controllers.Mod,
    // @LINE:394
    Irwin_41: controllers.Irwin,
    // @LINE:399
    Bookmark_43: controllers.Bookmark,
    // @LINE:402
    ForumCateg_26: controllers.ForumCateg,
    // @LINE:403
    ForumPost_49: controllers.ForumPost,
    // @LINE:405
    ForumTopic_15: controllers.ForumTopic,
    // @LINE:418
    Msg_31: controllers.Msg,
    // @LINE:429
    Coach_52: controllers.Coach,
    // @LINE:442
    Clas_32: controllers.Clas,
    // @LINE:473
    Importer_10: controllers.Importer,
    // @LINE:483
    Report_38: controllers.Report,
    // @LINE:495
    Stat_45: controllers.Stat,
    // @LINE:498
    Api_58: controllers.Api,
    // @LINE:520
    Account_7: controllers.Account,
    // @LINE:536
    Bot_30: controllers.Bot,
    // @LINE:570
    OAuthToken_47: controllers.OAuthToken,
    // @LINE:574
    OAuthApp_50: controllers.OAuthApp,
    // @LINE:582
    Event_22: controllers.Event,
    // @LINE:601
    Dev_29: controllers.Dev,
    // @LINE:608
    Push_19: controllers.Push,
    // @LINE:613
    Page_6: controllers.Page,
    // @LINE:641
    ExternalAssets_40: controllers.ExternalAssets,
    // @LINE:646
    Options_4: controllers.Options
  ) = this(errorHandler, Main_13, Lobby_51, Timeline_11, Search_39, Game_5, Tv_14, Relation_57, Insight_0, UserTournament_42, User_17, Dasher_18, Blog_33, Coordinate_3, Puzzle_44, Export_16, UserAnalysis_35, Study_55, Relay_23, Learn_36, Plan_37, Practice_34, Streamer_20, Round_27, Editor_8, Analyse_21, Tournament_2, TournamentCrud_24, Simul_48, Team_54, Fishnet_56, Pref_1, Setup_46, Challenge_28, Notify_59, Video_25, I18n_12, Auth_9, Mod_53, Irwin_41, Bookmark_43, ForumCateg_26, ForumPost_49, ForumTopic_15, Msg_31, Coach_52, Clas_32, Importer_10, Report_38, Stat_45, Api_58, Account_7, Bot_30, OAuthToken_47, OAuthApp_50, Event_22, Dev_29, Push_19, Page_6, ExternalAssets_40, Options_4, "/")

  def withPrefix(addPrefix: String): Routes = {
    val prefix = play.api.routing.Router.concatPrefix(addPrefix, this.prefix)
    router.RoutesPrefix.setPrefix(prefix)
    new Routes(errorHandler, Main_13, Lobby_51, Timeline_11, Search_39, Game_5, Tv_14, Relation_57, Insight_0, UserTournament_42, User_17, Dasher_18, Blog_33, Coordinate_3, Puzzle_44, Export_16, UserAnalysis_35, Study_55, Relay_23, Learn_36, Plan_37, Practice_34, Streamer_20, Round_27, Editor_8, Analyse_21, Tournament_2, TournamentCrud_24, Simul_48, Team_54, Fishnet_56, Pref_1, Setup_46, Challenge_28, Notify_59, Video_25, I18n_12, Auth_9, Mod_53, Irwin_41, Bookmark_43, ForumCateg_26, ForumPost_49, ForumTopic_15, Msg_31, Coach_52, Clas_32, Importer_10, Report_38, Stat_45, Api_58, Account_7, Bot_30, OAuthToken_47, OAuthApp_50, Event_22, Dev_29, Push_19, Page_6, ExternalAssets_40, Options_4, prefix)
  }

  private[this] val defaultPrefix: String = {
    if (this.prefix.endsWith("/")) "" else "/"
  }

  def documentation = List(
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """toggle-blind-mode""", """controllers.Main.toggleBlindMode"""),
    ("""GET""", this.prefix, """controllers.Lobby.home"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """lobby/seeks""", """controllers.Lobby.seeks"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """timeline""", """controllers.Timeline.home"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """timeline/unsub/""" + "$" + """channel<[^/]+>""", """controllers.Timeline.unsub(channel:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """games/search""", """controllers.Search.index(page:Int ?= 1)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """games/export/_ids""", """controllers.Game.exportByIds"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """games/export/""" + "$" + """username<[^/]+>""", """controllers.Game.exportByUser(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tv""", """controllers.Tv.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tv/embed""", """controllers.Tv.embed"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tv/frame""", """controllers.Tv.frame"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tv/feed""", """controllers.Tv.feed"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tv/channels""", """controllers.Tv.channels"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tv/""" + "$" + """chanKey<[^/]+>""", """controllers.Tv.onChannel(chanKey:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tv/""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>/sides""", """controllers.Tv.sides(gameId:String, color:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """games""", """controllers.Tv.games"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """games/""" + "$" + """chanKey<[^/]+>""", """controllers.Tv.gamesChannel(chanKey:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """rel/follow/""" + "$" + """userId<[^/]+>""", """controllers.Relation.follow(userId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """rel/unfollow/""" + "$" + """userId<[^/]+>""", """controllers.Relation.unfollow(userId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """rel/block/""" + "$" + """userId<[^/]+>""", """controllers.Relation.block(userId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """rel/unblock/""" + "$" + """userId<[^/]+>""", """controllers.Relation.unblock(userId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/following""", """controllers.Relation.following(username:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/followers""", """controllers.Relation.followers(username:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """rel/blocks""", """controllers.Relation.blocks(page:Int ?= 1)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """insights/refresh/""" + "$" + """username<[^/]+>""", """controllers.Insight.refresh(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """insights/data/""" + "$" + """username<[^/]+>""", """controllers.Insight.json(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """insights/""" + "$" + """username<[^/]+>""", """controllers.Insight.index(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """insights/""" + "$" + """username<[^/]+>/""" + "$" + """metric<[^/]+>/""" + "$" + """dimension<[^/]+>""", """controllers.Insight.path(username:String, metric:String, dimension:String, filters:String = "")"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """insights/""" + "$" + """username<[^/]+>/""" + "$" + """metric<[^/]+>/""" + "$" + """dimension<[^/]+>/""" + "$" + """filters<.+>""", """controllers.Insight.path(username:String, metric:String, dimension:String, filters:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/tournaments/""" + "$" + """path<[^/]+>""", """controllers.UserTournament.path(username:String, path:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/stream/""" + "$" + """username<[^/]+>/mod""", """controllers.User.mod(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/note""", """controllers.User.writeNote(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """note/delete/""" + "$" + """id<[^/]+>""", """controllers.User.deleteNote(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/mini""", """controllers.User.showMini(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/tv""", """controllers.User.tv(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/studyTv""", """controllers.User.studyTv(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/perf/""" + "$" + """perfKey<[^/]+>""", """controllers.User.perfStat(username:String, perfKey:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/all""", """controllers.User.gamesAll(username:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>/""" + "$" + """filterName<[^/]+>""", """controllers.User.games(username:String, filterName:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """@/""" + "$" + """username<[^/]+>""", """controllers.User.show(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """player/myself""", """controllers.User.myself"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """player/opponents""", """controllers.User.opponents"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """player""", """controllers.User.list"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """player/top/""" + "$" + """nb<[^/]+>/""" + "$" + """perfKey<[^/]+>""", """controllers.User.topNb(nb:Int, perfKey:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """player/top/week""", """controllers.User.topWeek"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """player/online""", """controllers.User.online"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """player/autocomplete""", """controllers.User.autocomplete"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """dasher""", """controllers.Dasher.get"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """blog""", """controllers.Blog.index(page:Int ?= 1, ref:Option[String] ?= None)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """blog/all""", """controllers.Blog.all"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """blog/""" + "$" + """year<[^/]+>""", """controllers.Blog.year(year:Int)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """blog/discuss/""" + "$" + """id<[^/]+>""", """controllers.Blog.discuss(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """blog/""" + "$" + """id<[^/]+>/""" + "$" + """slug<[^/]+>""", """controllers.Blog.show(id:String, slug:String, ref:Option[String] ?= None)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """blog.atom""", """controllers.Blog.atom"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/coordinate""", """controllers.Coordinate.home"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/coordinate/score""", """controllers.Coordinate.score"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/coordinate/color""", """controllers.Coordinate.color"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training""", """controllers.Puzzle.home"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/new""", """controllers.Puzzle.newPuzzle"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/daily""", """controllers.Puzzle.daily"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/embed""", """controllers.Puzzle.embed"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/frame""", """controllers.Puzzle.frame"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/export/png/""" + "$" + """id<[^/]+>.png""", """controllers.Export.puzzlePng(id:Int)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/batch""", """controllers.Puzzle.batchSelect"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/batch""", """controllers.Puzzle.batchSolve"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/""" + "$" + """id<[^/]+>""", """controllers.Puzzle.show(id:Int)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/""" + "$" + """id<[^/]+>/load""", """controllers.Puzzle.load(id:Int)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/""" + "$" + """id<[^/]+>/vote""", """controllers.Puzzle.vote(id:Int)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/""" + "$" + """id<[^/]+>/round""", """controllers.Puzzle.round(id:Int)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/""" + "$" + """id<[^/]+>/round2""", """controllers.Puzzle.round2(id:Int)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """training/""" + "$" + """id<[^/]+>/attempt""", """controllers.Puzzle.round(id:Int)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """analysis/help""", """controllers.UserAnalysis.help"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """analysis/""" + "$" + """something<.+>""", """controllers.UserAnalysis.parseArg(something:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """analysis""", """controllers.UserAnalysis.index"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """analysis/pgn""", """controllers.UserAnalysis.pgn"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study""", """controllers.Study.allDefault(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/all/""" + "$" + """order<[^/]+>""", """controllers.Study.all(order:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/mine/""" + "$" + """order<[^/]+>""", """controllers.Study.mine(order:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/member/""" + "$" + """order<[^/]+>""", """controllers.Study.mineMember(order:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/public/""" + "$" + """order<[^/]+>""", """controllers.Study.minePublic(order:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/private/""" + "$" + """order<[^/]+>""", """controllers.Study.minePrivate(order:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/likes/""" + "$" + """order<[^/]+>""", """controllers.Study.mineLikes(order:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/by/""" + "$" + """username<[^/]+>""", """controllers.Study.byOwnerDefault(username:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/by/""" + "$" + """username<[^/]+>/""" + "$" + """order<[^/]+>""", """controllers.Study.byOwner(username:String, order:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/search""", """controllers.Study.search(q:String ?= "", page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>""", """controllers.Study.show(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study""", """controllers.Study.create"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/as""", """controllers.Study.createAs"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>.pgn""", """controllers.Study.pgn(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>.pgn""", """controllers.Study.chapterPgn(id:String, chapterId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/delete""", """controllers.Study.delete(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/clone""", """controllers.Study.cloneStudy(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/cloneAplly""", """controllers.Study.cloneApply(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>""", """controllers.Study.chapter(id:String, chapterId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>/meta""", """controllers.Study.chapterMeta(id:String, chapterId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/embed/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>""", """controllers.Study.embed(id:String, chapterId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/clear-chat""", """controllers.Study.clearChat(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/import-pgn""", """controllers.Study.importPgn(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """study/""" + "$" + """id<\w{8}>/multi-board""", """controllers.Study.multiBoard(id:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast""", """controllers.Relay.index(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/new""", """controllers.Relay.form"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/new""", """controllers.Relay.create"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>""", """controllers.Relay.show(slug:String, id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>""", """controllers.Relay.chapter(slug:String, id:String, chapterId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/edit""", """controllers.Relay.edit(slug:String, id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/edit""", """controllers.Relay.update(slug:String, id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/reset""", """controllers.Relay.reset(slug:String, id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/clone""", """controllers.Relay.cloneRelay(slug:String, id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/push""", """controllers.Relay.push(slug:String, id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """learn""", """controllers.Learn.index"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """learn/score""", """controllers.Learn.score"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """learn/reset""", """controllers.Learn.reset"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """patron""", """controllers.Plan.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """patron/thanks""", """controllers.Plan.thanks"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """patron/list""", """controllers.Plan.list"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """patron/switch""", """controllers.Plan.switch"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """patron/cancel""", """controllers.Plan.cancel"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """patron/webhook""", """controllers.Plan.webhook"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """patron/stripe-checkout""", """controllers.Plan.stripeCheckout"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """patron/ipn""", """controllers.Plan.payPalIpn"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """features""", """controllers.Plan.features"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice""", """controllers.Practice.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/load/""" + "$" + """studyId<[^/]+>/""" + "$" + """chapterId<[^/]+>""", """controllers.Practice.chapter(studyId:String, chapterId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/config""", """controllers.Practice.config"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/config""", """controllers.Practice.configSave"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/reset""", """controllers.Practice.reset"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/""" + "$" + """sectionId<[^/]+>""", """controllers.Practice.showSection(sectionId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/""" + "$" + """sectionId<[^/]+>/""" + "$" + """studySlug<[^/]+>""", """controllers.Practice.showStudySlug(sectionId:String, studySlug:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/""" + "$" + """sectionId<[^/]+>/""" + "$" + """studySlug<[^/]+>/""" + "$" + """studyId<[^/]+>""", """controllers.Practice.show(sectionId:String, studySlug:String, studyId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/""" + "$" + """sectionId<[^/]+>/""" + "$" + """studySlug<[^/]+>/""" + "$" + """studyId<[^/]+>/""" + "$" + """chapterId<[^/]+>""", """controllers.Practice.showChapter(sectionId:String, studySlug:String, studyId:String, chapterId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """practice/complete/""" + "$" + """chapterId<[^/]+>/""" + "$" + """moves<[^/]+>""", """controllers.Practice.complete(chapterId:String, moves:Int)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer""", """controllers.Streamer.index(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/live""", """controllers.Streamer.live"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/edit""", """controllers.Streamer.edit"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/new""", """controllers.Streamer.create"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/edit""", """controllers.Streamer.editApply"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/approval/request""", """controllers.Streamer.approvalRequest"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/picture/edit""", """controllers.Streamer.picture"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/picture/upload""", """controllers.Streamer.pictureApply"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/picture/delete""", """controllers.Streamer.pictureDelete"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """streamer/""" + "$" + """username<[^/]+>""", """controllers.Streamer.show(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>""", """controllers.Round.watcher(gameId:String, color:String = "white")"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>""", """controllers.Round.watcher(gameId:String, color:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """fullId<\w{12}>""", """controllers.Round.player(fullId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>/sides""", """controllers.Round.sides(gameId:String, color:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/continue/""" + "$" + """mode<[^/]+>""", """controllers.Round.continue(gameId:String, mode:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/note""", """controllers.Round.readNote(gameId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/note""", """controllers.Round.writeNote(gameId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/mini""", """controllers.Round.mini(gameId:String, color:String = "white")"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>/mini""", """controllers.Round.mini(gameId:String, color:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """fullId<\w{12}>/mini""", """controllers.Round.miniFullId(fullId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/edit""", """controllers.Editor.game(gameId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>/analysis""", """controllers.UserAnalysis.game(gameId:String, color:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """fullId<\w{12}>/forecasts""", """controllers.UserAnalysis.forecasts(fullId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """fullId<\w{12}>/forecasts/""" + "$" + """uci<[^/]+>""", """controllers.UserAnalysis.forecastsOnMyTurn(fullId:String, uci:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """fullId<\w{12}>/resign""", """controllers.Round.resign(fullId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """embed/""" + "$" + """gameId<\w{8}>""", """controllers.Analyse.embed(gameId:String, color:String = "white")"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """embed/""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>""", """controllers.Analyse.embed(gameId:String, color:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/delete""", """controllers.Game.delete(gameId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """round-next/""" + "$" + """gameId<\w{8}>""", """controllers.Round.next(gameId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """whats-next/""" + "$" + """fullId<\w{12}>""", """controllers.Round.whatsNext(fullId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament""", """controllers.Tournament.home(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/featured""", """controllers.Tournament.featured"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/new""", """controllers.Tournament.form"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/new""", """controllers.Tournament.create"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/team-battle/new/""" + "$" + """teamId<[^/]+>""", """controllers.Tournament.teamBattleForm(teamId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/team-battle/edit/""" + "$" + """id<[^/]+>""", """controllers.Tournament.teamBattleEdit(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/team-battle/edit/""" + "$" + """id<[^/]+>""", """controllers.Tournament.teamBattleUpdate(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/calendar""", """controllers.Tournament.calendar"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/""" + "$" + """id<\w{8}>""", """controllers.Tournament.show(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/""" + "$" + """id<\w{8}>/standing/""" + "$" + """page<[^/]+>""", """controllers.Tournament.standing(id:String, page:Int)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/""" + "$" + """id<\w{8}>/page-of/""" + "$" + """userId<[^/]+>""", """controllers.Tournament.pageOf(id:String, userId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/""" + "$" + """id<\w{8}>/join""", """controllers.Tournament.join(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/""" + "$" + """id<\w{8}>/withdraw""", """controllers.Tournament.pause(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/""" + "$" + """id<\w{8}>/player/""" + "$" + """user<[^/]+>""", """controllers.Tournament.player(id:String, user:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/""" + "$" + """id<\w{8}>/team/""" + "$" + """team<[^/]+>""", """controllers.Tournament.teamInfo(id:String, team:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/""" + "$" + """id<\w{8}>/terminate""", """controllers.Tournament.terminate(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/help""", """controllers.Tournament.help(system:Option[String] ?= None)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/leaderboard""", """controllers.Tournament.leaderboard"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/shields""", """controllers.Tournament.shields"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/shields/""" + "$" + """categ<[^/]+>""", """controllers.Tournament.categShields(categ:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/manager""", """controllers.TournamentCrud.index(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/manager/clone/""" + "$" + """id<\w{8}>""", """controllers.TournamentCrud.cloneT(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/manager/""" + "$" + """id<\w{8}>""", """controllers.TournamentCrud.edit(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/manager/""" + "$" + """id<\w{8}>""", """controllers.TournamentCrud.update(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/manager/new""", """controllers.TournamentCrud.form"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """tournament/manager""", """controllers.TournamentCrud.create"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul""", """controllers.Simul.home"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/new""", """controllers.Simul.form"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/new""", """controllers.Simul.create"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/reload""", """controllers.Simul.homeReload"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>""", """controllers.Simul.show(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>/host-ping""", """controllers.Simul.hostPing(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>/accept/""" + "$" + """user<[^/]+>""", """controllers.Simul.accept(id:String, user:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>/reject/""" + "$" + """user<[^/]+>""", """controllers.Simul.reject(id:String, user:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>/start""", """controllers.Simul.start(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>/abort""", """controllers.Simul.abort(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>/join/""" + "$" + """variant<[^/]+>""", """controllers.Simul.join(id:String, variant:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>/withdraw""", """controllers.Simul.withdraw(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """simul/""" + "$" + """id<\w{8}>/set-text""", """controllers.Simul.setText(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team""", """controllers.Team.home(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/new""", """controllers.Team.form"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/new""", """controllers.Team.create"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/me""", """controllers.Team.mine"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/all""", """controllers.Team.all(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/requests""", """controllers.Team.requests"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/search""", """controllers.Team.search(text:String ?= "", page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/autocomplete""", """controllers.Team.autocomplete"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>""", """controllers.Team.show(id:String, page:Int ?= 1)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/join""", """controllers.Team.join(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/quit""", """controllers.Team.quit(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/request/new""", """controllers.Team.requestForm(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/request/new""", """controllers.Team.requestCreate(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/request/process""", """controllers.Team.requestProcess(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/edit""", """controllers.Team.edit(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/edit""", """controllers.Team.update(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/kick""", """controllers.Team.kickForm(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/kick""", """controllers.Team.kick(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/kick/""" + "$" + """user<[^/]+>""", """controllers.Team.kickUser(id:String, user:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/changeOwner""", """controllers.Team.changeOwnerForm(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/changeOwner""", """controllers.Team.changeOwner(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/close""", """controllers.Team.close(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """team/""" + "$" + """id<[^/]+>/users""", """controllers.Team.users(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """gameId<\w{8}>/request-analysis""", """controllers.Analyse.requestAnalysis(gameId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """game/export/""" + "$" + """gameId<\w{8}>""", """controllers.Game.exportOne(gameId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """game/export/""" + "$" + """gameId<\w{8}>.pgn""", """controllers.Game.exportOne(gameId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """game/export/png/""" + "$" + """gameId<\w{8}>.png""", """controllers.Export.png(gameId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """fishnet/acquire""", """controllers.Fishnet.acquire"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """fishnet/analysis/""" + "$" + """workId<\w{8}>""", """controllers.Fishnet.analysis(workId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """fishnet/abort/""" + "$" + """workId<\w{8}>""", """controllers.Fishnet.abort(workId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """fishnet/key/""" + "$" + """key<\w{8}>""", """controllers.Fishnet.keyExists(key:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """fishnet/status""", """controllers.Fishnet.status"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """pref/""" + "$" + """name<[^/]+>""", """controllers.Pref.set(name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/preferences/""" + "$" + """categ<[^/]+>""", """controllers.Pref.form(categ:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/preferences""", """controllers.Pref.formApply"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/preferences/verify-title""", """controllers.Pref.verifyTitle"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/ai""", """controllers.Setup.aiForm"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/ai""", """controllers.Setup.ai"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/friend""", """controllers.Setup.friendForm(user:Option[String] ?= None)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/friend""", """controllers.Setup.friend(user:Option[String] ?= None)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/hook""", """controllers.Setup.hookForm"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/hook/""" + "$" + """sri<[^/]+>/like/""" + "$" + """gameId<[^/]+>""", """controllers.Setup.like(sri:String, gameId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/hook/""" + "$" + """sri<[^/]+>""", """controllers.Setup.hook(sri:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/filter""", """controllers.Setup.filterForm"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/filter""", """controllers.Setup.filter"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """setup/validate-fen""", """controllers.Setup.validateFen"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """challenge""", """controllers.Challenge.all"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """challenge/""" + "$" + """id<\w{8}>""", """controllers.Challenge.show(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """challenge/""" + "$" + """id<\w{8}>/accept""", """controllers.Challenge.accept(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """challenge/""" + "$" + """id<\w{8}>/decline""", """controllers.Challenge.decline(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """challenge/""" + "$" + """id<\w{8}>/cancel""", """controllers.Challenge.cancel(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """challenge/""" + "$" + """id<\w{8}>/to-friend""", """controllers.Challenge.toFriend(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """challenge/rematch-of/""" + "$" + """id<\w{8}>""", """controllers.Challenge.rematchOf(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """notify""", """controllers.Notify.recent(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """video""", """controllers.Video.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """video/tags""", """controllers.Video.tags"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """video/author/""" + "$" + """author<[^/]+>""", """controllers.Video.author(author:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """video/""" + "$" + """id<[^/]+>""", """controllers.Video.show(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """translation/select""", """controllers.I18n.select"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """login""", """controllers.Auth.login"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """login""", """controllers.Auth.authenticate"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """logout""", """controllers.Auth.logoutGet"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """logout""", """controllers.Auth.logout"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """signup""", """controllers.Auth.signup"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """signup""", """controllers.Auth.signupPost"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """signup/check-your-email""", """controllers.Auth.checkYourEmail"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """signup/fix-email""", """controllers.Auth.fixEmail"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """signup/confirm/""" + "$" + """token<[^/]+>""", """controllers.Auth.signupConfirmEmail(token:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """password/reset""", """controllers.Auth.passwordReset"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """password/reset/send""", """controllers.Auth.passwordResetApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """password/reset/sent/""" + "$" + """email<[^/]+>""", """controllers.Auth.passwordResetSent(email:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """password/reset/confirm/""" + "$" + """token<[^/]+>""", """controllers.Auth.passwordResetConfirm(token:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """password/reset/confirm/""" + "$" + """token<[^/]+>""", """controllers.Auth.passwordResetConfirmApply(token:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """auth/set-fp/""" + "$" + """fp<[^/]+>/""" + "$" + """ms<[^/]+>""", """controllers.Auth.setFingerPrint(fp:String, ms:Int)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """auth/token""", """controllers.Auth.makeLoginToken"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """auth/token/""" + "$" + """token<[^/]+>""", """controllers.Auth.loginWithToken(token:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """auth/magic-link""", """controllers.Auth.magicLink"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """auth/magic-link/send""", """controllers.Auth.magicLinkApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """auth/magic-link/sent/""" + "$" + """email<[^/]+>""", """controllers.Auth.magicLinkSent(email:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """auth/magic-link/login/""" + "$" + """token<[^/]+>""", """controllers.Auth.magicLinkLogin(token:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/alt/""" + "$" + """v<[^/]+>""", """controllers.Mod.alt(username:String, v:Boolean)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/engine/""" + "$" + """v<[^/]+>""", """controllers.Mod.engine(username:String, v:Boolean)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/booster/""" + "$" + """v<[^/]+>""", """controllers.Mod.booster(username:String, v:Boolean)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/troll/""" + "$" + """v<[^/]+>""", """controllers.Mod.troll(username:String, v:Boolean)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/ban/""" + "$" + """v<[^/]+>""", """controllers.Mod.ipBan(username:String, v:Boolean)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/delete-pms-and-chats""", """controllers.Mod.deletePmsAndChats(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/warn""", """controllers.Mod.warn(username:String, subject:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/disable-2fa""", """controllers.Mod.disableTwoFactor(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/close""", """controllers.Mod.closeAccount(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/reopen""", """controllers.Mod.reopenAccount(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/title""", """controllers.Mod.setTitle(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/inquiry""", """controllers.Mod.spontaneousInquiry(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/communication""", """controllers.Mod.communicationPublic(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/communication/private""", """controllers.Mod.communicationPrivate(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/rankban/""" + "$" + """v<[^/]+>""", """controllers.Mod.rankban(username:String, v:Boolean)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/reportban/""" + "$" + """v<[^/]+>""", """controllers.Mod.reportban(username:String, v:Boolean)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/impersonate""", """controllers.Mod.impersonate(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/log""", """controllers.Mod.log"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/refreshUserAssess""", """controllers.Mod.refreshUserAssess(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/email""", """controllers.Mod.setEmail(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/notify-slack""", """controllers.Mod.notifySlack(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/ip-intel""", """controllers.Mod.ipIntel(ip:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/leaderboard""", """controllers.Mod.gamify"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/leaderboard/""" + "$" + """period<[^/]+>""", """controllers.Mod.gamifyPeriod(period:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/search""", """controllers.Mod.search"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/chat-user/""" + "$" + """username<[^/]+>""", """controllers.Mod.chatUser(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/permissions""", """controllers.Mod.permissions(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/""" + "$" + """username<[^/]+>/permissions""", """controllers.Mod.savePermissions(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/public-chat""", """controllers.Mod.publicChat"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/email-confirm""", """controllers.Mod.emailConfirm"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/chat-panic""", """controllers.Mod.chatPanic"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/chat-panic""", """controllers.Mod.chatPanicPost"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/print/""" + "$" + """fh<[^/]+>""", """controllers.Mod.print(fh:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mod/print/ban/""" + "$" + """v<[^/]+>/""" + "$" + """fh<[^/]+>""", """controllers.Mod.printBan(v:Boolean, fh:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/stream/mod""", """controllers.Mod.eventStream"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """irwin""", """controllers.Irwin.dashboard"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """irwin/report""", """controllers.Irwin.saveReport"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/stream/irwin""", """controllers.Irwin.eventStream"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """bookmark/""" + "$" + """gameId<\w{8}>""", """controllers.Bookmark.toggle(gameId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum""", """controllers.ForumCateg.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/search""", """controllers.ForumPost.search(text:String ?= "", page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """slug<[^/]+>""", """controllers.ForumCateg.show(slug:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """categSlug<[^/]+>/form""", """controllers.ForumTopic.form(categSlug:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """categSlug<[^/]+>/new""", """controllers.ForumTopic.create(categSlug:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/participants/""" + "$" + """topicId<[^/]+>""", """controllers.ForumTopic.participants(topicId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>""", """controllers.ForumTopic.show(categSlug:String, slug:String, page:Int ?= 1)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>/close""", """controllers.ForumTopic.close(categSlug:String, slug:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>/hide""", """controllers.ForumTopic.hide(categSlug:String, slug:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>/sticky""", """controllers.ForumTopic.sticky(categSlug:String, slug:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>/new""", """controllers.ForumPost.create(categSlug:String, slug:String, page:Int ?= 1)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/""" + "$" + """categSlug<[^/]+>/delete/""" + "$" + """id<[^/]+>""", """controllers.ForumPost.delete(categSlug:String, id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/post/""" + "$" + """id<[^/]+>""", """controllers.ForumPost.edit(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """forum/redirect/post/""" + "$" + """id<[^/]+>""", """controllers.ForumPost.redirect(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """inbox/new""", """controllers.Msg.compatCreate"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """inbox""", """controllers.Msg.home"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """inbox/search""", """controllers.Msg.search(q:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """inbox/unread-count""", """controllers.Msg.unreadCount"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """inbox/""" + "$" + """username<[^/]+>""", """controllers.Msg.convo(username:String, before:Option[Long] ?= None)"""),
    ("""DELETE""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """inbox/""" + "$" + """username<[^/]+>""", """controllers.Msg.convoDelete(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """inbox/""" + "$" + """username<[^/]+>""", """controllers.Msg.apiPost(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach""", """controllers.Coach.allDefault(page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/sort/""" + "$" + """order<[^/]+>""", """controllers.Coach.all(order:String, page:Int ?= 1)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/edit""", """controllers.Coach.edit"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/edit""", """controllers.Coach.editApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/picture/edit""", """controllers.Coach.picture"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/picture/upload""", """controllers.Coach.pictureApply"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/picture/delete""", """controllers.Coach.pictureDelete"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/approve-review/""" + "$" + """id<[^/]+>""", """controllers.Coach.approveReview(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/mod-review/""" + "$" + """id<[^/]+>""", """controllers.Coach.modReview(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/""" + "$" + """username<[^/]+>""", """controllers.Coach.show(username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """coach/""" + "$" + """username<[^/]+>/review""", """controllers.Coach.review(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class""", """controllers.Clas.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/new""", """controllers.Clas.form"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/new""", """controllers.Clas.create"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/verify-teacher""", """controllers.Clas.verifyTeacher"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>""", """controllers.Clas.show(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/edit""", """controllers.Clas.edit(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/edit""", """controllers.Clas.update(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/news""", """controllers.Clas.wall(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/news/edit""", """controllers.Clas.wallEdit(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/news/edit""", """controllers.Clas.wallUpdate(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/notify""", """controllers.Clas.notifyStudents(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/notifyPost""", """controllers.Clas.notifyPost(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/archive""", """controllers.Clas.archive(id:String, v:Boolean)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/archived""", """controllers.Clas.archived(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/progress/""" + "$" + """pt<[^/]+>/""" + "$" + """days<[^/]+>""", """controllers.Clas.progress(id:String, pt:String, days:Int)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/add""", """controllers.Clas.studentForm(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/new""", """controllers.Clas.studentCreate(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/invite""", """controllers.Clas.studentInvite(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>""", """controllers.Clas.studentShow(id:String, username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/archive""", """controllers.Clas.studentArchive(id:String, username:String, v:Boolean)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/reset-password""", """controllers.Clas.studentResetPassword(id:String, username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/set-kid""", """controllers.Clas.studentSetKid(id:String, username:String, v:Boolean)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/edit""", """controllers.Clas.studentEdit(id:String, username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/edit""", """controllers.Clas.studentUpdate(id:String, username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/release""", """controllers.Clas.studentRelease(id:String, username:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/release""", """controllers.Clas.studentReleasePost(id:String, username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """image/""" + "$" + """id<[^/]+>/""" + "$" + """hash<[^/]+>/""" + "$" + """name<[^/]+>""", """controllers.Main.image(id:String, hash:String, name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """paste""", """controllers.Importer.importGame"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """import""", """controllers.Importer.sendGame"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """import/master/""" + "$" + """id<\w{8}>/""" + "$" + """color<[^/]+>""", """controllers.Importer.masterGame(id:String, color:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """editor.json""", """controllers.Editor.data"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """editor/""" + "$" + """urlFen<.+>""", """controllers.Editor.load(urlFen:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """editor""", """controllers.Editor.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report""", """controllers.Report.form"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report""", """controllers.Report.create"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report/flag""", """controllers.Report.flag"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report/thanks""", """controllers.Report.thanks(reported:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report/list""", """controllers.Report.list"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report/list/""" + "$" + """room<[^/]+>""", """controllers.Report.listWithFilter(room:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report/""" + "$" + """id<[^/]+>/inquiry""", """controllers.Report.inquiry(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report/""" + "$" + """id<[^/]+>/process""", """controllers.Report.process(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report/""" + "$" + """id<[^/]+>/xfiles""", """controllers.Report.xfiles(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """report/""" + "$" + """username<[^/]+>/cheat-inquiry""", """controllers.Report.currentCheatInquiry(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """stat/rating/distribution/""" + "$" + """perf<[^/]+>""", """controllers.Stat.ratingDistribution(perf:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api""", """controllers.Api.index"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/users""", """controllers.Api.usersByIds"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/puzzle-activity""", """controllers.Puzzle.activity"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/""" + "$" + """name<[^/]+>/tournament/created""", """controllers.Api.tournamentsByOwner(name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/""" + "$" + """name<[^/]+>""", """controllers.Api.user(name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/""" + "$" + """name<[^/]+>/activity""", """controllers.Api.activity(name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/""" + "$" + """name<[^/]+>/following""", """controllers.Relation.apiFollowing(name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/""" + "$" + """name<[^/]+>/followers""", """controllers.Relation.apiFollowers(name:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/""" + "$" + """name<[^/]+>/note""", """controllers.User.apiWriteNote(name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/""" + "$" + """name<[^/]+>/rating-history""", """controllers.User.ratingHistory(name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/game/""" + "$" + """id<[^/]+>""", """controllers.Api.game(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/tournament""", """controllers.Api.currentTournaments"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/tournament/""" + "$" + """id<[^/]+>""", """controllers.Api.tournament(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/tournament/""" + "$" + """id<[^/]+>/games""", """controllers.Api.tournamentGames(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/tournament/""" + "$" + """id<[^/]+>/results""", """controllers.Api.tournamentResults(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/tournament""", """controllers.Tournament.apiCreate"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/simul""", """controllers.Simul.apiList"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/status""", """controllers.Api.status"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/users/status""", """controllers.Api.usersStatus"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/crosstable/""" + "$" + """u1<[^/]+>/""" + "$" + """u2<[^/]+>""", """controllers.Api.crosstable(u1:String, u2:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/stream/games-by-users""", """controllers.Api.gamesByUsersStream"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/stream/event""", """controllers.Api.eventStream"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/account""", """controllers.Account.apiMe"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/account/playing""", """controllers.Account.apiNowPlaying"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/account/email""", """controllers.Account.apiEmail"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/account/kid""", """controllers.Account.apiKid"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/account/kid""", """controllers.Account.apiKidPost"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/account/preferences""", """controllers.Pref.apiGet"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/challenge/""" + "$" + """user<[^/]+>""", """controllers.Challenge.apiCreate(user:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/challenge/""" + "$" + """id<\w{8}>/accept""", """controllers.Challenge.apiAccept(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/challenge/""" + "$" + """id<\w{8}>/decline""", """controllers.Challenge.apiDecline(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/games/user/""" + "$" + """username<[^/]+>""", """controllers.Game.apiExportByUser(username:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/user/""" + "$" + """name<[^/]+>/games""", """controllers.Api.userGames(name:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/bot/game/stream/""" + "$" + """id<[^/]+>""", """controllers.Bot.gameStream(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/bot/game/""" + "$" + """id<[^/]+>/move/""" + "$" + """uci<[^/]+>""", """controllers.Bot.move(id:String, uci:String, offeringDraw:Option[Boolean] ?= None)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """api/bot/""" + "$" + """cmd<.+>""", """controllers.Bot.command(cmd:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """player/bots""", """controllers.Bot.online"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/passwd""", """controllers.Account.passwd"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/passwd""", """controllers.Account.passwdApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/email""", """controllers.Account.email"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/email""", """controllers.Account.emailApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """contact/email-confirm/help""", """controllers.Account.emailConfirmHelp"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/email/confirm/""" + "$" + """token<[^/]+>""", """controllers.Account.emailConfirm(token:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/close""", """controllers.Account.close"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/closeConfirm""", """controllers.Account.closeConfirm"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/profile""", """controllers.Account.profile"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/profile""", """controllers.Account.profileApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/username""", """controllers.Account.username"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/username""", """controllers.Account.usernameApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/kid""", """controllers.Account.kid"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/kid""", """controllers.Account.kidPost"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/twofactor""", """controllers.Account.twoFactor"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/twofactor/setup""", """controllers.Account.setupTwoFactor"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/twofactor/disable""", """controllers.Account.disableTwoFactor"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/reopen""", """controllers.Account.reopen"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/reopen/send""", """controllers.Account.reopenApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/reopen/sent/""" + "$" + """email<[^/]+>""", """controllers.Account.reopenSent(email:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/reopen/login/""" + "$" + """token<[^/]+>""", """controllers.Account.reopenLogin(token:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/security""", """controllers.Account.security"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/signout/""" + "$" + """sessionId<[^/]+>""", """controllers.Account.signout(sessionId:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/info""", """controllers.Account.info"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/now-playing""", """controllers.Account.nowPlaying"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/token""", """controllers.OAuthToken.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/token/create""", """controllers.OAuthToken.create"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/token/create""", """controllers.OAuthToken.createApply"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/token/""" + "$" + """id<[^/]+>/delete""", """controllers.OAuthToken.delete(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/app""", """controllers.OAuthApp.index"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/app/create""", """controllers.OAuthApp.create"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/app/create""", """controllers.OAuthApp.createApply"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/app/""" + "$" + """id<[^/]+>/edit""", """controllers.OAuthApp.edit(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/app/""" + "$" + """id<[^/]+>/edit""", """controllers.OAuthApp.update(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """account/oauth/app/""" + "$" + """id<[^/]+>/delete""", """controllers.OAuthApp.delete(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """event/""" + "$" + """id<\w{8}>""", """controllers.Event.show(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """event/manager""", """controllers.Event.manager"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """event/manager/""" + "$" + """id<\w{8}>""", """controllers.Event.edit(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """event/manager/""" + "$" + """id<\w{8}>""", """controllers.Event.update(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """event/manager/clone/""" + "$" + """id<\w{8}>""", """controllers.Event.cloneE(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """event/manager/new""", """controllers.Event.form"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """event/manager""", """controllers.Event.create"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """captcha/""" + "$" + """id<\w{8}>""", """controllers.Main.captchaCheck(id:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """developers""", """controllers.Main.webmasters"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mobile""", """controllers.Main.mobile"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """lag""", """controllers.Main.lag"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """get-fishnet""", """controllers.Main.getFishnet"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """costs""", """controllers.Main.costs"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """verify-title""", """controllers.Main.verifyTitle"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """InstantChess.com""", """controllers.Main.instantChess"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """dev/cli""", """controllers.Dev.cli"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """dev/cli""", """controllers.Dev.cliPost"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """cli""", """controllers.Dev.command"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """dev/settings""", """controllers.Dev.settings"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """dev/settings/""" + "$" + """id<[^/]+>""", """controllers.Dev.settingsPost(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mobile/register/""" + "$" + """platform<[^/]+>/""" + "$" + """deviceId<[^/]+>""", """controllers.Push.mobileRegister(platform:String, deviceId:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """mobile/unregister""", """controllers.Push.mobileUnregister"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """push/subscribe""", """controllers.Push.webSubscribe"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """thanks""", """controllers.Page.thanks"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """terms-of-service""", """controllers.Page.tos"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """privacy""", """controllers.Page.privacy"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """contact""", """controllers.Main.contact"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """about""", """controllers.Page.about"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """faq""", """controllers.Main.faq"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """source""", """controllers.Page.source"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """qa""", """controllers.Main.movedPermanently(to:String = "/faq")"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """help""", """controllers.Main.movedPermanently(to:String = "/contact")"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """qa/""" + "$" + """id<[^/]+>/""" + "$" + """slug<[^/]+>""", """controllers.Main.legacyQaQuestion(id:Int, slug:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """how-to-cheat""", """controllers.Page.howToCheat"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """ads""", """controllers.Page.ads"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """variant""", """controllers.Page.variantHome"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """variant/""" + "$" + """key<[^/]+>""", """controllers.Page.variant(key:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """help/contribute""", """controllers.Page.help"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """help/master""", """controllers.Page.master"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """prismic-preview""", """controllers.Blog.preview(token:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """jslog/""" + "$" + """id<\w{12}>""", """controllers.Main.jslog(id:String)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """jsmon/""" + "$" + """event<[^/]+>""", """controllers.Main.jsmon(event:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """swag""", """controllers.Main.movedPermanently(to:String = "https://shop.spreadshirt.com/lichess-org")"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """assets/_""" + "$" + """v<\w{6}>/""" + "$" + """file<.+>""", """controllers.Main.devAsset(v:String, path:String = "public", file:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """assets/""" + "$" + """file<.+>""", """controllers.ExternalAssets.at(path:String = "public", file:String)"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """manifest.json""", """controllers.Main.manifest"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """robots.txt""", """controllers.Main.robots"""),
    ("""OPTIONS""", this.prefix, """controllers.Options.root"""),
    ("""OPTIONS""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """""" + "$" + """url<.+>""", """controllers.Options.all(url:String)"""),
    Nil
  ).foldLeft(List.empty[(String,String,String)]) { (s,e) => e.asInstanceOf[Any] match {
    case r @ (_,_,_) => s :+ r.asInstanceOf[(String,String,String)]
    case l => s ++ l.asInstanceOf[List[(String,String,String)]]
  }}


  // @LINE:2
  private[this] lazy val controllers_Main_toggleBlindMode0_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("toggle-blind-mode")))
  )
  private[this] lazy val controllers_Main_toggleBlindMode0_invoker = createInvoker(
    Main_13.toggleBlindMode,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "toggleBlindMode",
      Nil,
      "POST",
      this.prefix + """toggle-blind-mode""",
      """ Accessibility""",
      Seq()
    )
  )

  // @LINE:5
  private[this] lazy val controllers_Lobby_home1_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix)))
  )
  private[this] lazy val controllers_Lobby_home1_invoker = createInvoker(
    Lobby_51.home,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Lobby",
      "home",
      Nil,
      "GET",
      this.prefix + """""",
      """ Lobby""",
      Seq()
    )
  )

  // @LINE:6
  private[this] lazy val controllers_Lobby_seeks2_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("lobby/seeks")))
  )
  private[this] lazy val controllers_Lobby_seeks2_invoker = createInvoker(
    Lobby_51.seeks,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Lobby",
      "seeks",
      Nil,
      "GET",
      this.prefix + """lobby/seeks""",
      """""",
      Seq()
    )
  )

  // @LINE:9
  private[this] lazy val controllers_Timeline_home3_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("timeline")))
  )
  private[this] lazy val controllers_Timeline_home3_invoker = createInvoker(
    Timeline_11.home,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Timeline",
      "home",
      Nil,
      "GET",
      this.prefix + """timeline""",
      """ Timeline""",
      Seq()
    )
  )

  // @LINE:10
  private[this] lazy val controllers_Timeline_unsub4_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("timeline/unsub/"), DynamicPart("channel", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Timeline_unsub4_invoker = createInvoker(
    Timeline_11.unsub(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Timeline",
      "unsub",
      Seq(classOf[String]),
      "POST",
      this.prefix + """timeline/unsub/""" + "$" + """channel<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:13
  private[this] lazy val controllers_Search_index5_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("games/search")))
  )
  private[this] lazy val controllers_Search_index5_invoker = createInvoker(
    Search_39.index(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Search",
      "index",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """games/search""",
      """ Search""",
      Seq()
    )
  )

  // @LINE:16
  private[this] lazy val controllers_Game_exportByIds6_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("games/export/_ids")))
  )
  private[this] lazy val controllers_Game_exportByIds6_invoker = createInvoker(
    Game_5.exportByIds,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Game",
      "exportByIds",
      Nil,
      "POST",
      this.prefix + """games/export/_ids""",
      """ Game export""",
      Seq()
    )
  )

  // @LINE:17
  private[this] lazy val controllers_Game_exportByUser7_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("games/export/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Game_exportByUser7_invoker = createInvoker(
    Game_5.exportByUser(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Game",
      "exportByUser",
      Seq(classOf[String]),
      "GET",
      this.prefix + """games/export/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:20
  private[this] lazy val controllers_Tv_index8_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tv")))
  )
  private[this] lazy val controllers_Tv_index8_invoker = createInvoker(
    Tv_14.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "index",
      Nil,
      "GET",
      this.prefix + """tv""",
      """ TV""",
      Seq()
    )
  )

  // @LINE:21
  private[this] lazy val controllers_Tv_embed9_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tv/embed")))
  )
  private[this] lazy val controllers_Tv_embed9_invoker = createInvoker(
    Tv_14.embed,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "embed",
      Nil,
      "GET",
      this.prefix + """tv/embed""",
      """""",
      Seq()
    )
  )

  // @LINE:22
  private[this] lazy val controllers_Tv_frame10_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tv/frame")))
  )
  private[this] lazy val controllers_Tv_frame10_invoker = createInvoker(
    Tv_14.frame,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "frame",
      Nil,
      "GET",
      this.prefix + """tv/frame""",
      """""",
      Seq()
    )
  )

  // @LINE:23
  private[this] lazy val controllers_Tv_feed11_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tv/feed")))
  )
  private[this] lazy val controllers_Tv_feed11_invoker = createInvoker(
    Tv_14.feed,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "feed",
      Nil,
      "GET",
      this.prefix + """tv/feed""",
      """""",
      Seq()
    )
  )

  // @LINE:24
  private[this] lazy val controllers_Tv_channels12_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tv/channels")))
  )
  private[this] lazy val controllers_Tv_channels12_invoker = createInvoker(
    Tv_14.channels,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "channels",
      Nil,
      "GET",
      this.prefix + """tv/channels""",
      """""",
      Seq()
    )
  )

  // @LINE:25
  private[this] lazy val controllers_Tv_onChannel13_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tv/"), DynamicPart("chanKey", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tv_onChannel13_invoker = createInvoker(
    Tv_14.onChannel(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "onChannel",
      Seq(classOf[String]),
      "GET",
      this.prefix + """tv/""" + "$" + """chanKey<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:26
  private[this] lazy val controllers_Tv_sides14_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tv/"), DynamicPart("gameId", """\w{8}""",false), StaticPart("/"), DynamicPart("color", """white|black""",false), StaticPart("/sides")))
  )
  private[this] lazy val controllers_Tv_sides14_invoker = createInvoker(
    Tv_14.sides(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "sides",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """tv/""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>/sides""",
      """""",
      Seq()
    )
  )

  // @LINE:27
  private[this] lazy val controllers_Tv_games15_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("games")))
  )
  private[this] lazy val controllers_Tv_games15_invoker = createInvoker(
    Tv_14.games,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "games",
      Nil,
      "GET",
      this.prefix + """games""",
      """""",
      Seq()
    )
  )

  // @LINE:28
  private[this] lazy val controllers_Tv_gamesChannel16_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("games/"), DynamicPart("chanKey", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tv_gamesChannel16_invoker = createInvoker(
    Tv_14.gamesChannel(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tv",
      "gamesChannel",
      Seq(classOf[String]),
      "GET",
      this.prefix + """games/""" + "$" + """chanKey<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:31
  private[this] lazy val controllers_Relation_follow17_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("rel/follow/"), DynamicPart("userId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Relation_follow17_invoker = createInvoker(
    Relation_57.follow(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "follow",
      Seq(classOf[String]),
      "POST",
      this.prefix + """rel/follow/""" + "$" + """userId<[^/]+>""",
      """ Relation""",
      Seq()
    )
  )

  // @LINE:32
  private[this] lazy val controllers_Relation_unfollow18_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("rel/unfollow/"), DynamicPart("userId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Relation_unfollow18_invoker = createInvoker(
    Relation_57.unfollow(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "unfollow",
      Seq(classOf[String]),
      "POST",
      this.prefix + """rel/unfollow/""" + "$" + """userId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:33
  private[this] lazy val controllers_Relation_block19_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("rel/block/"), DynamicPart("userId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Relation_block19_invoker = createInvoker(
    Relation_57.block(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "block",
      Seq(classOf[String]),
      "POST",
      this.prefix + """rel/block/""" + "$" + """userId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:34
  private[this] lazy val controllers_Relation_unblock20_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("rel/unblock/"), DynamicPart("userId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Relation_unblock20_invoker = createInvoker(
    Relation_57.unblock(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "unblock",
      Seq(classOf[String]),
      "POST",
      this.prefix + """rel/unblock/""" + "$" + """userId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:35
  private[this] lazy val controllers_Relation_following21_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/following")))
  )
  private[this] lazy val controllers_Relation_following21_invoker = createInvoker(
    Relation_57.following(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "following",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/following""",
      """""",
      Seq()
    )
  )

  // @LINE:36
  private[this] lazy val controllers_Relation_followers22_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/followers")))
  )
  private[this] lazy val controllers_Relation_followers22_invoker = createInvoker(
    Relation_57.followers(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "followers",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/followers""",
      """""",
      Seq()
    )
  )

  // @LINE:37
  private[this] lazy val controllers_Relation_blocks23_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("rel/blocks")))
  )
  private[this] lazy val controllers_Relation_blocks23_invoker = createInvoker(
    Relation_57.blocks(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "blocks",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """rel/blocks""",
      """""",
      Seq()
    )
  )

  // @LINE:40
  private[this] lazy val controllers_Insight_refresh24_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("insights/refresh/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Insight_refresh24_invoker = createInvoker(
    Insight_0.refresh(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Insight",
      "refresh",
      Seq(classOf[String]),
      "POST",
      this.prefix + """insights/refresh/""" + "$" + """username<[^/]+>""",
      """ Insight""",
      Seq()
    )
  )

  // @LINE:41
  private[this] lazy val controllers_Insight_json25_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("insights/data/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Insight_json25_invoker = createInvoker(
    Insight_0.json(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Insight",
      "json",
      Seq(classOf[String]),
      "POST",
      this.prefix + """insights/data/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:42
  private[this] lazy val controllers_Insight_index26_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("insights/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Insight_index26_invoker = createInvoker(
    Insight_0.index(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Insight",
      "index",
      Seq(classOf[String]),
      "GET",
      this.prefix + """insights/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:43
  private[this] lazy val controllers_Insight_path27_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("insights/"), DynamicPart("username", """[^/]+""",true), StaticPart("/"), DynamicPart("metric", """[^/]+""",true), StaticPart("/"), DynamicPart("dimension", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Insight_path27_invoker = createInvoker(
    Insight_0.path(fakeValue[String], fakeValue[String], fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Insight",
      "path",
      Seq(classOf[String], classOf[String], classOf[String], classOf[String]),
      "GET",
      this.prefix + """insights/""" + "$" + """username<[^/]+>/""" + "$" + """metric<[^/]+>/""" + "$" + """dimension<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:44
  private[this] lazy val controllers_Insight_path28_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("insights/"), DynamicPart("username", """[^/]+""",true), StaticPart("/"), DynamicPart("metric", """[^/]+""",true), StaticPart("/"), DynamicPart("dimension", """[^/]+""",true), StaticPart("/"), DynamicPart("filters", """.+""",false)))
  )
  private[this] lazy val controllers_Insight_path28_invoker = createInvoker(
    Insight_0.path(fakeValue[String], fakeValue[String], fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Insight",
      "path",
      Seq(classOf[String], classOf[String], classOf[String], classOf[String]),
      "GET",
      this.prefix + """insights/""" + "$" + """username<[^/]+>/""" + "$" + """metric<[^/]+>/""" + "$" + """dimension<[^/]+>/""" + "$" + """filters<.+>""",
      """""",
      Seq()
    )
  )

  // @LINE:47
  private[this] lazy val controllers_UserTournament_path29_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/tournaments/"), DynamicPart("path", """[^/]+""",true)))
  )
  private[this] lazy val controllers_UserTournament_path29_invoker = createInvoker(
    UserTournament_42.path(fakeValue[String], fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.UserTournament",
      "path",
      Seq(classOf[String], classOf[String], classOf[Int]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/tournaments/""" + "$" + """path<[^/]+>""",
      """ User subpages""",
      Seq()
    )
  )

  // @LINE:50
  private[this] lazy val controllers_User_mod30_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/stream/"), DynamicPart("username", """[^/]+""",true), StaticPart("/mod")))
  )
  private[this] lazy val controllers_User_mod30_invoker = createInvoker(
    User_17.mod(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "mod",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/stream/""" + "$" + """username<[^/]+>/mod""",
      """ User""",
      Seq()
    )
  )

  // @LINE:51
  private[this] lazy val controllers_User_writeNote31_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/note")))
  )
  private[this] lazy val controllers_User_writeNote31_invoker = createInvoker(
    User_17.writeNote(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "writeNote",
      Seq(classOf[String]),
      "POST",
      this.prefix + """@/""" + "$" + """username<[^/]+>/note""",
      """""",
      Seq()
    )
  )

  // @LINE:52
  private[this] lazy val controllers_User_deleteNote32_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("note/delete/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_User_deleteNote32_invoker = createInvoker(
    User_17.deleteNote(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "deleteNote",
      Seq(classOf[String]),
      "POST",
      this.prefix + """note/delete/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:53
  private[this] lazy val controllers_User_showMini33_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/mini")))
  )
  private[this] lazy val controllers_User_showMini33_invoker = createInvoker(
    User_17.showMini(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "showMini",
      Seq(classOf[String]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/mini""",
      """""",
      Seq()
    )
  )

  // @LINE:54
  private[this] lazy val controllers_User_tv34_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/tv")))
  )
  private[this] lazy val controllers_User_tv34_invoker = createInvoker(
    User_17.tv(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "tv",
      Seq(classOf[String]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/tv""",
      """""",
      Seq()
    )
  )

  // @LINE:55
  private[this] lazy val controllers_User_studyTv35_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/studyTv")))
  )
  private[this] lazy val controllers_User_studyTv35_invoker = createInvoker(
    User_17.studyTv(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "studyTv",
      Seq(classOf[String]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/studyTv""",
      """""",
      Seq()
    )
  )

  // @LINE:56
  private[this] lazy val controllers_User_perfStat36_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/perf/"), DynamicPart("perfKey", """[^/]+""",true)))
  )
  private[this] lazy val controllers_User_perfStat36_invoker = createInvoker(
    User_17.perfStat(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "perfStat",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/perf/""" + "$" + """perfKey<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:57
  private[this] lazy val controllers_User_gamesAll37_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/all")))
  )
  private[this] lazy val controllers_User_gamesAll37_invoker = createInvoker(
    User_17.gamesAll(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "gamesAll",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/all""",
      """""",
      Seq()
    )
  )

  // @LINE:58
  private[this] lazy val controllers_User_games38_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true), StaticPart("/"), DynamicPart("filterName", """[^/]+""",true)))
  )
  private[this] lazy val controllers_User_games38_invoker = createInvoker(
    User_17.games(fakeValue[String], fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "games",
      Seq(classOf[String], classOf[String], classOf[Int]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>/""" + "$" + """filterName<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:59
  private[this] lazy val controllers_User_show39_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("@/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_User_show39_invoker = createInvoker(
    User_17.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """@/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:60
  private[this] lazy val controllers_User_myself40_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("player/myself")))
  )
  private[this] lazy val controllers_User_myself40_invoker = createInvoker(
    User_17.myself,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "myself",
      Nil,
      "GET",
      this.prefix + """player/myself""",
      """""",
      Seq()
    )
  )

  // @LINE:61
  private[this] lazy val controllers_User_opponents41_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("player/opponents")))
  )
  private[this] lazy val controllers_User_opponents41_invoker = createInvoker(
    User_17.opponents,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "opponents",
      Nil,
      "GET",
      this.prefix + """player/opponents""",
      """""",
      Seq()
    )
  )

  // @LINE:62
  private[this] lazy val controllers_User_list42_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("player")))
  )
  private[this] lazy val controllers_User_list42_invoker = createInvoker(
    User_17.list,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "list",
      Nil,
      "GET",
      this.prefix + """player""",
      """""",
      Seq()
    )
  )

  // @LINE:63
  private[this] lazy val controllers_User_topNb43_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("player/top/"), DynamicPart("nb", """[^/]+""",true), StaticPart("/"), DynamicPart("perfKey", """[^/]+""",true)))
  )
  private[this] lazy val controllers_User_topNb43_invoker = createInvoker(
    User_17.topNb(fakeValue[Int], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "topNb",
      Seq(classOf[Int], classOf[String]),
      "GET",
      this.prefix + """player/top/""" + "$" + """nb<[^/]+>/""" + "$" + """perfKey<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:64
  private[this] lazy val controllers_User_topWeek44_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("player/top/week")))
  )
  private[this] lazy val controllers_User_topWeek44_invoker = createInvoker(
    User_17.topWeek,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "topWeek",
      Nil,
      "GET",
      this.prefix + """player/top/week""",
      """""",
      Seq()
    )
  )

  // @LINE:65
  private[this] lazy val controllers_User_online45_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("player/online")))
  )
  private[this] lazy val controllers_User_online45_invoker = createInvoker(
    User_17.online,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "online",
      Nil,
      "GET",
      this.prefix + """player/online""",
      """""",
      Seq()
    )
  )

  // @LINE:66
  private[this] lazy val controllers_User_autocomplete46_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("player/autocomplete")))
  )
  private[this] lazy val controllers_User_autocomplete46_invoker = createInvoker(
    User_17.autocomplete,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "autocomplete",
      Nil,
      "GET",
      this.prefix + """player/autocomplete""",
      """""",
      Seq()
    )
  )

  // @LINE:68
  private[this] lazy val controllers_Dasher_get47_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("dasher")))
  )
  private[this] lazy val controllers_Dasher_get47_invoker = createInvoker(
    Dasher_18.get,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Dasher",
      "get",
      Nil,
      "GET",
      this.prefix + """dasher""",
      """""",
      Seq()
    )
  )

  // @LINE:71
  private[this] lazy val controllers_Blog_index48_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("blog")))
  )
  private[this] lazy val controllers_Blog_index48_invoker = createInvoker(
    Blog_33.index(fakeValue[Int], fakeValue[Option[String]]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Blog",
      "index",
      Seq(classOf[Int], classOf[Option[String]]),
      "GET",
      this.prefix + """blog""",
      """ Blog""",
      Seq()
    )
  )

  // @LINE:72
  private[this] lazy val controllers_Blog_all49_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("blog/all")))
  )
  private[this] lazy val controllers_Blog_all49_invoker = createInvoker(
    Blog_33.all,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Blog",
      "all",
      Nil,
      "GET",
      this.prefix + """blog/all""",
      """""",
      Seq()
    )
  )

  // @LINE:73
  private[this] lazy val controllers_Blog_year50_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("blog/"), DynamicPart("year", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Blog_year50_invoker = createInvoker(
    Blog_33.year(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Blog",
      "year",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """blog/""" + "$" + """year<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:74
  private[this] lazy val controllers_Blog_discuss51_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("blog/discuss/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Blog_discuss51_invoker = createInvoker(
    Blog_33.discuss(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Blog",
      "discuss",
      Seq(classOf[String]),
      "GET",
      this.prefix + """blog/discuss/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:75
  private[this] lazy val controllers_Blog_show52_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("blog/"), DynamicPart("id", """[^/]+""",true), StaticPart("/"), DynamicPart("slug", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Blog_show52_invoker = createInvoker(
    Blog_33.show(fakeValue[String], fakeValue[String], fakeValue[Option[String]]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Blog",
      "show",
      Seq(classOf[String], classOf[String], classOf[Option[String]]),
      "GET",
      this.prefix + """blog/""" + "$" + """id<[^/]+>/""" + "$" + """slug<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:76
  private[this] lazy val controllers_Blog_atom53_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("blog.atom")))
  )
  private[this] lazy val controllers_Blog_atom53_invoker = createInvoker(
    Blog_33.atom,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Blog",
      "atom",
      Nil,
      "GET",
      this.prefix + """blog.atom""",
      """""",
      Seq()
    )
  )

  // @LINE:79
  private[this] lazy val controllers_Coordinate_home54_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/coordinate")))
  )
  private[this] lazy val controllers_Coordinate_home54_invoker = createInvoker(
    Coordinate_3.home,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coordinate",
      "home",
      Nil,
      "GET",
      this.prefix + """training/coordinate""",
      """ Training - Coordinate""",
      Seq()
    )
  )

  // @LINE:80
  private[this] lazy val controllers_Coordinate_score55_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/coordinate/score")))
  )
  private[this] lazy val controllers_Coordinate_score55_invoker = createInvoker(
    Coordinate_3.score,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coordinate",
      "score",
      Nil,
      "POST",
      this.prefix + """training/coordinate/score""",
      """""",
      Seq()
    )
  )

  // @LINE:81
  private[this] lazy val controllers_Coordinate_color56_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/coordinate/color")))
  )
  private[this] lazy val controllers_Coordinate_color56_invoker = createInvoker(
    Coordinate_3.color,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coordinate",
      "color",
      Nil,
      "POST",
      this.prefix + """training/coordinate/color""",
      """""",
      Seq()
    )
  )

  // @LINE:84
  private[this] lazy val controllers_Puzzle_home57_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training")))
  )
  private[this] lazy val controllers_Puzzle_home57_invoker = createInvoker(
    Puzzle_44.home,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "home",
      Nil,
      "GET",
      this.prefix + """training""",
      """ Training - Puzzle""",
      Seq()
    )
  )

  // @LINE:85
  private[this] lazy val controllers_Puzzle_newPuzzle58_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/new")))
  )
  private[this] lazy val controllers_Puzzle_newPuzzle58_invoker = createInvoker(
    Puzzle_44.newPuzzle,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "newPuzzle",
      Nil,
      "GET",
      this.prefix + """training/new""",
      """""",
      Seq()
    )
  )

  // @LINE:86
  private[this] lazy val controllers_Puzzle_daily59_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/daily")))
  )
  private[this] lazy val controllers_Puzzle_daily59_invoker = createInvoker(
    Puzzle_44.daily,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "daily",
      Nil,
      "GET",
      this.prefix + """training/daily""",
      """""",
      Seq()
    )
  )

  // @LINE:87
  private[this] lazy val controllers_Puzzle_embed60_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/embed")))
  )
  private[this] lazy val controllers_Puzzle_embed60_invoker = createInvoker(
    Puzzle_44.embed,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "embed",
      Nil,
      "GET",
      this.prefix + """training/embed""",
      """""",
      Seq()
    )
  )

  // @LINE:88
  private[this] lazy val controllers_Puzzle_frame61_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/frame")))
  )
  private[this] lazy val controllers_Puzzle_frame61_invoker = createInvoker(
    Puzzle_44.frame,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "frame",
      Nil,
      "GET",
      this.prefix + """training/frame""",
      """""",
      Seq()
    )
  )

  // @LINE:89
  private[this] lazy val controllers_Export_puzzlePng62_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/export/png/"), DynamicPart("id", """[^/]+""",true), StaticPart(".png")))
  )
  private[this] lazy val controllers_Export_puzzlePng62_invoker = createInvoker(
    Export_16.puzzlePng(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Export",
      "puzzlePng",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """training/export/png/""" + "$" + """id<[^/]+>.png""",
      """""",
      Seq()
    )
  )

  // @LINE:90
  private[this] lazy val controllers_Puzzle_batchSelect63_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/batch")))
  )
  private[this] lazy val controllers_Puzzle_batchSelect63_invoker = createInvoker(
    Puzzle_44.batchSelect,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "batchSelect",
      Nil,
      "GET",
      this.prefix + """training/batch""",
      """""",
      Seq()
    )
  )

  // @LINE:91
  private[this] lazy val controllers_Puzzle_batchSolve64_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/batch")))
  )
  private[this] lazy val controllers_Puzzle_batchSolve64_invoker = createInvoker(
    Puzzle_44.batchSolve,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "batchSolve",
      Nil,
      "POST",
      this.prefix + """training/batch""",
      """""",
      Seq()
    )
  )

  // @LINE:92
  private[this] lazy val controllers_Puzzle_show65_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Puzzle_show65_invoker = createInvoker(
    Puzzle_44.show(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "show",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """training/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:93
  private[this] lazy val controllers_Puzzle_load66_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/"), DynamicPart("id", """[^/]+""",true), StaticPart("/load")))
  )
  private[this] lazy val controllers_Puzzle_load66_invoker = createInvoker(
    Puzzle_44.load(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "load",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """training/""" + "$" + """id<[^/]+>/load""",
      """""",
      Seq()
    )
  )

  // @LINE:94
  private[this] lazy val controllers_Puzzle_vote67_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/"), DynamicPart("id", """[^/]+""",true), StaticPart("/vote")))
  )
  private[this] lazy val controllers_Puzzle_vote67_invoker = createInvoker(
    Puzzle_44.vote(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "vote",
      Seq(classOf[Int]),
      "POST",
      this.prefix + """training/""" + "$" + """id<[^/]+>/vote""",
      """""",
      Seq()
    )
  )

  // @LINE:95
  private[this] lazy val controllers_Puzzle_round68_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/"), DynamicPart("id", """[^/]+""",true), StaticPart("/round")))
  )
  private[this] lazy val controllers_Puzzle_round68_invoker = createInvoker(
    Puzzle_44.round(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "round",
      Seq(classOf[Int]),
      "POST",
      this.prefix + """training/""" + "$" + """id<[^/]+>/round""",
      """""",
      Seq()
    )
  )

  // @LINE:97
  private[this] lazy val controllers_Puzzle_round269_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/"), DynamicPart("id", """[^/]+""",true), StaticPart("/round2")))
  )
  private[this] lazy val controllers_Puzzle_round269_invoker = createInvoker(
    Puzzle_44.round2(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "round2",
      Seq(classOf[Int]),
      "POST",
      this.prefix + """training/""" + "$" + """id<[^/]+>/round2""",
      """ new UI""",
      Seq()
    )
  )

  // @LINE:99
  private[this] lazy val controllers_Puzzle_round70_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("training/"), DynamicPart("id", """[^/]+""",true), StaticPart("/attempt")))
  )
  private[this] lazy val controllers_Puzzle_round70_invoker = createInvoker(
    Puzzle_44.round(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "round",
      Seq(classOf[Int]),
      "POST",
      this.prefix + """training/""" + "$" + """id<[^/]+>/attempt""",
      """ mobile app BC""",
      Seq()
    )
  )

  // @LINE:102
  private[this] lazy val controllers_UserAnalysis_help71_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("analysis/help")))
  )
  private[this] lazy val controllers_UserAnalysis_help71_invoker = createInvoker(
    UserAnalysis_35.help,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.UserAnalysis",
      "help",
      Nil,
      "GET",
      this.prefix + """analysis/help""",
      """ User Analysis""",
      Seq()
    )
  )

  // @LINE:103
  private[this] lazy val controllers_UserAnalysis_parseArg72_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("analysis/"), DynamicPart("something", """.+""",false)))
  )
  private[this] lazy val controllers_UserAnalysis_parseArg72_invoker = createInvoker(
    UserAnalysis_35.parseArg(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.UserAnalysis",
      "parseArg",
      Seq(classOf[String]),
      "GET",
      this.prefix + """analysis/""" + "$" + """something<.+>""",
      """""",
      Seq()
    )
  )

  // @LINE:104
  private[this] lazy val controllers_UserAnalysis_index73_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("analysis")))
  )
  private[this] lazy val controllers_UserAnalysis_index73_invoker = createInvoker(
    UserAnalysis_35.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.UserAnalysis",
      "index",
      Nil,
      "GET",
      this.prefix + """analysis""",
      """""",
      Seq()
    )
  )

  // @LINE:105
  private[this] lazy val controllers_UserAnalysis_pgn74_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("analysis/pgn")))
  )
  private[this] lazy val controllers_UserAnalysis_pgn74_invoker = createInvoker(
    UserAnalysis_35.pgn,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.UserAnalysis",
      "pgn",
      Nil,
      "POST",
      this.prefix + """analysis/pgn""",
      """""",
      Seq()
    )
  )

  // @LINE:108
  private[this] lazy val controllers_Study_allDefault75_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study")))
  )
  private[this] lazy val controllers_Study_allDefault75_invoker = createInvoker(
    Study_55.allDefault(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "allDefault",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """study""",
      """ Study""",
      Seq()
    )
  )

  // @LINE:109
  private[this] lazy val controllers_Study_all76_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/all/"), DynamicPart("order", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Study_all76_invoker = createInvoker(
    Study_55.all(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "all",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/all/""" + "$" + """order<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:110
  private[this] lazy val controllers_Study_mine77_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/mine/"), DynamicPart("order", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Study_mine77_invoker = createInvoker(
    Study_55.mine(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "mine",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/mine/""" + "$" + """order<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:111
  private[this] lazy val controllers_Study_mineMember78_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/member/"), DynamicPart("order", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Study_mineMember78_invoker = createInvoker(
    Study_55.mineMember(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "mineMember",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/member/""" + "$" + """order<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:112
  private[this] lazy val controllers_Study_minePublic79_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/public/"), DynamicPart("order", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Study_minePublic79_invoker = createInvoker(
    Study_55.minePublic(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "minePublic",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/public/""" + "$" + """order<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:113
  private[this] lazy val controllers_Study_minePrivate80_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/private/"), DynamicPart("order", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Study_minePrivate80_invoker = createInvoker(
    Study_55.minePrivate(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "minePrivate",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/private/""" + "$" + """order<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:114
  private[this] lazy val controllers_Study_mineLikes81_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/likes/"), DynamicPart("order", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Study_mineLikes81_invoker = createInvoker(
    Study_55.mineLikes(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "mineLikes",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/likes/""" + "$" + """order<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:115
  private[this] lazy val controllers_Study_byOwnerDefault82_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/by/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Study_byOwnerDefault82_invoker = createInvoker(
    Study_55.byOwnerDefault(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "byOwnerDefault",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/by/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:116
  private[this] lazy val controllers_Study_byOwner83_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/by/"), DynamicPart("username", """[^/]+""",true), StaticPart("/"), DynamicPart("order", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Study_byOwner83_invoker = createInvoker(
    Study_55.byOwner(fakeValue[String], fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "byOwner",
      Seq(classOf[String], classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/by/""" + "$" + """username<[^/]+>/""" + "$" + """order<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:117
  private[this] lazy val controllers_Study_search84_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/search")))
  )
  private[this] lazy val controllers_Study_search84_invoker = createInvoker(
    Study_55.search(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "search",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/search""",
      """""",
      Seq()
    )
  )

  // @LINE:118
  private[this] lazy val controllers_Study_show85_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Study_show85_invoker = createInvoker(
    Study_55.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """study/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:119
  private[this] lazy val controllers_Study_create86_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study")))
  )
  private[this] lazy val controllers_Study_create86_invoker = createInvoker(
    Study_55.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "create",
      Nil,
      "POST",
      this.prefix + """study""",
      """""",
      Seq()
    )
  )

  // @LINE:120
  private[this] lazy val controllers_Study_createAs87_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/as")))
  )
  private[this] lazy val controllers_Study_createAs87_invoker = createInvoker(
    Study_55.createAs,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "createAs",
      Nil,
      "POST",
      this.prefix + """study/as""",
      """""",
      Seq()
    )
  )

  // @LINE:121
  private[this] lazy val controllers_Study_pgn88_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart(".pgn")))
  )
  private[this] lazy val controllers_Study_pgn88_invoker = createInvoker(
    Study_55.pgn(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "pgn",
      Seq(classOf[String]),
      "GET",
      this.prefix + """study/""" + "$" + """id<\w{8}>.pgn""",
      """""",
      Seq()
    )
  )

  // @LINE:122
  private[this] lazy val controllers_Study_chapterPgn89_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/"), DynamicPart("chapterId", """\w{8}""",false), StaticPart(".pgn")))
  )
  private[this] lazy val controllers_Study_chapterPgn89_invoker = createInvoker(
    Study_55.chapterPgn(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "chapterPgn",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """study/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>.pgn""",
      """""",
      Seq()
    )
  )

  // @LINE:123
  private[this] lazy val controllers_Study_delete90_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/delete")))
  )
  private[this] lazy val controllers_Study_delete90_invoker = createInvoker(
    Study_55.delete(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "delete",
      Seq(classOf[String]),
      "POST",
      this.prefix + """study/""" + "$" + """id<\w{8}>/delete""",
      """""",
      Seq()
    )
  )

  // @LINE:124
  private[this] lazy val controllers_Study_cloneStudy91_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/clone")))
  )
  private[this] lazy val controllers_Study_cloneStudy91_invoker = createInvoker(
    Study_55.cloneStudy(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "cloneStudy",
      Seq(classOf[String]),
      "GET",
      this.prefix + """study/""" + "$" + """id<\w{8}>/clone""",
      """""",
      Seq()
    )
  )

  // @LINE:125
  private[this] lazy val controllers_Study_cloneApply92_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/cloneAplly")))
  )
  private[this] lazy val controllers_Study_cloneApply92_invoker = createInvoker(
    Study_55.cloneApply(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "cloneApply",
      Seq(classOf[String]),
      "POST",
      this.prefix + """study/""" + "$" + """id<\w{8}>/cloneAplly""",
      """""",
      Seq()
    )
  )

  // @LINE:126
  private[this] lazy val controllers_Study_chapter93_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/"), DynamicPart("chapterId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Study_chapter93_invoker = createInvoker(
    Study_55.chapter(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "chapter",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """study/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:127
  private[this] lazy val controllers_Study_chapterMeta94_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/"), DynamicPart("chapterId", """\w{8}""",false), StaticPart("/meta")))
  )
  private[this] lazy val controllers_Study_chapterMeta94_invoker = createInvoker(
    Study_55.chapterMeta(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "chapterMeta",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """study/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>/meta""",
      """""",
      Seq()
    )
  )

  // @LINE:128
  private[this] lazy val controllers_Study_embed95_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/embed/"), DynamicPart("id", """\w{8}""",false), StaticPart("/"), DynamicPart("chapterId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Study_embed95_invoker = createInvoker(
    Study_55.embed(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "embed",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """study/embed/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:129
  private[this] lazy val controllers_Study_clearChat96_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/clear-chat")))
  )
  private[this] lazy val controllers_Study_clearChat96_invoker = createInvoker(
    Study_55.clearChat(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "clearChat",
      Seq(classOf[String]),
      "POST",
      this.prefix + """study/""" + "$" + """id<\w{8}>/clear-chat""",
      """""",
      Seq()
    )
  )

  // @LINE:130
  private[this] lazy val controllers_Study_importPgn97_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/import-pgn")))
  )
  private[this] lazy val controllers_Study_importPgn97_invoker = createInvoker(
    Study_55.importPgn(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "importPgn",
      Seq(classOf[String]),
      "POST",
      this.prefix + """study/""" + "$" + """id<\w{8}>/import-pgn""",
      """""",
      Seq()
    )
  )

  // @LINE:131
  private[this] lazy val controllers_Study_multiBoard98_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("study/"), DynamicPart("id", """\w{8}""",false), StaticPart("/multi-board")))
  )
  private[this] lazy val controllers_Study_multiBoard98_invoker = createInvoker(
    Study_55.multiBoard(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Study",
      "multiBoard",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """study/""" + "$" + """id<\w{8}>/multi-board""",
      """""",
      Seq()
    )
  )

  // @LINE:134
  private[this] lazy val controllers_Relay_index99_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast")))
  )
  private[this] lazy val controllers_Relay_index99_invoker = createInvoker(
    Relay_23.index(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "index",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """broadcast""",
      """ Relay""",
      Seq()
    )
  )

  // @LINE:135
  private[this] lazy val controllers_Relay_form100_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/new")))
  )
  private[this] lazy val controllers_Relay_form100_invoker = createInvoker(
    Relay_23.form,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "form",
      Nil,
      "GET",
      this.prefix + """broadcast/new""",
      """""",
      Seq()
    )
  )

  // @LINE:136
  private[this] lazy val controllers_Relay_create101_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/new")))
  )
  private[this] lazy val controllers_Relay_create101_invoker = createInvoker(
    Relay_23.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "create",
      Nil,
      "POST",
      this.prefix + """broadcast/new""",
      """""",
      Seq()
    )
  )

  // @LINE:137
  private[this] lazy val controllers_Relay_show102_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Relay_show102_invoker = createInvoker(
    Relay_23.show(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "show",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:138
  private[this] lazy val controllers_Relay_chapter103_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/"), DynamicPart("id", """\w{8}""",false), StaticPart("/"), DynamicPart("chapterId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Relay_chapter103_invoker = createInvoker(
    Relay_23.chapter(fakeValue[String], fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "chapter",
      Seq(classOf[String], classOf[String], classOf[String]),
      "GET",
      this.prefix + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/""" + "$" + """chapterId<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:139
  private[this] lazy val controllers_Relay_edit104_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/"), DynamicPart("id", """\w{8}""",false), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Relay_edit104_invoker = createInvoker(
    Relay_23.edit(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "edit",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:140
  private[this] lazy val controllers_Relay_update105_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/"), DynamicPart("id", """\w{8}""",false), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Relay_update105_invoker = createInvoker(
    Relay_23.update(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "update",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:141
  private[this] lazy val controllers_Relay_reset106_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/"), DynamicPart("id", """\w{8}""",false), StaticPart("/reset")))
  )
  private[this] lazy val controllers_Relay_reset106_invoker = createInvoker(
    Relay_23.reset(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "reset",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/reset""",
      """""",
      Seq()
    )
  )

  // @LINE:142
  private[this] lazy val controllers_Relay_cloneRelay107_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/"), DynamicPart("id", """\w{8}""",false), StaticPart("/clone")))
  )
  private[this] lazy val controllers_Relay_cloneRelay107_invoker = createInvoker(
    Relay_23.cloneRelay(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "cloneRelay",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/clone""",
      """""",
      Seq()
    )
  )

  // @LINE:143
  private[this] lazy val controllers_Relay_push108_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("broadcast/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/"), DynamicPart("id", """\w{8}""",false), StaticPart("/push")))
  )
  private[this] lazy val controllers_Relay_push108_invoker = createInvoker(
    Relay_23.push(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relay",
      "push",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """broadcast/""" + "$" + """slug<[^/]+>/""" + "$" + """id<\w{8}>/push""",
      """""",
      Seq()
    )
  )

  // @LINE:146
  private[this] lazy val controllers_Learn_index109_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("learn")))
  )
  private[this] lazy val controllers_Learn_index109_invoker = createInvoker(
    Learn_36.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Learn",
      "index",
      Nil,
      "GET",
      this.prefix + """learn""",
      """ Learn""",
      Seq()
    )
  )

  // @LINE:147
  private[this] lazy val controllers_Learn_score110_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("learn/score")))
  )
  private[this] lazy val controllers_Learn_score110_invoker = createInvoker(
    Learn_36.score,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Learn",
      "score",
      Nil,
      "POST",
      this.prefix + """learn/score""",
      """""",
      Seq()
    )
  )

  // @LINE:148
  private[this] lazy val controllers_Learn_reset111_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("learn/reset")))
  )
  private[this] lazy val controllers_Learn_reset111_invoker = createInvoker(
    Learn_36.reset,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Learn",
      "reset",
      Nil,
      "POST",
      this.prefix + """learn/reset""",
      """""",
      Seq()
    )
  )

  // @LINE:151
  private[this] lazy val controllers_Plan_index112_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("patron")))
  )
  private[this] lazy val controllers_Plan_index112_invoker = createInvoker(
    Plan_37.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "index",
      Nil,
      "GET",
      this.prefix + """patron""",
      """ Patron""",
      Seq()
    )
  )

  // @LINE:152
  private[this] lazy val controllers_Plan_thanks113_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("patron/thanks")))
  )
  private[this] lazy val controllers_Plan_thanks113_invoker = createInvoker(
    Plan_37.thanks,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "thanks",
      Nil,
      "GET",
      this.prefix + """patron/thanks""",
      """""",
      Seq()
    )
  )

  // @LINE:153
  private[this] lazy val controllers_Plan_list114_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("patron/list")))
  )
  private[this] lazy val controllers_Plan_list114_invoker = createInvoker(
    Plan_37.list,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "list",
      Nil,
      "GET",
      this.prefix + """patron/list""",
      """""",
      Seq()
    )
  )

  // @LINE:154
  private[this] lazy val controllers_Plan_switch115_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("patron/switch")))
  )
  private[this] lazy val controllers_Plan_switch115_invoker = createInvoker(
    Plan_37.switch,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "switch",
      Nil,
      "POST",
      this.prefix + """patron/switch""",
      """""",
      Seq()
    )
  )

  // @LINE:155
  private[this] lazy val controllers_Plan_cancel116_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("patron/cancel")))
  )
  private[this] lazy val controllers_Plan_cancel116_invoker = createInvoker(
    Plan_37.cancel,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "cancel",
      Nil,
      "POST",
      this.prefix + """patron/cancel""",
      """""",
      Seq()
    )
  )

  // @LINE:156
  private[this] lazy val controllers_Plan_webhook117_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("patron/webhook")))
  )
  private[this] lazy val controllers_Plan_webhook117_invoker = createInvoker(
    Plan_37.webhook,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "webhook",
      Nil,
      "POST",
      this.prefix + """patron/webhook""",
      """""",
      Seq()
    )
  )

  // @LINE:157
  private[this] lazy val controllers_Plan_stripeCheckout118_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("patron/stripe-checkout")))
  )
  private[this] lazy val controllers_Plan_stripeCheckout118_invoker = createInvoker(
    Plan_37.stripeCheckout,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "stripeCheckout",
      Nil,
      "POST",
      this.prefix + """patron/stripe-checkout""",
      """""",
      Seq()
    )
  )

  // @LINE:158
  private[this] lazy val controllers_Plan_payPalIpn119_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("patron/ipn")))
  )
  private[this] lazy val controllers_Plan_payPalIpn119_invoker = createInvoker(
    Plan_37.payPalIpn,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "payPalIpn",
      Nil,
      "POST",
      this.prefix + """patron/ipn""",
      """""",
      Seq()
    )
  )

  // @LINE:159
  private[this] lazy val controllers_Plan_features120_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("features")))
  )
  private[this] lazy val controllers_Plan_features120_invoker = createInvoker(
    Plan_37.features,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Plan",
      "features",
      Nil,
      "GET",
      this.prefix + """features""",
      """""",
      Seq()
    )
  )

  // @LINE:162
  private[this] lazy val controllers_Practice_index121_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice")))
  )
  private[this] lazy val controllers_Practice_index121_invoker = createInvoker(
    Practice_34.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "index",
      Nil,
      "GET",
      this.prefix + """practice""",
      """ Practice""",
      Seq()
    )
  )

  // @LINE:163
  private[this] lazy val controllers_Practice_chapter122_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/load/"), DynamicPart("studyId", """[^/]+""",true), StaticPart("/"), DynamicPart("chapterId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Practice_chapter122_invoker = createInvoker(
    Practice_34.chapter(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "chapter",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """practice/load/""" + "$" + """studyId<[^/]+>/""" + "$" + """chapterId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:164
  private[this] lazy val controllers_Practice_config123_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/config")))
  )
  private[this] lazy val controllers_Practice_config123_invoker = createInvoker(
    Practice_34.config,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "config",
      Nil,
      "GET",
      this.prefix + """practice/config""",
      """""",
      Seq()
    )
  )

  // @LINE:165
  private[this] lazy val controllers_Practice_configSave124_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/config")))
  )
  private[this] lazy val controllers_Practice_configSave124_invoker = createInvoker(
    Practice_34.configSave,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "configSave",
      Nil,
      "POST",
      this.prefix + """practice/config""",
      """""",
      Seq()
    )
  )

  // @LINE:166
  private[this] lazy val controllers_Practice_reset125_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/reset")))
  )
  private[this] lazy val controllers_Practice_reset125_invoker = createInvoker(
    Practice_34.reset,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "reset",
      Nil,
      "POST",
      this.prefix + """practice/reset""",
      """""",
      Seq()
    )
  )

  // @LINE:167
  private[this] lazy val controllers_Practice_showSection126_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/"), DynamicPart("sectionId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Practice_showSection126_invoker = createInvoker(
    Practice_34.showSection(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "showSection",
      Seq(classOf[String]),
      "GET",
      this.prefix + """practice/""" + "$" + """sectionId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:168
  private[this] lazy val controllers_Practice_showStudySlug127_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/"), DynamicPart("sectionId", """[^/]+""",true), StaticPart("/"), DynamicPart("studySlug", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Practice_showStudySlug127_invoker = createInvoker(
    Practice_34.showStudySlug(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "showStudySlug",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """practice/""" + "$" + """sectionId<[^/]+>/""" + "$" + """studySlug<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:169
  private[this] lazy val controllers_Practice_show128_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/"), DynamicPart("sectionId", """[^/]+""",true), StaticPart("/"), DynamicPart("studySlug", """[^/]+""",true), StaticPart("/"), DynamicPart("studyId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Practice_show128_invoker = createInvoker(
    Practice_34.show(fakeValue[String], fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "show",
      Seq(classOf[String], classOf[String], classOf[String]),
      "GET",
      this.prefix + """practice/""" + "$" + """sectionId<[^/]+>/""" + "$" + """studySlug<[^/]+>/""" + "$" + """studyId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:170
  private[this] lazy val controllers_Practice_showChapter129_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/"), DynamicPart("sectionId", """[^/]+""",true), StaticPart("/"), DynamicPart("studySlug", """[^/]+""",true), StaticPart("/"), DynamicPart("studyId", """[^/]+""",true), StaticPart("/"), DynamicPart("chapterId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Practice_showChapter129_invoker = createInvoker(
    Practice_34.showChapter(fakeValue[String], fakeValue[String], fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "showChapter",
      Seq(classOf[String], classOf[String], classOf[String], classOf[String]),
      "GET",
      this.prefix + """practice/""" + "$" + """sectionId<[^/]+>/""" + "$" + """studySlug<[^/]+>/""" + "$" + """studyId<[^/]+>/""" + "$" + """chapterId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:171
  private[this] lazy val controllers_Practice_complete130_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("practice/complete/"), DynamicPart("chapterId", """[^/]+""",true), StaticPart("/"), DynamicPart("moves", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Practice_complete130_invoker = createInvoker(
    Practice_34.complete(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Practice",
      "complete",
      Seq(classOf[String], classOf[Int]),
      "POST",
      this.prefix + """practice/complete/""" + "$" + """chapterId<[^/]+>/""" + "$" + """moves<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:174
  private[this] lazy val controllers_Streamer_index131_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer")))
  )
  private[this] lazy val controllers_Streamer_index131_invoker = createInvoker(
    Streamer_20.index(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "index",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """streamer""",
      """ Streamer""",
      Seq()
    )
  )

  // @LINE:175
  private[this] lazy val controllers_Streamer_live132_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/live")))
  )
  private[this] lazy val controllers_Streamer_live132_invoker = createInvoker(
    Streamer_20.live,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "live",
      Nil,
      "GET",
      this.prefix + """streamer/live""",
      """""",
      Seq()
    )
  )

  // @LINE:176
  private[this] lazy val controllers_Streamer_edit133_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/edit")))
  )
  private[this] lazy val controllers_Streamer_edit133_invoker = createInvoker(
    Streamer_20.edit,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "edit",
      Nil,
      "GET",
      this.prefix + """streamer/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:177
  private[this] lazy val controllers_Streamer_create134_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/new")))
  )
  private[this] lazy val controllers_Streamer_create134_invoker = createInvoker(
    Streamer_20.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "create",
      Nil,
      "POST",
      this.prefix + """streamer/new""",
      """""",
      Seq()
    )
  )

  // @LINE:178
  private[this] lazy val controllers_Streamer_editApply135_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/edit")))
  )
  private[this] lazy val controllers_Streamer_editApply135_invoker = createInvoker(
    Streamer_20.editApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "editApply",
      Nil,
      "POST",
      this.prefix + """streamer/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:179
  private[this] lazy val controllers_Streamer_approvalRequest136_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/approval/request")))
  )
  private[this] lazy val controllers_Streamer_approvalRequest136_invoker = createInvoker(
    Streamer_20.approvalRequest,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "approvalRequest",
      Nil,
      "POST",
      this.prefix + """streamer/approval/request""",
      """""",
      Seq()
    )
  )

  // @LINE:180
  private[this] lazy val controllers_Streamer_picture137_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/picture/edit")))
  )
  private[this] lazy val controllers_Streamer_picture137_invoker = createInvoker(
    Streamer_20.picture,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "picture",
      Nil,
      "GET",
      this.prefix + """streamer/picture/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:181
  private[this] lazy val controllers_Streamer_pictureApply138_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/picture/upload")))
  )
  private[this] lazy val controllers_Streamer_pictureApply138_invoker = createInvoker(
    Streamer_20.pictureApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "pictureApply",
      Nil,
      "POST",
      this.prefix + """streamer/picture/upload""",
      """""",
      Seq()
    )
  )

  // @LINE:182
  private[this] lazy val controllers_Streamer_pictureDelete139_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/picture/delete")))
  )
  private[this] lazy val controllers_Streamer_pictureDelete139_invoker = createInvoker(
    Streamer_20.pictureDelete,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "pictureDelete",
      Nil,
      "POST",
      this.prefix + """streamer/picture/delete""",
      """""",
      Seq()
    )
  )

  // @LINE:183
  private[this] lazy val controllers_Streamer_show140_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("streamer/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Streamer_show140_invoker = createInvoker(
    Streamer_20.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Streamer",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """streamer/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:186
  private[this] lazy val controllers_Round_watcher141_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Round_watcher141_invoker = createInvoker(
    Round_27.watcher(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "watcher",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>""",
      """ Round""",
      Seq()
    )
  )

  // @LINE:187
  private[this] lazy val controllers_Round_watcher142_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/"), DynamicPart("color", """white|black""",false)))
  )
  private[this] lazy val controllers_Round_watcher142_invoker = createInvoker(
    Round_27.watcher(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "watcher",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>""",
      """""",
      Seq()
    )
  )

  // @LINE:188
  private[this] lazy val controllers_Round_player143_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("fullId", """\w{12}""",false)))
  )
  private[this] lazy val controllers_Round_player143_invoker = createInvoker(
    Round_27.player(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "player",
      Seq(classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """fullId<\w{12}>""",
      """""",
      Seq()
    )
  )

  // @LINE:189
  private[this] lazy val controllers_Round_sides144_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/"), DynamicPart("color", """white|black""",false), StaticPart("/sides")))
  )
  private[this] lazy val controllers_Round_sides144_invoker = createInvoker(
    Round_27.sides(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "sides",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>/sides""",
      """""",
      Seq()
    )
  )

  // @LINE:190
  private[this] lazy val controllers_Round_continue145_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/continue/"), DynamicPart("mode", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Round_continue145_invoker = createInvoker(
    Round_27.continue(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "continue",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>/continue/""" + "$" + """mode<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:191
  private[this] lazy val controllers_Round_readNote146_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/note")))
  )
  private[this] lazy val controllers_Round_readNote146_invoker = createInvoker(
    Round_27.readNote(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "readNote",
      Seq(classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>/note""",
      """""",
      Seq()
    )
  )

  // @LINE:192
  private[this] lazy val controllers_Round_writeNote147_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/note")))
  )
  private[this] lazy val controllers_Round_writeNote147_invoker = createInvoker(
    Round_27.writeNote(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "writeNote",
      Seq(classOf[String]),
      "POST",
      this.prefix + """""" + "$" + """gameId<\w{8}>/note""",
      """""",
      Seq()
    )
  )

  // @LINE:193
  private[this] lazy val controllers_Round_mini148_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/mini")))
  )
  private[this] lazy val controllers_Round_mini148_invoker = createInvoker(
    Round_27.mini(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "mini",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>/mini""",
      """""",
      Seq()
    )
  )

  // @LINE:194
  private[this] lazy val controllers_Round_mini149_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/"), DynamicPart("color", """white|black""",false), StaticPart("/mini")))
  )
  private[this] lazy val controllers_Round_mini149_invoker = createInvoker(
    Round_27.mini(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "mini",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>/mini""",
      """""",
      Seq()
    )
  )

  // @LINE:195
  private[this] lazy val controllers_Round_miniFullId150_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("fullId", """\w{12}""",false), StaticPart("/mini")))
  )
  private[this] lazy val controllers_Round_miniFullId150_invoker = createInvoker(
    Round_27.miniFullId(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "miniFullId",
      Seq(classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """fullId<\w{12}>/mini""",
      """""",
      Seq()
    )
  )

  // @LINE:196
  private[this] lazy val controllers_Editor_game151_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Editor_game151_invoker = createInvoker(
    Editor_8.game(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Editor",
      "game",
      Seq(classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:197
  private[this] lazy val controllers_UserAnalysis_game152_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/"), DynamicPart("color", """white|black""",false), StaticPart("/analysis")))
  )
  private[this] lazy val controllers_UserAnalysis_game152_invoker = createInvoker(
    UserAnalysis_35.game(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.UserAnalysis",
      "game",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>/analysis""",
      """""",
      Seq()
    )
  )

  // @LINE:198
  private[this] lazy val controllers_UserAnalysis_forecasts153_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("fullId", """\w{12}""",false), StaticPart("/forecasts")))
  )
  private[this] lazy val controllers_UserAnalysis_forecasts153_invoker = createInvoker(
    UserAnalysis_35.forecasts(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.UserAnalysis",
      "forecasts",
      Seq(classOf[String]),
      "POST",
      this.prefix + """""" + "$" + """fullId<\w{12}>/forecasts""",
      """""",
      Seq()
    )
  )

  // @LINE:199
  private[this] lazy val controllers_UserAnalysis_forecastsOnMyTurn154_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("fullId", """\w{12}""",false), StaticPart("/forecasts/"), DynamicPart("uci", """[^/]+""",true)))
  )
  private[this] lazy val controllers_UserAnalysis_forecastsOnMyTurn154_invoker = createInvoker(
    UserAnalysis_35.forecastsOnMyTurn(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.UserAnalysis",
      "forecastsOnMyTurn",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """""" + "$" + """fullId<\w{12}>/forecasts/""" + "$" + """uci<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:200
  private[this] lazy val controllers_Round_resign155_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("fullId", """\w{12}""",false), StaticPart("/resign")))
  )
  private[this] lazy val controllers_Round_resign155_invoker = createInvoker(
    Round_27.resign(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "resign",
      Seq(classOf[String]),
      "POST",
      this.prefix + """""" + "$" + """fullId<\w{12}>/resign""",
      """""",
      Seq()
    )
  )

  // @LINE:202
  private[this] lazy val controllers_Analyse_embed156_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("embed/"), DynamicPart("gameId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Analyse_embed156_invoker = createInvoker(
    Analyse_21.embed(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Analyse",
      "embed",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """embed/""" + "$" + """gameId<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:203
  private[this] lazy val controllers_Analyse_embed157_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("embed/"), DynamicPart("gameId", """\w{8}""",false), StaticPart("/"), DynamicPart("color", """white|black""",false)))
  )
  private[this] lazy val controllers_Analyse_embed157_invoker = createInvoker(
    Analyse_21.embed(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Analyse",
      "embed",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """embed/""" + "$" + """gameId<\w{8}>/""" + "$" + """color<white|black>""",
      """""",
      Seq()
    )
  )

  // @LINE:205
  private[this] lazy val controllers_Game_delete158_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/delete")))
  )
  private[this] lazy val controllers_Game_delete158_invoker = createInvoker(
    Game_5.delete(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Game",
      "delete",
      Seq(classOf[String]),
      "POST",
      this.prefix + """""" + "$" + """gameId<\w{8}>/delete""",
      """""",
      Seq()
    )
  )

  // @LINE:207
  private[this] lazy val controllers_Round_next159_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("round-next/"), DynamicPart("gameId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Round_next159_invoker = createInvoker(
    Round_27.next(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "next",
      Seq(classOf[String]),
      "GET",
      this.prefix + """round-next/""" + "$" + """gameId<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:208
  private[this] lazy val controllers_Round_whatsNext160_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("whats-next/"), DynamicPart("fullId", """\w{12}""",false)))
  )
  private[this] lazy val controllers_Round_whatsNext160_invoker = createInvoker(
    Round_27.whatsNext(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Round",
      "whatsNext",
      Seq(classOf[String]),
      "GET",
      this.prefix + """whats-next/""" + "$" + """fullId<\w{12}>""",
      """""",
      Seq()
    )
  )

  // @LINE:211
  private[this] lazy val controllers_Tournament_home161_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament")))
  )
  private[this] lazy val controllers_Tournament_home161_invoker = createInvoker(
    Tournament_2.home(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "home",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """tournament""",
      """ Tournament""",
      Seq()
    )
  )

  // @LINE:212
  private[this] lazy val controllers_Tournament_featured162_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/featured")))
  )
  private[this] lazy val controllers_Tournament_featured162_invoker = createInvoker(
    Tournament_2.featured,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "featured",
      Nil,
      "GET",
      this.prefix + """tournament/featured""",
      """""",
      Seq()
    )
  )

  // @LINE:213
  private[this] lazy val controllers_Tournament_form163_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/new")))
  )
  private[this] lazy val controllers_Tournament_form163_invoker = createInvoker(
    Tournament_2.form,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "form",
      Nil,
      "GET",
      this.prefix + """tournament/new""",
      """""",
      Seq()
    )
  )

  // @LINE:214
  private[this] lazy val controllers_Tournament_create164_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/new")))
  )
  private[this] lazy val controllers_Tournament_create164_invoker = createInvoker(
    Tournament_2.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "create",
      Nil,
      "POST",
      this.prefix + """tournament/new""",
      """""",
      Seq()
    )
  )

  // @LINE:215
  private[this] lazy val controllers_Tournament_teamBattleForm165_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/team-battle/new/"), DynamicPart("teamId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tournament_teamBattleForm165_invoker = createInvoker(
    Tournament_2.teamBattleForm(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "teamBattleForm",
      Seq(classOf[String]),
      "GET",
      this.prefix + """tournament/team-battle/new/""" + "$" + """teamId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:216
  private[this] lazy val controllers_Tournament_teamBattleEdit166_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/team-battle/edit/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tournament_teamBattleEdit166_invoker = createInvoker(
    Tournament_2.teamBattleEdit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "teamBattleEdit",
      Seq(classOf[String]),
      "GET",
      this.prefix + """tournament/team-battle/edit/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:217
  private[this] lazy val controllers_Tournament_teamBattleUpdate167_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/team-battle/edit/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tournament_teamBattleUpdate167_invoker = createInvoker(
    Tournament_2.teamBattleUpdate(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "teamBattleUpdate",
      Seq(classOf[String]),
      "POST",
      this.prefix + """tournament/team-battle/edit/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:218
  private[this] lazy val controllers_Tournament_calendar168_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/calendar")))
  )
  private[this] lazy val controllers_Tournament_calendar168_invoker = createInvoker(
    Tournament_2.calendar,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "calendar",
      Nil,
      "GET",
      this.prefix + """tournament/calendar""",
      """""",
      Seq()
    )
  )

  // @LINE:219
  private[this] lazy val controllers_Tournament_show169_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Tournament_show169_invoker = createInvoker(
    Tournament_2.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """tournament/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:220
  private[this] lazy val controllers_Tournament_standing170_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/"), DynamicPart("id", """\w{8}""",false), StaticPart("/standing/"), DynamicPart("page", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tournament_standing170_invoker = createInvoker(
    Tournament_2.standing(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "standing",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """tournament/""" + "$" + """id<\w{8}>/standing/""" + "$" + """page<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:221
  private[this] lazy val controllers_Tournament_pageOf171_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/"), DynamicPart("id", """\w{8}""",false), StaticPart("/page-of/"), DynamicPart("userId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tournament_pageOf171_invoker = createInvoker(
    Tournament_2.pageOf(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "pageOf",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """tournament/""" + "$" + """id<\w{8}>/page-of/""" + "$" + """userId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:222
  private[this] lazy val controllers_Tournament_join172_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/"), DynamicPart("id", """\w{8}""",false), StaticPart("/join")))
  )
  private[this] lazy val controllers_Tournament_join172_invoker = createInvoker(
    Tournament_2.join(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "join",
      Seq(classOf[String]),
      "POST",
      this.prefix + """tournament/""" + "$" + """id<\w{8}>/join""",
      """""",
      Seq()
    )
  )

  // @LINE:223
  private[this] lazy val controllers_Tournament_pause173_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/"), DynamicPart("id", """\w{8}""",false), StaticPart("/withdraw")))
  )
  private[this] lazy val controllers_Tournament_pause173_invoker = createInvoker(
    Tournament_2.pause(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "pause",
      Seq(classOf[String]),
      "POST",
      this.prefix + """tournament/""" + "$" + """id<\w{8}>/withdraw""",
      """""",
      Seq()
    )
  )

  // @LINE:224
  private[this] lazy val controllers_Tournament_player174_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/"), DynamicPart("id", """\w{8}""",false), StaticPart("/player/"), DynamicPart("user", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tournament_player174_invoker = createInvoker(
    Tournament_2.player(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "player",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """tournament/""" + "$" + """id<\w{8}>/player/""" + "$" + """user<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:225
  private[this] lazy val controllers_Tournament_teamInfo175_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/"), DynamicPart("id", """\w{8}""",false), StaticPart("/team/"), DynamicPart("team", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tournament_teamInfo175_invoker = createInvoker(
    Tournament_2.teamInfo(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "teamInfo",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """tournament/""" + "$" + """id<\w{8}>/team/""" + "$" + """team<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:226
  private[this] lazy val controllers_Tournament_terminate176_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/"), DynamicPart("id", """\w{8}""",false), StaticPart("/terminate")))
  )
  private[this] lazy val controllers_Tournament_terminate176_invoker = createInvoker(
    Tournament_2.terminate(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "terminate",
      Seq(classOf[String]),
      "POST",
      this.prefix + """tournament/""" + "$" + """id<\w{8}>/terminate""",
      """""",
      Seq()
    )
  )

  // @LINE:227
  private[this] lazy val controllers_Tournament_help177_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/help")))
  )
  private[this] lazy val controllers_Tournament_help177_invoker = createInvoker(
    Tournament_2.help(fakeValue[Option[String]]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "help",
      Seq(classOf[Option[String]]),
      "GET",
      this.prefix + """tournament/help""",
      """""",
      Seq()
    )
  )

  // @LINE:228
  private[this] lazy val controllers_Tournament_leaderboard178_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/leaderboard")))
  )
  private[this] lazy val controllers_Tournament_leaderboard178_invoker = createInvoker(
    Tournament_2.leaderboard,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "leaderboard",
      Nil,
      "GET",
      this.prefix + """tournament/leaderboard""",
      """""",
      Seq()
    )
  )

  // @LINE:229
  private[this] lazy val controllers_Tournament_shields179_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/shields")))
  )
  private[this] lazy val controllers_Tournament_shields179_invoker = createInvoker(
    Tournament_2.shields,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "shields",
      Nil,
      "GET",
      this.prefix + """tournament/shields""",
      """""",
      Seq()
    )
  )

  // @LINE:230
  private[this] lazy val controllers_Tournament_categShields180_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/shields/"), DynamicPart("categ", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Tournament_categShields180_invoker = createInvoker(
    Tournament_2.categShields(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "categShields",
      Seq(classOf[String]),
      "GET",
      this.prefix + """tournament/shields/""" + "$" + """categ<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:233
  private[this] lazy val controllers_TournamentCrud_index181_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/manager")))
  )
  private[this] lazy val controllers_TournamentCrud_index181_invoker = createInvoker(
    TournamentCrud_24.index(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.TournamentCrud",
      "index",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """tournament/manager""",
      """ Tournament CRUD""",
      Seq()
    )
  )

  // @LINE:234
  private[this] lazy val controllers_TournamentCrud_cloneT182_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/manager/clone/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_TournamentCrud_cloneT182_invoker = createInvoker(
    TournamentCrud_24.cloneT(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.TournamentCrud",
      "cloneT",
      Seq(classOf[String]),
      "GET",
      this.prefix + """tournament/manager/clone/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:235
  private[this] lazy val controllers_TournamentCrud_edit183_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/manager/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_TournamentCrud_edit183_invoker = createInvoker(
    TournamentCrud_24.edit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.TournamentCrud",
      "edit",
      Seq(classOf[String]),
      "GET",
      this.prefix + """tournament/manager/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:236
  private[this] lazy val controllers_TournamentCrud_update184_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/manager/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_TournamentCrud_update184_invoker = createInvoker(
    TournamentCrud_24.update(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.TournamentCrud",
      "update",
      Seq(classOf[String]),
      "POST",
      this.prefix + """tournament/manager/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:237
  private[this] lazy val controllers_TournamentCrud_form185_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/manager/new")))
  )
  private[this] lazy val controllers_TournamentCrud_form185_invoker = createInvoker(
    TournamentCrud_24.form,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.TournamentCrud",
      "form",
      Nil,
      "GET",
      this.prefix + """tournament/manager/new""",
      """""",
      Seq()
    )
  )

  // @LINE:238
  private[this] lazy val controllers_TournamentCrud_create186_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("tournament/manager")))
  )
  private[this] lazy val controllers_TournamentCrud_create186_invoker = createInvoker(
    TournamentCrud_24.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.TournamentCrud",
      "create",
      Nil,
      "POST",
      this.prefix + """tournament/manager""",
      """""",
      Seq()
    )
  )

  // @LINE:241
  private[this] lazy val controllers_Simul_home187_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul")))
  )
  private[this] lazy val controllers_Simul_home187_invoker = createInvoker(
    Simul_48.home,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "home",
      Nil,
      "GET",
      this.prefix + """simul""",
      """ Simul""",
      Seq()
    )
  )

  // @LINE:242
  private[this] lazy val controllers_Simul_form188_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/new")))
  )
  private[this] lazy val controllers_Simul_form188_invoker = createInvoker(
    Simul_48.form,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "form",
      Nil,
      "GET",
      this.prefix + """simul/new""",
      """""",
      Seq()
    )
  )

  // @LINE:243
  private[this] lazy val controllers_Simul_create189_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/new")))
  )
  private[this] lazy val controllers_Simul_create189_invoker = createInvoker(
    Simul_48.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "create",
      Nil,
      "POST",
      this.prefix + """simul/new""",
      """""",
      Seq()
    )
  )

  // @LINE:244
  private[this] lazy val controllers_Simul_homeReload190_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/reload")))
  )
  private[this] lazy val controllers_Simul_homeReload190_invoker = createInvoker(
    Simul_48.homeReload,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "homeReload",
      Nil,
      "GET",
      this.prefix + """simul/reload""",
      """""",
      Seq()
    )
  )

  // @LINE:245
  private[this] lazy val controllers_Simul_show191_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Simul_show191_invoker = createInvoker(
    Simul_48.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """simul/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:246
  private[this] lazy val controllers_Simul_hostPing192_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false), StaticPart("/host-ping")))
  )
  private[this] lazy val controllers_Simul_hostPing192_invoker = createInvoker(
    Simul_48.hostPing(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "hostPing",
      Seq(classOf[String]),
      "POST",
      this.prefix + """simul/""" + "$" + """id<\w{8}>/host-ping""",
      """""",
      Seq()
    )
  )

  // @LINE:247
  private[this] lazy val controllers_Simul_accept193_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false), StaticPart("/accept/"), DynamicPart("user", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Simul_accept193_invoker = createInvoker(
    Simul_48.accept(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "accept",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """simul/""" + "$" + """id<\w{8}>/accept/""" + "$" + """user<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:248
  private[this] lazy val controllers_Simul_reject194_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false), StaticPart("/reject/"), DynamicPart("user", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Simul_reject194_invoker = createInvoker(
    Simul_48.reject(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "reject",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """simul/""" + "$" + """id<\w{8}>/reject/""" + "$" + """user<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:249
  private[this] lazy val controllers_Simul_start195_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false), StaticPart("/start")))
  )
  private[this] lazy val controllers_Simul_start195_invoker = createInvoker(
    Simul_48.start(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "start",
      Seq(classOf[String]),
      "POST",
      this.prefix + """simul/""" + "$" + """id<\w{8}>/start""",
      """""",
      Seq()
    )
  )

  // @LINE:250
  private[this] lazy val controllers_Simul_abort196_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false), StaticPart("/abort")))
  )
  private[this] lazy val controllers_Simul_abort196_invoker = createInvoker(
    Simul_48.abort(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "abort",
      Seq(classOf[String]),
      "POST",
      this.prefix + """simul/""" + "$" + """id<\w{8}>/abort""",
      """""",
      Seq()
    )
  )

  // @LINE:251
  private[this] lazy val controllers_Simul_join197_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false), StaticPart("/join/"), DynamicPart("variant", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Simul_join197_invoker = createInvoker(
    Simul_48.join(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "join",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """simul/""" + "$" + """id<\w{8}>/join/""" + "$" + """variant<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:252
  private[this] lazy val controllers_Simul_withdraw198_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false), StaticPart("/withdraw")))
  )
  private[this] lazy val controllers_Simul_withdraw198_invoker = createInvoker(
    Simul_48.withdraw(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "withdraw",
      Seq(classOf[String]),
      "POST",
      this.prefix + """simul/""" + "$" + """id<\w{8}>/withdraw""",
      """""",
      Seq()
    )
  )

  // @LINE:253
  private[this] lazy val controllers_Simul_setText199_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("simul/"), DynamicPart("id", """\w{8}""",false), StaticPart("/set-text")))
  )
  private[this] lazy val controllers_Simul_setText199_invoker = createInvoker(
    Simul_48.setText(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "setText",
      Seq(classOf[String]),
      "POST",
      this.prefix + """simul/""" + "$" + """id<\w{8}>/set-text""",
      """""",
      Seq()
    )
  )

  // @LINE:256
  private[this] lazy val controllers_Team_home200_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team")))
  )
  private[this] lazy val controllers_Team_home200_invoker = createInvoker(
    Team_54.home(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "home",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """team""",
      """ Team""",
      Seq()
    )
  )

  // @LINE:257
  private[this] lazy val controllers_Team_form201_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/new")))
  )
  private[this] lazy val controllers_Team_form201_invoker = createInvoker(
    Team_54.form,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "form",
      Nil,
      "GET",
      this.prefix + """team/new""",
      """""",
      Seq()
    )
  )

  // @LINE:258
  private[this] lazy val controllers_Team_create202_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/new")))
  )
  private[this] lazy val controllers_Team_create202_invoker = createInvoker(
    Team_54.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "create",
      Nil,
      "POST",
      this.prefix + """team/new""",
      """""",
      Seq()
    )
  )

  // @LINE:259
  private[this] lazy val controllers_Team_mine203_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/me")))
  )
  private[this] lazy val controllers_Team_mine203_invoker = createInvoker(
    Team_54.mine,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "mine",
      Nil,
      "GET",
      this.prefix + """team/me""",
      """""",
      Seq()
    )
  )

  // @LINE:260
  private[this] lazy val controllers_Team_all204_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/all")))
  )
  private[this] lazy val controllers_Team_all204_invoker = createInvoker(
    Team_54.all(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "all",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """team/all""",
      """""",
      Seq()
    )
  )

  // @LINE:261
  private[this] lazy val controllers_Team_requests205_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/requests")))
  )
  private[this] lazy val controllers_Team_requests205_invoker = createInvoker(
    Team_54.requests,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "requests",
      Nil,
      "GET",
      this.prefix + """team/requests""",
      """""",
      Seq()
    )
  )

  // @LINE:262
  private[this] lazy val controllers_Team_search206_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/search")))
  )
  private[this] lazy val controllers_Team_search206_invoker = createInvoker(
    Team_54.search(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "search",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """team/search""",
      """""",
      Seq()
    )
  )

  // @LINE:263
  private[this] lazy val controllers_Team_autocomplete207_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/autocomplete")))
  )
  private[this] lazy val controllers_Team_autocomplete207_invoker = createInvoker(
    Team_54.autocomplete,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "autocomplete",
      Nil,
      "GET",
      this.prefix + """team/autocomplete""",
      """""",
      Seq()
    )
  )

  // @LINE:264
  private[this] lazy val controllers_Team_show208_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Team_show208_invoker = createInvoker(
    Team_54.show(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "show",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """team/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:265
  private[this] lazy val controllers_Team_join209_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/join")))
  )
  private[this] lazy val controllers_Team_join209_invoker = createInvoker(
    Team_54.join(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "join",
      Seq(classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/join""",
      """""",
      Seq()
    )
  )

  // @LINE:266
  private[this] lazy val controllers_Team_quit210_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/quit")))
  )
  private[this] lazy val controllers_Team_quit210_invoker = createInvoker(
    Team_54.quit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "quit",
      Seq(classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/quit""",
      """""",
      Seq()
    )
  )

  // @LINE:267
  private[this] lazy val controllers_Team_requestForm211_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/request/new")))
  )
  private[this] lazy val controllers_Team_requestForm211_invoker = createInvoker(
    Team_54.requestForm(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "requestForm",
      Seq(classOf[String]),
      "GET",
      this.prefix + """team/""" + "$" + """id<[^/]+>/request/new""",
      """""",
      Seq()
    )
  )

  // @LINE:268
  private[this] lazy val controllers_Team_requestCreate212_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/request/new")))
  )
  private[this] lazy val controllers_Team_requestCreate212_invoker = createInvoker(
    Team_54.requestCreate(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "requestCreate",
      Seq(classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/request/new""",
      """""",
      Seq()
    )
  )

  // @LINE:269
  private[this] lazy val controllers_Team_requestProcess213_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/request/process")))
  )
  private[this] lazy val controllers_Team_requestProcess213_invoker = createInvoker(
    Team_54.requestProcess(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "requestProcess",
      Seq(classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/request/process""",
      """""",
      Seq()
    )
  )

  // @LINE:270
  private[this] lazy val controllers_Team_edit214_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Team_edit214_invoker = createInvoker(
    Team_54.edit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "edit",
      Seq(classOf[String]),
      "GET",
      this.prefix + """team/""" + "$" + """id<[^/]+>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:271
  private[this] lazy val controllers_Team_update215_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Team_update215_invoker = createInvoker(
    Team_54.update(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "update",
      Seq(classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:272
  private[this] lazy val controllers_Team_kickForm216_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/kick")))
  )
  private[this] lazy val controllers_Team_kickForm216_invoker = createInvoker(
    Team_54.kickForm(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "kickForm",
      Seq(classOf[String]),
      "GET",
      this.prefix + """team/""" + "$" + """id<[^/]+>/kick""",
      """""",
      Seq()
    )
  )

  // @LINE:273
  private[this] lazy val controllers_Team_kick217_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/kick")))
  )
  private[this] lazy val controllers_Team_kick217_invoker = createInvoker(
    Team_54.kick(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "kick",
      Seq(classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/kick""",
      """""",
      Seq()
    )
  )

  // @LINE:274
  private[this] lazy val controllers_Team_kickUser218_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/kick/"), DynamicPart("user", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Team_kickUser218_invoker = createInvoker(
    Team_54.kickUser(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "kickUser",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/kick/""" + "$" + """user<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:275
  private[this] lazy val controllers_Team_changeOwnerForm219_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/changeOwner")))
  )
  private[this] lazy val controllers_Team_changeOwnerForm219_invoker = createInvoker(
    Team_54.changeOwnerForm(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "changeOwnerForm",
      Seq(classOf[String]),
      "GET",
      this.prefix + """team/""" + "$" + """id<[^/]+>/changeOwner""",
      """""",
      Seq()
    )
  )

  // @LINE:276
  private[this] lazy val controllers_Team_changeOwner220_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/changeOwner")))
  )
  private[this] lazy val controllers_Team_changeOwner220_invoker = createInvoker(
    Team_54.changeOwner(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "changeOwner",
      Seq(classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/changeOwner""",
      """""",
      Seq()
    )
  )

  // @LINE:277
  private[this] lazy val controllers_Team_close221_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/close")))
  )
  private[this] lazy val controllers_Team_close221_invoker = createInvoker(
    Team_54.close(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "close",
      Seq(classOf[String]),
      "POST",
      this.prefix + """team/""" + "$" + """id<[^/]+>/close""",
      """""",
      Seq()
    )
  )

  // @LINE:278
  private[this] lazy val controllers_Team_users222_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("team/"), DynamicPart("id", """[^/]+""",true), StaticPart("/users")))
  )
  private[this] lazy val controllers_Team_users222_invoker = createInvoker(
    Team_54.users(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Team",
      "users",
      Seq(classOf[String]),
      "GET",
      this.prefix + """team/""" + "$" + """id<[^/]+>/users""",
      """""",
      Seq()
    )
  )

  // @LINE:281
  private[this] lazy val controllers_Analyse_requestAnalysis223_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("gameId", """\w{8}""",false), StaticPart("/request-analysis")))
  )
  private[this] lazy val controllers_Analyse_requestAnalysis223_invoker = createInvoker(
    Analyse_21.requestAnalysis(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Analyse",
      "requestAnalysis",
      Seq(classOf[String]),
      "POST",
      this.prefix + """""" + "$" + """gameId<\w{8}>/request-analysis""",
      """ Analyse""",
      Seq()
    )
  )

  // @LINE:283
  private[this] lazy val controllers_Game_exportOne224_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("game/export/"), DynamicPart("gameId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Game_exportOne224_invoker = createInvoker(
    Game_5.exportOne(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Game",
      "exportOne",
      Seq(classOf[String]),
      "GET",
      this.prefix + """game/export/""" + "$" + """gameId<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:284
  private[this] lazy val controllers_Game_exportOne225_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("game/export/"), DynamicPart("gameId", """\w{8}""",false), StaticPart(".pgn")))
  )
  private[this] lazy val controllers_Game_exportOne225_invoker = createInvoker(
    Game_5.exportOne(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Game",
      "exportOne",
      Seq(classOf[String]),
      "GET",
      this.prefix + """game/export/""" + "$" + """gameId<\w{8}>.pgn""",
      """""",
      Seq()
    )
  )

  // @LINE:285
  private[this] lazy val controllers_Export_png226_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("game/export/png/"), DynamicPart("gameId", """\w{8}""",false), StaticPart(".png")))
  )
  private[this] lazy val controllers_Export_png226_invoker = createInvoker(
    Export_16.png(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Export",
      "png",
      Seq(classOf[String]),
      "GET",
      this.prefix + """game/export/png/""" + "$" + """gameId<\w{8}>.png""",
      """""",
      Seq()
    )
  )

  // @LINE:288
  private[this] lazy val controllers_Fishnet_acquire227_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("fishnet/acquire")))
  )
  private[this] lazy val controllers_Fishnet_acquire227_invoker = createInvoker(
    Fishnet_56.acquire,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Fishnet",
      "acquire",
      Nil,
      "POST",
      this.prefix + """fishnet/acquire""",
      """ Fishnet""",
      Seq()
    )
  )

  // @LINE:289
  private[this] lazy val controllers_Fishnet_analysis228_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("fishnet/analysis/"), DynamicPart("workId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Fishnet_analysis228_invoker = createInvoker(
    Fishnet_56.analysis(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Fishnet",
      "analysis",
      Seq(classOf[String]),
      "POST",
      this.prefix + """fishnet/analysis/""" + "$" + """workId<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:290
  private[this] lazy val controllers_Fishnet_abort229_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("fishnet/abort/"), DynamicPart("workId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Fishnet_abort229_invoker = createInvoker(
    Fishnet_56.abort(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Fishnet",
      "abort",
      Seq(classOf[String]),
      "POST",
      this.prefix + """fishnet/abort/""" + "$" + """workId<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:291
  private[this] lazy val controllers_Fishnet_keyExists230_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("fishnet/key/"), DynamicPart("key", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Fishnet_keyExists230_invoker = createInvoker(
    Fishnet_56.keyExists(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Fishnet",
      "keyExists",
      Seq(classOf[String]),
      "GET",
      this.prefix + """fishnet/key/""" + "$" + """key<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:292
  private[this] lazy val controllers_Fishnet_status231_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("fishnet/status")))
  )
  private[this] lazy val controllers_Fishnet_status231_invoker = createInvoker(
    Fishnet_56.status,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Fishnet",
      "status",
      Nil,
      "GET",
      this.prefix + """fishnet/status""",
      """""",
      Seq()
    )
  )

  // @LINE:295
  private[this] lazy val controllers_Pref_set232_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("pref/"), DynamicPart("name", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Pref_set232_invoker = createInvoker(
    Pref_1.set(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Pref",
      "set",
      Seq(classOf[String]),
      "POST",
      this.prefix + """pref/""" + "$" + """name<[^/]+>""",
      """ Pref""",
      Seq()
    )
  )

  // @LINE:296
  private[this] lazy val controllers_Pref_form233_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/preferences/"), DynamicPart("categ", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Pref_form233_invoker = createInvoker(
    Pref_1.form(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Pref",
      "form",
      Seq(classOf[String]),
      "GET",
      this.prefix + """account/preferences/""" + "$" + """categ<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:297
  private[this] lazy val controllers_Pref_formApply234_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/preferences")))
  )
  private[this] lazy val controllers_Pref_formApply234_invoker = createInvoker(
    Pref_1.formApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Pref",
      "formApply",
      Nil,
      "POST",
      this.prefix + """account/preferences""",
      """""",
      Seq()
    )
  )

  // @LINE:298
  private[this] lazy val controllers_Pref_verifyTitle235_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/preferences/verify-title")))
  )
  private[this] lazy val controllers_Pref_verifyTitle235_invoker = createInvoker(
    Pref_1.verifyTitle,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Pref",
      "verifyTitle",
      Nil,
      "POST",
      this.prefix + """account/preferences/verify-title""",
      """""",
      Seq()
    )
  )

  // @LINE:301
  private[this] lazy val controllers_Setup_aiForm236_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/ai")))
  )
  private[this] lazy val controllers_Setup_aiForm236_invoker = createInvoker(
    Setup_46.aiForm,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "aiForm",
      Nil,
      "GET",
      this.prefix + """setup/ai""",
      """ Setup""",
      Seq()
    )
  )

  // @LINE:302
  private[this] lazy val controllers_Setup_ai237_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/ai")))
  )
  private[this] lazy val controllers_Setup_ai237_invoker = createInvoker(
    Setup_46.ai,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "ai",
      Nil,
      "POST",
      this.prefix + """setup/ai""",
      """""",
      Seq()
    )
  )

  // @LINE:303
  private[this] lazy val controllers_Setup_friendForm238_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/friend")))
  )
  private[this] lazy val controllers_Setup_friendForm238_invoker = createInvoker(
    Setup_46.friendForm(fakeValue[Option[String]]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "friendForm",
      Seq(classOf[Option[String]]),
      "GET",
      this.prefix + """setup/friend""",
      """""",
      Seq()
    )
  )

  // @LINE:304
  private[this] lazy val controllers_Setup_friend239_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/friend")))
  )
  private[this] lazy val controllers_Setup_friend239_invoker = createInvoker(
    Setup_46.friend(fakeValue[Option[String]]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "friend",
      Seq(classOf[Option[String]]),
      "POST",
      this.prefix + """setup/friend""",
      """""",
      Seq()
    )
  )

  // @LINE:305
  private[this] lazy val controllers_Setup_hookForm240_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/hook")))
  )
  private[this] lazy val controllers_Setup_hookForm240_invoker = createInvoker(
    Setup_46.hookForm,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "hookForm",
      Nil,
      "GET",
      this.prefix + """setup/hook""",
      """""",
      Seq()
    )
  )

  // @LINE:306
  private[this] lazy val controllers_Setup_like241_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/hook/"), DynamicPart("sri", """[^/]+""",true), StaticPart("/like/"), DynamicPart("gameId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Setup_like241_invoker = createInvoker(
    Setup_46.like(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "like",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """setup/hook/""" + "$" + """sri<[^/]+>/like/""" + "$" + """gameId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:307
  private[this] lazy val controllers_Setup_hook242_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/hook/"), DynamicPart("sri", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Setup_hook242_invoker = createInvoker(
    Setup_46.hook(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "hook",
      Seq(classOf[String]),
      "POST",
      this.prefix + """setup/hook/""" + "$" + """sri<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:308
  private[this] lazy val controllers_Setup_filterForm243_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/filter")))
  )
  private[this] lazy val controllers_Setup_filterForm243_invoker = createInvoker(
    Setup_46.filterForm,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "filterForm",
      Nil,
      "GET",
      this.prefix + """setup/filter""",
      """""",
      Seq()
    )
  )

  // @LINE:309
  private[this] lazy val controllers_Setup_filter244_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/filter")))
  )
  private[this] lazy val controllers_Setup_filter244_invoker = createInvoker(
    Setup_46.filter,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "filter",
      Nil,
      "POST",
      this.prefix + """setup/filter""",
      """""",
      Seq()
    )
  )

  // @LINE:310
  private[this] lazy val controllers_Setup_validateFen245_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("setup/validate-fen")))
  )
  private[this] lazy val controllers_Setup_validateFen245_invoker = createInvoker(
    Setup_46.validateFen,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Setup",
      "validateFen",
      Nil,
      "GET",
      this.prefix + """setup/validate-fen""",
      """""",
      Seq()
    )
  )

  // @LINE:313
  private[this] lazy val controllers_Challenge_all246_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("challenge")))
  )
  private[this] lazy val controllers_Challenge_all246_invoker = createInvoker(
    Challenge_28.all,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "all",
      Nil,
      "GET",
      this.prefix + """challenge""",
      """ Challenge""",
      Seq()
    )
  )

  // @LINE:314
  private[this] lazy val controllers_Challenge_show247_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("challenge/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Challenge_show247_invoker = createInvoker(
    Challenge_28.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """challenge/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:315
  private[this] lazy val controllers_Challenge_accept248_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("challenge/"), DynamicPart("id", """\w{8}""",false), StaticPart("/accept")))
  )
  private[this] lazy val controllers_Challenge_accept248_invoker = createInvoker(
    Challenge_28.accept(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "accept",
      Seq(classOf[String]),
      "POST",
      this.prefix + """challenge/""" + "$" + """id<\w{8}>/accept""",
      """""",
      Seq()
    )
  )

  // @LINE:316
  private[this] lazy val controllers_Challenge_decline249_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("challenge/"), DynamicPart("id", """\w{8}""",false), StaticPart("/decline")))
  )
  private[this] lazy val controllers_Challenge_decline249_invoker = createInvoker(
    Challenge_28.decline(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "decline",
      Seq(classOf[String]),
      "POST",
      this.prefix + """challenge/""" + "$" + """id<\w{8}>/decline""",
      """""",
      Seq()
    )
  )

  // @LINE:317
  private[this] lazy val controllers_Challenge_cancel250_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("challenge/"), DynamicPart("id", """\w{8}""",false), StaticPart("/cancel")))
  )
  private[this] lazy val controllers_Challenge_cancel250_invoker = createInvoker(
    Challenge_28.cancel(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "cancel",
      Seq(classOf[String]),
      "POST",
      this.prefix + """challenge/""" + "$" + """id<\w{8}>/cancel""",
      """""",
      Seq()
    )
  )

  // @LINE:318
  private[this] lazy val controllers_Challenge_toFriend251_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("challenge/"), DynamicPart("id", """\w{8}""",false), StaticPart("/to-friend")))
  )
  private[this] lazy val controllers_Challenge_toFriend251_invoker = createInvoker(
    Challenge_28.toFriend(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "toFriend",
      Seq(classOf[String]),
      "POST",
      this.prefix + """challenge/""" + "$" + """id<\w{8}>/to-friend""",
      """""",
      Seq()
    )
  )

  // @LINE:319
  private[this] lazy val controllers_Challenge_rematchOf252_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("challenge/rematch-of/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Challenge_rematchOf252_invoker = createInvoker(
    Challenge_28.rematchOf(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "rematchOf",
      Seq(classOf[String]),
      "POST",
      this.prefix + """challenge/rematch-of/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:322
  private[this] lazy val controllers_Notify_recent253_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("notify")))
  )
  private[this] lazy val controllers_Notify_recent253_invoker = createInvoker(
    Notify_59.recent(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Notify",
      "recent",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """notify""",
      """ Notify""",
      Seq()
    )
  )

  // @LINE:325
  private[this] lazy val controllers_Video_index254_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("video")))
  )
  private[this] lazy val controllers_Video_index254_invoker = createInvoker(
    Video_25.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Video",
      "index",
      Nil,
      "GET",
      this.prefix + """video""",
      """ Video""",
      Seq()
    )
  )

  // @LINE:326
  private[this] lazy val controllers_Video_tags255_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("video/tags")))
  )
  private[this] lazy val controllers_Video_tags255_invoker = createInvoker(
    Video_25.tags,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Video",
      "tags",
      Nil,
      "GET",
      this.prefix + """video/tags""",
      """""",
      Seq()
    )
  )

  // @LINE:327
  private[this] lazy val controllers_Video_author256_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("video/author/"), DynamicPart("author", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Video_author256_invoker = createInvoker(
    Video_25.author(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Video",
      "author",
      Seq(classOf[String]),
      "GET",
      this.prefix + """video/author/""" + "$" + """author<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:328
  private[this] lazy val controllers_Video_show257_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("video/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Video_show257_invoker = createInvoker(
    Video_25.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Video",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """video/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:331
  private[this] lazy val controllers_I18n_select258_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("translation/select")))
  )
  private[this] lazy val controllers_I18n_select258_invoker = createInvoker(
    I18n_12.select,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.I18n",
      "select",
      Nil,
      "POST",
      this.prefix + """translation/select""",
      """ I18n""",
      Seq()
    )
  )

  // @LINE:334
  private[this] lazy val controllers_Auth_login259_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("login")))
  )
  private[this] lazy val controllers_Auth_login259_invoker = createInvoker(
    Auth_9.login,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "login",
      Nil,
      "GET",
      this.prefix + """login""",
      """ Authentication""",
      Seq()
    )
  )

  // @LINE:335
  private[this] lazy val controllers_Auth_authenticate260_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("login")))
  )
  private[this] lazy val controllers_Auth_authenticate260_invoker = createInvoker(
    Auth_9.authenticate,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "authenticate",
      Nil,
      "POST",
      this.prefix + """login""",
      """""",
      Seq()
    )
  )

  // @LINE:336
  private[this] lazy val controllers_Auth_logoutGet261_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("logout")))
  )
  private[this] lazy val controllers_Auth_logoutGet261_invoker = createInvoker(
    Auth_9.logoutGet,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "logoutGet",
      Nil,
      "GET",
      this.prefix + """logout""",
      """""",
      Seq()
    )
  )

  // @LINE:337
  private[this] lazy val controllers_Auth_logout262_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("logout")))
  )
  private[this] lazy val controllers_Auth_logout262_invoker = createInvoker(
    Auth_9.logout,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "logout",
      Nil,
      "POST",
      this.prefix + """logout""",
      """""",
      Seq()
    )
  )

  // @LINE:338
  private[this] lazy val controllers_Auth_signup263_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("signup")))
  )
  private[this] lazy val controllers_Auth_signup263_invoker = createInvoker(
    Auth_9.signup,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "signup",
      Nil,
      "GET",
      this.prefix + """signup""",
      """""",
      Seq()
    )
  )

  // @LINE:339
  private[this] lazy val controllers_Auth_signupPost264_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("signup")))
  )
  private[this] lazy val controllers_Auth_signupPost264_invoker = createInvoker(
    Auth_9.signupPost,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "signupPost",
      Nil,
      "POST",
      this.prefix + """signup""",
      """""",
      Seq()
    )
  )

  // @LINE:340
  private[this] lazy val controllers_Auth_checkYourEmail265_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("signup/check-your-email")))
  )
  private[this] lazy val controllers_Auth_checkYourEmail265_invoker = createInvoker(
    Auth_9.checkYourEmail,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "checkYourEmail",
      Nil,
      "GET",
      this.prefix + """signup/check-your-email""",
      """""",
      Seq()
    )
  )

  // @LINE:341
  private[this] lazy val controllers_Auth_fixEmail266_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("signup/fix-email")))
  )
  private[this] lazy val controllers_Auth_fixEmail266_invoker = createInvoker(
    Auth_9.fixEmail,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "fixEmail",
      Nil,
      "POST",
      this.prefix + """signup/fix-email""",
      """""",
      Seq()
    )
  )

  // @LINE:342
  private[this] lazy val controllers_Auth_signupConfirmEmail267_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("signup/confirm/"), DynamicPart("token", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Auth_signupConfirmEmail267_invoker = createInvoker(
    Auth_9.signupConfirmEmail(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "signupConfirmEmail",
      Seq(classOf[String]),
      "GET",
      this.prefix + """signup/confirm/""" + "$" + """token<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:343
  private[this] lazy val controllers_Auth_passwordReset268_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("password/reset")))
  )
  private[this] lazy val controllers_Auth_passwordReset268_invoker = createInvoker(
    Auth_9.passwordReset,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "passwordReset",
      Nil,
      "GET",
      this.prefix + """password/reset""",
      """""",
      Seq()
    )
  )

  // @LINE:344
  private[this] lazy val controllers_Auth_passwordResetApply269_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("password/reset/send")))
  )
  private[this] lazy val controllers_Auth_passwordResetApply269_invoker = createInvoker(
    Auth_9.passwordResetApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "passwordResetApply",
      Nil,
      "POST",
      this.prefix + """password/reset/send""",
      """""",
      Seq()
    )
  )

  // @LINE:345
  private[this] lazy val controllers_Auth_passwordResetSent270_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("password/reset/sent/"), DynamicPart("email", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Auth_passwordResetSent270_invoker = createInvoker(
    Auth_9.passwordResetSent(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "passwordResetSent",
      Seq(classOf[String]),
      "GET",
      this.prefix + """password/reset/sent/""" + "$" + """email<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:346
  private[this] lazy val controllers_Auth_passwordResetConfirm271_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("password/reset/confirm/"), DynamicPart("token", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Auth_passwordResetConfirm271_invoker = createInvoker(
    Auth_9.passwordResetConfirm(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "passwordResetConfirm",
      Seq(classOf[String]),
      "GET",
      this.prefix + """password/reset/confirm/""" + "$" + """token<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:347
  private[this] lazy val controllers_Auth_passwordResetConfirmApply272_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("password/reset/confirm/"), DynamicPart("token", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Auth_passwordResetConfirmApply272_invoker = createInvoker(
    Auth_9.passwordResetConfirmApply(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "passwordResetConfirmApply",
      Seq(classOf[String]),
      "POST",
      this.prefix + """password/reset/confirm/""" + "$" + """token<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:348
  private[this] lazy val controllers_Auth_setFingerPrint273_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("auth/set-fp/"), DynamicPart("fp", """[^/]+""",true), StaticPart("/"), DynamicPart("ms", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Auth_setFingerPrint273_invoker = createInvoker(
    Auth_9.setFingerPrint(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "setFingerPrint",
      Seq(classOf[String], classOf[Int]),
      "POST",
      this.prefix + """auth/set-fp/""" + "$" + """fp<[^/]+>/""" + "$" + """ms<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:349
  private[this] lazy val controllers_Auth_makeLoginToken274_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("auth/token")))
  )
  private[this] lazy val controllers_Auth_makeLoginToken274_invoker = createInvoker(
    Auth_9.makeLoginToken,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "makeLoginToken",
      Nil,
      "POST",
      this.prefix + """auth/token""",
      """""",
      Seq()
    )
  )

  // @LINE:350
  private[this] lazy val controllers_Auth_loginWithToken275_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("auth/token/"), DynamicPart("token", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Auth_loginWithToken275_invoker = createInvoker(
    Auth_9.loginWithToken(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "loginWithToken",
      Seq(classOf[String]),
      "GET",
      this.prefix + """auth/token/""" + "$" + """token<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:351
  private[this] lazy val controllers_Auth_magicLink276_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("auth/magic-link")))
  )
  private[this] lazy val controllers_Auth_magicLink276_invoker = createInvoker(
    Auth_9.magicLink,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "magicLink",
      Nil,
      "GET",
      this.prefix + """auth/magic-link""",
      """""",
      Seq()
    )
  )

  // @LINE:352
  private[this] lazy val controllers_Auth_magicLinkApply277_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("auth/magic-link/send")))
  )
  private[this] lazy val controllers_Auth_magicLinkApply277_invoker = createInvoker(
    Auth_9.magicLinkApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "magicLinkApply",
      Nil,
      "POST",
      this.prefix + """auth/magic-link/send""",
      """""",
      Seq()
    )
  )

  // @LINE:353
  private[this] lazy val controllers_Auth_magicLinkSent278_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("auth/magic-link/sent/"), DynamicPart("email", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Auth_magicLinkSent278_invoker = createInvoker(
    Auth_9.magicLinkSent(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "magicLinkSent",
      Seq(classOf[String]),
      "GET",
      this.prefix + """auth/magic-link/sent/""" + "$" + """email<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:354
  private[this] lazy val controllers_Auth_magicLinkLogin279_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("auth/magic-link/login/"), DynamicPart("token", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Auth_magicLinkLogin279_invoker = createInvoker(
    Auth_9.magicLinkLogin(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Auth",
      "magicLinkLogin",
      Seq(classOf[String]),
      "GET",
      this.prefix + """auth/magic-link/login/""" + "$" + """token<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:357
  private[this] lazy val controllers_Mod_alt280_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/alt/"), DynamicPart("v", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_alt280_invoker = createInvoker(
    Mod_53.alt(fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "alt",
      Seq(classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/alt/""" + "$" + """v<[^/]+>""",
      """ Mod""",
      Seq()
    )
  )

  // @LINE:358
  private[this] lazy val controllers_Mod_engine281_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/engine/"), DynamicPart("v", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_engine281_invoker = createInvoker(
    Mod_53.engine(fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "engine",
      Seq(classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/engine/""" + "$" + """v<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:359
  private[this] lazy val controllers_Mod_booster282_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/booster/"), DynamicPart("v", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_booster282_invoker = createInvoker(
    Mod_53.booster(fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "booster",
      Seq(classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/booster/""" + "$" + """v<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:360
  private[this] lazy val controllers_Mod_troll283_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/troll/"), DynamicPart("v", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_troll283_invoker = createInvoker(
    Mod_53.troll(fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "troll",
      Seq(classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/troll/""" + "$" + """v<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:361
  private[this] lazy val controllers_Mod_ipBan284_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/ban/"), DynamicPart("v", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_ipBan284_invoker = createInvoker(
    Mod_53.ipBan(fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "ipBan",
      Seq(classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/ban/""" + "$" + """v<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:362
  private[this] lazy val controllers_Mod_deletePmsAndChats285_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/delete-pms-and-chats")))
  )
  private[this] lazy val controllers_Mod_deletePmsAndChats285_invoker = createInvoker(
    Mod_53.deletePmsAndChats(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "deletePmsAndChats",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/delete-pms-and-chats""",
      """""",
      Seq()
    )
  )

  // @LINE:363
  private[this] lazy val controllers_Mod_warn286_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/warn")))
  )
  private[this] lazy val controllers_Mod_warn286_invoker = createInvoker(
    Mod_53.warn(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "warn",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/warn""",
      """""",
      Seq()
    )
  )

  // @LINE:364
  private[this] lazy val controllers_Mod_disableTwoFactor287_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/disable-2fa")))
  )
  private[this] lazy val controllers_Mod_disableTwoFactor287_invoker = createInvoker(
    Mod_53.disableTwoFactor(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "disableTwoFactor",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/disable-2fa""",
      """""",
      Seq()
    )
  )

  // @LINE:365
  private[this] lazy val controllers_Mod_closeAccount288_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/close")))
  )
  private[this] lazy val controllers_Mod_closeAccount288_invoker = createInvoker(
    Mod_53.closeAccount(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "closeAccount",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/close""",
      """""",
      Seq()
    )
  )

  // @LINE:366
  private[this] lazy val controllers_Mod_reopenAccount289_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/reopen")))
  )
  private[this] lazy val controllers_Mod_reopenAccount289_invoker = createInvoker(
    Mod_53.reopenAccount(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "reopenAccount",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/reopen""",
      """""",
      Seq()
    )
  )

  // @LINE:367
  private[this] lazy val controllers_Mod_setTitle290_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/title")))
  )
  private[this] lazy val controllers_Mod_setTitle290_invoker = createInvoker(
    Mod_53.setTitle(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "setTitle",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/title""",
      """""",
      Seq()
    )
  )

  // @LINE:368
  private[this] lazy val controllers_Mod_spontaneousInquiry291_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/inquiry")))
  )
  private[this] lazy val controllers_Mod_spontaneousInquiry291_invoker = createInvoker(
    Mod_53.spontaneousInquiry(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "spontaneousInquiry",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/inquiry""",
      """""",
      Seq()
    )
  )

  // @LINE:369
  private[this] lazy val controllers_Mod_communicationPublic292_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/communication")))
  )
  private[this] lazy val controllers_Mod_communicationPublic292_invoker = createInvoker(
    Mod_53.communicationPublic(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "communicationPublic",
      Seq(classOf[String]),
      "GET",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/communication""",
      """""",
      Seq()
    )
  )

  // @LINE:370
  private[this] lazy val controllers_Mod_communicationPrivate293_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/communication/private")))
  )
  private[this] lazy val controllers_Mod_communicationPrivate293_invoker = createInvoker(
    Mod_53.communicationPrivate(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "communicationPrivate",
      Seq(classOf[String]),
      "GET",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/communication/private""",
      """""",
      Seq()
    )
  )

  // @LINE:371
  private[this] lazy val controllers_Mod_rankban294_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/rankban/"), DynamicPart("v", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_rankban294_invoker = createInvoker(
    Mod_53.rankban(fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "rankban",
      Seq(classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/rankban/""" + "$" + """v<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:372
  private[this] lazy val controllers_Mod_reportban295_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/reportban/"), DynamicPart("v", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_reportban295_invoker = createInvoker(
    Mod_53.reportban(fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "reportban",
      Seq(classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/reportban/""" + "$" + """v<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:373
  private[this] lazy val controllers_Mod_impersonate296_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/impersonate")))
  )
  private[this] lazy val controllers_Mod_impersonate296_invoker = createInvoker(
    Mod_53.impersonate(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "impersonate",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/impersonate""",
      """""",
      Seq()
    )
  )

  // @LINE:374
  private[this] lazy val controllers_Mod_log297_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/log")))
  )
  private[this] lazy val controllers_Mod_log297_invoker = createInvoker(
    Mod_53.log,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "log",
      Nil,
      "GET",
      this.prefix + """mod/log""",
      """""",
      Seq()
    )
  )

  // @LINE:375
  private[this] lazy val controllers_Mod_refreshUserAssess298_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/refreshUserAssess")))
  )
  private[this] lazy val controllers_Mod_refreshUserAssess298_invoker = createInvoker(
    Mod_53.refreshUserAssess(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "refreshUserAssess",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/refreshUserAssess""",
      """""",
      Seq()
    )
  )

  // @LINE:376
  private[this] lazy val controllers_Mod_setEmail299_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/email")))
  )
  private[this] lazy val controllers_Mod_setEmail299_invoker = createInvoker(
    Mod_53.setEmail(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "setEmail",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/email""",
      """""",
      Seq()
    )
  )

  // @LINE:377
  private[this] lazy val controllers_Mod_notifySlack300_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/notify-slack")))
  )
  private[this] lazy val controllers_Mod_notifySlack300_invoker = createInvoker(
    Mod_53.notifySlack(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "notifySlack",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/notify-slack""",
      """""",
      Seq()
    )
  )

  // @LINE:378
  private[this] lazy val controllers_Mod_ipIntel301_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/ip-intel")))
  )
  private[this] lazy val controllers_Mod_ipIntel301_invoker = createInvoker(
    Mod_53.ipIntel(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "ipIntel",
      Seq(classOf[String]),
      "GET",
      this.prefix + """mod/ip-intel""",
      """""",
      Seq()
    )
  )

  // @LINE:379
  private[this] lazy val controllers_Mod_gamify302_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/leaderboard")))
  )
  private[this] lazy val controllers_Mod_gamify302_invoker = createInvoker(
    Mod_53.gamify,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "gamify",
      Nil,
      "GET",
      this.prefix + """mod/leaderboard""",
      """""",
      Seq()
    )
  )

  // @LINE:380
  private[this] lazy val controllers_Mod_gamifyPeriod303_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/leaderboard/"), DynamicPart("period", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_gamifyPeriod303_invoker = createInvoker(
    Mod_53.gamifyPeriod(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "gamifyPeriod",
      Seq(classOf[String]),
      "GET",
      this.prefix + """mod/leaderboard/""" + "$" + """period<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:381
  private[this] lazy val controllers_Mod_search304_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/search")))
  )
  private[this] lazy val controllers_Mod_search304_invoker = createInvoker(
    Mod_53.search,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "search",
      Nil,
      "GET",
      this.prefix + """mod/search""",
      """""",
      Seq()
    )
  )

  // @LINE:382
  private[this] lazy val controllers_Mod_chatUser305_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/chat-user/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_chatUser305_invoker = createInvoker(
    Mod_53.chatUser(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "chatUser",
      Seq(classOf[String]),
      "GET",
      this.prefix + """mod/chat-user/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:383
  private[this] lazy val controllers_Mod_permissions306_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/permissions")))
  )
  private[this] lazy val controllers_Mod_permissions306_invoker = createInvoker(
    Mod_53.permissions(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "permissions",
      Seq(classOf[String]),
      "GET",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/permissions""",
      """""",
      Seq()
    )
  )

  // @LINE:384
  private[this] lazy val controllers_Mod_savePermissions307_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/"), DynamicPart("username", """[^/]+""",true), StaticPart("/permissions")))
  )
  private[this] lazy val controllers_Mod_savePermissions307_invoker = createInvoker(
    Mod_53.savePermissions(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "savePermissions",
      Seq(classOf[String]),
      "POST",
      this.prefix + """mod/""" + "$" + """username<[^/]+>/permissions""",
      """""",
      Seq()
    )
  )

  // @LINE:385
  private[this] lazy val controllers_Mod_publicChat308_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/public-chat")))
  )
  private[this] lazy val controllers_Mod_publicChat308_invoker = createInvoker(
    Mod_53.publicChat,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "publicChat",
      Nil,
      "GET",
      this.prefix + """mod/public-chat""",
      """""",
      Seq()
    )
  )

  // @LINE:386
  private[this] lazy val controllers_Mod_emailConfirm309_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/email-confirm")))
  )
  private[this] lazy val controllers_Mod_emailConfirm309_invoker = createInvoker(
    Mod_53.emailConfirm,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "emailConfirm",
      Nil,
      "GET",
      this.prefix + """mod/email-confirm""",
      """""",
      Seq()
    )
  )

  // @LINE:387
  private[this] lazy val controllers_Mod_chatPanic310_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/chat-panic")))
  )
  private[this] lazy val controllers_Mod_chatPanic310_invoker = createInvoker(
    Mod_53.chatPanic,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "chatPanic",
      Nil,
      "GET",
      this.prefix + """mod/chat-panic""",
      """""",
      Seq()
    )
  )

  // @LINE:388
  private[this] lazy val controllers_Mod_chatPanicPost311_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/chat-panic")))
  )
  private[this] lazy val controllers_Mod_chatPanicPost311_invoker = createInvoker(
    Mod_53.chatPanicPost,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "chatPanicPost",
      Nil,
      "POST",
      this.prefix + """mod/chat-panic""",
      """""",
      Seq()
    )
  )

  // @LINE:389
  private[this] lazy val controllers_Mod_print312_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/print/"), DynamicPart("fh", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_print312_invoker = createInvoker(
    Mod_53.print(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "print",
      Seq(classOf[String]),
      "GET",
      this.prefix + """mod/print/""" + "$" + """fh<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:390
  private[this] lazy val controllers_Mod_printBan313_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mod/print/ban/"), DynamicPart("v", """[^/]+""",true), StaticPart("/"), DynamicPart("fh", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Mod_printBan313_invoker = createInvoker(
    Mod_53.printBan(fakeValue[Boolean], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "printBan",
      Seq(classOf[Boolean], classOf[String]),
      "POST",
      this.prefix + """mod/print/ban/""" + "$" + """v<[^/]+>/""" + "$" + """fh<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:391
  private[this] lazy val controllers_Mod_eventStream314_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/stream/mod")))
  )
  private[this] lazy val controllers_Mod_eventStream314_invoker = createInvoker(
    Mod_53.eventStream,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Mod",
      "eventStream",
      Nil,
      "GET",
      this.prefix + """api/stream/mod""",
      """""",
      Seq()
    )
  )

  // @LINE:394
  private[this] lazy val controllers_Irwin_dashboard315_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("irwin")))
  )
  private[this] lazy val controllers_Irwin_dashboard315_invoker = createInvoker(
    Irwin_41.dashboard,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Irwin",
      "dashboard",
      Nil,
      "GET",
      this.prefix + """irwin""",
      """ Irwin""",
      Seq()
    )
  )

  // @LINE:395
  private[this] lazy val controllers_Irwin_saveReport316_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("irwin/report")))
  )
  private[this] lazy val controllers_Irwin_saveReport316_invoker = createInvoker(
    Irwin_41.saveReport,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Irwin",
      "saveReport",
      Nil,
      "POST",
      this.prefix + """irwin/report""",
      """""",
      Seq()
    )
  )

  // @LINE:396
  private[this] lazy val controllers_Irwin_eventStream317_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/stream/irwin")))
  )
  private[this] lazy val controllers_Irwin_eventStream317_invoker = createInvoker(
    Irwin_41.eventStream,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Irwin",
      "eventStream",
      Nil,
      "GET",
      this.prefix + """api/stream/irwin""",
      """""",
      Seq()
    )
  )

  // @LINE:399
  private[this] lazy val controllers_Bookmark_toggle318_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("bookmark/"), DynamicPart("gameId", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Bookmark_toggle318_invoker = createInvoker(
    Bookmark_43.toggle(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Bookmark",
      "toggle",
      Seq(classOf[String]),
      "POST",
      this.prefix + """bookmark/""" + "$" + """gameId<\w{8}>""",
      """ Bookmark""",
      Seq()
    )
  )

  // @LINE:402
  private[this] lazy val controllers_ForumCateg_index319_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum")))
  )
  private[this] lazy val controllers_ForumCateg_index319_invoker = createInvoker(
    ForumCateg_26.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumCateg",
      "index",
      Nil,
      "GET",
      this.prefix + """forum""",
      """ Forum""",
      Seq()
    )
  )

  // @LINE:403
  private[this] lazy val controllers_ForumPost_search320_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/search")))
  )
  private[this] lazy val controllers_ForumPost_search320_invoker = createInvoker(
    ForumPost_49.search(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumPost",
      "search",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """forum/search""",
      """""",
      Seq()
    )
  )

  // @LINE:404
  private[this] lazy val controllers_ForumCateg_show321_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("slug", """[^/]+""",true)))
  )
  private[this] lazy val controllers_ForumCateg_show321_invoker = createInvoker(
    ForumCateg_26.show(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumCateg",
      "show",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """forum/""" + "$" + """slug<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:405
  private[this] lazy val controllers_ForumTopic_form322_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("categSlug", """[^/]+""",true), StaticPart("/form")))
  )
  private[this] lazy val controllers_ForumTopic_form322_invoker = createInvoker(
    ForumTopic_15.form(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumTopic",
      "form",
      Seq(classOf[String]),
      "GET",
      this.prefix + """forum/""" + "$" + """categSlug<[^/]+>/form""",
      """""",
      Seq()
    )
  )

  // @LINE:406
  private[this] lazy val controllers_ForumTopic_create323_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("categSlug", """[^/]+""",true), StaticPart("/new")))
  )
  private[this] lazy val controllers_ForumTopic_create323_invoker = createInvoker(
    ForumTopic_15.create(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumTopic",
      "create",
      Seq(classOf[String]),
      "POST",
      this.prefix + """forum/""" + "$" + """categSlug<[^/]+>/new""",
      """""",
      Seq()
    )
  )

  // @LINE:407
  private[this] lazy val controllers_ForumTopic_participants324_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/participants/"), DynamicPart("topicId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_ForumTopic_participants324_invoker = createInvoker(
    ForumTopic_15.participants(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumTopic",
      "participants",
      Seq(classOf[String]),
      "GET",
      this.prefix + """forum/participants/""" + "$" + """topicId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:408
  private[this] lazy val controllers_ForumTopic_show325_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("categSlug", """[^/]+""",true), StaticPart("/"), DynamicPart("slug", """[^/]+""",true)))
  )
  private[this] lazy val controllers_ForumTopic_show325_invoker = createInvoker(
    ForumTopic_15.show(fakeValue[String], fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumTopic",
      "show",
      Seq(classOf[String], classOf[String], classOf[Int]),
      "GET",
      this.prefix + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:409
  private[this] lazy val controllers_ForumTopic_close326_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("categSlug", """[^/]+""",true), StaticPart("/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/close")))
  )
  private[this] lazy val controllers_ForumTopic_close326_invoker = createInvoker(
    ForumTopic_15.close(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumTopic",
      "close",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>/close""",
      """""",
      Seq()
    )
  )

  // @LINE:410
  private[this] lazy val controllers_ForumTopic_hide327_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("categSlug", """[^/]+""",true), StaticPart("/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/hide")))
  )
  private[this] lazy val controllers_ForumTopic_hide327_invoker = createInvoker(
    ForumTopic_15.hide(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumTopic",
      "hide",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>/hide""",
      """""",
      Seq()
    )
  )

  // @LINE:411
  private[this] lazy val controllers_ForumTopic_sticky328_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("categSlug", """[^/]+""",true), StaticPart("/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/sticky")))
  )
  private[this] lazy val controllers_ForumTopic_sticky328_invoker = createInvoker(
    ForumTopic_15.sticky(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumTopic",
      "sticky",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>/sticky""",
      """""",
      Seq()
    )
  )

  // @LINE:412
  private[this] lazy val controllers_ForumPost_create329_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("categSlug", """[^/]+""",true), StaticPart("/"), DynamicPart("slug", """[^/]+""",true), StaticPart("/new")))
  )
  private[this] lazy val controllers_ForumPost_create329_invoker = createInvoker(
    ForumPost_49.create(fakeValue[String], fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumPost",
      "create",
      Seq(classOf[String], classOf[String], classOf[Int]),
      "POST",
      this.prefix + """forum/""" + "$" + """categSlug<[^/]+>/""" + "$" + """slug<[^/]+>/new""",
      """""",
      Seq()
    )
  )

  // @LINE:413
  private[this] lazy val controllers_ForumPost_delete330_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/"), DynamicPart("categSlug", """[^/]+""",true), StaticPart("/delete/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_ForumPost_delete330_invoker = createInvoker(
    ForumPost_49.delete(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumPost",
      "delete",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """forum/""" + "$" + """categSlug<[^/]+>/delete/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:414
  private[this] lazy val controllers_ForumPost_edit331_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/post/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_ForumPost_edit331_invoker = createInvoker(
    ForumPost_49.edit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumPost",
      "edit",
      Seq(classOf[String]),
      "POST",
      this.prefix + """forum/post/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:415
  private[this] lazy val controllers_ForumPost_redirect332_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("forum/redirect/post/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_ForumPost_redirect332_invoker = createInvoker(
    ForumPost_49.redirect(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ForumPost",
      "redirect",
      Seq(classOf[String]),
      "GET",
      this.prefix + """forum/redirect/post/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:418
  private[this] lazy val controllers_Msg_compatCreate333_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("inbox/new")))
  )
  private[this] lazy val controllers_Msg_compatCreate333_invoker = createInvoker(
    Msg_31.compatCreate,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Msg",
      "compatCreate",
      Nil,
      "POST",
      this.prefix + """inbox/new""",
      """ Msg compat""",
      Seq()
    )
  )

  // @LINE:420
  private[this] lazy val controllers_Msg_home334_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("inbox")))
  )
  private[this] lazy val controllers_Msg_home334_invoker = createInvoker(
    Msg_31.home,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Msg",
      "home",
      Nil,
      "GET",
      this.prefix + """inbox""",
      """ Msg""",
      Seq()
    )
  )

  // @LINE:421
  private[this] lazy val controllers_Msg_search335_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("inbox/search")))
  )
  private[this] lazy val controllers_Msg_search335_invoker = createInvoker(
    Msg_31.search(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Msg",
      "search",
      Seq(classOf[String]),
      "GET",
      this.prefix + """inbox/search""",
      """""",
      Seq()
    )
  )

  // @LINE:422
  private[this] lazy val controllers_Msg_unreadCount336_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("inbox/unread-count")))
  )
  private[this] lazy val controllers_Msg_unreadCount336_invoker = createInvoker(
    Msg_31.unreadCount,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Msg",
      "unreadCount",
      Nil,
      "GET",
      this.prefix + """inbox/unread-count""",
      """""",
      Seq()
    )
  )

  // @LINE:423
  private[this] lazy val controllers_Msg_convo337_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("inbox/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Msg_convo337_invoker = createInvoker(
    Msg_31.convo(fakeValue[String], fakeValue[Option[Long]]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Msg",
      "convo",
      Seq(classOf[String], classOf[Option[Long]]),
      "GET",
      this.prefix + """inbox/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:424
  private[this] lazy val controllers_Msg_convoDelete338_route = Route("DELETE",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("inbox/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Msg_convoDelete338_invoker = createInvoker(
    Msg_31.convoDelete(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Msg",
      "convoDelete",
      Seq(classOf[String]),
      "DELETE",
      this.prefix + """inbox/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:426
  private[this] lazy val controllers_Msg_apiPost339_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("inbox/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Msg_apiPost339_invoker = createInvoker(
    Msg_31.apiPost(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Msg",
      "apiPost",
      Seq(classOf[String]),
      "POST",
      this.prefix + """inbox/""" + "$" + """username<[^/]+>""",
      """ Msg API/compat""",
      Seq()
    )
  )

  // @LINE:429
  private[this] lazy val controllers_Coach_allDefault340_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach")))
  )
  private[this] lazy val controllers_Coach_allDefault340_invoker = createInvoker(
    Coach_52.allDefault(fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "allDefault",
      Seq(classOf[Int]),
      "GET",
      this.prefix + """coach""",
      """ Coach""",
      Seq()
    )
  )

  // @LINE:430
  private[this] lazy val controllers_Coach_all341_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/sort/"), DynamicPart("order", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Coach_all341_invoker = createInvoker(
    Coach_52.all(fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "all",
      Seq(classOf[String], classOf[Int]),
      "GET",
      this.prefix + """coach/sort/""" + "$" + """order<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:431
  private[this] lazy val controllers_Coach_edit342_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/edit")))
  )
  private[this] lazy val controllers_Coach_edit342_invoker = createInvoker(
    Coach_52.edit,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "edit",
      Nil,
      "GET",
      this.prefix + """coach/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:432
  private[this] lazy val controllers_Coach_editApply343_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/edit")))
  )
  private[this] lazy val controllers_Coach_editApply343_invoker = createInvoker(
    Coach_52.editApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "editApply",
      Nil,
      "POST",
      this.prefix + """coach/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:433
  private[this] lazy val controllers_Coach_picture344_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/picture/edit")))
  )
  private[this] lazy val controllers_Coach_picture344_invoker = createInvoker(
    Coach_52.picture,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "picture",
      Nil,
      "GET",
      this.prefix + """coach/picture/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:434
  private[this] lazy val controllers_Coach_pictureApply345_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/picture/upload")))
  )
  private[this] lazy val controllers_Coach_pictureApply345_invoker = createInvoker(
    Coach_52.pictureApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "pictureApply",
      Nil,
      "POST",
      this.prefix + """coach/picture/upload""",
      """""",
      Seq()
    )
  )

  // @LINE:435
  private[this] lazy val controllers_Coach_pictureDelete346_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/picture/delete")))
  )
  private[this] lazy val controllers_Coach_pictureDelete346_invoker = createInvoker(
    Coach_52.pictureDelete,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "pictureDelete",
      Nil,
      "POST",
      this.prefix + """coach/picture/delete""",
      """""",
      Seq()
    )
  )

  // @LINE:436
  private[this] lazy val controllers_Coach_approveReview347_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/approve-review/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Coach_approveReview347_invoker = createInvoker(
    Coach_52.approveReview(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "approveReview",
      Seq(classOf[String]),
      "POST",
      this.prefix + """coach/approve-review/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:437
  private[this] lazy val controllers_Coach_modReview348_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/mod-review/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Coach_modReview348_invoker = createInvoker(
    Coach_52.modReview(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "modReview",
      Seq(classOf[String]),
      "POST",
      this.prefix + """coach/mod-review/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:438
  private[this] lazy val controllers_Coach_show349_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Coach_show349_invoker = createInvoker(
    Coach_52.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """coach/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:439
  private[this] lazy val controllers_Coach_review350_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("coach/"), DynamicPart("username", """[^/]+""",true), StaticPart("/review")))
  )
  private[this] lazy val controllers_Coach_review350_invoker = createInvoker(
    Coach_52.review(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Coach",
      "review",
      Seq(classOf[String]),
      "POST",
      this.prefix + """coach/""" + "$" + """username<[^/]+>/review""",
      """""",
      Seq()
    )
  )

  // @LINE:442
  private[this] lazy val controllers_Clas_index351_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class")))
  )
  private[this] lazy val controllers_Clas_index351_invoker = createInvoker(
    Clas_32.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "index",
      Nil,
      "GET",
      this.prefix + """class""",
      """ Clas""",
      Seq()
    )
  )

  // @LINE:443
  private[this] lazy val controllers_Clas_form352_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/new")))
  )
  private[this] lazy val controllers_Clas_form352_invoker = createInvoker(
    Clas_32.form,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "form",
      Nil,
      "GET",
      this.prefix + """class/new""",
      """""",
      Seq()
    )
  )

  // @LINE:444
  private[this] lazy val controllers_Clas_create353_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/new")))
  )
  private[this] lazy val controllers_Clas_create353_invoker = createInvoker(
    Clas_32.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "create",
      Nil,
      "POST",
      this.prefix + """class/new""",
      """""",
      Seq()
    )
  )

  // @LINE:445
  private[this] lazy val controllers_Clas_verifyTeacher354_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/verify-teacher")))
  )
  private[this] lazy val controllers_Clas_verifyTeacher354_invoker = createInvoker(
    Clas_32.verifyTeacher,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "verifyTeacher",
      Nil,
      "GET",
      this.prefix + """class/verify-teacher""",
      """""",
      Seq()
    )
  )

  // @LINE:446
  private[this] lazy val controllers_Clas_show355_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Clas_show355_invoker = createInvoker(
    Clas_32.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:447
  private[this] lazy val controllers_Clas_edit356_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Clas_edit356_invoker = createInvoker(
    Clas_32.edit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "edit",
      Seq(classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:448
  private[this] lazy val controllers_Clas_update357_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Clas_update357_invoker = createInvoker(
    Clas_32.update(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "update",
      Seq(classOf[String]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:449
  private[this] lazy val controllers_Clas_wall358_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/news")))
  )
  private[this] lazy val controllers_Clas_wall358_invoker = createInvoker(
    Clas_32.wall(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "wall",
      Seq(classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/news""",
      """""",
      Seq()
    )
  )

  // @LINE:450
  private[this] lazy val controllers_Clas_wallEdit359_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/news/edit")))
  )
  private[this] lazy val controllers_Clas_wallEdit359_invoker = createInvoker(
    Clas_32.wallEdit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "wallEdit",
      Seq(classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/news/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:451
  private[this] lazy val controllers_Clas_wallUpdate360_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/news/edit")))
  )
  private[this] lazy val controllers_Clas_wallUpdate360_invoker = createInvoker(
    Clas_32.wallUpdate(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "wallUpdate",
      Seq(classOf[String]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/news/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:452
  private[this] lazy val controllers_Clas_notifyStudents361_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/notify")))
  )
  private[this] lazy val controllers_Clas_notifyStudents361_invoker = createInvoker(
    Clas_32.notifyStudents(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "notifyStudents",
      Seq(classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/notify""",
      """""",
      Seq()
    )
  )

  // @LINE:453
  private[this] lazy val controllers_Clas_notifyPost362_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/notifyPost")))
  )
  private[this] lazy val controllers_Clas_notifyPost362_invoker = createInvoker(
    Clas_32.notifyPost(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "notifyPost",
      Seq(classOf[String]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/notifyPost""",
      """""",
      Seq()
    )
  )

  // @LINE:454
  private[this] lazy val controllers_Clas_archive363_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/archive")))
  )
  private[this] lazy val controllers_Clas_archive363_invoker = createInvoker(
    Clas_32.archive(fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "archive",
      Seq(classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/archive""",
      """""",
      Seq()
    )
  )

  // @LINE:455
  private[this] lazy val controllers_Clas_archived364_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/archived")))
  )
  private[this] lazy val controllers_Clas_archived364_invoker = createInvoker(
    Clas_32.archived(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "archived",
      Seq(classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/archived""",
      """""",
      Seq()
    )
  )

  // @LINE:456
  private[this] lazy val controllers_Clas_progress365_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/progress/"), DynamicPart("pt", """[^/]+""",true), StaticPart("/"), DynamicPart("days", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Clas_progress365_invoker = createInvoker(
    Clas_32.progress(fakeValue[String], fakeValue[String], fakeValue[Int]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "progress",
      Seq(classOf[String], classOf[String], classOf[Int]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/progress/""" + "$" + """pt<[^/]+>/""" + "$" + """days<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:457
  private[this] lazy val controllers_Clas_studentForm366_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/add")))
  )
  private[this] lazy val controllers_Clas_studentForm366_invoker = createInvoker(
    Clas_32.studentForm(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentForm",
      Seq(classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/add""",
      """""",
      Seq()
    )
  )

  // @LINE:458
  private[this] lazy val controllers_Clas_studentCreate367_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/new")))
  )
  private[this] lazy val controllers_Clas_studentCreate367_invoker = createInvoker(
    Clas_32.studentCreate(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentCreate",
      Seq(classOf[String]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/new""",
      """""",
      Seq()
    )
  )

  // @LINE:459
  private[this] lazy val controllers_Clas_studentInvite368_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/invite")))
  )
  private[this] lazy val controllers_Clas_studentInvite368_invoker = createInvoker(
    Clas_32.studentInvite(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentInvite",
      Seq(classOf[String]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/invite""",
      """""",
      Seq()
    )
  )

  // @LINE:460
  private[this] lazy val controllers_Clas_studentShow369_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Clas_studentShow369_invoker = createInvoker(
    Clas_32.studentShow(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentShow",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:461
  private[this] lazy val controllers_Clas_studentArchive370_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/"), DynamicPart("username", """[^/]+""",true), StaticPart("/archive")))
  )
  private[this] lazy val controllers_Clas_studentArchive370_invoker = createInvoker(
    Clas_32.studentArchive(fakeValue[String], fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentArchive",
      Seq(classOf[String], classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/archive""",
      """""",
      Seq()
    )
  )

  // @LINE:462
  private[this] lazy val controllers_Clas_studentResetPassword371_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/"), DynamicPart("username", """[^/]+""",true), StaticPart("/reset-password")))
  )
  private[this] lazy val controllers_Clas_studentResetPassword371_invoker = createInvoker(
    Clas_32.studentResetPassword(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentResetPassword",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/reset-password""",
      """""",
      Seq()
    )
  )

  // @LINE:463
  private[this] lazy val controllers_Clas_studentSetKid372_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/"), DynamicPart("username", """[^/]+""",true), StaticPart("/set-kid")))
  )
  private[this] lazy val controllers_Clas_studentSetKid372_invoker = createInvoker(
    Clas_32.studentSetKid(fakeValue[String], fakeValue[String], fakeValue[Boolean]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentSetKid",
      Seq(classOf[String], classOf[String], classOf[Boolean]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/set-kid""",
      """""",
      Seq()
    )
  )

  // @LINE:464
  private[this] lazy val controllers_Clas_studentEdit373_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/"), DynamicPart("username", """[^/]+""",true), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Clas_studentEdit373_invoker = createInvoker(
    Clas_32.studentEdit(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentEdit",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:465
  private[this] lazy val controllers_Clas_studentUpdate374_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/"), DynamicPart("username", """[^/]+""",true), StaticPart("/edit")))
  )
  private[this] lazy val controllers_Clas_studentUpdate374_invoker = createInvoker(
    Clas_32.studentUpdate(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentUpdate",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:466
  private[this] lazy val controllers_Clas_studentRelease375_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/"), DynamicPart("username", """[^/]+""",true), StaticPart("/release")))
  )
  private[this] lazy val controllers_Clas_studentRelease375_invoker = createInvoker(
    Clas_32.studentRelease(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentRelease",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/release""",
      """""",
      Seq()
    )
  )

  // @LINE:467
  private[this] lazy val controllers_Clas_studentReleasePost376_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("class/"), DynamicPart("id", """\w{8}""",false), StaticPart("/student/"), DynamicPart("username", """[^/]+""",true), StaticPart("/release")))
  )
  private[this] lazy val controllers_Clas_studentReleasePost376_invoker = createInvoker(
    Clas_32.studentReleasePost(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Clas",
      "studentReleasePost",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """class/""" + "$" + """id<\w{8}>/student/""" + "$" + """username<[^/]+>/release""",
      """""",
      Seq()
    )
  )

  // @LINE:470
  private[this] lazy val controllers_Main_image377_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("image/"), DynamicPart("id", """[^/]+""",true), StaticPart("/"), DynamicPart("hash", """[^/]+""",true), StaticPart("/"), DynamicPart("name", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Main_image377_invoker = createInvoker(
    Main_13.image(fakeValue[String], fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "image",
      Seq(classOf[String], classOf[String], classOf[String]),
      "GET",
      this.prefix + """image/""" + "$" + """id<[^/]+>/""" + "$" + """hash<[^/]+>/""" + "$" + """name<[^/]+>""",
      """ DB image""",
      Seq()
    )
  )

  // @LINE:473
  private[this] lazy val controllers_Importer_importGame378_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("paste")))
  )
  private[this] lazy val controllers_Importer_importGame378_invoker = createInvoker(
    Importer_10.importGame,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Importer",
      "importGame",
      Nil,
      "GET",
      this.prefix + """paste""",
      """ Paste""",
      Seq()
    )
  )

  // @LINE:474
  private[this] lazy val controllers_Importer_sendGame379_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("import")))
  )
  private[this] lazy val controllers_Importer_sendGame379_invoker = createInvoker(
    Importer_10.sendGame,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Importer",
      "sendGame",
      Nil,
      "POST",
      this.prefix + """import""",
      """""",
      Seq()
    )
  )

  // @LINE:475
  private[this] lazy val controllers_Importer_masterGame380_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("import/master/"), DynamicPart("id", """\w{8}""",false), StaticPart("/"), DynamicPart("color", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Importer_masterGame380_invoker = createInvoker(
    Importer_10.masterGame(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Importer",
      "masterGame",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """import/master/""" + "$" + """id<\w{8}>/""" + "$" + """color<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:478
  private[this] lazy val controllers_Editor_data381_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("editor.json")))
  )
  private[this] lazy val controllers_Editor_data381_invoker = createInvoker(
    Editor_8.data,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Editor",
      "data",
      Nil,
      "GET",
      this.prefix + """editor.json""",
      """ Edit""",
      Seq()
    )
  )

  // @LINE:479
  private[this] lazy val controllers_Editor_load382_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("editor/"), DynamicPart("urlFen", """.+""",false)))
  )
  private[this] lazy val controllers_Editor_load382_invoker = createInvoker(
    Editor_8.load(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Editor",
      "load",
      Seq(classOf[String]),
      "GET",
      this.prefix + """editor/""" + "$" + """urlFen<.+>""",
      """""",
      Seq()
    )
  )

  // @LINE:480
  private[this] lazy val controllers_Editor_index383_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("editor")))
  )
  private[this] lazy val controllers_Editor_index383_invoker = createInvoker(
    Editor_8.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Editor",
      "index",
      Nil,
      "GET",
      this.prefix + """editor""",
      """""",
      Seq()
    )
  )

  // @LINE:483
  private[this] lazy val controllers_Report_form384_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report")))
  )
  private[this] lazy val controllers_Report_form384_invoker = createInvoker(
    Report_38.form,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "form",
      Nil,
      "GET",
      this.prefix + """report""",
      """ Report""",
      Seq()
    )
  )

  // @LINE:484
  private[this] lazy val controllers_Report_create385_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report")))
  )
  private[this] lazy val controllers_Report_create385_invoker = createInvoker(
    Report_38.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "create",
      Nil,
      "POST",
      this.prefix + """report""",
      """""",
      Seq()
    )
  )

  // @LINE:485
  private[this] lazy val controllers_Report_flag386_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report/flag")))
  )
  private[this] lazy val controllers_Report_flag386_invoker = createInvoker(
    Report_38.flag,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "flag",
      Nil,
      "POST",
      this.prefix + """report/flag""",
      """""",
      Seq()
    )
  )

  // @LINE:486
  private[this] lazy val controllers_Report_thanks387_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report/thanks")))
  )
  private[this] lazy val controllers_Report_thanks387_invoker = createInvoker(
    Report_38.thanks(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "thanks",
      Seq(classOf[String]),
      "GET",
      this.prefix + """report/thanks""",
      """""",
      Seq()
    )
  )

  // @LINE:487
  private[this] lazy val controllers_Report_list388_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report/list")))
  )
  private[this] lazy val controllers_Report_list388_invoker = createInvoker(
    Report_38.list,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "list",
      Nil,
      "GET",
      this.prefix + """report/list""",
      """""",
      Seq()
    )
  )

  // @LINE:488
  private[this] lazy val controllers_Report_listWithFilter389_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report/list/"), DynamicPart("room", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Report_listWithFilter389_invoker = createInvoker(
    Report_38.listWithFilter(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "listWithFilter",
      Seq(classOf[String]),
      "GET",
      this.prefix + """report/list/""" + "$" + """room<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:489
  private[this] lazy val controllers_Report_inquiry390_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report/"), DynamicPart("id", """[^/]+""",true), StaticPart("/inquiry")))
  )
  private[this] lazy val controllers_Report_inquiry390_invoker = createInvoker(
    Report_38.inquiry(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "inquiry",
      Seq(classOf[String]),
      "POST",
      this.prefix + """report/""" + "$" + """id<[^/]+>/inquiry""",
      """""",
      Seq()
    )
  )

  // @LINE:490
  private[this] lazy val controllers_Report_process391_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report/"), DynamicPart("id", """[^/]+""",true), StaticPart("/process")))
  )
  private[this] lazy val controllers_Report_process391_invoker = createInvoker(
    Report_38.process(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "process",
      Seq(classOf[String]),
      "POST",
      this.prefix + """report/""" + "$" + """id<[^/]+>/process""",
      """""",
      Seq()
    )
  )

  // @LINE:491
  private[this] lazy val controllers_Report_xfiles392_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report/"), DynamicPart("id", """[^/]+""",true), StaticPart("/xfiles")))
  )
  private[this] lazy val controllers_Report_xfiles392_invoker = createInvoker(
    Report_38.xfiles(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "xfiles",
      Seq(classOf[String]),
      "POST",
      this.prefix + """report/""" + "$" + """id<[^/]+>/xfiles""",
      """""",
      Seq()
    )
  )

  // @LINE:492
  private[this] lazy val controllers_Report_currentCheatInquiry393_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("report/"), DynamicPart("username", """[^/]+""",true), StaticPart("/cheat-inquiry")))
  )
  private[this] lazy val controllers_Report_currentCheatInquiry393_invoker = createInvoker(
    Report_38.currentCheatInquiry(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Report",
      "currentCheatInquiry",
      Seq(classOf[String]),
      "GET",
      this.prefix + """report/""" + "$" + """username<[^/]+>/cheat-inquiry""",
      """""",
      Seq()
    )
  )

  // @LINE:495
  private[this] lazy val controllers_Stat_ratingDistribution394_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("stat/rating/distribution/"), DynamicPart("perf", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Stat_ratingDistribution394_invoker = createInvoker(
    Stat_45.ratingDistribution(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Stat",
      "ratingDistribution",
      Seq(classOf[String]),
      "GET",
      this.prefix + """stat/rating/distribution/""" + "$" + """perf<[^/]+>""",
      """ Stats""",
      Seq()
    )
  )

  // @LINE:498
  private[this] lazy val controllers_Api_index395_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api")))
  )
  private[this] lazy val controllers_Api_index395_invoker = createInvoker(
    Api_58.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "index",
      Nil,
      "GET",
      this.prefix + """api""",
      """ API""",
      Seq()
    )
  )

  // @LINE:499
  private[this] lazy val controllers_Api_usersByIds396_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/users")))
  )
  private[this] lazy val controllers_Api_usersByIds396_invoker = createInvoker(
    Api_58.usersByIds,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "usersByIds",
      Nil,
      "POST",
      this.prefix + """api/users""",
      """""",
      Seq()
    )
  )

  // @LINE:500
  private[this] lazy val controllers_Puzzle_activity397_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/puzzle-activity")))
  )
  private[this] lazy val controllers_Puzzle_activity397_invoker = createInvoker(
    Puzzle_44.activity,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Puzzle",
      "activity",
      Nil,
      "GET",
      this.prefix + """api/user/puzzle-activity""",
      """""",
      Seq()
    )
  )

  // @LINE:501
  private[this] lazy val controllers_Api_tournamentsByOwner398_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/"), DynamicPart("name", """[^/]+""",true), StaticPart("/tournament/created")))
  )
  private[this] lazy val controllers_Api_tournamentsByOwner398_invoker = createInvoker(
    Api_58.tournamentsByOwner(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "tournamentsByOwner",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/user/""" + "$" + """name<[^/]+>/tournament/created""",
      """""",
      Seq()
    )
  )

  // @LINE:502
  private[this] lazy val controllers_Api_user399_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/"), DynamicPart("name", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Api_user399_invoker = createInvoker(
    Api_58.user(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "user",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/user/""" + "$" + """name<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:503
  private[this] lazy val controllers_Api_activity400_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/"), DynamicPart("name", """[^/]+""",true), StaticPart("/activity")))
  )
  private[this] lazy val controllers_Api_activity400_invoker = createInvoker(
    Api_58.activity(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "activity",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/user/""" + "$" + """name<[^/]+>/activity""",
      """""",
      Seq()
    )
  )

  // @LINE:504
  private[this] lazy val controllers_Relation_apiFollowing401_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/"), DynamicPart("name", """[^/]+""",true), StaticPart("/following")))
  )
  private[this] lazy val controllers_Relation_apiFollowing401_invoker = createInvoker(
    Relation_57.apiFollowing(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "apiFollowing",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/user/""" + "$" + """name<[^/]+>/following""",
      """""",
      Seq()
    )
  )

  // @LINE:505
  private[this] lazy val controllers_Relation_apiFollowers402_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/"), DynamicPart("name", """[^/]+""",true), StaticPart("/followers")))
  )
  private[this] lazy val controllers_Relation_apiFollowers402_invoker = createInvoker(
    Relation_57.apiFollowers(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Relation",
      "apiFollowers",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/user/""" + "$" + """name<[^/]+>/followers""",
      """""",
      Seq()
    )
  )

  // @LINE:506
  private[this] lazy val controllers_User_apiWriteNote403_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/"), DynamicPart("name", """[^/]+""",true), StaticPart("/note")))
  )
  private[this] lazy val controllers_User_apiWriteNote403_invoker = createInvoker(
    User_17.apiWriteNote(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "apiWriteNote",
      Seq(classOf[String]),
      "POST",
      this.prefix + """api/user/""" + "$" + """name<[^/]+>/note""",
      """""",
      Seq()
    )
  )

  // @LINE:507
  private[this] lazy val controllers_User_ratingHistory404_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/"), DynamicPart("name", """[^/]+""",true), StaticPart("/rating-history")))
  )
  private[this] lazy val controllers_User_ratingHistory404_invoker = createInvoker(
    User_17.ratingHistory(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.User",
      "ratingHistory",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/user/""" + "$" + """name<[^/]+>/rating-history""",
      """""",
      Seq()
    )
  )

  // @LINE:508
  private[this] lazy val controllers_Api_game405_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/game/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Api_game405_invoker = createInvoker(
    Api_58.game(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "game",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/game/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:509
  private[this] lazy val controllers_Api_currentTournaments406_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/tournament")))
  )
  private[this] lazy val controllers_Api_currentTournaments406_invoker = createInvoker(
    Api_58.currentTournaments,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "currentTournaments",
      Nil,
      "GET",
      this.prefix + """api/tournament""",
      """""",
      Seq()
    )
  )

  // @LINE:510
  private[this] lazy val controllers_Api_tournament407_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/tournament/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Api_tournament407_invoker = createInvoker(
    Api_58.tournament(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "tournament",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/tournament/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:511
  private[this] lazy val controllers_Api_tournamentGames408_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/tournament/"), DynamicPart("id", """[^/]+""",true), StaticPart("/games")))
  )
  private[this] lazy val controllers_Api_tournamentGames408_invoker = createInvoker(
    Api_58.tournamentGames(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "tournamentGames",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/tournament/""" + "$" + """id<[^/]+>/games""",
      """""",
      Seq()
    )
  )

  // @LINE:512
  private[this] lazy val controllers_Api_tournamentResults409_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/tournament/"), DynamicPart("id", """[^/]+""",true), StaticPart("/results")))
  )
  private[this] lazy val controllers_Api_tournamentResults409_invoker = createInvoker(
    Api_58.tournamentResults(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "tournamentResults",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/tournament/""" + "$" + """id<[^/]+>/results""",
      """""",
      Seq()
    )
  )

  // @LINE:513
  private[this] lazy val controllers_Tournament_apiCreate410_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/tournament")))
  )
  private[this] lazy val controllers_Tournament_apiCreate410_invoker = createInvoker(
    Tournament_2.apiCreate,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Tournament",
      "apiCreate",
      Nil,
      "POST",
      this.prefix + """api/tournament""",
      """""",
      Seq()
    )
  )

  // @LINE:514
  private[this] lazy val controllers_Simul_apiList411_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/simul")))
  )
  private[this] lazy val controllers_Simul_apiList411_invoker = createInvoker(
    Simul_48.apiList,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Simul",
      "apiList",
      Nil,
      "GET",
      this.prefix + """api/simul""",
      """""",
      Seq()
    )
  )

  // @LINE:515
  private[this] lazy val controllers_Api_status412_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/status")))
  )
  private[this] lazy val controllers_Api_status412_invoker = createInvoker(
    Api_58.status,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "status",
      Nil,
      "GET",
      this.prefix + """api/status""",
      """""",
      Seq()
    )
  )

  // @LINE:516
  private[this] lazy val controllers_Api_usersStatus413_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/users/status")))
  )
  private[this] lazy val controllers_Api_usersStatus413_invoker = createInvoker(
    Api_58.usersStatus,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "usersStatus",
      Nil,
      "GET",
      this.prefix + """api/users/status""",
      """""",
      Seq()
    )
  )

  // @LINE:517
  private[this] lazy val controllers_Api_crosstable414_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/crosstable/"), DynamicPart("u1", """[^/]+""",true), StaticPart("/"), DynamicPart("u2", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Api_crosstable414_invoker = createInvoker(
    Api_58.crosstable(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "crosstable",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """api/crosstable/""" + "$" + """u1<[^/]+>/""" + "$" + """u2<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:518
  private[this] lazy val controllers_Api_gamesByUsersStream415_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/stream/games-by-users")))
  )
  private[this] lazy val controllers_Api_gamesByUsersStream415_invoker = createInvoker(
    Api_58.gamesByUsersStream,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "gamesByUsersStream",
      Nil,
      "POST",
      this.prefix + """api/stream/games-by-users""",
      """""",
      Seq()
    )
  )

  // @LINE:519
  private[this] lazy val controllers_Api_eventStream416_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/stream/event")))
  )
  private[this] lazy val controllers_Api_eventStream416_invoker = createInvoker(
    Api_58.eventStream,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "eventStream",
      Nil,
      "GET",
      this.prefix + """api/stream/event""",
      """""",
      Seq()
    )
  )

  // @LINE:520
  private[this] lazy val controllers_Account_apiMe417_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/account")))
  )
  private[this] lazy val controllers_Account_apiMe417_invoker = createInvoker(
    Account_7.apiMe,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "apiMe",
      Nil,
      "GET",
      this.prefix + """api/account""",
      """""",
      Seq()
    )
  )

  // @LINE:521
  private[this] lazy val controllers_Account_apiNowPlaying418_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/account/playing")))
  )
  private[this] lazy val controllers_Account_apiNowPlaying418_invoker = createInvoker(
    Account_7.apiNowPlaying,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "apiNowPlaying",
      Nil,
      "GET",
      this.prefix + """api/account/playing""",
      """""",
      Seq()
    )
  )

  // @LINE:522
  private[this] lazy val controllers_Account_apiEmail419_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/account/email")))
  )
  private[this] lazy val controllers_Account_apiEmail419_invoker = createInvoker(
    Account_7.apiEmail,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "apiEmail",
      Nil,
      "GET",
      this.prefix + """api/account/email""",
      """""",
      Seq()
    )
  )

  // @LINE:523
  private[this] lazy val controllers_Account_apiKid420_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/account/kid")))
  )
  private[this] lazy val controllers_Account_apiKid420_invoker = createInvoker(
    Account_7.apiKid,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "apiKid",
      Nil,
      "GET",
      this.prefix + """api/account/kid""",
      """""",
      Seq()
    )
  )

  // @LINE:524
  private[this] lazy val controllers_Account_apiKidPost421_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/account/kid")))
  )
  private[this] lazy val controllers_Account_apiKidPost421_invoker = createInvoker(
    Account_7.apiKidPost,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "apiKidPost",
      Nil,
      "POST",
      this.prefix + """api/account/kid""",
      """""",
      Seq()
    )
  )

  // @LINE:525
  private[this] lazy val controllers_Pref_apiGet422_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/account/preferences")))
  )
  private[this] lazy val controllers_Pref_apiGet422_invoker = createInvoker(
    Pref_1.apiGet,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Pref",
      "apiGet",
      Nil,
      "GET",
      this.prefix + """api/account/preferences""",
      """""",
      Seq()
    )
  )

  // @LINE:526
  private[this] lazy val controllers_Challenge_apiCreate423_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/challenge/"), DynamicPart("user", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Challenge_apiCreate423_invoker = createInvoker(
    Challenge_28.apiCreate(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "apiCreate",
      Seq(classOf[String]),
      "POST",
      this.prefix + """api/challenge/""" + "$" + """user<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:527
  private[this] lazy val controllers_Challenge_apiAccept424_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/challenge/"), DynamicPart("id", """\w{8}""",false), StaticPart("/accept")))
  )
  private[this] lazy val controllers_Challenge_apiAccept424_invoker = createInvoker(
    Challenge_28.apiAccept(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "apiAccept",
      Seq(classOf[String]),
      "POST",
      this.prefix + """api/challenge/""" + "$" + """id<\w{8}>/accept""",
      """""",
      Seq()
    )
  )

  // @LINE:528
  private[this] lazy val controllers_Challenge_apiDecline425_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/challenge/"), DynamicPart("id", """\w{8}""",false), StaticPart("/decline")))
  )
  private[this] lazy val controllers_Challenge_apiDecline425_invoker = createInvoker(
    Challenge_28.apiDecline(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Challenge",
      "apiDecline",
      Seq(classOf[String]),
      "POST",
      this.prefix + """api/challenge/""" + "$" + """id<\w{8}>/decline""",
      """""",
      Seq()
    )
  )

  // @LINE:530
  private[this] lazy val controllers_Game_apiExportByUser426_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/games/user/"), DynamicPart("username", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Game_apiExportByUser426_invoker = createInvoker(
    Game_5.apiExportByUser(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Game",
      "apiExportByUser",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/games/user/""" + "$" + """username<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:533
  private[this] lazy val controllers_Api_userGames427_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/user/"), DynamicPart("name", """[^/]+""",true), StaticPart("/games")))
  )
  private[this] lazy val controllers_Api_userGames427_invoker = createInvoker(
    Api_58.userGames(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Api",
      "userGames",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/user/""" + "$" + """name<[^/]+>/games""",
      """ Mobile API only""",
      Seq()
    )
  )

  // @LINE:536
  private[this] lazy val controllers_Bot_gameStream428_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/bot/game/stream/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Bot_gameStream428_invoker = createInvoker(
    Bot_30.gameStream(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Bot",
      "gameStream",
      Seq(classOf[String]),
      "GET",
      this.prefix + """api/bot/game/stream/""" + "$" + """id<[^/]+>""",
      """ Bot API""",
      Seq()
    )
  )

  // @LINE:537
  private[this] lazy val controllers_Bot_move429_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/bot/game/"), DynamicPart("id", """[^/]+""",true), StaticPart("/move/"), DynamicPart("uci", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Bot_move429_invoker = createInvoker(
    Bot_30.move(fakeValue[String], fakeValue[String], fakeValue[Option[Boolean]]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Bot",
      "move",
      Seq(classOf[String], classOf[String], classOf[Option[Boolean]]),
      "POST",
      this.prefix + """api/bot/game/""" + "$" + """id<[^/]+>/move/""" + "$" + """uci<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:538
  private[this] lazy val controllers_Bot_command430_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("api/bot/"), DynamicPart("cmd", """.+""",false)))
  )
  private[this] lazy val controllers_Bot_command430_invoker = createInvoker(
    Bot_30.command(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Bot",
      "command",
      Seq(classOf[String]),
      "POST",
      this.prefix + """api/bot/""" + "$" + """cmd<.+>""",
      """""",
      Seq()
    )
  )

  // @LINE:539
  private[this] lazy val controllers_Bot_online431_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("player/bots")))
  )
  private[this] lazy val controllers_Bot_online431_invoker = createInvoker(
    Bot_30.online,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Bot",
      "online",
      Nil,
      "GET",
      this.prefix + """player/bots""",
      """""",
      Seq()
    )
  )

  // @LINE:542
  private[this] lazy val controllers_Account_passwd432_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/passwd")))
  )
  private[this] lazy val controllers_Account_passwd432_invoker = createInvoker(
    Account_7.passwd,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "passwd",
      Nil,
      "GET",
      this.prefix + """account/passwd""",
      """ Account""",
      Seq()
    )
  )

  // @LINE:543
  private[this] lazy val controllers_Account_passwdApply433_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/passwd")))
  )
  private[this] lazy val controllers_Account_passwdApply433_invoker = createInvoker(
    Account_7.passwdApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "passwdApply",
      Nil,
      "POST",
      this.prefix + """account/passwd""",
      """""",
      Seq()
    )
  )

  // @LINE:544
  private[this] lazy val controllers_Account_email434_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/email")))
  )
  private[this] lazy val controllers_Account_email434_invoker = createInvoker(
    Account_7.email,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "email",
      Nil,
      "GET",
      this.prefix + """account/email""",
      """""",
      Seq()
    )
  )

  // @LINE:545
  private[this] lazy val controllers_Account_emailApply435_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/email")))
  )
  private[this] lazy val controllers_Account_emailApply435_invoker = createInvoker(
    Account_7.emailApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "emailApply",
      Nil,
      "POST",
      this.prefix + """account/email""",
      """""",
      Seq()
    )
  )

  // @LINE:546
  private[this] lazy val controllers_Account_emailConfirmHelp436_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("contact/email-confirm/help")))
  )
  private[this] lazy val controllers_Account_emailConfirmHelp436_invoker = createInvoker(
    Account_7.emailConfirmHelp,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "emailConfirmHelp",
      Nil,
      "GET",
      this.prefix + """contact/email-confirm/help""",
      """""",
      Seq()
    )
  )

  // @LINE:547
  private[this] lazy val controllers_Account_emailConfirm437_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/email/confirm/"), DynamicPart("token", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Account_emailConfirm437_invoker = createInvoker(
    Account_7.emailConfirm(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "emailConfirm",
      Seq(classOf[String]),
      "GET",
      this.prefix + """account/email/confirm/""" + "$" + """token<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:548
  private[this] lazy val controllers_Account_close438_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/close")))
  )
  private[this] lazy val controllers_Account_close438_invoker = createInvoker(
    Account_7.close,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "close",
      Nil,
      "GET",
      this.prefix + """account/close""",
      """""",
      Seq()
    )
  )

  // @LINE:549
  private[this] lazy val controllers_Account_closeConfirm439_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/closeConfirm")))
  )
  private[this] lazy val controllers_Account_closeConfirm439_invoker = createInvoker(
    Account_7.closeConfirm,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "closeConfirm",
      Nil,
      "POST",
      this.prefix + """account/closeConfirm""",
      """""",
      Seq()
    )
  )

  // @LINE:550
  private[this] lazy val controllers_Account_profile440_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/profile")))
  )
  private[this] lazy val controllers_Account_profile440_invoker = createInvoker(
    Account_7.profile,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "profile",
      Nil,
      "GET",
      this.prefix + """account/profile""",
      """""",
      Seq()
    )
  )

  // @LINE:551
  private[this] lazy val controllers_Account_profileApply441_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/profile")))
  )
  private[this] lazy val controllers_Account_profileApply441_invoker = createInvoker(
    Account_7.profileApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "profileApply",
      Nil,
      "POST",
      this.prefix + """account/profile""",
      """""",
      Seq()
    )
  )

  // @LINE:552
  private[this] lazy val controllers_Account_username442_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/username")))
  )
  private[this] lazy val controllers_Account_username442_invoker = createInvoker(
    Account_7.username,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "username",
      Nil,
      "GET",
      this.prefix + """account/username""",
      """""",
      Seq()
    )
  )

  // @LINE:553
  private[this] lazy val controllers_Account_usernameApply443_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/username")))
  )
  private[this] lazy val controllers_Account_usernameApply443_invoker = createInvoker(
    Account_7.usernameApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "usernameApply",
      Nil,
      "POST",
      this.prefix + """account/username""",
      """""",
      Seq()
    )
  )

  // @LINE:554
  private[this] lazy val controllers_Account_kid444_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/kid")))
  )
  private[this] lazy val controllers_Account_kid444_invoker = createInvoker(
    Account_7.kid,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "kid",
      Nil,
      "GET",
      this.prefix + """account/kid""",
      """""",
      Seq()
    )
  )

  // @LINE:555
  private[this] lazy val controllers_Account_kidPost445_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/kid")))
  )
  private[this] lazy val controllers_Account_kidPost445_invoker = createInvoker(
    Account_7.kidPost,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "kidPost",
      Nil,
      "POST",
      this.prefix + """account/kid""",
      """""",
      Seq()
    )
  )

  // @LINE:556
  private[this] lazy val controllers_Account_twoFactor446_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/twofactor")))
  )
  private[this] lazy val controllers_Account_twoFactor446_invoker = createInvoker(
    Account_7.twoFactor,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "twoFactor",
      Nil,
      "GET",
      this.prefix + """account/twofactor""",
      """""",
      Seq()
    )
  )

  // @LINE:557
  private[this] lazy val controllers_Account_setupTwoFactor447_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/twofactor/setup")))
  )
  private[this] lazy val controllers_Account_setupTwoFactor447_invoker = createInvoker(
    Account_7.setupTwoFactor,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "setupTwoFactor",
      Nil,
      "POST",
      this.prefix + """account/twofactor/setup""",
      """""",
      Seq()
    )
  )

  // @LINE:558
  private[this] lazy val controllers_Account_disableTwoFactor448_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/twofactor/disable")))
  )
  private[this] lazy val controllers_Account_disableTwoFactor448_invoker = createInvoker(
    Account_7.disableTwoFactor,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "disableTwoFactor",
      Nil,
      "POST",
      this.prefix + """account/twofactor/disable""",
      """""",
      Seq()
    )
  )

  // @LINE:559
  private[this] lazy val controllers_Account_reopen449_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/reopen")))
  )
  private[this] lazy val controllers_Account_reopen449_invoker = createInvoker(
    Account_7.reopen,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "reopen",
      Nil,
      "GET",
      this.prefix + """account/reopen""",
      """""",
      Seq()
    )
  )

  // @LINE:560
  private[this] lazy val controllers_Account_reopenApply450_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/reopen/send")))
  )
  private[this] lazy val controllers_Account_reopenApply450_invoker = createInvoker(
    Account_7.reopenApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "reopenApply",
      Nil,
      "POST",
      this.prefix + """account/reopen/send""",
      """""",
      Seq()
    )
  )

  // @LINE:561
  private[this] lazy val controllers_Account_reopenSent451_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/reopen/sent/"), DynamicPart("email", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Account_reopenSent451_invoker = createInvoker(
    Account_7.reopenSent(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "reopenSent",
      Seq(classOf[String]),
      "GET",
      this.prefix + """account/reopen/sent/""" + "$" + """email<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:562
  private[this] lazy val controllers_Account_reopenLogin452_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/reopen/login/"), DynamicPart("token", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Account_reopenLogin452_invoker = createInvoker(
    Account_7.reopenLogin(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "reopenLogin",
      Seq(classOf[String]),
      "GET",
      this.prefix + """account/reopen/login/""" + "$" + """token<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:564
  private[this] lazy val controllers_Account_security453_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/security")))
  )
  private[this] lazy val controllers_Account_security453_invoker = createInvoker(
    Account_7.security,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "security",
      Nil,
      "GET",
      this.prefix + """account/security""",
      """ App BC""",
      Seq()
    )
  )

  // @LINE:565
  private[this] lazy val controllers_Account_signout454_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/signout/"), DynamicPart("sessionId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Account_signout454_invoker = createInvoker(
    Account_7.signout(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "signout",
      Seq(classOf[String]),
      "POST",
      this.prefix + """account/signout/""" + "$" + """sessionId<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:566
  private[this] lazy val controllers_Account_info455_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/info")))
  )
  private[this] lazy val controllers_Account_info455_invoker = createInvoker(
    Account_7.info,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "info",
      Nil,
      "GET",
      this.prefix + """account/info""",
      """""",
      Seq()
    )
  )

  // @LINE:567
  private[this] lazy val controllers_Account_nowPlaying456_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/now-playing")))
  )
  private[this] lazy val controllers_Account_nowPlaying456_invoker = createInvoker(
    Account_7.nowPlaying,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Account",
      "nowPlaying",
      Nil,
      "GET",
      this.prefix + """account/now-playing""",
      """""",
      Seq()
    )
  )

  // @LINE:570
  private[this] lazy val controllers_OAuthToken_index457_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/token")))
  )
  private[this] lazy val controllers_OAuthToken_index457_invoker = createInvoker(
    OAuthToken_47.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthToken",
      "index",
      Nil,
      "GET",
      this.prefix + """account/oauth/token""",
      """ OAuth""",
      Seq()
    )
  )

  // @LINE:571
  private[this] lazy val controllers_OAuthToken_create458_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/token/create")))
  )
  private[this] lazy val controllers_OAuthToken_create458_invoker = createInvoker(
    OAuthToken_47.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthToken",
      "create",
      Nil,
      "GET",
      this.prefix + """account/oauth/token/create""",
      """""",
      Seq()
    )
  )

  // @LINE:572
  private[this] lazy val controllers_OAuthToken_createApply459_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/token/create")))
  )
  private[this] lazy val controllers_OAuthToken_createApply459_invoker = createInvoker(
    OAuthToken_47.createApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthToken",
      "createApply",
      Nil,
      "POST",
      this.prefix + """account/oauth/token/create""",
      """""",
      Seq()
    )
  )

  // @LINE:573
  private[this] lazy val controllers_OAuthToken_delete460_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/token/"), DynamicPart("id", """[^/]+""",true), StaticPart("/delete")))
  )
  private[this] lazy val controllers_OAuthToken_delete460_invoker = createInvoker(
    OAuthToken_47.delete(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthToken",
      "delete",
      Seq(classOf[String]),
      "POST",
      this.prefix + """account/oauth/token/""" + "$" + """id<[^/]+>/delete""",
      """""",
      Seq()
    )
  )

  // @LINE:574
  private[this] lazy val controllers_OAuthApp_index461_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/app")))
  )
  private[this] lazy val controllers_OAuthApp_index461_invoker = createInvoker(
    OAuthApp_50.index,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthApp",
      "index",
      Nil,
      "GET",
      this.prefix + """account/oauth/app""",
      """""",
      Seq()
    )
  )

  // @LINE:575
  private[this] lazy val controllers_OAuthApp_create462_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/app/create")))
  )
  private[this] lazy val controllers_OAuthApp_create462_invoker = createInvoker(
    OAuthApp_50.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthApp",
      "create",
      Nil,
      "GET",
      this.prefix + """account/oauth/app/create""",
      """""",
      Seq()
    )
  )

  // @LINE:576
  private[this] lazy val controllers_OAuthApp_createApply463_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/app/create")))
  )
  private[this] lazy val controllers_OAuthApp_createApply463_invoker = createInvoker(
    OAuthApp_50.createApply,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthApp",
      "createApply",
      Nil,
      "POST",
      this.prefix + """account/oauth/app/create""",
      """""",
      Seq()
    )
  )

  // @LINE:577
  private[this] lazy val controllers_OAuthApp_edit464_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/app/"), DynamicPart("id", """[^/]+""",true), StaticPart("/edit")))
  )
  private[this] lazy val controllers_OAuthApp_edit464_invoker = createInvoker(
    OAuthApp_50.edit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthApp",
      "edit",
      Seq(classOf[String]),
      "GET",
      this.prefix + """account/oauth/app/""" + "$" + """id<[^/]+>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:578
  private[this] lazy val controllers_OAuthApp_update465_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/app/"), DynamicPart("id", """[^/]+""",true), StaticPart("/edit")))
  )
  private[this] lazy val controllers_OAuthApp_update465_invoker = createInvoker(
    OAuthApp_50.update(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthApp",
      "update",
      Seq(classOf[String]),
      "POST",
      this.prefix + """account/oauth/app/""" + "$" + """id<[^/]+>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:579
  private[this] lazy val controllers_OAuthApp_delete466_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("account/oauth/app/"), DynamicPart("id", """[^/]+""",true), StaticPart("/delete")))
  )
  private[this] lazy val controllers_OAuthApp_delete466_invoker = createInvoker(
    OAuthApp_50.delete(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.OAuthApp",
      "delete",
      Seq(classOf[String]),
      "POST",
      this.prefix + """account/oauth/app/""" + "$" + """id<[^/]+>/delete""",
      """""",
      Seq()
    )
  )

  // @LINE:582
  private[this] lazy val controllers_Event_show467_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("event/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Event_show467_invoker = createInvoker(
    Event_22.show(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Event",
      "show",
      Seq(classOf[String]),
      "GET",
      this.prefix + """event/""" + "$" + """id<\w{8}>""",
      """ Events""",
      Seq()
    )
  )

  // @LINE:583
  private[this] lazy val controllers_Event_manager468_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("event/manager")))
  )
  private[this] lazy val controllers_Event_manager468_invoker = createInvoker(
    Event_22.manager,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Event",
      "manager",
      Nil,
      "GET",
      this.prefix + """event/manager""",
      """""",
      Seq()
    )
  )

  // @LINE:584
  private[this] lazy val controllers_Event_edit469_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("event/manager/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Event_edit469_invoker = createInvoker(
    Event_22.edit(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Event",
      "edit",
      Seq(classOf[String]),
      "GET",
      this.prefix + """event/manager/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:585
  private[this] lazy val controllers_Event_update470_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("event/manager/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Event_update470_invoker = createInvoker(
    Event_22.update(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Event",
      "update",
      Seq(classOf[String]),
      "POST",
      this.prefix + """event/manager/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:586
  private[this] lazy val controllers_Event_cloneE471_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("event/manager/clone/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Event_cloneE471_invoker = createInvoker(
    Event_22.cloneE(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Event",
      "cloneE",
      Seq(classOf[String]),
      "GET",
      this.prefix + """event/manager/clone/""" + "$" + """id<\w{8}>""",
      """""",
      Seq()
    )
  )

  // @LINE:587
  private[this] lazy val controllers_Event_form472_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("event/manager/new")))
  )
  private[this] lazy val controllers_Event_form472_invoker = createInvoker(
    Event_22.form,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Event",
      "form",
      Nil,
      "GET",
      this.prefix + """event/manager/new""",
      """""",
      Seq()
    )
  )

  // @LINE:588
  private[this] lazy val controllers_Event_create473_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("event/manager")))
  )
  private[this] lazy val controllers_Event_create473_invoker = createInvoker(
    Event_22.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Event",
      "create",
      Nil,
      "POST",
      this.prefix + """event/manager""",
      """""",
      Seq()
    )
  )

  // @LINE:591
  private[this] lazy val controllers_Main_captchaCheck474_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("captcha/"), DynamicPart("id", """\w{8}""",false)))
  )
  private[this] lazy val controllers_Main_captchaCheck474_invoker = createInvoker(
    Main_13.captchaCheck(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "captchaCheck",
      Seq(classOf[String]),
      "GET",
      this.prefix + """captcha/""" + "$" + """id<\w{8}>""",
      """ Misc""",
      Seq()
    )
  )

  // @LINE:592
  private[this] lazy val controllers_Main_webmasters475_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("developers")))
  )
  private[this] lazy val controllers_Main_webmasters475_invoker = createInvoker(
    Main_13.webmasters,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "webmasters",
      Nil,
      "GET",
      this.prefix + """developers""",
      """""",
      Seq()
    )
  )

  // @LINE:593
  private[this] lazy val controllers_Main_mobile476_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mobile")))
  )
  private[this] lazy val controllers_Main_mobile476_invoker = createInvoker(
    Main_13.mobile,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "mobile",
      Nil,
      "GET",
      this.prefix + """mobile""",
      """""",
      Seq()
    )
  )

  // @LINE:594
  private[this] lazy val controllers_Main_lag477_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("lag")))
  )
  private[this] lazy val controllers_Main_lag477_invoker = createInvoker(
    Main_13.lag,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "lag",
      Nil,
      "GET",
      this.prefix + """lag""",
      """""",
      Seq()
    )
  )

  // @LINE:595
  private[this] lazy val controllers_Main_getFishnet478_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("get-fishnet")))
  )
  private[this] lazy val controllers_Main_getFishnet478_invoker = createInvoker(
    Main_13.getFishnet,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "getFishnet",
      Nil,
      "GET",
      this.prefix + """get-fishnet""",
      """""",
      Seq()
    )
  )

  // @LINE:596
  private[this] lazy val controllers_Main_costs479_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("costs")))
  )
  private[this] lazy val controllers_Main_costs479_invoker = createInvoker(
    Main_13.costs,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "costs",
      Nil,
      "GET",
      this.prefix + """costs""",
      """""",
      Seq()
    )
  )

  // @LINE:597
  private[this] lazy val controllers_Main_verifyTitle480_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("verify-title")))
  )
  private[this] lazy val controllers_Main_verifyTitle480_invoker = createInvoker(
    Main_13.verifyTitle,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "verifyTitle",
      Nil,
      "GET",
      this.prefix + """verify-title""",
      """""",
      Seq()
    )
  )

  // @LINE:598
  private[this] lazy val controllers_Main_instantChess481_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("InstantChess.com")))
  )
  private[this] lazy val controllers_Main_instantChess481_invoker = createInvoker(
    Main_13.instantChess,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "instantChess",
      Nil,
      "GET",
      this.prefix + """InstantChess.com""",
      """""",
      Seq()
    )
  )

  // @LINE:601
  private[this] lazy val controllers_Dev_cli482_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("dev/cli")))
  )
  private[this] lazy val controllers_Dev_cli482_invoker = createInvoker(
    Dev_29.cli,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Dev",
      "cli",
      Nil,
      "GET",
      this.prefix + """dev/cli""",
      """ Dev""",
      Seq()
    )
  )

  // @LINE:602
  private[this] lazy val controllers_Dev_cliPost483_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("dev/cli")))
  )
  private[this] lazy val controllers_Dev_cliPost483_invoker = createInvoker(
    Dev_29.cliPost,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Dev",
      "cliPost",
      Nil,
      "POST",
      this.prefix + """dev/cli""",
      """""",
      Seq()
    )
  )

  // @LINE:603
  private[this] lazy val controllers_Dev_command484_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("cli")))
  )
  private[this] lazy val controllers_Dev_command484_invoker = createInvoker(
    Dev_29.command,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Dev",
      "command",
      Nil,
      "POST",
      this.prefix + """cli""",
      """""",
      Seq()
    )
  )

  // @LINE:604
  private[this] lazy val controllers_Dev_settings485_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("dev/settings")))
  )
  private[this] lazy val controllers_Dev_settings485_invoker = createInvoker(
    Dev_29.settings,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Dev",
      "settings",
      Nil,
      "GET",
      this.prefix + """dev/settings""",
      """""",
      Seq()
    )
  )

  // @LINE:605
  private[this] lazy val controllers_Dev_settingsPost486_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("dev/settings/"), DynamicPart("id", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Dev_settingsPost486_invoker = createInvoker(
    Dev_29.settingsPost(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Dev",
      "settingsPost",
      Seq(classOf[String]),
      "POST",
      this.prefix + """dev/settings/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:608
  private[this] lazy val controllers_Push_mobileRegister487_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mobile/register/"), DynamicPart("platform", """[^/]+""",true), StaticPart("/"), DynamicPart("deviceId", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Push_mobileRegister487_invoker = createInvoker(
    Push_19.mobileRegister(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Push",
      "mobileRegister",
      Seq(classOf[String], classOf[String]),
      "POST",
      this.prefix + """mobile/register/""" + "$" + """platform<[^/]+>/""" + "$" + """deviceId<[^/]+>""",
      """ Push""",
      Seq()
    )
  )

  // @LINE:609
  private[this] lazy val controllers_Push_mobileUnregister488_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("mobile/unregister")))
  )
  private[this] lazy val controllers_Push_mobileUnregister488_invoker = createInvoker(
    Push_19.mobileUnregister,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Push",
      "mobileUnregister",
      Nil,
      "POST",
      this.prefix + """mobile/unregister""",
      """""",
      Seq()
    )
  )

  // @LINE:610
  private[this] lazy val controllers_Push_webSubscribe489_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("push/subscribe")))
  )
  private[this] lazy val controllers_Push_webSubscribe489_invoker = createInvoker(
    Push_19.webSubscribe,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Push",
      "webSubscribe",
      Nil,
      "POST",
      this.prefix + """push/subscribe""",
      """""",
      Seq()
    )
  )

  // @LINE:613
  private[this] lazy val controllers_Page_thanks490_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("thanks")))
  )
  private[this] lazy val controllers_Page_thanks490_invoker = createInvoker(
    Page_6.thanks,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "thanks",
      Nil,
      "GET",
      this.prefix + """thanks""",
      """ Pages""",
      Seq()
    )
  )

  // @LINE:614
  private[this] lazy val controllers_Page_tos491_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("terms-of-service")))
  )
  private[this] lazy val controllers_Page_tos491_invoker = createInvoker(
    Page_6.tos,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "tos",
      Nil,
      "GET",
      this.prefix + """terms-of-service""",
      """""",
      Seq()
    )
  )

  // @LINE:615
  private[this] lazy val controllers_Page_privacy492_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("privacy")))
  )
  private[this] lazy val controllers_Page_privacy492_invoker = createInvoker(
    Page_6.privacy,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "privacy",
      Nil,
      "GET",
      this.prefix + """privacy""",
      """""",
      Seq()
    )
  )

  // @LINE:616
  private[this] lazy val controllers_Main_contact493_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("contact")))
  )
  private[this] lazy val controllers_Main_contact493_invoker = createInvoker(
    Main_13.contact,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "contact",
      Nil,
      "GET",
      this.prefix + """contact""",
      """""",
      Seq()
    )
  )

  // @LINE:617
  private[this] lazy val controllers_Page_about494_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("about")))
  )
  private[this] lazy val controllers_Page_about494_invoker = createInvoker(
    Page_6.about,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "about",
      Nil,
      "GET",
      this.prefix + """about""",
      """""",
      Seq()
    )
  )

  // @LINE:618
  private[this] lazy val controllers_Main_faq495_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("faq")))
  )
  private[this] lazy val controllers_Main_faq495_invoker = createInvoker(
    Main_13.faq,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "faq",
      Nil,
      "GET",
      this.prefix + """faq""",
      """""",
      Seq()
    )
  )

  // @LINE:619
  private[this] lazy val controllers_Page_source496_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("source")))
  )
  private[this] lazy val controllers_Page_source496_invoker = createInvoker(
    Page_6.source,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "source",
      Nil,
      "GET",
      this.prefix + """source""",
      """""",
      Seq()
    )
  )

  // @LINE:620
  private[this] lazy val controllers_Main_movedPermanently497_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("qa")))
  )
  private[this] lazy val controllers_Main_movedPermanently497_invoker = createInvoker(
    Main_13.movedPermanently(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "movedPermanently",
      Seq(classOf[String]),
      "GET",
      this.prefix + """qa""",
      """""",
      Seq()
    )
  )

  // @LINE:621
  private[this] lazy val controllers_Main_movedPermanently498_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("help")))
  )
  private[this] lazy val controllers_Main_movedPermanently498_invoker = createInvoker(
    Main_13.movedPermanently(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "movedPermanently",
      Seq(classOf[String]),
      "GET",
      this.prefix + """help""",
      """""",
      Seq()
    )
  )

  // @LINE:622
  private[this] lazy val controllers_Main_legacyQaQuestion499_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("qa/"), DynamicPart("id", """[^/]+""",true), StaticPart("/"), DynamicPart("slug", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Main_legacyQaQuestion499_invoker = createInvoker(
    Main_13.legacyQaQuestion(fakeValue[Int], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "legacyQaQuestion",
      Seq(classOf[Int], classOf[String]),
      "GET",
      this.prefix + """qa/""" + "$" + """id<[^/]+>/""" + "$" + """slug<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:623
  private[this] lazy val controllers_Page_howToCheat500_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("how-to-cheat")))
  )
  private[this] lazy val controllers_Page_howToCheat500_invoker = createInvoker(
    Page_6.howToCheat,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "howToCheat",
      Nil,
      "GET",
      this.prefix + """how-to-cheat""",
      """""",
      Seq()
    )
  )

  // @LINE:624
  private[this] lazy val controllers_Page_ads501_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("ads")))
  )
  private[this] lazy val controllers_Page_ads501_invoker = createInvoker(
    Page_6.ads,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "ads",
      Nil,
      "GET",
      this.prefix + """ads""",
      """""",
      Seq()
    )
  )

  // @LINE:627
  private[this] lazy val controllers_Page_variantHome502_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("variant")))
  )
  private[this] lazy val controllers_Page_variantHome502_invoker = createInvoker(
    Page_6.variantHome,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "variantHome",
      Nil,
      "GET",
      this.prefix + """variant""",
      """ Variants""",
      Seq()
    )
  )

  // @LINE:628
  private[this] lazy val controllers_Page_variant503_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("variant/"), DynamicPart("key", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Page_variant503_invoker = createInvoker(
    Page_6.variant(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "variant",
      Seq(classOf[String]),
      "GET",
      this.prefix + """variant/""" + "$" + """key<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:631
  private[this] lazy val controllers_Page_help504_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("help/contribute")))
  )
  private[this] lazy val controllers_Page_help504_invoker = createInvoker(
    Page_6.help,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "help",
      Nil,
      "GET",
      this.prefix + """help/contribute""",
      """ Help""",
      Seq()
    )
  )

  // @LINE:632
  private[this] lazy val controllers_Page_master505_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("help/master")))
  )
  private[this] lazy val controllers_Page_master505_invoker = createInvoker(
    Page_6.master,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Page",
      "master",
      Nil,
      "GET",
      this.prefix + """help/master""",
      """""",
      Seq()
    )
  )

  // @LINE:634
  private[this] lazy val controllers_Blog_preview506_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("prismic-preview")))
  )
  private[this] lazy val controllers_Blog_preview506_invoker = createInvoker(
    Blog_33.preview(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Blog",
      "preview",
      Seq(classOf[String]),
      "GET",
      this.prefix + """prismic-preview""",
      """""",
      Seq()
    )
  )

  // @LINE:635
  private[this] lazy val controllers_Main_jslog507_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("jslog/"), DynamicPart("id", """\w{12}""",false)))
  )
  private[this] lazy val controllers_Main_jslog507_invoker = createInvoker(
    Main_13.jslog(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "jslog",
      Seq(classOf[String]),
      "POST",
      this.prefix + """jslog/""" + "$" + """id<\w{12}>""",
      """""",
      Seq()
    )
  )

  // @LINE:636
  private[this] lazy val controllers_Main_jsmon508_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("jsmon/"), DynamicPart("event", """[^/]+""",true)))
  )
  private[this] lazy val controllers_Main_jsmon508_invoker = createInvoker(
    Main_13.jsmon(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "jsmon",
      Seq(classOf[String]),
      "POST",
      this.prefix + """jsmon/""" + "$" + """event<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:638
  private[this] lazy val controllers_Main_movedPermanently509_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("swag")))
  )
  private[this] lazy val controllers_Main_movedPermanently509_invoker = createInvoker(
    Main_13.movedPermanently(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "movedPermanently",
      Seq(classOf[String]),
      "GET",
      this.prefix + """swag""",
      """""",
      Seq()
    )
  )

  // @LINE:640
  private[this] lazy val controllers_Main_devAsset510_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("assets/_"), DynamicPart("v", """\w{6}""",false), StaticPart("/"), DynamicPart("file", """.+""",false)))
  )
  private[this] lazy val controllers_Main_devAsset510_invoker = createInvoker(
    Main_13.devAsset(fakeValue[String], fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "devAsset",
      Seq(classOf[String], classOf[String], classOf[String]),
      "GET",
      this.prefix + """assets/_""" + "$" + """v<\w{6}>/""" + "$" + """file<.+>""",
      """""",
      Seq()
    )
  )

  // @LINE:641
  private[this] lazy val controllers_ExternalAssets_at511_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("assets/"), DynamicPart("file", """.+""",false)))
  )
  private[this] lazy val controllers_ExternalAssets_at511_invoker = createInvoker(
    ExternalAssets_40.at(fakeValue[String], fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.ExternalAssets",
      "at",
      Seq(classOf[String], classOf[String]),
      "GET",
      this.prefix + """assets/""" + "$" + """file<.+>""",
      """""",
      Seq()
    )
  )

  // @LINE:643
  private[this] lazy val controllers_Main_manifest512_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("manifest.json")))
  )
  private[this] lazy val controllers_Main_manifest512_invoker = createInvoker(
    Main_13.manifest,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "manifest",
      Nil,
      "GET",
      this.prefix + """manifest.json""",
      """""",
      Seq()
    )
  )

  // @LINE:644
  private[this] lazy val controllers_Main_robots513_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("robots.txt")))
  )
  private[this] lazy val controllers_Main_robots513_invoker = createInvoker(
    Main_13.robots,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Main",
      "robots",
      Nil,
      "GET",
      this.prefix + """robots.txt""",
      """""",
      Seq()
    )
  )

  // @LINE:646
  private[this] lazy val controllers_Options_root514_route = Route("OPTIONS",
    PathPattern(List(StaticPart(this.prefix)))
  )
  private[this] lazy val controllers_Options_root514_invoker = createInvoker(
    Options_4.root,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Options",
      "root",
      Nil,
      "OPTIONS",
      this.prefix + """""",
      """""",
      Seq()
    )
  )

  // @LINE:647
  private[this] lazy val controllers_Options_all515_route = Route("OPTIONS",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), DynamicPart("url", """.+""",false)))
  )
  private[this] lazy val controllers_Options_all515_invoker = createInvoker(
    Options_4.all(fakeValue[String]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.Options",
      "all",
      Seq(classOf[String]),
      "OPTIONS",
      this.prefix + """""" + "$" + """url<.+>""",
      """""",
      Seq()
    )
  )


  def routes: PartialFunction[RequestHeader, Handler] = {
  
    // @LINE:2
    case controllers_Main_toggleBlindMode0_route(params@_) =>
      call { 
        controllers_Main_toggleBlindMode0_invoker.call(Main_13.toggleBlindMode)
      }
  
    // @LINE:5
    case controllers_Lobby_home1_route(params@_) =>
      call { 
        controllers_Lobby_home1_invoker.call(Lobby_51.home)
      }
  
    // @LINE:6
    case controllers_Lobby_seeks2_route(params@_) =>
      call { 
        controllers_Lobby_seeks2_invoker.call(Lobby_51.seeks)
      }
  
    // @LINE:9
    case controllers_Timeline_home3_route(params@_) =>
      call { 
        controllers_Timeline_home3_invoker.call(Timeline_11.home)
      }
  
    // @LINE:10
    case controllers_Timeline_unsub4_route(params@_) =>
      call(params.fromPath[String]("channel", None)) { (channel) =>
        controllers_Timeline_unsub4_invoker.call(Timeline_11.unsub(channel))
      }
  
    // @LINE:13
    case controllers_Search_index5_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Search_index5_invoker.call(Search_39.index(page))
      }
  
    // @LINE:16
    case controllers_Game_exportByIds6_route(params@_) =>
      call { 
        controllers_Game_exportByIds6_invoker.call(Game_5.exportByIds)
      }
  
    // @LINE:17
    case controllers_Game_exportByUser7_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Game_exportByUser7_invoker.call(Game_5.exportByUser(username))
      }
  
    // @LINE:20
    case controllers_Tv_index8_route(params@_) =>
      call { 
        controllers_Tv_index8_invoker.call(Tv_14.index)
      }
  
    // @LINE:21
    case controllers_Tv_embed9_route(params@_) =>
      call { 
        controllers_Tv_embed9_invoker.call(Tv_14.embed)
      }
  
    // @LINE:22
    case controllers_Tv_frame10_route(params@_) =>
      call { 
        controllers_Tv_frame10_invoker.call(Tv_14.frame)
      }
  
    // @LINE:23
    case controllers_Tv_feed11_route(params@_) =>
      call { 
        controllers_Tv_feed11_invoker.call(Tv_14.feed)
      }
  
    // @LINE:24
    case controllers_Tv_channels12_route(params@_) =>
      call { 
        controllers_Tv_channels12_invoker.call(Tv_14.channels)
      }
  
    // @LINE:25
    case controllers_Tv_onChannel13_route(params@_) =>
      call(params.fromPath[String]("chanKey", None)) { (chanKey) =>
        controllers_Tv_onChannel13_invoker.call(Tv_14.onChannel(chanKey))
      }
  
    // @LINE:26
    case controllers_Tv_sides14_route(params@_) =>
      call(params.fromPath[String]("gameId", None), params.fromPath[String]("color", None)) { (gameId, color) =>
        controllers_Tv_sides14_invoker.call(Tv_14.sides(gameId, color))
      }
  
    // @LINE:27
    case controllers_Tv_games15_route(params@_) =>
      call { 
        controllers_Tv_games15_invoker.call(Tv_14.games)
      }
  
    // @LINE:28
    case controllers_Tv_gamesChannel16_route(params@_) =>
      call(params.fromPath[String]("chanKey", None)) { (chanKey) =>
        controllers_Tv_gamesChannel16_invoker.call(Tv_14.gamesChannel(chanKey))
      }
  
    // @LINE:31
    case controllers_Relation_follow17_route(params@_) =>
      call(params.fromPath[String]("userId", None)) { (userId) =>
        controllers_Relation_follow17_invoker.call(Relation_57.follow(userId))
      }
  
    // @LINE:32
    case controllers_Relation_unfollow18_route(params@_) =>
      call(params.fromPath[String]("userId", None)) { (userId) =>
        controllers_Relation_unfollow18_invoker.call(Relation_57.unfollow(userId))
      }
  
    // @LINE:33
    case controllers_Relation_block19_route(params@_) =>
      call(params.fromPath[String]("userId", None)) { (userId) =>
        controllers_Relation_block19_invoker.call(Relation_57.block(userId))
      }
  
    // @LINE:34
    case controllers_Relation_unblock20_route(params@_) =>
      call(params.fromPath[String]("userId", None)) { (userId) =>
        controllers_Relation_unblock20_invoker.call(Relation_57.unblock(userId))
      }
  
    // @LINE:35
    case controllers_Relation_following21_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromQuery[Int]("page", Some(1))) { (username, page) =>
        controllers_Relation_following21_invoker.call(Relation_57.following(username, page))
      }
  
    // @LINE:36
    case controllers_Relation_followers22_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromQuery[Int]("page", Some(1))) { (username, page) =>
        controllers_Relation_followers22_invoker.call(Relation_57.followers(username, page))
      }
  
    // @LINE:37
    case controllers_Relation_blocks23_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Relation_blocks23_invoker.call(Relation_57.blocks(page))
      }
  
    // @LINE:40
    case controllers_Insight_refresh24_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Insight_refresh24_invoker.call(Insight_0.refresh(username))
      }
  
    // @LINE:41
    case controllers_Insight_json25_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Insight_json25_invoker.call(Insight_0.json(username))
      }
  
    // @LINE:42
    case controllers_Insight_index26_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Insight_index26_invoker.call(Insight_0.index(username))
      }
  
    // @LINE:43
    case controllers_Insight_path27_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[String]("metric", None), params.fromPath[String]("dimension", None), Param[String]("filters", Right(""))) { (username, metric, dimension, filters) =>
        controllers_Insight_path27_invoker.call(Insight_0.path(username, metric, dimension, filters))
      }
  
    // @LINE:44
    case controllers_Insight_path28_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[String]("metric", None), params.fromPath[String]("dimension", None), params.fromPath[String]("filters", None)) { (username, metric, dimension, filters) =>
        controllers_Insight_path28_invoker.call(Insight_0.path(username, metric, dimension, filters))
      }
  
    // @LINE:47
    case controllers_UserTournament_path29_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[String]("path", None), params.fromQuery[Int]("page", Some(1))) { (username, path, page) =>
        controllers_UserTournament_path29_invoker.call(UserTournament_42.path(username, path, page))
      }
  
    // @LINE:50
    case controllers_User_mod30_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_User_mod30_invoker.call(User_17.mod(username))
      }
  
    // @LINE:51
    case controllers_User_writeNote31_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_User_writeNote31_invoker.call(User_17.writeNote(username))
      }
  
    // @LINE:52
    case controllers_User_deleteNote32_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_User_deleteNote32_invoker.call(User_17.deleteNote(id))
      }
  
    // @LINE:53
    case controllers_User_showMini33_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_User_showMini33_invoker.call(User_17.showMini(username))
      }
  
    // @LINE:54
    case controllers_User_tv34_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_User_tv34_invoker.call(User_17.tv(username))
      }
  
    // @LINE:55
    case controllers_User_studyTv35_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_User_studyTv35_invoker.call(User_17.studyTv(username))
      }
  
    // @LINE:56
    case controllers_User_perfStat36_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[String]("perfKey", None)) { (username, perfKey) =>
        controllers_User_perfStat36_invoker.call(User_17.perfStat(username, perfKey))
      }
  
    // @LINE:57
    case controllers_User_gamesAll37_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromQuery[Int]("page", Some(1))) { (username, page) =>
        controllers_User_gamesAll37_invoker.call(User_17.gamesAll(username, page))
      }
  
    // @LINE:58
    case controllers_User_games38_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[String]("filterName", None), params.fromQuery[Int]("page", Some(1))) { (username, filterName, page) =>
        controllers_User_games38_invoker.call(User_17.games(username, filterName, page))
      }
  
    // @LINE:59
    case controllers_User_show39_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_User_show39_invoker.call(User_17.show(username))
      }
  
    // @LINE:60
    case controllers_User_myself40_route(params@_) =>
      call { 
        controllers_User_myself40_invoker.call(User_17.myself)
      }
  
    // @LINE:61
    case controllers_User_opponents41_route(params@_) =>
      call { 
        controllers_User_opponents41_invoker.call(User_17.opponents)
      }
  
    // @LINE:62
    case controllers_User_list42_route(params@_) =>
      call { 
        controllers_User_list42_invoker.call(User_17.list)
      }
  
    // @LINE:63
    case controllers_User_topNb43_route(params@_) =>
      call(params.fromPath[Int]("nb", None), params.fromPath[String]("perfKey", None)) { (nb, perfKey) =>
        controllers_User_topNb43_invoker.call(User_17.topNb(nb, perfKey))
      }
  
    // @LINE:64
    case controllers_User_topWeek44_route(params@_) =>
      call { 
        controllers_User_topWeek44_invoker.call(User_17.topWeek)
      }
  
    // @LINE:65
    case controllers_User_online45_route(params@_) =>
      call { 
        controllers_User_online45_invoker.call(User_17.online)
      }
  
    // @LINE:66
    case controllers_User_autocomplete46_route(params@_) =>
      call { 
        controllers_User_autocomplete46_invoker.call(User_17.autocomplete)
      }
  
    // @LINE:68
    case controllers_Dasher_get47_route(params@_) =>
      call { 
        controllers_Dasher_get47_invoker.call(Dasher_18.get)
      }
  
    // @LINE:71
    case controllers_Blog_index48_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1)), params.fromQuery[Option[String]]("ref", Some(None))) { (page, ref) =>
        controllers_Blog_index48_invoker.call(Blog_33.index(page, ref))
      }
  
    // @LINE:72
    case controllers_Blog_all49_route(params@_) =>
      call { 
        controllers_Blog_all49_invoker.call(Blog_33.all)
      }
  
    // @LINE:73
    case controllers_Blog_year50_route(params@_) =>
      call(params.fromPath[Int]("year", None)) { (year) =>
        controllers_Blog_year50_invoker.call(Blog_33.year(year))
      }
  
    // @LINE:74
    case controllers_Blog_discuss51_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Blog_discuss51_invoker.call(Blog_33.discuss(id))
      }
  
    // @LINE:75
    case controllers_Blog_show52_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("slug", None), params.fromQuery[Option[String]]("ref", Some(None))) { (id, slug, ref) =>
        controllers_Blog_show52_invoker.call(Blog_33.show(id, slug, ref))
      }
  
    // @LINE:76
    case controllers_Blog_atom53_route(params@_) =>
      call { 
        controllers_Blog_atom53_invoker.call(Blog_33.atom)
      }
  
    // @LINE:79
    case controllers_Coordinate_home54_route(params@_) =>
      call { 
        controllers_Coordinate_home54_invoker.call(Coordinate_3.home)
      }
  
    // @LINE:80
    case controllers_Coordinate_score55_route(params@_) =>
      call { 
        controllers_Coordinate_score55_invoker.call(Coordinate_3.score)
      }
  
    // @LINE:81
    case controllers_Coordinate_color56_route(params@_) =>
      call { 
        controllers_Coordinate_color56_invoker.call(Coordinate_3.color)
      }
  
    // @LINE:84
    case controllers_Puzzle_home57_route(params@_) =>
      call { 
        controllers_Puzzle_home57_invoker.call(Puzzle_44.home)
      }
  
    // @LINE:85
    case controllers_Puzzle_newPuzzle58_route(params@_) =>
      call { 
        controllers_Puzzle_newPuzzle58_invoker.call(Puzzle_44.newPuzzle)
      }
  
    // @LINE:86
    case controllers_Puzzle_daily59_route(params@_) =>
      call { 
        controllers_Puzzle_daily59_invoker.call(Puzzle_44.daily)
      }
  
    // @LINE:87
    case controllers_Puzzle_embed60_route(params@_) =>
      call { 
        controllers_Puzzle_embed60_invoker.call(Puzzle_44.embed)
      }
  
    // @LINE:88
    case controllers_Puzzle_frame61_route(params@_) =>
      call { 
        controllers_Puzzle_frame61_invoker.call(Puzzle_44.frame)
      }
  
    // @LINE:89
    case controllers_Export_puzzlePng62_route(params@_) =>
      call(params.fromPath[Int]("id", None)) { (id) =>
        controllers_Export_puzzlePng62_invoker.call(Export_16.puzzlePng(id))
      }
  
    // @LINE:90
    case controllers_Puzzle_batchSelect63_route(params@_) =>
      call { 
        controllers_Puzzle_batchSelect63_invoker.call(Puzzle_44.batchSelect)
      }
  
    // @LINE:91
    case controllers_Puzzle_batchSolve64_route(params@_) =>
      call { 
        controllers_Puzzle_batchSolve64_invoker.call(Puzzle_44.batchSolve)
      }
  
    // @LINE:92
    case controllers_Puzzle_show65_route(params@_) =>
      call(params.fromPath[Int]("id", None)) { (id) =>
        controllers_Puzzle_show65_invoker.call(Puzzle_44.show(id))
      }
  
    // @LINE:93
    case controllers_Puzzle_load66_route(params@_) =>
      call(params.fromPath[Int]("id", None)) { (id) =>
        controllers_Puzzle_load66_invoker.call(Puzzle_44.load(id))
      }
  
    // @LINE:94
    case controllers_Puzzle_vote67_route(params@_) =>
      call(params.fromPath[Int]("id", None)) { (id) =>
        controllers_Puzzle_vote67_invoker.call(Puzzle_44.vote(id))
      }
  
    // @LINE:95
    case controllers_Puzzle_round68_route(params@_) =>
      call(params.fromPath[Int]("id", None)) { (id) =>
        controllers_Puzzle_round68_invoker.call(Puzzle_44.round(id))
      }
  
    // @LINE:97
    case controllers_Puzzle_round269_route(params@_) =>
      call(params.fromPath[Int]("id", None)) { (id) =>
        controllers_Puzzle_round269_invoker.call(Puzzle_44.round2(id))
      }
  
    // @LINE:99
    case controllers_Puzzle_round70_route(params@_) =>
      call(params.fromPath[Int]("id", None)) { (id) =>
        controllers_Puzzle_round70_invoker.call(Puzzle_44.round(id))
      }
  
    // @LINE:102
    case controllers_UserAnalysis_help71_route(params@_) =>
      call { 
        controllers_UserAnalysis_help71_invoker.call(UserAnalysis_35.help)
      }
  
    // @LINE:103
    case controllers_UserAnalysis_parseArg72_route(params@_) =>
      call(params.fromPath[String]("something", None)) { (something) =>
        controllers_UserAnalysis_parseArg72_invoker.call(UserAnalysis_35.parseArg(something))
      }
  
    // @LINE:104
    case controllers_UserAnalysis_index73_route(params@_) =>
      call { 
        controllers_UserAnalysis_index73_invoker.call(UserAnalysis_35.index)
      }
  
    // @LINE:105
    case controllers_UserAnalysis_pgn74_route(params@_) =>
      call { 
        controllers_UserAnalysis_pgn74_invoker.call(UserAnalysis_35.pgn)
      }
  
    // @LINE:108
    case controllers_Study_allDefault75_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Study_allDefault75_invoker.call(Study_55.allDefault(page))
      }
  
    // @LINE:109
    case controllers_Study_all76_route(params@_) =>
      call(params.fromPath[String]("order", None), params.fromQuery[Int]("page", Some(1))) { (order, page) =>
        controllers_Study_all76_invoker.call(Study_55.all(order, page))
      }
  
    // @LINE:110
    case controllers_Study_mine77_route(params@_) =>
      call(params.fromPath[String]("order", None), params.fromQuery[Int]("page", Some(1))) { (order, page) =>
        controllers_Study_mine77_invoker.call(Study_55.mine(order, page))
      }
  
    // @LINE:111
    case controllers_Study_mineMember78_route(params@_) =>
      call(params.fromPath[String]("order", None), params.fromQuery[Int]("page", Some(1))) { (order, page) =>
        controllers_Study_mineMember78_invoker.call(Study_55.mineMember(order, page))
      }
  
    // @LINE:112
    case controllers_Study_minePublic79_route(params@_) =>
      call(params.fromPath[String]("order", None), params.fromQuery[Int]("page", Some(1))) { (order, page) =>
        controllers_Study_minePublic79_invoker.call(Study_55.minePublic(order, page))
      }
  
    // @LINE:113
    case controllers_Study_minePrivate80_route(params@_) =>
      call(params.fromPath[String]("order", None), params.fromQuery[Int]("page", Some(1))) { (order, page) =>
        controllers_Study_minePrivate80_invoker.call(Study_55.minePrivate(order, page))
      }
  
    // @LINE:114
    case controllers_Study_mineLikes81_route(params@_) =>
      call(params.fromPath[String]("order", None), params.fromQuery[Int]("page", Some(1))) { (order, page) =>
        controllers_Study_mineLikes81_invoker.call(Study_55.mineLikes(order, page))
      }
  
    // @LINE:115
    case controllers_Study_byOwnerDefault82_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromQuery[Int]("page", Some(1))) { (username, page) =>
        controllers_Study_byOwnerDefault82_invoker.call(Study_55.byOwnerDefault(username, page))
      }
  
    // @LINE:116
    case controllers_Study_byOwner83_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[String]("order", None), params.fromQuery[Int]("page", Some(1))) { (username, order, page) =>
        controllers_Study_byOwner83_invoker.call(Study_55.byOwner(username, order, page))
      }
  
    // @LINE:117
    case controllers_Study_search84_route(params@_) =>
      call(params.fromQuery[String]("q", Some("")), params.fromQuery[Int]("page", Some(1))) { (q, page) =>
        controllers_Study_search84_invoker.call(Study_55.search(q, page))
      }
  
    // @LINE:118
    case controllers_Study_show85_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Study_show85_invoker.call(Study_55.show(id))
      }
  
    // @LINE:119
    case controllers_Study_create86_route(params@_) =>
      call { 
        controllers_Study_create86_invoker.call(Study_55.create)
      }
  
    // @LINE:120
    case controllers_Study_createAs87_route(params@_) =>
      call { 
        controllers_Study_createAs87_invoker.call(Study_55.createAs)
      }
  
    // @LINE:121
    case controllers_Study_pgn88_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Study_pgn88_invoker.call(Study_55.pgn(id))
      }
  
    // @LINE:122
    case controllers_Study_chapterPgn89_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("chapterId", None)) { (id, chapterId) =>
        controllers_Study_chapterPgn89_invoker.call(Study_55.chapterPgn(id, chapterId))
      }
  
    // @LINE:123
    case controllers_Study_delete90_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Study_delete90_invoker.call(Study_55.delete(id))
      }
  
    // @LINE:124
    case controllers_Study_cloneStudy91_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Study_cloneStudy91_invoker.call(Study_55.cloneStudy(id))
      }
  
    // @LINE:125
    case controllers_Study_cloneApply92_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Study_cloneApply92_invoker.call(Study_55.cloneApply(id))
      }
  
    // @LINE:126
    case controllers_Study_chapter93_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("chapterId", None)) { (id, chapterId) =>
        controllers_Study_chapter93_invoker.call(Study_55.chapter(id, chapterId))
      }
  
    // @LINE:127
    case controllers_Study_chapterMeta94_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("chapterId", None)) { (id, chapterId) =>
        controllers_Study_chapterMeta94_invoker.call(Study_55.chapterMeta(id, chapterId))
      }
  
    // @LINE:128
    case controllers_Study_embed95_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("chapterId", None)) { (id, chapterId) =>
        controllers_Study_embed95_invoker.call(Study_55.embed(id, chapterId))
      }
  
    // @LINE:129
    case controllers_Study_clearChat96_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Study_clearChat96_invoker.call(Study_55.clearChat(id))
      }
  
    // @LINE:130
    case controllers_Study_importPgn97_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Study_importPgn97_invoker.call(Study_55.importPgn(id))
      }
  
    // @LINE:131
    case controllers_Study_multiBoard98_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromQuery[Int]("page", Some(1))) { (id, page) =>
        controllers_Study_multiBoard98_invoker.call(Study_55.multiBoard(id, page))
      }
  
    // @LINE:134
    case controllers_Relay_index99_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Relay_index99_invoker.call(Relay_23.index(page))
      }
  
    // @LINE:135
    case controllers_Relay_form100_route(params@_) =>
      call { 
        controllers_Relay_form100_invoker.call(Relay_23.form)
      }
  
    // @LINE:136
    case controllers_Relay_create101_route(params@_) =>
      call { 
        controllers_Relay_create101_invoker.call(Relay_23.create)
      }
  
    // @LINE:137
    case controllers_Relay_show102_route(params@_) =>
      call(params.fromPath[String]("slug", None), params.fromPath[String]("id", None)) { (slug, id) =>
        controllers_Relay_show102_invoker.call(Relay_23.show(slug, id))
      }
  
    // @LINE:138
    case controllers_Relay_chapter103_route(params@_) =>
      call(params.fromPath[String]("slug", None), params.fromPath[String]("id", None), params.fromPath[String]("chapterId", None)) { (slug, id, chapterId) =>
        controllers_Relay_chapter103_invoker.call(Relay_23.chapter(slug, id, chapterId))
      }
  
    // @LINE:139
    case controllers_Relay_edit104_route(params@_) =>
      call(params.fromPath[String]("slug", None), params.fromPath[String]("id", None)) { (slug, id) =>
        controllers_Relay_edit104_invoker.call(Relay_23.edit(slug, id))
      }
  
    // @LINE:140
    case controllers_Relay_update105_route(params@_) =>
      call(params.fromPath[String]("slug", None), params.fromPath[String]("id", None)) { (slug, id) =>
        controllers_Relay_update105_invoker.call(Relay_23.update(slug, id))
      }
  
    // @LINE:141
    case controllers_Relay_reset106_route(params@_) =>
      call(params.fromPath[String]("slug", None), params.fromPath[String]("id", None)) { (slug, id) =>
        controllers_Relay_reset106_invoker.call(Relay_23.reset(slug, id))
      }
  
    // @LINE:142
    case controllers_Relay_cloneRelay107_route(params@_) =>
      call(params.fromPath[String]("slug", None), params.fromPath[String]("id", None)) { (slug, id) =>
        controllers_Relay_cloneRelay107_invoker.call(Relay_23.cloneRelay(slug, id))
      }
  
    // @LINE:143
    case controllers_Relay_push108_route(params@_) =>
      call(params.fromPath[String]("slug", None), params.fromPath[String]("id", None)) { (slug, id) =>
        controllers_Relay_push108_invoker.call(Relay_23.push(slug, id))
      }
  
    // @LINE:146
    case controllers_Learn_index109_route(params@_) =>
      call { 
        controllers_Learn_index109_invoker.call(Learn_36.index)
      }
  
    // @LINE:147
    case controllers_Learn_score110_route(params@_) =>
      call { 
        controllers_Learn_score110_invoker.call(Learn_36.score)
      }
  
    // @LINE:148
    case controllers_Learn_reset111_route(params@_) =>
      call { 
        controllers_Learn_reset111_invoker.call(Learn_36.reset)
      }
  
    // @LINE:151
    case controllers_Plan_index112_route(params@_) =>
      call { 
        controllers_Plan_index112_invoker.call(Plan_37.index)
      }
  
    // @LINE:152
    case controllers_Plan_thanks113_route(params@_) =>
      call { 
        controllers_Plan_thanks113_invoker.call(Plan_37.thanks)
      }
  
    // @LINE:153
    case controllers_Plan_list114_route(params@_) =>
      call { 
        controllers_Plan_list114_invoker.call(Plan_37.list)
      }
  
    // @LINE:154
    case controllers_Plan_switch115_route(params@_) =>
      call { 
        controllers_Plan_switch115_invoker.call(Plan_37.switch)
      }
  
    // @LINE:155
    case controllers_Plan_cancel116_route(params@_) =>
      call { 
        controllers_Plan_cancel116_invoker.call(Plan_37.cancel)
      }
  
    // @LINE:156
    case controllers_Plan_webhook117_route(params@_) =>
      call { 
        controllers_Plan_webhook117_invoker.call(Plan_37.webhook)
      }
  
    // @LINE:157
    case controllers_Plan_stripeCheckout118_route(params@_) =>
      call { 
        controllers_Plan_stripeCheckout118_invoker.call(Plan_37.stripeCheckout)
      }
  
    // @LINE:158
    case controllers_Plan_payPalIpn119_route(params@_) =>
      call { 
        controllers_Plan_payPalIpn119_invoker.call(Plan_37.payPalIpn)
      }
  
    // @LINE:159
    case controllers_Plan_features120_route(params@_) =>
      call { 
        controllers_Plan_features120_invoker.call(Plan_37.features)
      }
  
    // @LINE:162
    case controllers_Practice_index121_route(params@_) =>
      call { 
        controllers_Practice_index121_invoker.call(Practice_34.index)
      }
  
    // @LINE:163
    case controllers_Practice_chapter122_route(params@_) =>
      call(params.fromPath[String]("studyId", None), params.fromPath[String]("chapterId", None)) { (studyId, chapterId) =>
        controllers_Practice_chapter122_invoker.call(Practice_34.chapter(studyId, chapterId))
      }
  
    // @LINE:164
    case controllers_Practice_config123_route(params@_) =>
      call { 
        controllers_Practice_config123_invoker.call(Practice_34.config)
      }
  
    // @LINE:165
    case controllers_Practice_configSave124_route(params@_) =>
      call { 
        controllers_Practice_configSave124_invoker.call(Practice_34.configSave)
      }
  
    // @LINE:166
    case controllers_Practice_reset125_route(params@_) =>
      call { 
        controllers_Practice_reset125_invoker.call(Practice_34.reset)
      }
  
    // @LINE:167
    case controllers_Practice_showSection126_route(params@_) =>
      call(params.fromPath[String]("sectionId", None)) { (sectionId) =>
        controllers_Practice_showSection126_invoker.call(Practice_34.showSection(sectionId))
      }
  
    // @LINE:168
    case controllers_Practice_showStudySlug127_route(params@_) =>
      call(params.fromPath[String]("sectionId", None), params.fromPath[String]("studySlug", None)) { (sectionId, studySlug) =>
        controllers_Practice_showStudySlug127_invoker.call(Practice_34.showStudySlug(sectionId, studySlug))
      }
  
    // @LINE:169
    case controllers_Practice_show128_route(params@_) =>
      call(params.fromPath[String]("sectionId", None), params.fromPath[String]("studySlug", None), params.fromPath[String]("studyId", None)) { (sectionId, studySlug, studyId) =>
        controllers_Practice_show128_invoker.call(Practice_34.show(sectionId, studySlug, studyId))
      }
  
    // @LINE:170
    case controllers_Practice_showChapter129_route(params@_) =>
      call(params.fromPath[String]("sectionId", None), params.fromPath[String]("studySlug", None), params.fromPath[String]("studyId", None), params.fromPath[String]("chapterId", None)) { (sectionId, studySlug, studyId, chapterId) =>
        controllers_Practice_showChapter129_invoker.call(Practice_34.showChapter(sectionId, studySlug, studyId, chapterId))
      }
  
    // @LINE:171
    case controllers_Practice_complete130_route(params@_) =>
      call(params.fromPath[String]("chapterId", None), params.fromPath[Int]("moves", None)) { (chapterId, moves) =>
        controllers_Practice_complete130_invoker.call(Practice_34.complete(chapterId, moves))
      }
  
    // @LINE:174
    case controllers_Streamer_index131_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Streamer_index131_invoker.call(Streamer_20.index(page))
      }
  
    // @LINE:175
    case controllers_Streamer_live132_route(params@_) =>
      call { 
        controllers_Streamer_live132_invoker.call(Streamer_20.live)
      }
  
    // @LINE:176
    case controllers_Streamer_edit133_route(params@_) =>
      call { 
        controllers_Streamer_edit133_invoker.call(Streamer_20.edit)
      }
  
    // @LINE:177
    case controllers_Streamer_create134_route(params@_) =>
      call { 
        controllers_Streamer_create134_invoker.call(Streamer_20.create)
      }
  
    // @LINE:178
    case controllers_Streamer_editApply135_route(params@_) =>
      call { 
        controllers_Streamer_editApply135_invoker.call(Streamer_20.editApply)
      }
  
    // @LINE:179
    case controllers_Streamer_approvalRequest136_route(params@_) =>
      call { 
        controllers_Streamer_approvalRequest136_invoker.call(Streamer_20.approvalRequest)
      }
  
    // @LINE:180
    case controllers_Streamer_picture137_route(params@_) =>
      call { 
        controllers_Streamer_picture137_invoker.call(Streamer_20.picture)
      }
  
    // @LINE:181
    case controllers_Streamer_pictureApply138_route(params@_) =>
      call { 
        controllers_Streamer_pictureApply138_invoker.call(Streamer_20.pictureApply)
      }
  
    // @LINE:182
    case controllers_Streamer_pictureDelete139_route(params@_) =>
      call { 
        controllers_Streamer_pictureDelete139_invoker.call(Streamer_20.pictureDelete)
      }
  
    // @LINE:183
    case controllers_Streamer_show140_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Streamer_show140_invoker.call(Streamer_20.show(username))
      }
  
    // @LINE:186
    case controllers_Round_watcher141_route(params@_) =>
      call(params.fromPath[String]("gameId", None), Param[String]("color", Right("white"))) { (gameId, color) =>
        controllers_Round_watcher141_invoker.call(Round_27.watcher(gameId, color))
      }
  
    // @LINE:187
    case controllers_Round_watcher142_route(params@_) =>
      call(params.fromPath[String]("gameId", None), params.fromPath[String]("color", None)) { (gameId, color) =>
        controllers_Round_watcher142_invoker.call(Round_27.watcher(gameId, color))
      }
  
    // @LINE:188
    case controllers_Round_player143_route(params@_) =>
      call(params.fromPath[String]("fullId", None)) { (fullId) =>
        controllers_Round_player143_invoker.call(Round_27.player(fullId))
      }
  
    // @LINE:189
    case controllers_Round_sides144_route(params@_) =>
      call(params.fromPath[String]("gameId", None), params.fromPath[String]("color", None)) { (gameId, color) =>
        controllers_Round_sides144_invoker.call(Round_27.sides(gameId, color))
      }
  
    // @LINE:190
    case controllers_Round_continue145_route(params@_) =>
      call(params.fromPath[String]("gameId", None), params.fromPath[String]("mode", None)) { (gameId, mode) =>
        controllers_Round_continue145_invoker.call(Round_27.continue(gameId, mode))
      }
  
    // @LINE:191
    case controllers_Round_readNote146_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Round_readNote146_invoker.call(Round_27.readNote(gameId))
      }
  
    // @LINE:192
    case controllers_Round_writeNote147_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Round_writeNote147_invoker.call(Round_27.writeNote(gameId))
      }
  
    // @LINE:193
    case controllers_Round_mini148_route(params@_) =>
      call(params.fromPath[String]("gameId", None), Param[String]("color", Right("white"))) { (gameId, color) =>
        controllers_Round_mini148_invoker.call(Round_27.mini(gameId, color))
      }
  
    // @LINE:194
    case controllers_Round_mini149_route(params@_) =>
      call(params.fromPath[String]("gameId", None), params.fromPath[String]("color", None)) { (gameId, color) =>
        controllers_Round_mini149_invoker.call(Round_27.mini(gameId, color))
      }
  
    // @LINE:195
    case controllers_Round_miniFullId150_route(params@_) =>
      call(params.fromPath[String]("fullId", None)) { (fullId) =>
        controllers_Round_miniFullId150_invoker.call(Round_27.miniFullId(fullId))
      }
  
    // @LINE:196
    case controllers_Editor_game151_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Editor_game151_invoker.call(Editor_8.game(gameId))
      }
  
    // @LINE:197
    case controllers_UserAnalysis_game152_route(params@_) =>
      call(params.fromPath[String]("gameId", None), params.fromPath[String]("color", None)) { (gameId, color) =>
        controllers_UserAnalysis_game152_invoker.call(UserAnalysis_35.game(gameId, color))
      }
  
    // @LINE:198
    case controllers_UserAnalysis_forecasts153_route(params@_) =>
      call(params.fromPath[String]("fullId", None)) { (fullId) =>
        controllers_UserAnalysis_forecasts153_invoker.call(UserAnalysis_35.forecasts(fullId))
      }
  
    // @LINE:199
    case controllers_UserAnalysis_forecastsOnMyTurn154_route(params@_) =>
      call(params.fromPath[String]("fullId", None), params.fromPath[String]("uci", None)) { (fullId, uci) =>
        controllers_UserAnalysis_forecastsOnMyTurn154_invoker.call(UserAnalysis_35.forecastsOnMyTurn(fullId, uci))
      }
  
    // @LINE:200
    case controllers_Round_resign155_route(params@_) =>
      call(params.fromPath[String]("fullId", None)) { (fullId) =>
        controllers_Round_resign155_invoker.call(Round_27.resign(fullId))
      }
  
    // @LINE:202
    case controllers_Analyse_embed156_route(params@_) =>
      call(params.fromPath[String]("gameId", None), Param[String]("color", Right("white"))) { (gameId, color) =>
        controllers_Analyse_embed156_invoker.call(Analyse_21.embed(gameId, color))
      }
  
    // @LINE:203
    case controllers_Analyse_embed157_route(params@_) =>
      call(params.fromPath[String]("gameId", None), params.fromPath[String]("color", None)) { (gameId, color) =>
        controllers_Analyse_embed157_invoker.call(Analyse_21.embed(gameId, color))
      }
  
    // @LINE:205
    case controllers_Game_delete158_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Game_delete158_invoker.call(Game_5.delete(gameId))
      }
  
    // @LINE:207
    case controllers_Round_next159_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Round_next159_invoker.call(Round_27.next(gameId))
      }
  
    // @LINE:208
    case controllers_Round_whatsNext160_route(params@_) =>
      call(params.fromPath[String]("fullId", None)) { (fullId) =>
        controllers_Round_whatsNext160_invoker.call(Round_27.whatsNext(fullId))
      }
  
    // @LINE:211
    case controllers_Tournament_home161_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Tournament_home161_invoker.call(Tournament_2.home(page))
      }
  
    // @LINE:212
    case controllers_Tournament_featured162_route(params@_) =>
      call { 
        controllers_Tournament_featured162_invoker.call(Tournament_2.featured)
      }
  
    // @LINE:213
    case controllers_Tournament_form163_route(params@_) =>
      call { 
        controllers_Tournament_form163_invoker.call(Tournament_2.form)
      }
  
    // @LINE:214
    case controllers_Tournament_create164_route(params@_) =>
      call { 
        controllers_Tournament_create164_invoker.call(Tournament_2.create)
      }
  
    // @LINE:215
    case controllers_Tournament_teamBattleForm165_route(params@_) =>
      call(params.fromPath[String]("teamId", None)) { (teamId) =>
        controllers_Tournament_teamBattleForm165_invoker.call(Tournament_2.teamBattleForm(teamId))
      }
  
    // @LINE:216
    case controllers_Tournament_teamBattleEdit166_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Tournament_teamBattleEdit166_invoker.call(Tournament_2.teamBattleEdit(id))
      }
  
    // @LINE:217
    case controllers_Tournament_teamBattleUpdate167_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Tournament_teamBattleUpdate167_invoker.call(Tournament_2.teamBattleUpdate(id))
      }
  
    // @LINE:218
    case controllers_Tournament_calendar168_route(params@_) =>
      call { 
        controllers_Tournament_calendar168_invoker.call(Tournament_2.calendar)
      }
  
    // @LINE:219
    case controllers_Tournament_show169_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Tournament_show169_invoker.call(Tournament_2.show(id))
      }
  
    // @LINE:220
    case controllers_Tournament_standing170_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[Int]("page", None)) { (id, page) =>
        controllers_Tournament_standing170_invoker.call(Tournament_2.standing(id, page))
      }
  
    // @LINE:221
    case controllers_Tournament_pageOf171_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("userId", None)) { (id, userId) =>
        controllers_Tournament_pageOf171_invoker.call(Tournament_2.pageOf(id, userId))
      }
  
    // @LINE:222
    case controllers_Tournament_join172_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Tournament_join172_invoker.call(Tournament_2.join(id))
      }
  
    // @LINE:223
    case controllers_Tournament_pause173_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Tournament_pause173_invoker.call(Tournament_2.pause(id))
      }
  
    // @LINE:224
    case controllers_Tournament_player174_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("user", None)) { (id, user) =>
        controllers_Tournament_player174_invoker.call(Tournament_2.player(id, user))
      }
  
    // @LINE:225
    case controllers_Tournament_teamInfo175_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("team", None)) { (id, team) =>
        controllers_Tournament_teamInfo175_invoker.call(Tournament_2.teamInfo(id, team))
      }
  
    // @LINE:226
    case controllers_Tournament_terminate176_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Tournament_terminate176_invoker.call(Tournament_2.terminate(id))
      }
  
    // @LINE:227
    case controllers_Tournament_help177_route(params@_) =>
      call(params.fromQuery[Option[String]]("system", Some(None))) { (system) =>
        controllers_Tournament_help177_invoker.call(Tournament_2.help(system))
      }
  
    // @LINE:228
    case controllers_Tournament_leaderboard178_route(params@_) =>
      call { 
        controllers_Tournament_leaderboard178_invoker.call(Tournament_2.leaderboard)
      }
  
    // @LINE:229
    case controllers_Tournament_shields179_route(params@_) =>
      call { 
        controllers_Tournament_shields179_invoker.call(Tournament_2.shields)
      }
  
    // @LINE:230
    case controllers_Tournament_categShields180_route(params@_) =>
      call(params.fromPath[String]("categ", None)) { (categ) =>
        controllers_Tournament_categShields180_invoker.call(Tournament_2.categShields(categ))
      }
  
    // @LINE:233
    case controllers_TournamentCrud_index181_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_TournamentCrud_index181_invoker.call(TournamentCrud_24.index(page))
      }
  
    // @LINE:234
    case controllers_TournamentCrud_cloneT182_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_TournamentCrud_cloneT182_invoker.call(TournamentCrud_24.cloneT(id))
      }
  
    // @LINE:235
    case controllers_TournamentCrud_edit183_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_TournamentCrud_edit183_invoker.call(TournamentCrud_24.edit(id))
      }
  
    // @LINE:236
    case controllers_TournamentCrud_update184_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_TournamentCrud_update184_invoker.call(TournamentCrud_24.update(id))
      }
  
    // @LINE:237
    case controllers_TournamentCrud_form185_route(params@_) =>
      call { 
        controllers_TournamentCrud_form185_invoker.call(TournamentCrud_24.form)
      }
  
    // @LINE:238
    case controllers_TournamentCrud_create186_route(params@_) =>
      call { 
        controllers_TournamentCrud_create186_invoker.call(TournamentCrud_24.create)
      }
  
    // @LINE:241
    case controllers_Simul_home187_route(params@_) =>
      call { 
        controllers_Simul_home187_invoker.call(Simul_48.home)
      }
  
    // @LINE:242
    case controllers_Simul_form188_route(params@_) =>
      call { 
        controllers_Simul_form188_invoker.call(Simul_48.form)
      }
  
    // @LINE:243
    case controllers_Simul_create189_route(params@_) =>
      call { 
        controllers_Simul_create189_invoker.call(Simul_48.create)
      }
  
    // @LINE:244
    case controllers_Simul_homeReload190_route(params@_) =>
      call { 
        controllers_Simul_homeReload190_invoker.call(Simul_48.homeReload)
      }
  
    // @LINE:245
    case controllers_Simul_show191_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Simul_show191_invoker.call(Simul_48.show(id))
      }
  
    // @LINE:246
    case controllers_Simul_hostPing192_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Simul_hostPing192_invoker.call(Simul_48.hostPing(id))
      }
  
    // @LINE:247
    case controllers_Simul_accept193_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("user", None)) { (id, user) =>
        controllers_Simul_accept193_invoker.call(Simul_48.accept(id, user))
      }
  
    // @LINE:248
    case controllers_Simul_reject194_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("user", None)) { (id, user) =>
        controllers_Simul_reject194_invoker.call(Simul_48.reject(id, user))
      }
  
    // @LINE:249
    case controllers_Simul_start195_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Simul_start195_invoker.call(Simul_48.start(id))
      }
  
    // @LINE:250
    case controllers_Simul_abort196_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Simul_abort196_invoker.call(Simul_48.abort(id))
      }
  
    // @LINE:251
    case controllers_Simul_join197_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("variant", None)) { (id, variant) =>
        controllers_Simul_join197_invoker.call(Simul_48.join(id, variant))
      }
  
    // @LINE:252
    case controllers_Simul_withdraw198_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Simul_withdraw198_invoker.call(Simul_48.withdraw(id))
      }
  
    // @LINE:253
    case controllers_Simul_setText199_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Simul_setText199_invoker.call(Simul_48.setText(id))
      }
  
    // @LINE:256
    case controllers_Team_home200_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Team_home200_invoker.call(Team_54.home(page))
      }
  
    // @LINE:257
    case controllers_Team_form201_route(params@_) =>
      call { 
        controllers_Team_form201_invoker.call(Team_54.form)
      }
  
    // @LINE:258
    case controllers_Team_create202_route(params@_) =>
      call { 
        controllers_Team_create202_invoker.call(Team_54.create)
      }
  
    // @LINE:259
    case controllers_Team_mine203_route(params@_) =>
      call { 
        controllers_Team_mine203_invoker.call(Team_54.mine)
      }
  
    // @LINE:260
    case controllers_Team_all204_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Team_all204_invoker.call(Team_54.all(page))
      }
  
    // @LINE:261
    case controllers_Team_requests205_route(params@_) =>
      call { 
        controllers_Team_requests205_invoker.call(Team_54.requests)
      }
  
    // @LINE:262
    case controllers_Team_search206_route(params@_) =>
      call(params.fromQuery[String]("text", Some("")), params.fromQuery[Int]("page", Some(1))) { (text, page) =>
        controllers_Team_search206_invoker.call(Team_54.search(text, page))
      }
  
    // @LINE:263
    case controllers_Team_autocomplete207_route(params@_) =>
      call { 
        controllers_Team_autocomplete207_invoker.call(Team_54.autocomplete)
      }
  
    // @LINE:264
    case controllers_Team_show208_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromQuery[Int]("page", Some(1))) { (id, page) =>
        controllers_Team_show208_invoker.call(Team_54.show(id, page))
      }
  
    // @LINE:265
    case controllers_Team_join209_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_join209_invoker.call(Team_54.join(id))
      }
  
    // @LINE:266
    case controllers_Team_quit210_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_quit210_invoker.call(Team_54.quit(id))
      }
  
    // @LINE:267
    case controllers_Team_requestForm211_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_requestForm211_invoker.call(Team_54.requestForm(id))
      }
  
    // @LINE:268
    case controllers_Team_requestCreate212_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_requestCreate212_invoker.call(Team_54.requestCreate(id))
      }
  
    // @LINE:269
    case controllers_Team_requestProcess213_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_requestProcess213_invoker.call(Team_54.requestProcess(id))
      }
  
    // @LINE:270
    case controllers_Team_edit214_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_edit214_invoker.call(Team_54.edit(id))
      }
  
    // @LINE:271
    case controllers_Team_update215_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_update215_invoker.call(Team_54.update(id))
      }
  
    // @LINE:272
    case controllers_Team_kickForm216_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_kickForm216_invoker.call(Team_54.kickForm(id))
      }
  
    // @LINE:273
    case controllers_Team_kick217_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_kick217_invoker.call(Team_54.kick(id))
      }
  
    // @LINE:274
    case controllers_Team_kickUser218_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("user", None)) { (id, user) =>
        controllers_Team_kickUser218_invoker.call(Team_54.kickUser(id, user))
      }
  
    // @LINE:275
    case controllers_Team_changeOwnerForm219_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_changeOwnerForm219_invoker.call(Team_54.changeOwnerForm(id))
      }
  
    // @LINE:276
    case controllers_Team_changeOwner220_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_changeOwner220_invoker.call(Team_54.changeOwner(id))
      }
  
    // @LINE:277
    case controllers_Team_close221_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_close221_invoker.call(Team_54.close(id))
      }
  
    // @LINE:278
    case controllers_Team_users222_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Team_users222_invoker.call(Team_54.users(id))
      }
  
    // @LINE:281
    case controllers_Analyse_requestAnalysis223_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Analyse_requestAnalysis223_invoker.call(Analyse_21.requestAnalysis(gameId))
      }
  
    // @LINE:283
    case controllers_Game_exportOne224_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Game_exportOne224_invoker.call(Game_5.exportOne(gameId))
      }
  
    // @LINE:284
    case controllers_Game_exportOne225_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Game_exportOne225_invoker.call(Game_5.exportOne(gameId))
      }
  
    // @LINE:285
    case controllers_Export_png226_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Export_png226_invoker.call(Export_16.png(gameId))
      }
  
    // @LINE:288
    case controllers_Fishnet_acquire227_route(params@_) =>
      call { 
        controllers_Fishnet_acquire227_invoker.call(Fishnet_56.acquire)
      }
  
    // @LINE:289
    case controllers_Fishnet_analysis228_route(params@_) =>
      call(params.fromPath[String]("workId", None)) { (workId) =>
        controllers_Fishnet_analysis228_invoker.call(Fishnet_56.analysis(workId))
      }
  
    // @LINE:290
    case controllers_Fishnet_abort229_route(params@_) =>
      call(params.fromPath[String]("workId", None)) { (workId) =>
        controllers_Fishnet_abort229_invoker.call(Fishnet_56.abort(workId))
      }
  
    // @LINE:291
    case controllers_Fishnet_keyExists230_route(params@_) =>
      call(params.fromPath[String]("key", None)) { (key) =>
        controllers_Fishnet_keyExists230_invoker.call(Fishnet_56.keyExists(key))
      }
  
    // @LINE:292
    case controllers_Fishnet_status231_route(params@_) =>
      call { 
        controllers_Fishnet_status231_invoker.call(Fishnet_56.status)
      }
  
    // @LINE:295
    case controllers_Pref_set232_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_Pref_set232_invoker.call(Pref_1.set(name))
      }
  
    // @LINE:296
    case controllers_Pref_form233_route(params@_) =>
      call(params.fromPath[String]("categ", None)) { (categ) =>
        controllers_Pref_form233_invoker.call(Pref_1.form(categ))
      }
  
    // @LINE:297
    case controllers_Pref_formApply234_route(params@_) =>
      call { 
        controllers_Pref_formApply234_invoker.call(Pref_1.formApply)
      }
  
    // @LINE:298
    case controllers_Pref_verifyTitle235_route(params@_) =>
      call { 
        controllers_Pref_verifyTitle235_invoker.call(Pref_1.verifyTitle)
      }
  
    // @LINE:301
    case controllers_Setup_aiForm236_route(params@_) =>
      call { 
        controllers_Setup_aiForm236_invoker.call(Setup_46.aiForm)
      }
  
    // @LINE:302
    case controllers_Setup_ai237_route(params@_) =>
      call { 
        controllers_Setup_ai237_invoker.call(Setup_46.ai)
      }
  
    // @LINE:303
    case controllers_Setup_friendForm238_route(params@_) =>
      call(params.fromQuery[Option[String]]("user", Some(None))) { (user) =>
        controllers_Setup_friendForm238_invoker.call(Setup_46.friendForm(user))
      }
  
    // @LINE:304
    case controllers_Setup_friend239_route(params@_) =>
      call(params.fromQuery[Option[String]]("user", Some(None))) { (user) =>
        controllers_Setup_friend239_invoker.call(Setup_46.friend(user))
      }
  
    // @LINE:305
    case controllers_Setup_hookForm240_route(params@_) =>
      call { 
        controllers_Setup_hookForm240_invoker.call(Setup_46.hookForm)
      }
  
    // @LINE:306
    case controllers_Setup_like241_route(params@_) =>
      call(params.fromPath[String]("sri", None), params.fromPath[String]("gameId", None)) { (sri, gameId) =>
        controllers_Setup_like241_invoker.call(Setup_46.like(sri, gameId))
      }
  
    // @LINE:307
    case controllers_Setup_hook242_route(params@_) =>
      call(params.fromPath[String]("sri", None)) { (sri) =>
        controllers_Setup_hook242_invoker.call(Setup_46.hook(sri))
      }
  
    // @LINE:308
    case controllers_Setup_filterForm243_route(params@_) =>
      call { 
        controllers_Setup_filterForm243_invoker.call(Setup_46.filterForm)
      }
  
    // @LINE:309
    case controllers_Setup_filter244_route(params@_) =>
      call { 
        controllers_Setup_filter244_invoker.call(Setup_46.filter)
      }
  
    // @LINE:310
    case controllers_Setup_validateFen245_route(params@_) =>
      call { 
        controllers_Setup_validateFen245_invoker.call(Setup_46.validateFen)
      }
  
    // @LINE:313
    case controllers_Challenge_all246_route(params@_) =>
      call { 
        controllers_Challenge_all246_invoker.call(Challenge_28.all)
      }
  
    // @LINE:314
    case controllers_Challenge_show247_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Challenge_show247_invoker.call(Challenge_28.show(id))
      }
  
    // @LINE:315
    case controllers_Challenge_accept248_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Challenge_accept248_invoker.call(Challenge_28.accept(id))
      }
  
    // @LINE:316
    case controllers_Challenge_decline249_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Challenge_decline249_invoker.call(Challenge_28.decline(id))
      }
  
    // @LINE:317
    case controllers_Challenge_cancel250_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Challenge_cancel250_invoker.call(Challenge_28.cancel(id))
      }
  
    // @LINE:318
    case controllers_Challenge_toFriend251_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Challenge_toFriend251_invoker.call(Challenge_28.toFriend(id))
      }
  
    // @LINE:319
    case controllers_Challenge_rematchOf252_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Challenge_rematchOf252_invoker.call(Challenge_28.rematchOf(id))
      }
  
    // @LINE:322
    case controllers_Notify_recent253_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Notify_recent253_invoker.call(Notify_59.recent(page))
      }
  
    // @LINE:325
    case controllers_Video_index254_route(params@_) =>
      call { 
        controllers_Video_index254_invoker.call(Video_25.index)
      }
  
    // @LINE:326
    case controllers_Video_tags255_route(params@_) =>
      call { 
        controllers_Video_tags255_invoker.call(Video_25.tags)
      }
  
    // @LINE:327
    case controllers_Video_author256_route(params@_) =>
      call(params.fromPath[String]("author", None)) { (author) =>
        controllers_Video_author256_invoker.call(Video_25.author(author))
      }
  
    // @LINE:328
    case controllers_Video_show257_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Video_show257_invoker.call(Video_25.show(id))
      }
  
    // @LINE:331
    case controllers_I18n_select258_route(params@_) =>
      call { 
        controllers_I18n_select258_invoker.call(I18n_12.select)
      }
  
    // @LINE:334
    case controllers_Auth_login259_route(params@_) =>
      call { 
        controllers_Auth_login259_invoker.call(Auth_9.login)
      }
  
    // @LINE:335
    case controllers_Auth_authenticate260_route(params@_) =>
      call { 
        controllers_Auth_authenticate260_invoker.call(Auth_9.authenticate)
      }
  
    // @LINE:336
    case controllers_Auth_logoutGet261_route(params@_) =>
      call { 
        controllers_Auth_logoutGet261_invoker.call(Auth_9.logoutGet)
      }
  
    // @LINE:337
    case controllers_Auth_logout262_route(params@_) =>
      call { 
        controllers_Auth_logout262_invoker.call(Auth_9.logout)
      }
  
    // @LINE:338
    case controllers_Auth_signup263_route(params@_) =>
      call { 
        controllers_Auth_signup263_invoker.call(Auth_9.signup)
      }
  
    // @LINE:339
    case controllers_Auth_signupPost264_route(params@_) =>
      call { 
        controllers_Auth_signupPost264_invoker.call(Auth_9.signupPost)
      }
  
    // @LINE:340
    case controllers_Auth_checkYourEmail265_route(params@_) =>
      call { 
        controllers_Auth_checkYourEmail265_invoker.call(Auth_9.checkYourEmail)
      }
  
    // @LINE:341
    case controllers_Auth_fixEmail266_route(params@_) =>
      call { 
        controllers_Auth_fixEmail266_invoker.call(Auth_9.fixEmail)
      }
  
    // @LINE:342
    case controllers_Auth_signupConfirmEmail267_route(params@_) =>
      call(params.fromPath[String]("token", None)) { (token) =>
        controllers_Auth_signupConfirmEmail267_invoker.call(Auth_9.signupConfirmEmail(token))
      }
  
    // @LINE:343
    case controllers_Auth_passwordReset268_route(params@_) =>
      call { 
        controllers_Auth_passwordReset268_invoker.call(Auth_9.passwordReset)
      }
  
    // @LINE:344
    case controllers_Auth_passwordResetApply269_route(params@_) =>
      call { 
        controllers_Auth_passwordResetApply269_invoker.call(Auth_9.passwordResetApply)
      }
  
    // @LINE:345
    case controllers_Auth_passwordResetSent270_route(params@_) =>
      call(params.fromPath[String]("email", None)) { (email) =>
        controllers_Auth_passwordResetSent270_invoker.call(Auth_9.passwordResetSent(email))
      }
  
    // @LINE:346
    case controllers_Auth_passwordResetConfirm271_route(params@_) =>
      call(params.fromPath[String]("token", None)) { (token) =>
        controllers_Auth_passwordResetConfirm271_invoker.call(Auth_9.passwordResetConfirm(token))
      }
  
    // @LINE:347
    case controllers_Auth_passwordResetConfirmApply272_route(params@_) =>
      call(params.fromPath[String]("token", None)) { (token) =>
        controllers_Auth_passwordResetConfirmApply272_invoker.call(Auth_9.passwordResetConfirmApply(token))
      }
  
    // @LINE:348
    case controllers_Auth_setFingerPrint273_route(params@_) =>
      call(params.fromPath[String]("fp", None), params.fromPath[Int]("ms", None)) { (fp, ms) =>
        controllers_Auth_setFingerPrint273_invoker.call(Auth_9.setFingerPrint(fp, ms))
      }
  
    // @LINE:349
    case controllers_Auth_makeLoginToken274_route(params@_) =>
      call { 
        controllers_Auth_makeLoginToken274_invoker.call(Auth_9.makeLoginToken)
      }
  
    // @LINE:350
    case controllers_Auth_loginWithToken275_route(params@_) =>
      call(params.fromPath[String]("token", None)) { (token) =>
        controllers_Auth_loginWithToken275_invoker.call(Auth_9.loginWithToken(token))
      }
  
    // @LINE:351
    case controllers_Auth_magicLink276_route(params@_) =>
      call { 
        controllers_Auth_magicLink276_invoker.call(Auth_9.magicLink)
      }
  
    // @LINE:352
    case controllers_Auth_magicLinkApply277_route(params@_) =>
      call { 
        controllers_Auth_magicLinkApply277_invoker.call(Auth_9.magicLinkApply)
      }
  
    // @LINE:353
    case controllers_Auth_magicLinkSent278_route(params@_) =>
      call(params.fromPath[String]("email", None)) { (email) =>
        controllers_Auth_magicLinkSent278_invoker.call(Auth_9.magicLinkSent(email))
      }
  
    // @LINE:354
    case controllers_Auth_magicLinkLogin279_route(params@_) =>
      call(params.fromPath[String]("token", None)) { (token) =>
        controllers_Auth_magicLinkLogin279_invoker.call(Auth_9.magicLinkLogin(token))
      }
  
    // @LINE:357
    case controllers_Mod_alt280_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[Boolean]("v", None)) { (username, v) =>
        controllers_Mod_alt280_invoker.call(Mod_53.alt(username, v))
      }
  
    // @LINE:358
    case controllers_Mod_engine281_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[Boolean]("v", None)) { (username, v) =>
        controllers_Mod_engine281_invoker.call(Mod_53.engine(username, v))
      }
  
    // @LINE:359
    case controllers_Mod_booster282_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[Boolean]("v", None)) { (username, v) =>
        controllers_Mod_booster282_invoker.call(Mod_53.booster(username, v))
      }
  
    // @LINE:360
    case controllers_Mod_troll283_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[Boolean]("v", None)) { (username, v) =>
        controllers_Mod_troll283_invoker.call(Mod_53.troll(username, v))
      }
  
    // @LINE:361
    case controllers_Mod_ipBan284_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[Boolean]("v", None)) { (username, v) =>
        controllers_Mod_ipBan284_invoker.call(Mod_53.ipBan(username, v))
      }
  
    // @LINE:362
    case controllers_Mod_deletePmsAndChats285_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_deletePmsAndChats285_invoker.call(Mod_53.deletePmsAndChats(username))
      }
  
    // @LINE:363
    case controllers_Mod_warn286_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromQuery[String]("subject", None)) { (username, subject) =>
        controllers_Mod_warn286_invoker.call(Mod_53.warn(username, subject))
      }
  
    // @LINE:364
    case controllers_Mod_disableTwoFactor287_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_disableTwoFactor287_invoker.call(Mod_53.disableTwoFactor(username))
      }
  
    // @LINE:365
    case controllers_Mod_closeAccount288_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_closeAccount288_invoker.call(Mod_53.closeAccount(username))
      }
  
    // @LINE:366
    case controllers_Mod_reopenAccount289_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_reopenAccount289_invoker.call(Mod_53.reopenAccount(username))
      }
  
    // @LINE:367
    case controllers_Mod_setTitle290_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_setTitle290_invoker.call(Mod_53.setTitle(username))
      }
  
    // @LINE:368
    case controllers_Mod_spontaneousInquiry291_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_spontaneousInquiry291_invoker.call(Mod_53.spontaneousInquiry(username))
      }
  
    // @LINE:369
    case controllers_Mod_communicationPublic292_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_communicationPublic292_invoker.call(Mod_53.communicationPublic(username))
      }
  
    // @LINE:370
    case controllers_Mod_communicationPrivate293_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_communicationPrivate293_invoker.call(Mod_53.communicationPrivate(username))
      }
  
    // @LINE:371
    case controllers_Mod_rankban294_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[Boolean]("v", None)) { (username, v) =>
        controllers_Mod_rankban294_invoker.call(Mod_53.rankban(username, v))
      }
  
    // @LINE:372
    case controllers_Mod_reportban295_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromPath[Boolean]("v", None)) { (username, v) =>
        controllers_Mod_reportban295_invoker.call(Mod_53.reportban(username, v))
      }
  
    // @LINE:373
    case controllers_Mod_impersonate296_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_impersonate296_invoker.call(Mod_53.impersonate(username))
      }
  
    // @LINE:374
    case controllers_Mod_log297_route(params@_) =>
      call { 
        controllers_Mod_log297_invoker.call(Mod_53.log)
      }
  
    // @LINE:375
    case controllers_Mod_refreshUserAssess298_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_refreshUserAssess298_invoker.call(Mod_53.refreshUserAssess(username))
      }
  
    // @LINE:376
    case controllers_Mod_setEmail299_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_setEmail299_invoker.call(Mod_53.setEmail(username))
      }
  
    // @LINE:377
    case controllers_Mod_notifySlack300_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_notifySlack300_invoker.call(Mod_53.notifySlack(username))
      }
  
    // @LINE:378
    case controllers_Mod_ipIntel301_route(params@_) =>
      call(params.fromQuery[String]("ip", None)) { (ip) =>
        controllers_Mod_ipIntel301_invoker.call(Mod_53.ipIntel(ip))
      }
  
    // @LINE:379
    case controllers_Mod_gamify302_route(params@_) =>
      call { 
        controllers_Mod_gamify302_invoker.call(Mod_53.gamify)
      }
  
    // @LINE:380
    case controllers_Mod_gamifyPeriod303_route(params@_) =>
      call(params.fromPath[String]("period", None)) { (period) =>
        controllers_Mod_gamifyPeriod303_invoker.call(Mod_53.gamifyPeriod(period))
      }
  
    // @LINE:381
    case controllers_Mod_search304_route(params@_) =>
      call { 
        controllers_Mod_search304_invoker.call(Mod_53.search)
      }
  
    // @LINE:382
    case controllers_Mod_chatUser305_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_chatUser305_invoker.call(Mod_53.chatUser(username))
      }
  
    // @LINE:383
    case controllers_Mod_permissions306_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_permissions306_invoker.call(Mod_53.permissions(username))
      }
  
    // @LINE:384
    case controllers_Mod_savePermissions307_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Mod_savePermissions307_invoker.call(Mod_53.savePermissions(username))
      }
  
    // @LINE:385
    case controllers_Mod_publicChat308_route(params@_) =>
      call { 
        controllers_Mod_publicChat308_invoker.call(Mod_53.publicChat)
      }
  
    // @LINE:386
    case controllers_Mod_emailConfirm309_route(params@_) =>
      call { 
        controllers_Mod_emailConfirm309_invoker.call(Mod_53.emailConfirm)
      }
  
    // @LINE:387
    case controllers_Mod_chatPanic310_route(params@_) =>
      call { 
        controllers_Mod_chatPanic310_invoker.call(Mod_53.chatPanic)
      }
  
    // @LINE:388
    case controllers_Mod_chatPanicPost311_route(params@_) =>
      call { 
        controllers_Mod_chatPanicPost311_invoker.call(Mod_53.chatPanicPost)
      }
  
    // @LINE:389
    case controllers_Mod_print312_route(params@_) =>
      call(params.fromPath[String]("fh", None)) { (fh) =>
        controllers_Mod_print312_invoker.call(Mod_53.print(fh))
      }
  
    // @LINE:390
    case controllers_Mod_printBan313_route(params@_) =>
      call(params.fromPath[Boolean]("v", None), params.fromPath[String]("fh", None)) { (v, fh) =>
        controllers_Mod_printBan313_invoker.call(Mod_53.printBan(v, fh))
      }
  
    // @LINE:391
    case controllers_Mod_eventStream314_route(params@_) =>
      call { 
        controllers_Mod_eventStream314_invoker.call(Mod_53.eventStream)
      }
  
    // @LINE:394
    case controllers_Irwin_dashboard315_route(params@_) =>
      call { 
        controllers_Irwin_dashboard315_invoker.call(Irwin_41.dashboard)
      }
  
    // @LINE:395
    case controllers_Irwin_saveReport316_route(params@_) =>
      call { 
        controllers_Irwin_saveReport316_invoker.call(Irwin_41.saveReport)
      }
  
    // @LINE:396
    case controllers_Irwin_eventStream317_route(params@_) =>
      call { 
        controllers_Irwin_eventStream317_invoker.call(Irwin_41.eventStream)
      }
  
    // @LINE:399
    case controllers_Bookmark_toggle318_route(params@_) =>
      call(params.fromPath[String]("gameId", None)) { (gameId) =>
        controllers_Bookmark_toggle318_invoker.call(Bookmark_43.toggle(gameId))
      }
  
    // @LINE:402
    case controllers_ForumCateg_index319_route(params@_) =>
      call { 
        controllers_ForumCateg_index319_invoker.call(ForumCateg_26.index)
      }
  
    // @LINE:403
    case controllers_ForumPost_search320_route(params@_) =>
      call(params.fromQuery[String]("text", Some("")), params.fromQuery[Int]("page", Some(1))) { (text, page) =>
        controllers_ForumPost_search320_invoker.call(ForumPost_49.search(text, page))
      }
  
    // @LINE:404
    case controllers_ForumCateg_show321_route(params@_) =>
      call(params.fromPath[String]("slug", None), params.fromQuery[Int]("page", Some(1))) { (slug, page) =>
        controllers_ForumCateg_show321_invoker.call(ForumCateg_26.show(slug, page))
      }
  
    // @LINE:405
    case controllers_ForumTopic_form322_route(params@_) =>
      call(params.fromPath[String]("categSlug", None)) { (categSlug) =>
        controllers_ForumTopic_form322_invoker.call(ForumTopic_15.form(categSlug))
      }
  
    // @LINE:406
    case controllers_ForumTopic_create323_route(params@_) =>
      call(params.fromPath[String]("categSlug", None)) { (categSlug) =>
        controllers_ForumTopic_create323_invoker.call(ForumTopic_15.create(categSlug))
      }
  
    // @LINE:407
    case controllers_ForumTopic_participants324_route(params@_) =>
      call(params.fromPath[String]("topicId", None)) { (topicId) =>
        controllers_ForumTopic_participants324_invoker.call(ForumTopic_15.participants(topicId))
      }
  
    // @LINE:408
    case controllers_ForumTopic_show325_route(params@_) =>
      call(params.fromPath[String]("categSlug", None), params.fromPath[String]("slug", None), params.fromQuery[Int]("page", Some(1))) { (categSlug, slug, page) =>
        controllers_ForumTopic_show325_invoker.call(ForumTopic_15.show(categSlug, slug, page))
      }
  
    // @LINE:409
    case controllers_ForumTopic_close326_route(params@_) =>
      call(params.fromPath[String]("categSlug", None), params.fromPath[String]("slug", None)) { (categSlug, slug) =>
        controllers_ForumTopic_close326_invoker.call(ForumTopic_15.close(categSlug, slug))
      }
  
    // @LINE:410
    case controllers_ForumTopic_hide327_route(params@_) =>
      call(params.fromPath[String]("categSlug", None), params.fromPath[String]("slug", None)) { (categSlug, slug) =>
        controllers_ForumTopic_hide327_invoker.call(ForumTopic_15.hide(categSlug, slug))
      }
  
    // @LINE:411
    case controllers_ForumTopic_sticky328_route(params@_) =>
      call(params.fromPath[String]("categSlug", None), params.fromPath[String]("slug", None)) { (categSlug, slug) =>
        controllers_ForumTopic_sticky328_invoker.call(ForumTopic_15.sticky(categSlug, slug))
      }
  
    // @LINE:412
    case controllers_ForumPost_create329_route(params@_) =>
      call(params.fromPath[String]("categSlug", None), params.fromPath[String]("slug", None), params.fromQuery[Int]("page", Some(1))) { (categSlug, slug, page) =>
        controllers_ForumPost_create329_invoker.call(ForumPost_49.create(categSlug, slug, page))
      }
  
    // @LINE:413
    case controllers_ForumPost_delete330_route(params@_) =>
      call(params.fromPath[String]("categSlug", None), params.fromPath[String]("id", None)) { (categSlug, id) =>
        controllers_ForumPost_delete330_invoker.call(ForumPost_49.delete(categSlug, id))
      }
  
    // @LINE:414
    case controllers_ForumPost_edit331_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_ForumPost_edit331_invoker.call(ForumPost_49.edit(id))
      }
  
    // @LINE:415
    case controllers_ForumPost_redirect332_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_ForumPost_redirect332_invoker.call(ForumPost_49.redirect(id))
      }
  
    // @LINE:418
    case controllers_Msg_compatCreate333_route(params@_) =>
      call { 
        controllers_Msg_compatCreate333_invoker.call(Msg_31.compatCreate)
      }
  
    // @LINE:420
    case controllers_Msg_home334_route(params@_) =>
      call { 
        controllers_Msg_home334_invoker.call(Msg_31.home)
      }
  
    // @LINE:421
    case controllers_Msg_search335_route(params@_) =>
      call(params.fromQuery[String]("q", None)) { (q) =>
        controllers_Msg_search335_invoker.call(Msg_31.search(q))
      }
  
    // @LINE:422
    case controllers_Msg_unreadCount336_route(params@_) =>
      call { 
        controllers_Msg_unreadCount336_invoker.call(Msg_31.unreadCount)
      }
  
    // @LINE:423
    case controllers_Msg_convo337_route(params@_) =>
      call(params.fromPath[String]("username", None), params.fromQuery[Option[Long]]("before", Some(None))) { (username, before) =>
        controllers_Msg_convo337_invoker.call(Msg_31.convo(username, before))
      }
  
    // @LINE:424
    case controllers_Msg_convoDelete338_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Msg_convoDelete338_invoker.call(Msg_31.convoDelete(username))
      }
  
    // @LINE:426
    case controllers_Msg_apiPost339_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Msg_apiPost339_invoker.call(Msg_31.apiPost(username))
      }
  
    // @LINE:429
    case controllers_Coach_allDefault340_route(params@_) =>
      call(params.fromQuery[Int]("page", Some(1))) { (page) =>
        controllers_Coach_allDefault340_invoker.call(Coach_52.allDefault(page))
      }
  
    // @LINE:430
    case controllers_Coach_all341_route(params@_) =>
      call(params.fromPath[String]("order", None), params.fromQuery[Int]("page", Some(1))) { (order, page) =>
        controllers_Coach_all341_invoker.call(Coach_52.all(order, page))
      }
  
    // @LINE:431
    case controllers_Coach_edit342_route(params@_) =>
      call { 
        controllers_Coach_edit342_invoker.call(Coach_52.edit)
      }
  
    // @LINE:432
    case controllers_Coach_editApply343_route(params@_) =>
      call { 
        controllers_Coach_editApply343_invoker.call(Coach_52.editApply)
      }
  
    // @LINE:433
    case controllers_Coach_picture344_route(params@_) =>
      call { 
        controllers_Coach_picture344_invoker.call(Coach_52.picture)
      }
  
    // @LINE:434
    case controllers_Coach_pictureApply345_route(params@_) =>
      call { 
        controllers_Coach_pictureApply345_invoker.call(Coach_52.pictureApply)
      }
  
    // @LINE:435
    case controllers_Coach_pictureDelete346_route(params@_) =>
      call { 
        controllers_Coach_pictureDelete346_invoker.call(Coach_52.pictureDelete)
      }
  
    // @LINE:436
    case controllers_Coach_approveReview347_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Coach_approveReview347_invoker.call(Coach_52.approveReview(id))
      }
  
    // @LINE:437
    case controllers_Coach_modReview348_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Coach_modReview348_invoker.call(Coach_52.modReview(id))
      }
  
    // @LINE:438
    case controllers_Coach_show349_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Coach_show349_invoker.call(Coach_52.show(username))
      }
  
    // @LINE:439
    case controllers_Coach_review350_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Coach_review350_invoker.call(Coach_52.review(username))
      }
  
    // @LINE:442
    case controllers_Clas_index351_route(params@_) =>
      call { 
        controllers_Clas_index351_invoker.call(Clas_32.index)
      }
  
    // @LINE:443
    case controllers_Clas_form352_route(params@_) =>
      call { 
        controllers_Clas_form352_invoker.call(Clas_32.form)
      }
  
    // @LINE:444
    case controllers_Clas_create353_route(params@_) =>
      call { 
        controllers_Clas_create353_invoker.call(Clas_32.create)
      }
  
    // @LINE:445
    case controllers_Clas_verifyTeacher354_route(params@_) =>
      call { 
        controllers_Clas_verifyTeacher354_invoker.call(Clas_32.verifyTeacher)
      }
  
    // @LINE:446
    case controllers_Clas_show355_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_show355_invoker.call(Clas_32.show(id))
      }
  
    // @LINE:447
    case controllers_Clas_edit356_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_edit356_invoker.call(Clas_32.edit(id))
      }
  
    // @LINE:448
    case controllers_Clas_update357_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_update357_invoker.call(Clas_32.update(id))
      }
  
    // @LINE:449
    case controllers_Clas_wall358_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_wall358_invoker.call(Clas_32.wall(id))
      }
  
    // @LINE:450
    case controllers_Clas_wallEdit359_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_wallEdit359_invoker.call(Clas_32.wallEdit(id))
      }
  
    // @LINE:451
    case controllers_Clas_wallUpdate360_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_wallUpdate360_invoker.call(Clas_32.wallUpdate(id))
      }
  
    // @LINE:452
    case controllers_Clas_notifyStudents361_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_notifyStudents361_invoker.call(Clas_32.notifyStudents(id))
      }
  
    // @LINE:453
    case controllers_Clas_notifyPost362_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_notifyPost362_invoker.call(Clas_32.notifyPost(id))
      }
  
    // @LINE:454
    case controllers_Clas_archive363_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromQuery[Boolean]("v", None)) { (id, v) =>
        controllers_Clas_archive363_invoker.call(Clas_32.archive(id, v))
      }
  
    // @LINE:455
    case controllers_Clas_archived364_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_archived364_invoker.call(Clas_32.archived(id))
      }
  
    // @LINE:456
    case controllers_Clas_progress365_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("pt", None), params.fromPath[Int]("days", None)) { (id, pt, days) =>
        controllers_Clas_progress365_invoker.call(Clas_32.progress(id, pt, days))
      }
  
    // @LINE:457
    case controllers_Clas_studentForm366_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_studentForm366_invoker.call(Clas_32.studentForm(id))
      }
  
    // @LINE:458
    case controllers_Clas_studentCreate367_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_studentCreate367_invoker.call(Clas_32.studentCreate(id))
      }
  
    // @LINE:459
    case controllers_Clas_studentInvite368_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Clas_studentInvite368_invoker.call(Clas_32.studentInvite(id))
      }
  
    // @LINE:460
    case controllers_Clas_studentShow369_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("username", None)) { (id, username) =>
        controllers_Clas_studentShow369_invoker.call(Clas_32.studentShow(id, username))
      }
  
    // @LINE:461
    case controllers_Clas_studentArchive370_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("username", None), params.fromQuery[Boolean]("v", None)) { (id, username, v) =>
        controllers_Clas_studentArchive370_invoker.call(Clas_32.studentArchive(id, username, v))
      }
  
    // @LINE:462
    case controllers_Clas_studentResetPassword371_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("username", None)) { (id, username) =>
        controllers_Clas_studentResetPassword371_invoker.call(Clas_32.studentResetPassword(id, username))
      }
  
    // @LINE:463
    case controllers_Clas_studentSetKid372_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("username", None), params.fromQuery[Boolean]("v", None)) { (id, username, v) =>
        controllers_Clas_studentSetKid372_invoker.call(Clas_32.studentSetKid(id, username, v))
      }
  
    // @LINE:464
    case controllers_Clas_studentEdit373_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("username", None)) { (id, username) =>
        controllers_Clas_studentEdit373_invoker.call(Clas_32.studentEdit(id, username))
      }
  
    // @LINE:465
    case controllers_Clas_studentUpdate374_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("username", None)) { (id, username) =>
        controllers_Clas_studentUpdate374_invoker.call(Clas_32.studentUpdate(id, username))
      }
  
    // @LINE:466
    case controllers_Clas_studentRelease375_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("username", None)) { (id, username) =>
        controllers_Clas_studentRelease375_invoker.call(Clas_32.studentRelease(id, username))
      }
  
    // @LINE:467
    case controllers_Clas_studentReleasePost376_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("username", None)) { (id, username) =>
        controllers_Clas_studentReleasePost376_invoker.call(Clas_32.studentReleasePost(id, username))
      }
  
    // @LINE:470
    case controllers_Main_image377_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("hash", None), params.fromPath[String]("name", None)) { (id, hash, name) =>
        controllers_Main_image377_invoker.call(Main_13.image(id, hash, name))
      }
  
    // @LINE:473
    case controllers_Importer_importGame378_route(params@_) =>
      call { 
        controllers_Importer_importGame378_invoker.call(Importer_10.importGame)
      }
  
    // @LINE:474
    case controllers_Importer_sendGame379_route(params@_) =>
      call { 
        controllers_Importer_sendGame379_invoker.call(Importer_10.sendGame)
      }
  
    // @LINE:475
    case controllers_Importer_masterGame380_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("color", None)) { (id, color) =>
        controllers_Importer_masterGame380_invoker.call(Importer_10.masterGame(id, color))
      }
  
    // @LINE:478
    case controllers_Editor_data381_route(params@_) =>
      call { 
        controllers_Editor_data381_invoker.call(Editor_8.data)
      }
  
    // @LINE:479
    case controllers_Editor_load382_route(params@_) =>
      call(params.fromPath[String]("urlFen", None)) { (urlFen) =>
        controllers_Editor_load382_invoker.call(Editor_8.load(urlFen))
      }
  
    // @LINE:480
    case controllers_Editor_index383_route(params@_) =>
      call { 
        controllers_Editor_index383_invoker.call(Editor_8.index)
      }
  
    // @LINE:483
    case controllers_Report_form384_route(params@_) =>
      call { 
        controllers_Report_form384_invoker.call(Report_38.form)
      }
  
    // @LINE:484
    case controllers_Report_create385_route(params@_) =>
      call { 
        controllers_Report_create385_invoker.call(Report_38.create)
      }
  
    // @LINE:485
    case controllers_Report_flag386_route(params@_) =>
      call { 
        controllers_Report_flag386_invoker.call(Report_38.flag)
      }
  
    // @LINE:486
    case controllers_Report_thanks387_route(params@_) =>
      call(params.fromQuery[String]("reported", None)) { (reported) =>
        controllers_Report_thanks387_invoker.call(Report_38.thanks(reported))
      }
  
    // @LINE:487
    case controllers_Report_list388_route(params@_) =>
      call { 
        controllers_Report_list388_invoker.call(Report_38.list)
      }
  
    // @LINE:488
    case controllers_Report_listWithFilter389_route(params@_) =>
      call(params.fromPath[String]("room", None)) { (room) =>
        controllers_Report_listWithFilter389_invoker.call(Report_38.listWithFilter(room))
      }
  
    // @LINE:489
    case controllers_Report_inquiry390_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Report_inquiry390_invoker.call(Report_38.inquiry(id))
      }
  
    // @LINE:490
    case controllers_Report_process391_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Report_process391_invoker.call(Report_38.process(id))
      }
  
    // @LINE:491
    case controllers_Report_xfiles392_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Report_xfiles392_invoker.call(Report_38.xfiles(id))
      }
  
    // @LINE:492
    case controllers_Report_currentCheatInquiry393_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Report_currentCheatInquiry393_invoker.call(Report_38.currentCheatInquiry(username))
      }
  
    // @LINE:495
    case controllers_Stat_ratingDistribution394_route(params@_) =>
      call(params.fromPath[String]("perf", None)) { (perf) =>
        controllers_Stat_ratingDistribution394_invoker.call(Stat_45.ratingDistribution(perf))
      }
  
    // @LINE:498
    case controllers_Api_index395_route(params@_) =>
      call { 
        controllers_Api_index395_invoker.call(Api_58.index)
      }
  
    // @LINE:499
    case controllers_Api_usersByIds396_route(params@_) =>
      call { 
        controllers_Api_usersByIds396_invoker.call(Api_58.usersByIds)
      }
  
    // @LINE:500
    case controllers_Puzzle_activity397_route(params@_) =>
      call { 
        controllers_Puzzle_activity397_invoker.call(Puzzle_44.activity)
      }
  
    // @LINE:501
    case controllers_Api_tournamentsByOwner398_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_Api_tournamentsByOwner398_invoker.call(Api_58.tournamentsByOwner(name))
      }
  
    // @LINE:502
    case controllers_Api_user399_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_Api_user399_invoker.call(Api_58.user(name))
      }
  
    // @LINE:503
    case controllers_Api_activity400_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_Api_activity400_invoker.call(Api_58.activity(name))
      }
  
    // @LINE:504
    case controllers_Relation_apiFollowing401_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_Relation_apiFollowing401_invoker.call(Relation_57.apiFollowing(name))
      }
  
    // @LINE:505
    case controllers_Relation_apiFollowers402_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_Relation_apiFollowers402_invoker.call(Relation_57.apiFollowers(name))
      }
  
    // @LINE:506
    case controllers_User_apiWriteNote403_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_User_apiWriteNote403_invoker.call(User_17.apiWriteNote(name))
      }
  
    // @LINE:507
    case controllers_User_ratingHistory404_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_User_ratingHistory404_invoker.call(User_17.ratingHistory(name))
      }
  
    // @LINE:508
    case controllers_Api_game405_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Api_game405_invoker.call(Api_58.game(id))
      }
  
    // @LINE:509
    case controllers_Api_currentTournaments406_route(params@_) =>
      call { 
        controllers_Api_currentTournaments406_invoker.call(Api_58.currentTournaments)
      }
  
    // @LINE:510
    case controllers_Api_tournament407_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Api_tournament407_invoker.call(Api_58.tournament(id))
      }
  
    // @LINE:511
    case controllers_Api_tournamentGames408_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Api_tournamentGames408_invoker.call(Api_58.tournamentGames(id))
      }
  
    // @LINE:512
    case controllers_Api_tournamentResults409_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Api_tournamentResults409_invoker.call(Api_58.tournamentResults(id))
      }
  
    // @LINE:513
    case controllers_Tournament_apiCreate410_route(params@_) =>
      call { 
        controllers_Tournament_apiCreate410_invoker.call(Tournament_2.apiCreate)
      }
  
    // @LINE:514
    case controllers_Simul_apiList411_route(params@_) =>
      call { 
        controllers_Simul_apiList411_invoker.call(Simul_48.apiList)
      }
  
    // @LINE:515
    case controllers_Api_status412_route(params@_) =>
      call { 
        controllers_Api_status412_invoker.call(Api_58.status)
      }
  
    // @LINE:516
    case controllers_Api_usersStatus413_route(params@_) =>
      call { 
        controllers_Api_usersStatus413_invoker.call(Api_58.usersStatus)
      }
  
    // @LINE:517
    case controllers_Api_crosstable414_route(params@_) =>
      call(params.fromPath[String]("u1", None), params.fromPath[String]("u2", None)) { (u1, u2) =>
        controllers_Api_crosstable414_invoker.call(Api_58.crosstable(u1, u2))
      }
  
    // @LINE:518
    case controllers_Api_gamesByUsersStream415_route(params@_) =>
      call { 
        controllers_Api_gamesByUsersStream415_invoker.call(Api_58.gamesByUsersStream)
      }
  
    // @LINE:519
    case controllers_Api_eventStream416_route(params@_) =>
      call { 
        controllers_Api_eventStream416_invoker.call(Api_58.eventStream)
      }
  
    // @LINE:520
    case controllers_Account_apiMe417_route(params@_) =>
      call { 
        controllers_Account_apiMe417_invoker.call(Account_7.apiMe)
      }
  
    // @LINE:521
    case controllers_Account_apiNowPlaying418_route(params@_) =>
      call { 
        controllers_Account_apiNowPlaying418_invoker.call(Account_7.apiNowPlaying)
      }
  
    // @LINE:522
    case controllers_Account_apiEmail419_route(params@_) =>
      call { 
        controllers_Account_apiEmail419_invoker.call(Account_7.apiEmail)
      }
  
    // @LINE:523
    case controllers_Account_apiKid420_route(params@_) =>
      call { 
        controllers_Account_apiKid420_invoker.call(Account_7.apiKid)
      }
  
    // @LINE:524
    case controllers_Account_apiKidPost421_route(params@_) =>
      call { 
        controllers_Account_apiKidPost421_invoker.call(Account_7.apiKidPost)
      }
  
    // @LINE:525
    case controllers_Pref_apiGet422_route(params@_) =>
      call { 
        controllers_Pref_apiGet422_invoker.call(Pref_1.apiGet)
      }
  
    // @LINE:526
    case controllers_Challenge_apiCreate423_route(params@_) =>
      call(params.fromPath[String]("user", None)) { (user) =>
        controllers_Challenge_apiCreate423_invoker.call(Challenge_28.apiCreate(user))
      }
  
    // @LINE:527
    case controllers_Challenge_apiAccept424_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Challenge_apiAccept424_invoker.call(Challenge_28.apiAccept(id))
      }
  
    // @LINE:528
    case controllers_Challenge_apiDecline425_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Challenge_apiDecline425_invoker.call(Challenge_28.apiDecline(id))
      }
  
    // @LINE:530
    case controllers_Game_apiExportByUser426_route(params@_) =>
      call(params.fromPath[String]("username", None)) { (username) =>
        controllers_Game_apiExportByUser426_invoker.call(Game_5.apiExportByUser(username))
      }
  
    // @LINE:533
    case controllers_Api_userGames427_route(params@_) =>
      call(params.fromPath[String]("name", None)) { (name) =>
        controllers_Api_userGames427_invoker.call(Api_58.userGames(name))
      }
  
    // @LINE:536
    case controllers_Bot_gameStream428_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Bot_gameStream428_invoker.call(Bot_30.gameStream(id))
      }
  
    // @LINE:537
    case controllers_Bot_move429_route(params@_) =>
      call(params.fromPath[String]("id", None), params.fromPath[String]("uci", None), params.fromQuery[Option[Boolean]]("offeringDraw", Some(None))) { (id, uci, offeringDraw) =>
        controllers_Bot_move429_invoker.call(Bot_30.move(id, uci, offeringDraw))
      }
  
    // @LINE:538
    case controllers_Bot_command430_route(params@_) =>
      call(params.fromPath[String]("cmd", None)) { (cmd) =>
        controllers_Bot_command430_invoker.call(Bot_30.command(cmd))
      }
  
    // @LINE:539
    case controllers_Bot_online431_route(params@_) =>
      call { 
        controllers_Bot_online431_invoker.call(Bot_30.online)
      }
  
    // @LINE:542
    case controllers_Account_passwd432_route(params@_) =>
      call { 
        controllers_Account_passwd432_invoker.call(Account_7.passwd)
      }
  
    // @LINE:543
    case controllers_Account_passwdApply433_route(params@_) =>
      call { 
        controllers_Account_passwdApply433_invoker.call(Account_7.passwdApply)
      }
  
    // @LINE:544
    case controllers_Account_email434_route(params@_) =>
      call { 
        controllers_Account_email434_invoker.call(Account_7.email)
      }
  
    // @LINE:545
    case controllers_Account_emailApply435_route(params@_) =>
      call { 
        controllers_Account_emailApply435_invoker.call(Account_7.emailApply)
      }
  
    // @LINE:546
    case controllers_Account_emailConfirmHelp436_route(params@_) =>
      call { 
        controllers_Account_emailConfirmHelp436_invoker.call(Account_7.emailConfirmHelp)
      }
  
    // @LINE:547
    case controllers_Account_emailConfirm437_route(params@_) =>
      call(params.fromPath[String]("token", None)) { (token) =>
        controllers_Account_emailConfirm437_invoker.call(Account_7.emailConfirm(token))
      }
  
    // @LINE:548
    case controllers_Account_close438_route(params@_) =>
      call { 
        controllers_Account_close438_invoker.call(Account_7.close)
      }
  
    // @LINE:549
    case controllers_Account_closeConfirm439_route(params@_) =>
      call { 
        controllers_Account_closeConfirm439_invoker.call(Account_7.closeConfirm)
      }
  
    // @LINE:550
    case controllers_Account_profile440_route(params@_) =>
      call { 
        controllers_Account_profile440_invoker.call(Account_7.profile)
      }
  
    // @LINE:551
    case controllers_Account_profileApply441_route(params@_) =>
      call { 
        controllers_Account_profileApply441_invoker.call(Account_7.profileApply)
      }
  
    // @LINE:552
    case controllers_Account_username442_route(params@_) =>
      call { 
        controllers_Account_username442_invoker.call(Account_7.username)
      }
  
    // @LINE:553
    case controllers_Account_usernameApply443_route(params@_) =>
      call { 
        controllers_Account_usernameApply443_invoker.call(Account_7.usernameApply)
      }
  
    // @LINE:554
    case controllers_Account_kid444_route(params@_) =>
      call { 
        controllers_Account_kid444_invoker.call(Account_7.kid)
      }
  
    // @LINE:555
    case controllers_Account_kidPost445_route(params@_) =>
      call { 
        controllers_Account_kidPost445_invoker.call(Account_7.kidPost)
      }
  
    // @LINE:556
    case controllers_Account_twoFactor446_route(params@_) =>
      call { 
        controllers_Account_twoFactor446_invoker.call(Account_7.twoFactor)
      }
  
    // @LINE:557
    case controllers_Account_setupTwoFactor447_route(params@_) =>
      call { 
        controllers_Account_setupTwoFactor447_invoker.call(Account_7.setupTwoFactor)
      }
  
    // @LINE:558
    case controllers_Account_disableTwoFactor448_route(params@_) =>
      call { 
        controllers_Account_disableTwoFactor448_invoker.call(Account_7.disableTwoFactor)
      }
  
    // @LINE:559
    case controllers_Account_reopen449_route(params@_) =>
      call { 
        controllers_Account_reopen449_invoker.call(Account_7.reopen)
      }
  
    // @LINE:560
    case controllers_Account_reopenApply450_route(params@_) =>
      call { 
        controllers_Account_reopenApply450_invoker.call(Account_7.reopenApply)
      }
  
    // @LINE:561
    case controllers_Account_reopenSent451_route(params@_) =>
      call(params.fromPath[String]("email", None)) { (email) =>
        controllers_Account_reopenSent451_invoker.call(Account_7.reopenSent(email))
      }
  
    // @LINE:562
    case controllers_Account_reopenLogin452_route(params@_) =>
      call(params.fromPath[String]("token", None)) { (token) =>
        controllers_Account_reopenLogin452_invoker.call(Account_7.reopenLogin(token))
      }
  
    // @LINE:564
    case controllers_Account_security453_route(params@_) =>
      call { 
        controllers_Account_security453_invoker.call(Account_7.security)
      }
  
    // @LINE:565
    case controllers_Account_signout454_route(params@_) =>
      call(params.fromPath[String]("sessionId", None)) { (sessionId) =>
        controllers_Account_signout454_invoker.call(Account_7.signout(sessionId))
      }
  
    // @LINE:566
    case controllers_Account_info455_route(params@_) =>
      call { 
        controllers_Account_info455_invoker.call(Account_7.info)
      }
  
    // @LINE:567
    case controllers_Account_nowPlaying456_route(params@_) =>
      call { 
        controllers_Account_nowPlaying456_invoker.call(Account_7.nowPlaying)
      }
  
    // @LINE:570
    case controllers_OAuthToken_index457_route(params@_) =>
      call { 
        controllers_OAuthToken_index457_invoker.call(OAuthToken_47.index)
      }
  
    // @LINE:571
    case controllers_OAuthToken_create458_route(params@_) =>
      call { 
        controllers_OAuthToken_create458_invoker.call(OAuthToken_47.create)
      }
  
    // @LINE:572
    case controllers_OAuthToken_createApply459_route(params@_) =>
      call { 
        controllers_OAuthToken_createApply459_invoker.call(OAuthToken_47.createApply)
      }
  
    // @LINE:573
    case controllers_OAuthToken_delete460_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_OAuthToken_delete460_invoker.call(OAuthToken_47.delete(id))
      }
  
    // @LINE:574
    case controllers_OAuthApp_index461_route(params@_) =>
      call { 
        controllers_OAuthApp_index461_invoker.call(OAuthApp_50.index)
      }
  
    // @LINE:575
    case controllers_OAuthApp_create462_route(params@_) =>
      call { 
        controllers_OAuthApp_create462_invoker.call(OAuthApp_50.create)
      }
  
    // @LINE:576
    case controllers_OAuthApp_createApply463_route(params@_) =>
      call { 
        controllers_OAuthApp_createApply463_invoker.call(OAuthApp_50.createApply)
      }
  
    // @LINE:577
    case controllers_OAuthApp_edit464_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_OAuthApp_edit464_invoker.call(OAuthApp_50.edit(id))
      }
  
    // @LINE:578
    case controllers_OAuthApp_update465_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_OAuthApp_update465_invoker.call(OAuthApp_50.update(id))
      }
  
    // @LINE:579
    case controllers_OAuthApp_delete466_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_OAuthApp_delete466_invoker.call(OAuthApp_50.delete(id))
      }
  
    // @LINE:582
    case controllers_Event_show467_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Event_show467_invoker.call(Event_22.show(id))
      }
  
    // @LINE:583
    case controllers_Event_manager468_route(params@_) =>
      call { 
        controllers_Event_manager468_invoker.call(Event_22.manager)
      }
  
    // @LINE:584
    case controllers_Event_edit469_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Event_edit469_invoker.call(Event_22.edit(id))
      }
  
    // @LINE:585
    case controllers_Event_update470_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Event_update470_invoker.call(Event_22.update(id))
      }
  
    // @LINE:586
    case controllers_Event_cloneE471_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Event_cloneE471_invoker.call(Event_22.cloneE(id))
      }
  
    // @LINE:587
    case controllers_Event_form472_route(params@_) =>
      call { 
        controllers_Event_form472_invoker.call(Event_22.form)
      }
  
    // @LINE:588
    case controllers_Event_create473_route(params@_) =>
      call { 
        controllers_Event_create473_invoker.call(Event_22.create)
      }
  
    // @LINE:591
    case controllers_Main_captchaCheck474_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Main_captchaCheck474_invoker.call(Main_13.captchaCheck(id))
      }
  
    // @LINE:592
    case controllers_Main_webmasters475_route(params@_) =>
      call { 
        controllers_Main_webmasters475_invoker.call(Main_13.webmasters)
      }
  
    // @LINE:593
    case controllers_Main_mobile476_route(params@_) =>
      call { 
        controllers_Main_mobile476_invoker.call(Main_13.mobile)
      }
  
    // @LINE:594
    case controllers_Main_lag477_route(params@_) =>
      call { 
        controllers_Main_lag477_invoker.call(Main_13.lag)
      }
  
    // @LINE:595
    case controllers_Main_getFishnet478_route(params@_) =>
      call { 
        controllers_Main_getFishnet478_invoker.call(Main_13.getFishnet)
      }
  
    // @LINE:596
    case controllers_Main_costs479_route(params@_) =>
      call { 
        controllers_Main_costs479_invoker.call(Main_13.costs)
      }
  
    // @LINE:597
    case controllers_Main_verifyTitle480_route(params@_) =>
      call { 
        controllers_Main_verifyTitle480_invoker.call(Main_13.verifyTitle)
      }
  
    // @LINE:598
    case controllers_Main_instantChess481_route(params@_) =>
      call { 
        controllers_Main_instantChess481_invoker.call(Main_13.instantChess)
      }
  
    // @LINE:601
    case controllers_Dev_cli482_route(params@_) =>
      call { 
        controllers_Dev_cli482_invoker.call(Dev_29.cli)
      }
  
    // @LINE:602
    case controllers_Dev_cliPost483_route(params@_) =>
      call { 
        controllers_Dev_cliPost483_invoker.call(Dev_29.cliPost)
      }
  
    // @LINE:603
    case controllers_Dev_command484_route(params@_) =>
      call { 
        controllers_Dev_command484_invoker.call(Dev_29.command)
      }
  
    // @LINE:604
    case controllers_Dev_settings485_route(params@_) =>
      call { 
        controllers_Dev_settings485_invoker.call(Dev_29.settings)
      }
  
    // @LINE:605
    case controllers_Dev_settingsPost486_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Dev_settingsPost486_invoker.call(Dev_29.settingsPost(id))
      }
  
    // @LINE:608
    case controllers_Push_mobileRegister487_route(params@_) =>
      call(params.fromPath[String]("platform", None), params.fromPath[String]("deviceId", None)) { (platform, deviceId) =>
        controllers_Push_mobileRegister487_invoker.call(Push_19.mobileRegister(platform, deviceId))
      }
  
    // @LINE:609
    case controllers_Push_mobileUnregister488_route(params@_) =>
      call { 
        controllers_Push_mobileUnregister488_invoker.call(Push_19.mobileUnregister)
      }
  
    // @LINE:610
    case controllers_Push_webSubscribe489_route(params@_) =>
      call { 
        controllers_Push_webSubscribe489_invoker.call(Push_19.webSubscribe)
      }
  
    // @LINE:613
    case controllers_Page_thanks490_route(params@_) =>
      call { 
        controllers_Page_thanks490_invoker.call(Page_6.thanks)
      }
  
    // @LINE:614
    case controllers_Page_tos491_route(params@_) =>
      call { 
        controllers_Page_tos491_invoker.call(Page_6.tos)
      }
  
    // @LINE:615
    case controllers_Page_privacy492_route(params@_) =>
      call { 
        controllers_Page_privacy492_invoker.call(Page_6.privacy)
      }
  
    // @LINE:616
    case controllers_Main_contact493_route(params@_) =>
      call { 
        controllers_Main_contact493_invoker.call(Main_13.contact)
      }
  
    // @LINE:617
    case controllers_Page_about494_route(params@_) =>
      call { 
        controllers_Page_about494_invoker.call(Page_6.about)
      }
  
    // @LINE:618
    case controllers_Main_faq495_route(params@_) =>
      call { 
        controllers_Main_faq495_invoker.call(Main_13.faq)
      }
  
    // @LINE:619
    case controllers_Page_source496_route(params@_) =>
      call { 
        controllers_Page_source496_invoker.call(Page_6.source)
      }
  
    // @LINE:620
    case controllers_Main_movedPermanently497_route(params@_) =>
      call(Param[String]("to", Right("/faq"))) { (to) =>
        controllers_Main_movedPermanently497_invoker.call(Main_13.movedPermanently(to))
      }
  
    // @LINE:621
    case controllers_Main_movedPermanently498_route(params@_) =>
      call(Param[String]("to", Right("/contact"))) { (to) =>
        controllers_Main_movedPermanently498_invoker.call(Main_13.movedPermanently(to))
      }
  
    // @LINE:622
    case controllers_Main_legacyQaQuestion499_route(params@_) =>
      call(params.fromPath[Int]("id", None), params.fromPath[String]("slug", None)) { (id, slug) =>
        controllers_Main_legacyQaQuestion499_invoker.call(Main_13.legacyQaQuestion(id, slug))
      }
  
    // @LINE:623
    case controllers_Page_howToCheat500_route(params@_) =>
      call { 
        controllers_Page_howToCheat500_invoker.call(Page_6.howToCheat)
      }
  
    // @LINE:624
    case controllers_Page_ads501_route(params@_) =>
      call { 
        controllers_Page_ads501_invoker.call(Page_6.ads)
      }
  
    // @LINE:627
    case controllers_Page_variantHome502_route(params@_) =>
      call { 
        controllers_Page_variantHome502_invoker.call(Page_6.variantHome)
      }
  
    // @LINE:628
    case controllers_Page_variant503_route(params@_) =>
      call(params.fromPath[String]("key", None)) { (key) =>
        controllers_Page_variant503_invoker.call(Page_6.variant(key))
      }
  
    // @LINE:631
    case controllers_Page_help504_route(params@_) =>
      call { 
        controllers_Page_help504_invoker.call(Page_6.help)
      }
  
    // @LINE:632
    case controllers_Page_master505_route(params@_) =>
      call { 
        controllers_Page_master505_invoker.call(Page_6.master)
      }
  
    // @LINE:634
    case controllers_Blog_preview506_route(params@_) =>
      call(params.fromQuery[String]("token", None)) { (token) =>
        controllers_Blog_preview506_invoker.call(Blog_33.preview(token))
      }
  
    // @LINE:635
    case controllers_Main_jslog507_route(params@_) =>
      call(params.fromPath[String]("id", None)) { (id) =>
        controllers_Main_jslog507_invoker.call(Main_13.jslog(id))
      }
  
    // @LINE:636
    case controllers_Main_jsmon508_route(params@_) =>
      call(params.fromPath[String]("event", None)) { (event) =>
        controllers_Main_jsmon508_invoker.call(Main_13.jsmon(event))
      }
  
    // @LINE:638
    case controllers_Main_movedPermanently509_route(params@_) =>
      call(Param[String]("to", Right("https://shop.spreadshirt.com/lichess-org"))) { (to) =>
        controllers_Main_movedPermanently509_invoker.call(Main_13.movedPermanently(to))
      }
  
    // @LINE:640
    case controllers_Main_devAsset510_route(params@_) =>
      call(params.fromPath[String]("v", None), Param[String]("path", Right("public")), params.fromPath[String]("file", None)) { (v, path, file) =>
        controllers_Main_devAsset510_invoker.call(Main_13.devAsset(v, path, file))
      }
  
    // @LINE:641
    case controllers_ExternalAssets_at511_route(params@_) =>
      call(Param[String]("path", Right("public")), params.fromPath[String]("file", None)) { (path, file) =>
        controllers_ExternalAssets_at511_invoker.call(ExternalAssets_40.at(path, file))
      }
  
    // @LINE:643
    case controllers_Main_manifest512_route(params@_) =>
      call { 
        controllers_Main_manifest512_invoker.call(Main_13.manifest)
      }
  
    // @LINE:644
    case controllers_Main_robots513_route(params@_) =>
      call { 
        controllers_Main_robots513_invoker.call(Main_13.robots)
      }
  
    // @LINE:646
    case controllers_Options_root514_route(params@_) =>
      call { 
        controllers_Options_root514_invoker.call(Options_4.root)
      }
  
    // @LINE:647
    case controllers_Options_all515_route(params@_) =>
      call(params.fromPath[String]("url", None)) { (url) =>
        controllers_Options_all515_invoker.call(Options_4.all(url))
      }
  }
}
