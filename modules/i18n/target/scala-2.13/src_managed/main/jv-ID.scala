package lila.i18n

import I18nQuantity._

// format: OFF
private object `jv-ID` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](42)
m.put("playWithAFriend",new Simple("""dulanan karo konco"""))
m.put("playWithTheMachine",new Simple("""dulanan karo mesin"""))
m.put("toInviteSomeoneToPlayGiveThisUrl",new Escaped("""nggo ngundang konco ben maen bareng, ke'i URL iki""","""nggo ngundang konco ben maen bareng, ke&#39;i URL iki"""))
m.put("gameOver",new Simple("""kowe kalah"""))
m.put("waitingForOpponent",new Simple("""ngenteni kanca kanca"""))
m.put("waiting",new Simple("""enteni dilit"""))
m.put("yourTurn",new Simple("""giliran kowe"""))
m.put("aiNameLevelAiLevel",new Simple("""%1$s kelas %2$s"""))
m.put("level",new Simple("""tingkatan"""))
m.put("toggleTheChat",new Simple("""alihke obrolan"""))
m.put("toggleSound",new Simple("""alihke suara"""))
m.put("chat",new Simple("""obrolan"""))
m.put("resign",new Simple("""kabur"""))
m.put("checkmate",new Simple("""sekakmat"""))
m.put("stalemate",new Simple("""seri"""))
m.put("white",new Simple("""putih"""))
m.put("black",new Simple("""ireng"""))
m.put("randomColor",new Simple("""acak warna"""))
m.put("createAGame",new Simple("""nggawe game"""))
m.put("whiteIsVictorious",new Simple("""putih seng menang"""))
m.put("blackIsVictorious",new Simple("""ireng seng menang"""))
m.put("newOpponent",new Simple("""pemain anyar"""))
m.put("yourOpponentWantsToPlayANewGameWithYou",new Simple("""pemain lawanmu pengen dulanan karo kowe meneh"""))
m.put("joinTheGame",new Simple("""gabung dulanan"""))
m.put("whitePlays",new Simple("""putih mulai"""))
m.put("blackPlays",new Simple("""ireng mulai"""))
m.put("opponentLeftChoices",new Simple("""lawanmu lagi ninggalke dulanan. kowe meksa ngundurke diri opo ditunggu"""))
m.put("makeYourOpponentResign",new Simple("""gawe pemain lawanmu ngundurke diri"""))
m.put("forceResignation",new Simple("""peksa menyerah"""))
m.put("forceDraw",new Simple("""pekso seri"""))
m.put("talkInChat",new Simple("""wicara ing obrolan"""))
m.put("theFirstPersonToComeOnThisUrlWillPlayWithYou",new Simple("""wong pertomo sing teko seko alamat URL pengen dulanan karo kowe"""))
m.put("whiteResigned",new Simple("""putih ngalah"""))
m.put("blackResigned",new Simple("""ireng ngalah"""))
m.put("whiteLeftTheGame",new Simple("""putih kabur seko dulanan"""))
m.put("blackLeftTheGame",new Simple("""ireng kabur seko dulanan"""))
m.put("shareThisUrlToLetSpectatorsSeeTheGame",new Simple("""sebarke alamat URL iki kanggo wong sing pengen ndelok dulanan"""))
m.put("viewTheComputerAnalysis",new Simple("""Ndelok analisa tekan komputer"""))
m.put("computerAnalysis",new Simple("""AnalisaKomputer"""))
m.put("fromPosition",new Simple("""seka posisi"""))
m.put("continueFromHere",new Simple("""lanjut seka kene"""))
    m
  }
}
