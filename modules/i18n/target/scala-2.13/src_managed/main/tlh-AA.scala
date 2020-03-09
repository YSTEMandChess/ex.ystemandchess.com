package lila.i18n

import I18nQuantity._

// format: OFF
private object `tlh-AA` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](30)
m.put("playWithAFriend",new Simple("""maqaDchuq"""))
m.put("playWithTheMachine",new Escaped("""maQuj jIH De'wI' je""","""maQuj jIH De&#39;wI&#39; je"""))
m.put("gameOver",new Simple("""Quj bertlham"""))
m.put("waiting",new Simple("""loS"""))
m.put("yourTurn",new Simple("""poHlIj"""))
m.put("level",new Simple("""mIw"""))
m.put("toggleTheChat",new Escaped("""choH QumwI'""","""choH QumwI&#39;"""))
m.put("toggleSound",new Simple("""choH wab"""))
m.put("chat",new Escaped("""QumwI'""","""QumwI&#39;"""))
m.put("resign",new Simple("""jegh"""))
m.put("checkmate",new Simple("""Doghjey"""))
m.put("white",new Escaped("""chIS QujwI'""","""chIS QujwI&#39;"""))
m.put("black",new Escaped("""qIj QujwI'""","""qIj QujwI&#39;"""))
m.put("randomColor",new Simple("""Haw Dop"""))
m.put("createAGame",new Simple("""tagh Quj"""))
m.put("whiteIsVictorious",new Escaped("""Zha riest'n, teskas tal tai-kleon""","""Zha riest&#39;n, teskas tal tai-kleon"""))
m.put("blackIsVictorious",new Escaped("""Zha riest'n, teskas tal tai-kleon""","""Zha riest&#39;n, teskas tal tai-kleon"""))
m.put("kingInTheCenter",new Escaped("""botlh 'el ta'""","""botlh &#39;el ta&#39;"""))
m.put("threeChecks",new Escaped("""wej ta' buQlu'""","""wej ta&#39; buQlu&#39;"""))
m.put("newOpponent",new Escaped("""chu' ghol""","""chu&#39; ghol"""))
m.put("joinTheGame",new Simple("""Quj muv"""))
m.put("computerAnalysis",new Escaped("""De'wI' poj""","""De&#39;wI&#39; poj"""))
m.put("computerAnalysisAvailable",new Escaped("""SaH De'wI' poj""","""SaH De&#39;wI&#39; poj"""))
m.put("analysis",new Escaped("""poj Quj 'echlet""","""poj Quj &#39;echlet"""))
m.put("depthX",new Escaped("""%s Saw'""","""%s Saw&#39;"""))
m.put("blunder",new Simple("""Qagh"""))
m.put("blunders",new Escaped("""Qaghpu'""","""Qaghpu&#39;"""))
m.put("inaccuracy",new Simple("""QaghHom"""))
m.put("inaccuracies",new Escaped("""QaghHompu'""","""QaghHompu&#39;"""))
    m
  }
}
