package lila.i18n

import I18nQuantity._

// format: OFF
private object `pi-IN` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](11)
m.put("playWithAFriend",new Simple("""mittena kīḷāhi"""))
m.put("playWithTheMachine",new Simple("""yantena kīḷāhi"""))
m.put("gameOver",new Escaped("""parājito'si""","""parājito&#39;si"""))
m.put("level",new Simple("""Bhūmi"""))
m.put("createAGame",new Simple("""Kīḷam ārabhāhi"""))
m.put("nbGames",new Plurals(new Map.Map2(One,"""%ssa kīḷā""",Other,"""%ssa kīḷā""")))
m.put("games",new Simple("""Kīḷā"""))
m.put("players",new Simple("""Caturangaṃ jūtakā"""))
m.put("usernameOrEmail",new Simple("""Nāmaṃ"""))
m.put("gamesPlayed",new Simple("""Kīḷā kīḷitā"""))
    m
  }
}
