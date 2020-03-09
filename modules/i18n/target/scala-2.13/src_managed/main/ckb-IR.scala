package lila.i18n

import I18nQuantity._

// format: OFF
private object `ckb-IR` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](158)
m.put("playWithAFriend",new Simple("""یاریکردن لەگەڵ هاوڕێ"""))
m.put("playWithTheMachine",new Simple("""یاریکردن لەگەڵ کۆمپیوتەر"""))
m.put("toInviteSomeoneToPlayGiveThisUrl",new Simple("""بۆ بانگێشتکردنی کەسیک بۆ یاریکردن, ئەم لینکەیان پێ بدە"""))
m.put("gameOver",new Simple("""یاریەکە کۆتایی هات"""))
m.put("waitingForOpponent",new Simple("""چاوەڕوانی لایەینی بەرامبەر"""))
m.put("waiting",new Simple("""چاوەڕوانی ڕازیبوونی لایەنی بەرامبەر"""))
m.put("yourTurn",new Simple("""سەرەی تۆیە"""))
m.put("level",new Simple("""پلە"""))
m.put("toggleTheChat",new Simple("""چەسپاندنی چاتەکە"""))
m.put("toggleSound",new Simple("""چەسپاندنی دەنگەکە"""))
m.put("chat",new Simple("""دەمەتەقێ"""))
m.put("resign",new Simple("""خۆبەدەستەوەدان"""))
m.put("checkmate",new Simple("""کش مات"""))
m.put("stalemate",new Simple("""هەڵوێست"""))
m.put("white",new Simple("""سپی"""))
m.put("black",new Simple("""رەش"""))
m.put("randomColor",new Simple("""لایەکی هەرەمەکی"""))
m.put("createAGame",new Simple("""دروستکردن و ڕێکخستنی یاریەک"""))
m.put("whiteIsVictorious",new Simple("""سپی براوەیە"""))
m.put("blackIsVictorious",new Simple("""رەش براوەیە"""))
m.put("kingInTheCenter",new Simple("""پاشا لە ناوەڕاست"""))
m.put("threeChecks",new Simple("""سێ چێککردن (هێرش کردنە سەر پاشای بەرامبەر)"""))
m.put("raceFinished",new Simple("""کۆتایی هات"""))
m.put("variantEnding",new Simple("""کۆتایی هات بە شێوازی variant"""))
m.put("newOpponent",new Simple("""ڕکابەرێکی نوێ"""))
m.put("yourOpponentWantsToPlayANewGameWithYou",new Simple("""لایەنی بەرامبەر دەیەوێ یارییکی نوێت لەگەڵ بکات"""))
m.put("joinTheGame",new Simple("""بەژداریکرن"""))
m.put("whitePlays",new Simple("""یاری بە داشە سپیەکه بکه"""))
m.put("blackPlays",new Simple("""یاری بە داشە ڕەشەکە بکە"""))
m.put("opponentLeftChoices",new Simple("""لایەنی بەرامبەر چووە دەرەوە لە یارییەکە. دەتوانی ببی بە براوە یان یەکسان بوون هەڵبژێری, یاخود چاوەڕێ بیت."""))
m.put("makeYourOpponentResign",new Simple("""وا لە ڕکابەرەکەت بکه دەست هەڵبگرێت"""))
m.put("forceResignation",new Simple("""بردنەوە بە دەست بێنە"""))
m.put("forceDraw",new Simple("""یەکسانبوون هەڵبژێرە"""))
m.put("talkInChat",new Simple("""تکایە بەرێزەوە دەمەتەقێ بکە!"""))
m.put("theFirstPersonToComeOnThisUrlWillPlayWithYou",new Simple("""یەکەم کەس ئەم لینکە بەکاربهێنێت یاریت لەگەڵ دەکات."""))
m.put("whiteResigned",new Simple("""سپی خۆی بەدەستەوەدا"""))
m.put("blackResigned",new Simple("""رەش خۆی بەدەستەوەدا"""))
m.put("whiteLeftTheGame",new Simple("""سپی وازیهێنا لە یاریکردن"""))
m.put("blackLeftTheGame",new Simple("""ڕەش وازیهێنا لە یاریکردن"""))
m.put("shareThisUrlToLetSpectatorsSeeTheGame",new Simple("""ئەم لینکە بڵاو بکەوە بۆ ئەوەی بینەران چاودێری یاریەکە بن"""))
m.put("theComputerAnalysisHasFailed",new Simple("""شیکردنەوەی کۆمپیوتەری سەرکەوتوو نەبوو"""))
m.put("viewTheComputerAnalysis",new Simple("""پشاندانی شیکاری کۆمپیوتەری"""))
m.put("requestAComputerAnalysis",new Simple("""داواکردنی شیکاری کۆمپیوتەری"""))
m.put("computerAnalysis",new Simple("""شیکاری کۆمپیوتەری"""))
m.put("computerAnalysisAvailable",new Simple("""شیکاری کۆمپیوتەری بەردەستە"""))
m.put("analysis",new Simple("""شیکاری تەختەی شەترەنج"""))
m.put("depthX",new Simple("""قوڵایی%s"""))
m.put("usingServerAnalysis",new Simple("""بەکارھێنانی شیکاری ڕاژەکاری"""))
m.put("loadingEngine",new Simple("""بزوێنەرەکە لە باری هەڵگرتندایه..."""))
m.put("goDeeper",new Simple("""زیاتر"""))
m.put("showThreat",new Simple("""پیشاندانی مەترسی"""))
m.put("inLocalBrowser",new Simple("""له شوێنی گەڕانی ناوخۆیی"""))
m.put("makeMainLine",new Simple("""کردن بە رستەی سەرەکی"""))
m.put("deleteFromHere",new Simple("""سڕینەوە"""))
m.put("move",new Simple("""جوڵان"""))
m.put("variantLoss",new Simple("""دۆرانی ناچاری"""))
m.put("insufficientMaterial",new Simple("""یەکسانبوون بەهۆی نەمانی جوڵە بۆ کش"""))
m.put("capture",new Simple("""گرتن"""))
m.put("close",new Simple("""داخستن"""))
m.put("winning",new Simple("""جوڵەی بردنەوە"""))
m.put("losing",new Simple("""جولەی دۆڕان"""))
m.put("drawn",new Simple("""جولەی یەکسانبوون"""))
m.put("unknown",new Simple("""نەزانراو"""))
m.put("averageRatingX",new Simple("""پۆلێنکردنی تێکرا: %s"""))
m.put("recentGames",new Simple("""دوایین یاریەکانت"""))
m.put("noGameFound",new Simple("""هیچ یارییەک نەدۆزرایەوە"""))
m.put("maybeIncludeMoreGamesFromThePreferencesMenu",new Simple("""ئایا دەتەویت جۆری تر دیاری بکەیت?"""))
m.put("allSet",new Simple("""ئامادەیە!"""))
m.put("importPgn",new Simple("""سکرین شوت PGN"""))
m.put("delete",new Simple("""سڕینەوە"""))
m.put("deleteThisImportedGame",new Simple("""دڵنیای کە دەتەوێت بیسڕیەوە?"""))
m.put("replayMode",new Simple("""سەیرکردنەوەی یاریەکە"""))
m.put("realtimeReplay",new Simple("""وەک خۆی"""))
m.put("emails:emailConfirm_subject",new Simple("""هەژماری lichess.org بسەلمێنە %s"""))
m.put("emails:emailConfirm_click",new Escaped("""بۆ کارا کردنی حیسابی "لیچێس"ەکەت بەستەرەکە داگرە:""","""بۆ کارا کردنی حیسابی &quot;لیچێس&quot;ەکەت بەستەرەکە داگرە:"""))
m.put("emails:emailConfirm_ignore",new Simple("""ئەگەر خۆت تۆمار نەکردووە لە Lichess ئەوا دەتوانی ئەم نامەیە بشتگوێ بخەیت."""))
m.put("emails:passwordReset_subject",new Simple("""ووشەی نهێنی هەژماری lichess.org رێک بخەوە %s"""))
m.put("emails:passwordReset_intro",new Simple("""داواکارییەکمان پێگەیش بۆ ئەوەی ووشەی تێپەڕی هەژمارەکەت رێکبخەین."""))
m.put("emails:passwordReset_clickOrIgnore",new Simple("""ئەگەر ئەم داواکارییەت کردووە ئەوا کلیک لەم لینکەی خوارەوە بکە, ئەگەر نا ئەم ئیمێلە پشتگوێ بخە."""))
m.put("emails:emailChange_subject",new Simple("""ئیمێلە نوێیەکەت بسەلمێنە %s"""))
m.put("emails:emailChange_intro",new Simple("""داواتکردووە ئیمێلەکەت بگۆڕی."""))
m.put("emails:emailChange_click",new Simple("""تکایا کلیک لەم لینکەی خوارەوە بکە بۆ دڵنیا بوون لەوەی کە ئەم ئیمیلە بەردەستتە:"""))
m.put("emails:welcome_subject",new Simple("""بەخێربێی بۆ lichees.org %s"""))
m.put("emails:welcome_text",new Escaped("""هەژمارەکەت بەسەرکەوتووی دروستکرا لە https://lichess.org.
ئەمە لاپەرەی هەژمارەکەتە:%1$s. لێرە دەتوانی بەخواستی خۆت ڕێکی بخەی %2$s.
کاتێکی خۆش, وە هیوادارین داشەکانت هەمووکاتێک ڕێگایک ببیننەوە بۆ سەر پادشای دوژمن!""","""هەژمارەکەت بەسەرکەوتووی دروستکرا لە https://lichess.org.<br />ئەمە لاپەرەی هەژمارەکەتە:%1$s. لێرە دەتوانی بەخواستی خۆت ڕێکی بخەی %2$s.<br />کاتێکی خۆش, وە هیوادارین داشەکانت هەمووکاتێک ڕێگایک ببیننەوە بۆ سەر پادشای دوژمن!"""))
m.put("emails:common_orPaste",new Simple("""(کلیککردن سودی نییە ؟ هەوڵبدە کۆپی پێستی بکەی لە براوسەرەکەت)"""))
m.put("emails:common_note",new Simple("""ئەمە خزمەتگوزاری ئیمێڵییە, پەیوەستە بە بەکارهێنانت بۆ %s."""))
m.put("emails:common_contact",new Simple("""بۆ پەیوەندی کردن, تکایە ئەم لینکە بەکاربهێنە %s."""))
m.put("study:private",new Simple("""تایبەت"""))
m.put("study:myStudies",new Simple("""لێکۆڵینەوەکم"""))
m.put("study:studiesIContributeTo",new Simple("""ئەو لێکۆڵینەوانەی بەشداریم تێیاندا کرد"""))
m.put("study:myPublicStudies",new Simple("""لێکۆڵینەوە گشتییەکانم"""))
m.put("study:myPrivateStudies",new Simple("""لێکۆڵینەوە تایبەتییەکانم"""))
m.put("study:myFavoriteStudies",new Simple("""لێکۆڵینەوە دڵخوازەکانم"""))
m.put("study:whatAreStudies",new Simple("""لێکۆڵینەوەکان چین؟"""))
m.put("study:allStudies",new Simple("""هەموو لێکۆڵینەوەکان"""))
m.put("study:dateAddedNewest",new Simple("""(نوێترین) داتای زیادکراو"""))
m.put("study:dateAddedOldest",new Simple("""(کۆنترین) داتای زیادکراو"""))
m.put("study:mostPopular",new Simple("""دیارترین"""))
m.put("study:addNewChapter",new Simple("""بەشێکی نوێ زیاد بکە"""))
m.put("study:addMembers",new Simple("""ئەندامەکان زیاد بکە"""))
m.put("study:inviteToTheStudy",new Simple("""بانگێشتکردن بۆ لێکۆڵینەوەکه"""))
m.put("study:pleaseOnlyInvitePeopleYouKnow",new Simple("""تکایە تەنھا ئەو کەسانە بانگێشت بکە کە دەیانناسیت و دەیانەوێت بە شێوەیەکی چالاکانە بێنە پاڵ ئەو لێکۆڵینەوەیه."""))
m.put("study:searchByUsername",new Simple("""لە ڕێگەی ناوی بەکارھێنەرەوە بگەڕێ"""))
m.put("study:spectator",new Simple("""بینەر"""))
m.put("study:contributor",new Simple("""بەشدار"""))
m.put("study:leaveTheStudy",new Simple("""لێکۆڵینەوەکە جێبهێڵە"""))
m.put("study:youAreNowAContributor",new Simple("""ئێستا تۆ بەشداری"""))
m.put("study:youAreNowASpectator",new Simple("""ئێستا تۆ بینەری"""))
m.put("study:like",new Simple("""بەدڵ بوون"""))
m.put("study:commentThisPosition",new Simple("""لێدوان لەسەر ئەو پێگەیە"""))
m.put("study:commentThisMove",new Simple("""لێدوان لەسەر ئەو جوڵانەوەیه"""))
m.put("study:theChapterIsTooShortToBeAnalysed",new Simple("""ئەو بەشە بەهۆی کورتییەوە ناتوانرێت شیکار بکرێت."""))
m.put("study:onlyContributorsCanRequestAnalysis",new Simple("""تەنها بەشداربووانی لێکۆڵینەوەکە دەتوانن داوای شیکارکردنی کۆمپیوتەر بکەن."""))
m.put("study:makeSureTheChapterIsComplete",new Simple("""دڵنیا ببەوه لەوەی کە بەشەکە تەواو کراوە. تەنها بۆ یەکجار دەتوانیت ئەو شیکارکردنە بکەیت."""))
m.put("study:allSyncMembersRemainOnTheSamePosition",new Simple("""هەموو ئەندامەکانی SYNC لەسەر هەمان پێگە بمێننەوە"""))
m.put("study:shareChanges",new Simple("""گۆڕانکاریەکان لەگەڵ بینەرەکان بەشداری پێبکە و لەسەر سێرڤەرەکە دایانبکه"""))
m.put("study:playing",new Simple("""یاریکردن"""))
m.put("study:first",new Simple("""یەکەم"""))
m.put("study:previous",new Simple("""پێشوو"""))
m.put("study:next",new Simple("""دواتر"""))
m.put("study:last",new Simple("""دواترین"""))
m.put("study:startAtInitialPosition",new Simple("""له شوێنێکی سەرەتایی دەستپێبکە"""))
m.put("study:readMoreAboutEmbeddingAStudyChapter",new Simple("""زیاتر بخوێنەوە دەربارەی چەسپکردنی بەشێکی لێکۆڵینەوە"""))
m.put("study:open",new Simple("""کردنەوە"""))
m.put("study:studyNotFound",new Simple("""لێکۆڵینەوەکە نەدۆزرایەوە"""))
m.put("study:editChapter",new Simple("""چاککردنی بەش"""))
m.put("study:newChapter",new Simple("""بەشێکی نوێ"""))
m.put("study:orientation",new Simple("""ڕێکخستن"""))
m.put("study:analysisMode",new Simple("""شێوازی شیکردنەوە"""))
m.put("study:saveChapter",new Simple("""داکردنی بەش"""))
m.put("study:deleteChapter",new Simple("""سڕینەوەی بەش"""))
m.put("study:deleteThisChapter",new Simple("""سڕینەوەی ئەم بەشە؟ گەڕانەوەی بۆ نییه!"""))
m.put("study:rightUnderTheBoard",new Simple("""ڕێک لەژێر تەختەکە"""))
m.put("study:noPinnedComment",new Simple("""هیچ کامێکیان"""))
m.put("study:normalAnalysis",new Simple("""شیکردنەوەی ئاسایی"""))
m.put("study:hideNextMoves",new Simple("""شاردنەوەی جوولەکانی دواتر"""))
m.put("study:interactiveLesson",new Simple("""وانەی دوولایەنە"""))
m.put("study:empty",new Simple("""بەتاڵ"""))
m.put("study:startFromInitialPosition",new Simple("""دەستپێکردن لە پێگەی سەرەتاوە"""))
m.put("study:automatic",new Simple("""خوودکاری"""))
m.put("study:createChapter",new Simple("""دروستکردنی بەش"""))
m.put("study:createStudy",new Simple("""دروستکردنی لێکۆڵینەوە"""))
m.put("study:editStudy",new Simple("""چاککردنی لێکۆڵینەوە"""))
m.put("study:visibility",new Simple("""دەرکەوتن"""))
m.put("study:public",new Simple("""گشتی"""))
m.put("study:unlisted",new Simple("""ڕێکنەخراو"""))
m.put("study:nobody",new Simple("""هیچ کەس"""))
m.put("study:onlyMe",new Simple("""تەنها من"""))
m.put("study:contributors",new Simple("""بەشداربووان"""))
m.put("study:members",new Simple("""ئەندامان"""))
m.put("study:everyone",new Simple("""هەموو کەس"""))
m.put("study:yesKeepEveryoneOnTheSamePosition",new Simple("""هێشتنەوەی هەموو کەس له هەمان شوێندا"""))
m.put("study:noLetPeopleBrowseFreely",new Simple("""نەخێر: ڕێگەدان بەوەی هەمووان بە ئازادی بگەڕێن"""))
m.put("study:start",new Simple("""دەستپێکردن"""))
m.put("study:save",new Simple("""داکردن"""))
m.put("study:clearChat",new Simple("""سڕینەوەی نامە"""))
m.put("study:deleteTheEntireStudy",new Simple("""سڕینەوەی سەرتاپای لێکۆڵینەوەکە؟ گەڕانەوەی بۆ نییه!"""))
    m
  }
}
