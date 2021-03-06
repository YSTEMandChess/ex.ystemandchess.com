package lila.i18n

import I18nQuantity._

// format: OFF
private object `si-LK` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](139)
m.put("playWithAFriend",new Simple("""මිතුරෙකු හා ක්‍රීඩා කරන්න"""))
m.put("playWithTheMachine",new Simple("""පරිගණකය සමඟ ක්‍රීඩා කරන්න"""))
m.put("toInviteSomeoneToPlayGiveThisUrl",new Simple("""ක්‍රීඩා කිරීමට යමෙකුට ආරාධනා කිරීමට, මෙම URL එක දෙන්න"""))
m.put("gameOver",new Simple("""තරගය අවසන්"""))
m.put("waitingForOpponent",new Simple("""ප්‍රතිවාදියා වෙනුවෙන් බලාසිටිමින්"""))
m.put("waiting",new Simple("""බලාසිටිමින්"""))
m.put("yourTurn",new Simple("""ඔබේ වාරය"""))
m.put("aiNameLevelAiLevel",new Simple("""%1$s %2$sවන මට්ටම"""))
m.put("level",new Simple("""මට්ටම"""))
m.put("toggleTheChat",new Simple("""පිළිසඳර මාරුකරන්න"""))
m.put("toggleSound",new Simple("""ටොගල ශබ්දය"""))
m.put("chat",new Simple("""පිළිසඳර"""))
m.put("resign",new Simple("""ඉවත්වන්න"""))
m.put("checkmate",new Simple("""රජ වටකර ඇත"""))
m.put("stalemate",new Simple("""ජය පැරදුමෙන් තොර"""))
m.put("white",new Simple("""සුදු"""))
m.put("black",new Simple("""කළු"""))
m.put("randomColor",new Simple("""අහඹු පැත්ත"""))
m.put("createAGame",new Simple("""ක්‍රීඩාවක් නිර්මාණය කරන්න"""))
m.put("whiteIsVictorious",new Simple("""සුදු ජයග්‍රාහී වේ"""))
m.put("blackIsVictorious",new Simple("""කළු ජයග්‍රාහී වේ"""))
m.put("kingInTheCenter",new Simple("""රජු කෙන්ද්‍රයේය"""))
m.put("threeChecks",new Simple("""වැටලුම් තුනක්"""))
m.put("raceFinished",new Simple("""තරඟය අවසන්"""))
m.put("variantEnding",new Simple("""විචල්‍ය අවසානය"""))
m.put("newOpponent",new Simple("""නව ප්‍රතිවාදියා"""))
m.put("yourOpponentWantsToPlayANewGameWithYou",new Simple("""ඔබේ ප්‍රතිවාදියාට ඔබ සමඟ නව ක්‍රීඩාවක් කිරීමට අවශ්‍යයි"""))
m.put("joinTheGame",new Simple("""ක්‍රීඩාවට සම්බන්ධ වන්න"""))
m.put("whitePlays",new Simple("""සෙල්ලම් කිරීමට සුදු"""))
m.put("blackPlays",new Simple("""සෙල්ලම් කිරීමට කළු"""))
m.put("opponentLeftChoices",new Simple("""අනෙක් ක්‍රීඩකයා ක්‍රීඩාවෙන් ඉවත් වන්නට ඇත. ඔබට ජයග්‍රහණයට හිමිකම් කීමට, ක්‍රීඩාව දිනුම් ඇදීමක් ලෙස හැඳින්විමට, නැතහොත් රැඳී සිටින්න."""))
m.put("makeYourOpponentResign",new Simple("""ඔබේ විරුද්ධවාදියා ඉල්ලා අස්වීමට"""))
m.put("forceResignation",new Simple("""ජයග්‍රහණය ඉල්ලා සිටින්න"""))
m.put("forceDraw",new Simple("""ඇමතුම් දිනුම් ඇදීම"""))
m.put("talkInChat",new Simple("""කරුණාකර පිළිසඳරෙහි දී හොඳින් හැසිරෙන්න!"""))
m.put("theFirstPersonToComeOnThisUrlWillPlayWithYou",new Simple("""මෙම URL වෙත පැමිණි පළමු පුද්ගලයා ඔබ සමඟ සෙල්ලම් කරනු ඇත."""))
m.put("whiteResigned",new Simple("""සුදු ඉල්ලා අස්"""))
m.put("blackResigned",new Simple("""කළු ඉල්ලා අස්විය"""))
m.put("whiteLeftTheGame",new Simple("""සුදු ක්‍රීඩාවෙන් ඉවත් විය"""))
m.put("blackLeftTheGame",new Simple("""කළු ක්‍රීඩාවෙන් ඉවත් විය"""))
m.put("shareThisUrlToLetSpectatorsSeeTheGame",new Simple("""ප්‍රේක්ෂකයින්ට ක්‍රීඩාව බැලීමට මෙම URL බෙදාගන්න"""))
m.put("theComputerAnalysisHasFailed",new Simple("""පරිගණක විශ්ලේෂණය අසමත් විය"""))
m.put("viewTheComputerAnalysis",new Simple("""පරිගණක විශ්ලේෂණය බලන්න"""))
m.put("requestAComputerAnalysis",new Simple("""පරිගණක විශ්ලේෂණයක් ඉල්ලන්න"""))
m.put("computerAnalysis",new Simple("""පරිගණක විශ්ලේෂණය"""))
m.put("computerAnalysisAvailable",new Simple("""පරිගණක විශ්ලේෂණය ලබා ගත හැකිය"""))
m.put("analysis",new Simple("""විශ්ලේෂණ මණ්ඩලය"""))
m.put("depthX",new Simple("""ගැඹුර %s"""))
m.put("usingServerAnalysis",new Simple("""සර්වර් විශ්ලේෂණය භාවිතා කිරීම"""))
m.put("loadingEngine",new Simple("""එන්ජිම පූරණය වේ ..."""))
m.put("cloudAnalysis",new Simple("""වලාකුළු විශ්ලේෂණය"""))
m.put("goDeeper",new Simple("""ගැඹුරට යන්න"""))
m.put("showThreat",new Simple("""තර්ජනය පෙන්වන්න"""))
m.put("inLocalBrowser",new Simple("""ස්වකීය ගවේශකය තුළ"""))
m.put("toggleLocalEvaluation",new Simple("""ස්වකීය ඇගයුමට මාරුවන්න"""))
m.put("promoteVariation",new Simple("""විචලනය ප්‍රමුඛ කරන්න"""))
m.put("makeMainLine",new Simple("""ප්‍රමුඛ රේඛාව කරන්න"""))
m.put("deleteFromHere",new Simple("""මෙතැන සිට මකන්න"""))
m.put("victoryVsYInZ",new Simple("""%3$s හි %1$s එදිරිව %2$s"""))
m.put("defeatVsYInZ",new Simple("""%3$s හි %1$s එදිරිව %2$s"""))
m.put("drawVsYInZ",new Simple("""%3$s හි %1$s එදිරිව %2$s"""))
m.put("arena:thereIsACountdown",new Simple("""ඔබගේ පළමු පියවර සඳහා ගණන් කිරීමක් තිබේ. මෙම කාලය තුළ පියවරක් ගැනීමට අපොහොසත් වීමෙන් ඔබගේ ප්‍රතිවාදියාට ක්‍රීඩාව අහිමි වනු ඇත."""))
m.put("emails:emailConfirm_subject",new Simple("""ඔබගේ lichess.org ගිණුම තහවුරු කරන්න, %s"""))
m.put("emails:emailConfirm_click",new Simple("""ඔබගේ ලිචෙස් ගිණුම සක්‍රීය කිරීමට සබැඳිය ක්ලික් කරන්න:"""))
m.put("emails:emailConfirm_ignore",new Simple("""ඔබ ලිචෙස් සමඟ ලියාපදිංචි නොවූයේ නම් ඔබට මෙම පණිවිඩය ආරක්ෂිතව නොසලකා හැරිය හැකිය."""))
m.put("emails:passwordReset_subject",new Simple("""ඔබගේ lichess.org මුරපදය නැවත සකසන්න, %s"""))
m.put("emails:passwordReset_intro",new Simple("""ඔබගේ ගිණුමේ මුරපදය නැවත සැකසීමට අපට ඉල්ලීමක් ලැබුණි."""))
m.put("emails:passwordReset_clickOrIgnore",new Simple("""ඔබ මෙම ඉල්ලීම කළේ නම්, පහත සබැඳිය ක්ලික් කරන්න. එසේ නොවේ නම්, ඔබට මෙම විද්‍යුත් තැපෑල නොසලකා හැරිය හැකිය."""))
m.put("emails:emailChange_subject",new Simple("""නව විද්‍යුත් තැපැල් ලිපිනය තහවුරු කරන්න, %s"""))
m.put("emails:emailChange_intro",new Simple("""ඔබගේ විද්‍යුත් තැපැල් ලිපිනය වෙනස් කිරීමට ඔබ ඉල්ලා ඇත."""))
m.put("emails:emailChange_click",new Simple("""ඔබට මෙම විද්‍යුත් තැපැල් ලිපිනයට ප්‍රවේශය ඇති බව තහවුරු කිරීමට, කරුණාකර පහත සබැඳිය ක්ලික් කරන්න:"""))
m.put("emails:welcome_subject",new Simple("""Lichess.org වෙත සාදරයෙන් පිළිගනිමු, %s"""))
m.put("emails:welcome_text",new Escaped("""ඔබ https://lichess.org හි ඔබේ ගිණුම සාර්ථකව නිර්මාණය කර ඇත.

මෙන්න ඔබේ පැතිකඩ පිටුව: %1$s. ඔබට එය %2$s මත පුද්ගලීකරණය කළ හැකිය.

විනෝද වන්න, ඔබේ කොටස් සෑම විටම ඔබේ ප්‍රතිවාදියාගේ රජු වෙතට යා හැකි වේවා!""","""ඔබ https://lichess.org හි ඔබේ ගිණුම සාර්ථකව නිර්මාණය කර ඇත.<br /><br />මෙන්න ඔබේ පැතිකඩ පිටුව: %1$s. ඔබට එය %2$s මත පුද්ගලීකරණය කළ හැකිය.<br /><br />විනෝද වන්න, ඔබේ කොටස් සෑම විටම ඔබේ ප්‍රතිවාදියාගේ රජු වෙතට යා හැකි වේවා!"""))
m.put("emails:common_orPaste",new Simple("""(ක්ලික් කිරීම ක්‍රියා නොකරයි ද? එය ඔබගේ බ්‍රව්සරයට ඇතුල් කර උත්සාහ කරන්න!)"""))
m.put("emails:common_note",new Simple("""මෙය ඔබගේ %s භාවිතය හා සම්බන්ධ සේවා විද්‍යුත් තැපෑලකි."""))
m.put("emails:common_contact",new Simple("""අප හා සම්බන්ධ වීමට, කරුණාකර %s භාවිතා කරන්න."""))
m.put("study:private",new Simple("""පෞද්ගලික"""))
m.put("study:myStudies",new Simple("""මගේ අධ්‍යයන"""))
m.put("study:studiesIContributeTo",new Simple("""මම දායක වන අධ්‍යයන"""))
m.put("study:myPublicStudies",new Simple("""මගේ පොදු අධ්‍යයන"""))
m.put("study:myPrivateStudies",new Simple("""මගේ පෞද්ගලික අධ්‍යයන"""))
m.put("study:myFavoriteStudies",new Simple("""මගේ ප්‍රියතම අධ්‍යයන"""))
m.put("study:whatAreStudies",new Simple("""අධ්‍යයන යනු කුමක්ද?"""))
m.put("study:allStudies",new Simple("""සියලුම අධ්‍යයන"""))
m.put("study:studiesCreatedByX",new Simple("""%s විසින් නිර්මාණය කරන ලද අධ්‍යයන"""))
m.put("study:noneYet",new Simple("""තවම කිසිවක් නැත."""))
m.put("study:hot",new Simple("""උණුසුම්"""))
m.put("study:dateAddedNewest",new Simple("""එකතු කළ දිනය (නවතම)"""))
m.put("study:dateAddedOldest",new Simple("""එකතු කළ දිනය (පැරණිතම)"""))
m.put("study:recentlyUpdated",new Simple("""මෑතකදී යාවත්කාලීන කරන ලදි"""))
m.put("study:mostPopular",new Simple("""වඩාත් ජනප්‍රිය"""))
m.put("study:addNewChapter",new Simple("""නව පරිච්ඡේදයක් එක් කරන්න"""))
m.put("study:nbChapters",new Plurals(new Map.Map2(One,"""%s පරිච්ඡේදය""",Other,"""%s පරිච්ඡේද""")))
m.put("study:nbGames",new Plurals(new Map.Map2(One,"""%s ක්‍රීඩාව""",Other,"""%s ක්‍රීඩා""")))
m.put("study:addMembers",new Simple("""සාමාජිකයින් එකතු කරන්න"""))
m.put("study:nbMembers",new Plurals(new Map.Map2(One,"""%s සාමාජික""",Other,"""%s සාමාජිකයන්""")))
m.put("study:inviteToTheStudy",new Simple("""අධ්‍යයනයට ආරාධනා කරන්න"""))
m.put("study:pleaseOnlyInvitePeopleYouKnow",new Simple("""කරුණාකර ඔබ දන්නා සහ ක්‍රියාකාරීව මෙම අධ්‍යයනයට සම්බන්ධ වීමට කැමති අයට පමණක් ආරාධනා කරන්න."""))
m.put("study:searchByUsername",new Simple("""පරිශීලක නාමයෙන් සොයන්න"""))
m.put("study:spectator",new Simple("""නරඹන්නා"""))
m.put("study:contributor",new Simple("""දායකයා"""))
m.put("study:kick",new Simple("""පයින් ගසනවා"""))
m.put("study:leaveTheStudy",new Simple("""අධ්‍යයනයෙන් ඉවත් වන්න"""))
m.put("study:youAreNowAContributor",new Simple("""ඔබ දැන් දායකයෙක්"""))
m.put("study:youAreNowASpectator",new Simple("""ඔබ දැන් ප්‍රේක්ෂකයෙකි"""))
m.put("study:pgnTags",new Simple("""PGN ටැග්"""))
m.put("study:like",new Simple("""මනාප"""))
m.put("study:newTag",new Simple("""නව ටැගය"""))
m.put("study:commentThisPosition",new Simple("""මෙම ස්ථාවරය ගැන අදහස් දක්වන්න"""))
m.put("study:commentThisMove",new Simple("""මෙම පියවර ගැන අදහස් දක්වන්න"""))
m.put("study:annotateWithGlyphs",new Simple("""ග්ලයිෆස් සමඟ විවරණය කරන්න"""))
m.put("study:theChapterIsTooShortToBeAnalysed",new Simple("""පරිච්ඡේදය විශ්ලේෂණය කිරීමට නොහැකි තරම් කෙටි ය."""))
m.put("study:onlyContributorsCanRequestAnalysis",new Simple("""පරිගණක විශ්ලේෂණයක් ඉල්ලා සිටිය හැක්කේ අධ්‍යයන දායකයින්ට පමණි."""))
m.put("study:getAFullComputerAnalysis",new Simple("""මෙම ප්‍රධාන ගණයේ සම්පූර්ණ පරිගණක සර්වර්-ගැන විශ්ලේෂණය ලබා ගන්න."""))
m.put("study:makeSureTheChapterIsComplete",new Simple("""පරිච්ඡේදය සම්පූර්ණ බවට වග බලා ගන්න. ඔබට විශ්ලේෂණය ඉල්ලා සිටිය හැක්කේ එක් වරක් පමණි."""))
m.put("study:allSyncMembersRemainOnTheSamePosition",new Simple("""සියලුම SYNC සාමාජිකයින් එකම ස්ථානයක රැඳී සිටිති"""))
m.put("study:shareChanges",new Simple("""වෙනස්කම් ප්‍රේක්ෂකයන් සමඟ බෙදාගෙන ඒවා සේවාදායකයේ සුරකින්න"""))
m.put("study:playing",new Simple("""සෙල්ලම් කරමින්"""))
m.put("study:first",new Simple("""පළමුවන"""))
m.put("study:previous",new Simple("""කලින්"""))
m.put("study:next",new Simple("""ඊළඟ"""))
m.put("study:last",new Simple("""අවසන්"""))
m.put("study:shareAndExport",new Escaped("""බෙදාගන්න & අපනයනය""","""බෙදාගන්න &amp; අපනයනය"""))
m.put("study:cloneStudy",new Simple("""ක්ලෝනය"""))
m.put("study:studyPgn",new Simple("""අධ්‍යයන PGN"""))
m.put("study:chapterPgn",new Simple("""පරිච්ඡේදය PGN"""))
m.put("study:everyone",new Simple("""හැමෝම"""))
m.put("study:enableSync",new Simple("""සමමුහුර්තකරණය සක්‍රීය කරන්න"""))
m.put("study:yesKeepEveryoneOnTheSamePosition",new Simple("""ඔව්: සෑම කෙනෙකුම එකම ස්ථානයක තබා ගන්න"""))
m.put("study:noLetPeopleBrowseFreely",new Simple("""නැත: මිනිසුන්ට නිදහසේ සැරිසැරීමට ඉඩ දෙන්න"""))
m.put("study:pinnedStudyComment",new Simple("""ඇමුණූ අධ්‍යයනය ගැන අදහස් දැක්වීම"""))
m.put("study:start",new Simple("""ආරම්භ කරන්න"""))
m.put("study:save",new Simple("""සුරකින්න"""))
m.put("study:clearChat",new Simple("""පිළිසඳර ඉවත් කරන්න"""))
m.put("study:deleteTheStudyChatHistory",new Simple("""අධ්‍යයන කතාබස් ඉතිහාසය මකන්නද? ආපසු යාමක් නැත!"""))
m.put("study:deleteStudy",new Simple("""අධ්‍යයනය මකන්න"""))
m.put("study:deleteTheEntireStudy",new Simple("""සම්පූර්ණ අධ්‍යයනය මකන්නද? ආපසු යාමක් නැත!"""))
m.put("team:nbMembers",new Plurals(new Map.Map2(One,"""%s සාමාජික""",Other,"""%s සාමාජිකයන්""")))
    m
  }
}
