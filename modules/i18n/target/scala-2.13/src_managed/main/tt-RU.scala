package lila.i18n

import I18nQuantity._

// format: OFF
private object `tt-RU` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](3)
m.put("playWithAFriend",new Simple("""Дус белән уйнарга"""))
m.put("playWithTheMachine",new Simple("""Компьютер белән уйнарга"""))
    m
  }
}
