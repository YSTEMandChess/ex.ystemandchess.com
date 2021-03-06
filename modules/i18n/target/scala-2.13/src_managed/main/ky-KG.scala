package lila.i18n

import I18nQuantity._

// format: OFF
private object `ky-KG` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](120)
m.put("playWithAFriend",new Simple("""Дос менен ойноо"""))
m.put("playWithTheMachine",new Simple("""Компьютер менен ойноо"""))
m.put("toInviteSomeoneToPlayGiveThisUrl",new Simple("""Бул шилтеме менен чакыруу"""))
m.put("gameOver",new Simple("""Оюн бутту"""))
m.put("waitingForOpponent",new Simple("""Өнөктөш менен ойноо"""))
m.put("waiting",new Simple("""Күтүүдө"""))
m.put("yourTurn",new Simple("""Сиздин кезегиңиз"""))
m.put("aiNameLevelAiLevel",new Simple("""%1$s басамак %2$s"""))
m.put("level",new Simple("""Басамак"""))
m.put("toggleTheChat",new Simple("""Чатты алмаштыруу"""))
m.put("toggleSound",new Simple("""хъйцукенеъяч.юбьтиимъхзъйцукУке\нду алмаштыруу"""))
m.put("chat",new Simple("""Чат"""))
m.put("resign",new Simple("""Баш тартуу"""))
m.put("checkmate",new Simple("""Мат болуу"""))
m.put("stalemate",new Simple("""Пат"""))
m.put("white",new Simple("""Ак"""))
m.put("black",new Simple("""Кара"""))
m.put("randomColor",new Simple("""Оң келген тарап"""))
m.put("createAGame",new Simple("""Оюн куруу"""))
m.put("whiteIsVictorious",new Simple("""Ак түстөгү оюнчу утту"""))
m.put("blackIsVictorious",new Simple("""Кара түстөгү оюнчу утту"""))
m.put("kingInTheCenter",new Simple("""Хан ортодо"""))
m.put("threeChecks",new Simple("""Үч шах"""))
m.put("raceFinished",new Simple("""Гонка бүдтүү"""))
m.put("variantEnding",new Simple("""Вариант бүтүшү"""))
m.put("newOpponent",new Simple("""Жаңы өнөктөш"""))
m.put("yourOpponentWantsToPlayANewGameWithYou",new Simple("""Сиздин өнөктөшүңүз сиз менен жаңы оюн ойноого чакырат"""))
m.put("joinTheGame",new Simple("""Оюрга кошулуу"""))
m.put("whitePlays",new Simple("""Ак түстөгү оюнчу баштайт"""))
m.put("blackPlays",new Simple("""Кара түстөгү оюнчу баштайт"""))
m.put("opponentLeftChoices",new Simple("""Сиздин өнөктөшүңүз оюндан чыгып кетти, кутунуз же башка оюн тандаңыз"""))
m.put("makeYourOpponentResign",new Simple("""Атаандашка утулуш эсептелинет"""))
m.put("forceResignation",new Simple("""Утушту талап кылуу"""))
m.put("forceDraw",new Simple("""Барабардык сурануу"""))
m.put("talkInChat",new Simple("""Чат менен суйлошүү"""))
m.put("theFirstPersonToComeOnThisUrlWillPlayWithYou",new Simple("""Бул шилтеме менен келген биринчи оюнчу сиз менен ойнойт."""))
m.put("whiteResigned",new Simple("""Ак түстөгү оюнчу утулду"""))
m.put("blackResigned",new Simple("""Кара түстөгү оюнчу утулду"""))
m.put("whiteLeftTheGame",new Simple("""Ак түстөгү оюнчу оюндан чыгып кетти"""))
m.put("blackLeftTheGame",new Simple("""Кара түстөгү оюнчу оюндан чыгып кетти"""))
m.put("shareThisUrlToLetSpectatorsSeeTheGame",new Simple("""Көрүүчүлөр бул оюнду көрүшү үчүн бул шилтемени бөлүшүңүз"""))
m.put("theComputerAnalysisHasFailed",new Simple("""Компьютердик анализ ийгиликсиз аяктады"""))
m.put("viewTheComputerAnalysis",new Simple("""Компьютердик анализди көрүү"""))
m.put("requestAComputerAnalysis",new Simple("""Компьютердик анализ суроо"""))
m.put("computerAnalysis",new Simple("""Компьютердик анализ"""))
m.put("computerAnalysisAvailable",new Simple("""Компьютердик анализ бар"""))
m.put("analysis",new Simple("""Досканы анализдөө"""))
m.put("depthX",new Simple("""Терендик %s"""))
m.put("usingServerAnalysis",new Simple("""Анализдөө сервери колдонулуп жатат"""))
m.put("loadingEngine",new Simple("""Анализ мотору жүктөлүп жатат ..."""))
m.put("cloudAnalysis",new Simple("""Булут талдоосу"""))
m.put("goDeeper",new Simple("""Тереңдет"""))
m.put("showThreat",new Simple("""Вариантты көрсөт"""))
m.put("inLocalBrowser",new Simple("""жергиликтүү браузерде"""))
m.put("toggleLocalEvaluation",new Simple("""Жергиликтүү баалоого которуу"""))
m.put("promoteVariation",new Simple("""Варианттын артыкчылыгын жогорулатуу"""))
m.put("makeMainLine",new Simple("""Бул вариантты негизги кылуу"""))
m.put("deleteFromHere",new Simple("""Бул жактан өчүрүү"""))
m.put("forceVariation",new Simple("""Вариант катары көрсөт"""))
m.put("move",new Simple("""Жүрүш"""))
m.put("variantLoss",new Simple("""Утулуу варианты"""))
m.put("variantWin",new Simple("""Утуу варианты"""))
m.put("insufficientMaterial",new Simple("""Жетишсиз материал"""))
m.put("pawnMove",new Simple("""Пешка жүрүүсү"""))
m.put("capture",new Simple("""Алуу"""))
m.put("close",new Simple("""Жабуу"""))
m.put("winning",new Simple("""Утуп жатат"""))
m.put("losing",new Simple("""Утулуп жатат"""))
m.put("drawn",new Simple("""Тең"""))
m.put("unknown",new Simple("""Белгисиз"""))
m.put("database",new Simple("""Берилиш базасы"""))
m.put("whiteDrawBlack",new Simple("""Актар / Тең / Кара"""))
m.put("averageRatingX",new Simple("""Орточо рейтинг: %s"""))
m.put("recentGames",new Simple("""Жакында бүткөн оюндар"""))
m.put("topGames",new Simple("""Мыкты оюндар"""))
m.put("masterDbExplanation",new Simple("""Эки миллион OTB оюндар %1$sтен + FIDE рейтинги оюнчулары %2$sдан %3$sга чейин"""))
m.put("noGameFound",new Simple("""Оюн табылган жок"""))
m.put("maybeIncludeMoreGamesFromThePreferencesMenu",new Simple("""Балким жөндөөлөрдөн көбүрөөк оюндарды кошоттурсуз?"""))
m.put("openingExplorer",new Simple("""Дебюттар базасы"""))
m.put("xOpeningExplorer",new Simple("""%s дебюттар базасы"""))
m.put("winPreventedBy50MoveRule",new Simple("""50 жүрүш эрежеси негизинде уту болбой жатат"""))
m.put("lossSavedBy50MoveRule",new Simple("""50 жүрүш эрежеси негизинде утулуштан куткарылды"""))
m.put("allSet",new Simple("""Даяр!"""))
m.put("importPgn",new Simple("""PGNге импортто"""))
m.put("delete",new Simple("""Өчүрүү"""))
m.put("deleteThisImportedGame",new Simple("""Импорттолгон оюн өчүрүлсүнбү?"""))
m.put("replayMode",new Simple("""Кайталоодо көрүү"""))
m.put("realtimeReplay",new Simple("""Чыныгы убакытта"""))
m.put("byCPL",new Simple("""Каталар боюнча"""))
m.put("openStudy",new Simple("""Изилдөөнү ач"""))
m.put("enable",new Simple("""Жандыруу"""))
m.put("bestMoveArrow",new Simple("""Эң жакшы жүрүштөрдү стрелка менен көрсөтүү"""))
m.put("evaluationGauge",new Simple("""Баалоо шкаласы"""))
m.put("multipleLines",new Simple("""Варианттардын көптүгү"""))
m.put("cpus",new Simple("""Агымдар"""))
m.put("memory",new Simple("""Эс-тутум"""))
m.put("infiniteAnalysis",new Simple("""Чексиз анализ"""))
m.put("blunders",new Simple("""Одоно ката"""))
m.put("mistakes",new Simple("""Жаңылыштык"""))
m.put("inaccuracies",new Simple("""Так эместик"""))
m.put("draw",new Simple("""Ничья"""))
m.put("currentGames",new Simple("""Азыркы оюндар"""))
m.put("logOut",new Simple("""Чыгыш"""))
m.put("signIn",new Simple("""Кирүү"""))
m.put("signUp",new Simple("""Регистрация"""))
m.put("games",new Simple("""Оюндар"""))
m.put("forum",new Simple("""Форум"""))
m.put("players",new Simple("""Оюнчулар"""))
m.put("variant",new Simple("""Вариант"""))
m.put("variants",new Simple("""Варианттар"""))
m.put("realTime",new Simple("""Убакыт контроль"""))
m.put("oneDay",new Simple("""Бир күнү"""))
m.put("time",new Simple("""Убакыт"""))
m.put("playOfflineComputer",new Simple("""Компьютер"""))
m.put("opponent",new Simple("""Өнөктөш"""))
m.put("community",new Simple("""Коом"""))
m.put("tools",new Simple("""Инструменттер"""))
m.put("playOnline",new Simple("""Онлайн оноо"""))
m.put("playOffline",new Simple("""Оффлайн ойноо"""))
    m
  }
}
