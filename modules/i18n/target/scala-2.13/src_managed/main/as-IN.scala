package lila.i18n

import I18nQuantity._

// format: OFF
private object `as-IN` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](24)
m.put("playWithAFriend",new Escaped("""বন্ধু'ৰ বিপক্ষে খেলক""","""বন্ধু&#39;ৰ বিপক্ষে খেলক"""))
m.put("playWithTheMachine",new Escaped("""কম্পিউটাৰ'ৰ বিপক্ষে খেলক""","""কম্পিউটাৰ&#39;ৰ বিপক্ষে খেলক"""))
m.put("toInviteSomeoneToPlayGiveThisUrl",new Simple("""অান এজনৰ বিপক্ষে খেলিবলৈ এই URLতু ব্যৱহাৰ কৰক"""))
m.put("gameOver",new Simple("""Khel Sesh"""))
m.put("waitingForOpponent",new Escaped("""বিৰোধী'ৰ অপেক্ষাত""","""বিৰোধী&#39;ৰ অপেক্ষাত"""))
m.put("waiting",new Simple("""অপেক্ষাত"""))
m.put("yourTurn",new Simple("""আপোনাৰ পাল"""))
m.put("white",new Simple("""বগা"""))
m.put("black",new Simple("""ক’লা"""))
m.put("randomColor",new Simple("""যাদৃচ্ছিক দল"""))
m.put("createAGame",new Simple("""নতুন খেল আৰমভ কৰক"""))
m.put("whiteIsVictorious",new Simple("""বগা দল বিজয়ী"""))
m.put("blackIsVictorious",new Simple("""ক’লা দল বিজয়ী"""))
m.put("kingInTheCenter",new Escaped("""ৰজা আহিল মাজ'লৈ""","""ৰজা আহিল মাজ&#39;লৈ"""))
m.put("joinTheGame",new Simple("""খেলখনত ভাগ লোৱা"""))
m.put("whitePlays",new Simple("""বগা দলৰ পাল"""))
m.put("blackPlays",new Simple("""ক’লা দলৰ পাল"""))
m.put("forceResignation",new Simple("""জয় লাভ কৰক"""))
m.put("talkInChat",new Simple("""চেতত ভাল বাবে কথা পাতিব!"""))
m.put("whiteLeftTheGame",new Escaped("""বগা খেলোৱৈয়ে খেলখন এৰি গ'ল""","""বগা খেলোৱৈয়ে খেলখন এৰি গ&#39;ল"""))
m.put("blackLeftTheGame",new Escaped("""ক'লা খেলোৱৈয়ে খেলখন এৰি গ'ল""","""ক&#39;লা খেলোৱৈয়ে খেলখন এৰি গ&#39;ল"""))
m.put("close",new Simple("""বন্ধ"""))
m.put("coordinates:startTraining",new Simple("""প্ৰ‌শিক্ষণ আৰম্ভ"""))
    m
  }
}
