package lila.i18n

import I18nQuantity._

// format: OFF
private object `sw-KE` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](86)
m.put("playWithAFriend",new Simple("""cheza na rafiki"""))
m.put("playWithTheMachine",new Simple("""cheza na tarakilishi"""))
m.put("toInviteSomeoneToPlayGiveThisUrl",new Simple("""kumwalika mtu acheze, mpe anwani hii"""))
m.put("gameOver",new Simple("""mchezo kwisha"""))
m.put("waitingForOpponent",new Simple("""ngojea mpinzani"""))
m.put("waiting",new Simple("""ngoja"""))
m.put("yourTurn",new Simple("""nafasi ni yako"""))
m.put("aiNameLevelAiLevel",new Simple("""%1$s kiwango %2$s"""))
m.put("level",new Simple("""kiwango"""))
m.put("toggleTheChat",new Simple("""geuza gumzo"""))
m.put("toggleSound",new Escaped("""Badili Sauti
Bonyeza ndio usikie ama usisikie Sauti. Hiki kitufe kiko katika upande wa kulia wa juu katika kiwambo ( screen). Kama unatumia internet explorer, pengine uwezi kuona""","""Badili Sauti<br />Bonyeza ndio usikie ama usisikie Sauti. Hiki kitufe kiko katika upande wa kulia wa juu katika kiwambo ( screen). Kama unatumia internet explorer, pengine uwezi kuona"""))
m.put("chat",new Simple("""Piga Gumzo"""))
m.put("resign",new Simple("""acha kucheza"""))
m.put("checkmate",new Simple("""Maongezi"""))
m.put("stalemate",new Simple("""Usawa kupitia ukosaji wa mchezo halali"""))
m.put("white",new Simple("""nyeupe"""))
m.put("black",new Simple("""nyeusi"""))
m.put("randomColor",new Simple("""Upande ovyoovyo"""))
m.put("createAGame",new Simple("""unda mchezo"""))
m.put("whiteIsVictorious",new Simple("""nyeupe ameshinda"""))
m.put("blackIsVictorious",new Simple("""nyeusi ameshinda"""))
m.put("kingInTheCenter",new Simple("""Mfalme katika kituo"""))
m.put("threeChecks",new Simple("""Kaguzi tatu"""))
m.put("raceFinished",new Simple("""Mbio imemalizika"""))
m.put("variantEnding",new Simple("""Kumalizia kwa njia tofauti"""))
m.put("newOpponent",new Simple("""mpinzani mwingine"""))
m.put("yourOpponentWantsToPlayANewGameWithYou",new Simple("""mpinzani wako ataka mcheze upya"""))
m.put("joinTheGame",new Simple("""jiunge na mchezo"""))
m.put("whitePlays",new Simple("""nyeupe acheza"""))
m.put("blackPlays",new Simple("""nyeusi acheza"""))
m.put("opponentLeftChoices",new Simple("""mchezaji ameondoka, waweza mlazimisha kujiuzulu ama umngoje"""))
m.put("makeYourOpponentResign",new Simple("""fanya mpinzani wako ajiuzulu"""))
m.put("forceResignation",new Simple("""lazimisha kujiuzulu"""))
m.put("forceDraw",new Simple("""Itikia Usawia"""))
m.put("talkInChat",new Simple("""Kua mpole kwa mawasiliano!"""))
m.put("theFirstPersonToComeOnThisUrlWillPlayWithYou",new Simple("""Mtu wa kwanza ambaye ataituma URL hii, atacheza na wewe."""))
m.put("whiteResigned",new Simple("""Mwenye nyeupe ameshindwa"""))
m.put("blackResigned",new Simple("""Mwenye nyeusi ameshindwa"""))
m.put("whiteLeftTheGame",new Simple("""Mwenye nyeupe aliondoka mchezo huu"""))
m.put("blackLeftTheGame",new Simple("""Mwenye nyeusi aliondoka mchezo huu"""))
m.put("shareThisUrlToLetSpectatorsSeeTheGame",new Simple("""Sambaza URL hii ili watazamaji waweze kuona mchezo"""))
m.put("theComputerAnalysisHasFailed",new Simple("""Uchambuzi wa tarakilishi umeshindwa"""))
m.put("viewTheComputerAnalysis",new Simple("""Angalia uchambuzi wa tarakilishi"""))
m.put("requestAComputerAnalysis",new Simple("""Itisha uchambuzi wa tarakilishi"""))
m.put("computerAnalysis",new Simple("""Uchambuzi wa tarakilishi"""))
m.put("computerAnalysisAvailable",new Simple("""Uchambuzi wa kompyuta zilizopo"""))
m.put("analysis",new Simple("""Bodi ya uchambuzi"""))
m.put("depthX",new Simple("""Kina %s"""))
m.put("usingServerAnalysis",new Simple("""Kutumia uchambuzi wa seva"""))
m.put("loadingEngine",new Simple("""Injini inaanza..."""))
m.put("cloudAnalysis",new Simple("""Uchambuzi wa wingu"""))
m.put("goDeeper",new Simple("""Ongeza kina"""))
m.put("showThreat",new Simple("""Onyesha tishio"""))
m.put("inLocalBrowser",new Simple("""katika tarakilishi yako"""))
m.put("toggleLocalEvaluation",new Simple("""Tumia uchambuzi wa tarakilishi yako"""))
m.put("promoteVariation",new Simple("""Kuza utofauti"""))
m.put("makeMainLine",new Simple("""Fanya mstari kuu"""))
m.put("deleteFromHere",new Simple("""Futa kutoka hapa"""))
m.put("forceVariation",new Simple("""Onyesha kwa lazima"""))
m.put("move",new Simple("""Songa"""))
m.put("insufficientMaterial",new Simple("""Hakuna vipande vya kutosha"""))
m.put("pawnMove",new Simple("""Cheza na Poni"""))
m.put("capture",new Simple("""Kula"""))
m.put("close",new Simple("""Funga"""))
m.put("winning",new Simple("""Inashinda"""))
m.put("losing",new Simple("""Inapoteza"""))
m.put("drawn",new Simple("""Inaisha na usawa"""))
m.put("unknown",new Simple("""Haijulikani"""))
m.put("database",new Simple("""Databesi"""))
m.put("whiteDrawBlack",new Simple("""Nyeupe/Usawa/Nyeusi"""))
m.put("delete",new Simple("""Futa"""))
m.put("realtimeReplay",new Simple("""Moja kwa moja"""))
m.put("rematch",new Simple("""cheza tena"""))
m.put("learn:learnChess",new Simple("""Jifunze kucheza chess"""))
m.put("learn:byPlaying",new Simple("""kwa kucheza!"""))
m.put("learn:progressX",new Simple("""Maendeleo:%s"""))
m.put("learn:resetMyProgress",new Simple("""Futa maendeleo yangu"""))
m.put("learn:youWillLoseAllYourProgress",new Simple("""Utapoteza maendeleo yako yote!"""))
m.put("learn:play",new Simple("""cheza!"""))
m.put("learn:theRook",new Simple("""Kasri"""))
m.put("learn:itMovesInStraightLines",new Simple("""Inasonga kwa mstari sambamba"""))
m.put("learn:theQueen",new Simple("""Malkia"""))
m.put("learn:queenCombinesRookAndBishop",new Simple("""Malkia = kasri + askofu"""))
m.put("learn:theKing",new Simple("""Mfalme"""))
m.put("learn:itMovesForwardOnly",new Simple("""Inasonga mbele peke yake"""))
    m
  }
}
