package lila.i18n

import I18nQuantity._

// format: OFF
private object `mr-IN` {

  def load: java.util.HashMap[MessageKey, Translation] = {
    val m = new java.util.HashMap[MessageKey, Translation](306)
m.put("playWithAFriend",new Simple("""एका मित्रा बरोबर खेळा"""))
m.put("playWithTheMachine",new Simple("""संगणका बरोबर खेळा"""))
m.put("toInviteSomeoneToPlayGiveThisUrl",new Simple("""कुणाला आपल्या बरोबर खेळण्याचे निमंत्रित करण्यासाठी हा युआरएल द्या"""))
m.put("gameOver",new Simple("""डाव समाप्त"""))
m.put("waitingForOpponent",new Simple("""विरोधकाच्या चालीसाठी थांबलेले आहे"""))
m.put("waiting",new Simple("""वाट पाहत आहे"""))
m.put("yourTurn",new Simple("""तुमची चाल"""))
m.put("aiNameLevelAiLevel",new Simple("""%1$s, पातळी %2$s"""))
m.put("level",new Simple("""पातळी"""))
m.put("toggleTheChat",new Simple("""गप्पा उघड/बंद करा"""))
m.put("toggleSound",new Simple("""आवाज"""))
m.put("chat",new Simple("""गप्पा"""))
m.put("resign",new Simple("""हार माना"""))
m.put("checkmate",new Simple("""शह देउन मात"""))
m.put("stalemate",new Simple("""अर्धवट मात"""))
m.put("white",new Simple("""पांढरा"""))
m.put("black",new Simple("""काळा"""))
m.put("randomColor",new Simple("""यादृच्छिक बाजू"""))
m.put("createAGame",new Simple("""डाव मांडा"""))
m.put("whiteIsVictorious",new Simple("""पांढरा विजयी ठरला"""))
m.put("blackIsVictorious",new Simple("""काळा विजयी ठरला"""))
m.put("kingInTheCenter",new Simple("""मध्यस्थानी राजा"""))
m.put("threeChecks",new Simple("""तीन शह"""))
m.put("raceFinished",new Simple("""शर्यंत समाप्त"""))
m.put("newOpponent",new Simple("""नवा विरोधक"""))
m.put("yourOpponentWantsToPlayANewGameWithYou",new Simple("""तुमचे विरोधक तुमच्याबरोबर नवा डाव खेळू इच्छितात"""))
m.put("joinTheGame",new Simple("""खेळात दाखल व्हा"""))
m.put("whitePlays",new Simple("""पांढरा खेळतो"""))
m.put("blackPlays",new Simple("""काळा खेळतो"""))
m.put("opponentLeftChoices",new Simple("""दुसर्या खेळाडूने खेळ सोडला आहे. तुम्ही जबरदस्ती त्यांची हार कबूल करू शकतात, नाही तर त्यांची वाट पाहू शकतात."""))
m.put("makeYourOpponentResign",new Simple("""विरोधकांना हार मानायला लावा"""))
m.put("forceResignation",new Simple("""जबरदस्ती हार कबूल करा"""))
m.put("forceDraw",new Simple("""सामना अनिर्णित करण्याची विनंती करा"""))
m.put("talkInChat",new Simple("""गप्पांमध्ये बोला"""))
m.put("theFirstPersonToComeOnThisUrlWillPlayWithYou",new Simple("""या युआरएलवर येणारे पहिले व्यक्ती तुमच्याबरोबर खेळणार."""))
m.put("whiteResigned",new Simple("""पांढर्याने हार मानली"""))
m.put("blackResigned",new Simple("""काळ्याने हार मानली"""))
m.put("whiteLeftTheGame",new Simple("""पांढर्याने खेळ सोडले"""))
m.put("blackLeftTheGame",new Simple("""काळ्याने खेळ सोडले"""))
m.put("shareThisUrlToLetSpectatorsSeeTheGame",new Simple("""प्रेक्षकांना हा खेळ पाहायला देण्यासाठी हा युआरएल वाटावे"""))
m.put("theComputerAnalysisHasFailed",new Simple("""संगणक विश्लेषण अयशस्वी झाले आहे"""))
m.put("viewTheComputerAnalysis",new Simple("""संगणक विश्लेषण पहा"""))
m.put("requestAComputerAnalysis",new Simple("""संगणक विश्लेषणासाठी विनंती करा"""))
m.put("computerAnalysis",new Simple("""संगणकीय विश्लेषण"""))
m.put("computerAnalysisAvailable",new Simple("""संगणक विश्लेषण उपलब्ध"""))
m.put("analysis",new Simple("""विश्लेषण मंच"""))
m.put("depthX",new Simple("""खोली %s"""))
m.put("loadingEngine",new Simple("""इंजिन लोड करीत आहे ..."""))
m.put("goDeeper",new Simple("""गहन जा"""))
m.put("showThreat",new Simple("""धोका दाखवा"""))
m.put("inLocalBrowser",new Simple("""स्थानिक ब्राउझरमध्ये"""))
m.put("deleteFromHere",new Simple("""येथून हटवा"""))
m.put("move",new Simple("""चाल"""))
m.put("insufficientMaterial",new Simple("""अपर्याप्त सामग्री"""))
m.put("pawnMove",new Simple("""प्याद्याच्या चाली"""))
m.put("capture",new Simple("""ताब्यात घेतले"""))
m.put("close",new Simple("""बंद"""))
m.put("winning",new Simple("""जिंकणारा"""))
m.put("losing",new Simple("""तोट्याचा"""))
m.put("unknown",new Simple("""अज्ञात"""))
m.put("database",new Simple("""माहितीसंच"""))
m.put("whiteDrawBlack",new Simple("""पांढरी / तह / काळी"""))
m.put("averageRatingX",new Simple("""सरासरी रेटिंग: %s"""))
m.put("recentGames",new Simple("""अलीकडचे खेळ"""))
m.put("topGames",new Simple("""शीर्ष खेळ"""))
m.put("noGameFound",new Simple("""कोणताही गेम सापडला नाही"""))
m.put("allSet",new Simple("""सर्व तयार!"""))
m.put("importPgn",new Simple("""पीजीएन आयात करा"""))
m.put("delete",new Simple("""काढून टाका"""))
m.put("replayMode",new Simple("""रीप्ले मोड"""))
m.put("realtimeReplay",new Simple("""प्रत्यक्ष वेळी"""))
m.put("openStudy",new Simple("""ओपन स्टडी"""))
m.put("enable",new Simple("""सक्षम करा"""))
m.put("bestMoveArrow",new Simple("""उत्तम चाल बाण"""))
m.put("evaluationGauge",new Simple("""मूल्यांकन गेज"""))
m.put("multipleLines",new Simple("""अनेक रेखा"""))
m.put("infiniteAnalysis",new Simple("""अमर्यादित विश्लेषण"""))
m.put("blunder",new Simple("""घोडचूक"""))
m.put("blunders",new Simple("""घोडचूक"""))
m.put("mistake",new Simple("""चुका"""))
m.put("mistakes",new Simple("""चुका"""))
m.put("inaccuracies",new Simple("""अचूकपणा"""))
m.put("moveTimes",new Simple("""चालीसाठी खर्चिलेला वेळ"""))
m.put("flipBoard",new Simple("""पटाला पलटा"""))
m.put("threefoldRepetition",new Simple("""तीनदा पुनरावृत्ती"""))
m.put("claimADraw",new Simple("""डाव अनिर्णीत राहण्याचा दावा करा"""))
m.put("offerDraw",new Simple("""डाव अनिर्णीत ठेवण्याचा प्रस्ताव पाठवा"""))
m.put("draw",new Simple("""डाव अनिर्णीत राहिला"""))
m.put("nbPlayers",new Plurals(new Map.Map2(One,"""%s खेळाडू जोडुन आहेत""",Other,"""%s खेळाडू जोडुन आहेत""")))
m.put("currentGames",new Simple("""या वेळी खेळले जाणारे डाव"""))
m.put("nbGames",new Plurals(new Map.Map2(One,"""सर्व %s डाव पाहा""",Other,"""सर्व %s डाव पाहा""")))
m.put("nbBookmarks",new Plurals(new Map.Map2(One,"""%s आवडते""",Other,"""%s आवडते""")))
m.put("viewInFullSize",new Simple("""अधिकतम आकारात पाहा"""))
m.put("logOut",new Simple("""बाहेर पडा"""))
m.put("signIn",new Simple("""प्रवेश करा"""))
m.put("youNeedAnAccountToDoThat",new Simple("""त्यासाठी तुम्हाला खातं लागेल"""))
m.put("signUp",new Simple("""सदस्य खाते तयार करा"""))
m.put("games",new Simple("""खेळ"""))
m.put("forum",new Simple("""चर्चामंडळ"""))
m.put("latestForumPosts",new Simple("""ताज्या  प्रतिक्रिया"""))
m.put("players",new Simple("""बुद्धिबळ खेळाडू"""))
m.put("minutesPerSide",new Simple("""दर बाजूचे मिनिट"""))
m.put("variant",new Simple("""प्रकार"""))
m.put("variants",new Simple("""प्रकार"""))
m.put("timeControl",new Simple("""वेळाचे नियंत्रण"""))
m.put("realTime",new Simple("""जलद"""))
m.put("correspondence",new Simple("""दीर्घकालीन"""))
m.put("oneDay",new Simple("""एक दिवस"""))
m.put("nbDays",new Plurals(new Map.Map2(One,"""%s  दिवस""",Other,"""%s  दिवस""")))
m.put("nbHours",new Plurals(new Map.Map2(One,"""%s तास""",Other,"""%s तास""")))
m.put("time",new Simple("""vel"""))
m.put("rating",new Simple("""गुणांकन"""))
m.put("username",new Simple("""वापरकर्त्याचे नाव"""))
m.put("usernameOrEmail",new Simple("""वापरकर्त्याचे नाव किंवा पत्ता"""))
m.put("password",new Simple("""परवलीचा शब्द"""))
m.put("changePassword",new Simple("""परवलीचा शब्द बदला"""))
m.put("changeEmail",new Simple("""ई-मेल बदला"""))
m.put("email",new Simple("""ई-मेल"""))
m.put("passwordReset",new Simple("""पासवर्ड रिसेट"""))
m.put("forgotPassword",new Simple("""परवलीचा शब्द विसरलात?"""))
m.put("rank",new Simple("""मानांकन"""))
m.put("gamesPlayed",new Simple("""खेळलेले डाव"""))
m.put("nbGamesWithYou",new Plurals(new Map.Map2(One,"""%s  तुमच्याशी खेळलेले डाव""",Other,"""%s  तुमच्याशी खेळलेले डाव""")))
m.put("cancel",new Simple("""रद्द करा"""))
m.put("timeOut",new Simple("""वेळ समाप्त"""))
m.put("drawOfferSent",new Simple("""डाव अनिर्णीत ठेवण्याचा प्रस्ताव पाठवला"""))
m.put("drawOfferDeclined",new Simple("""डाव अनिर्णीत ठेवण्याचा प्रस्ताव नाकारला"""))
m.put("drawOfferAccepted",new Simple("""डाव अनिर्णीत ठेवण्याचा प्रस्ताव स्वीकारला"""))
m.put("drawOfferCanceled",new Simple("""डाव अनिर्णीत ठेवण्याचा प्रस्ताव रद्द केला गेला"""))
m.put("whiteOffersDraw",new Simple("""पांढऱ्याने सामना अनिर्णित करण्याची तयारी  दर्शवली"""))
m.put("blackOffersDraw",new Simple("""काळ्याने अनिर्णित करण्याची तयारी  दर्शवली"""))
m.put("whiteDeclinesDraw",new Simple("""पांढऱ्यास सामना अनिर्णित करण्याची विनंती नाकबुल"""))
m.put("blackDeclinesDraw",new Simple("""काळ्यास सामना अनिर्णित करण्याची विनंती नाकबुल"""))
m.put("yourOpponentOffersADraw",new Simple("""तुमच्या विरोधकाने डाव अनिर्णीत ठेवण्याचा प्रस्ताव पाठवला आहे"""))
m.put("accept",new Simple("""स्वीकारा"""))
m.put("decline",new Simple("""नाकारा"""))
m.put("playingRightNow",new Simple("""या वेळी खेळत"""))
m.put("finished",new Simple("""संपली"""))
m.put("abortGame",new Simple("""डाव बंद करा"""))
m.put("gameAborted",new Simple("""डाव बंद केला गेला"""))
m.put("standard",new Simple("""मानक"""))
m.put("unlimited",new Simple("""अमर्याद"""))
m.put("mode",new Simple("""पध्दती"""))
m.put("casual",new Simple("""नैमित्तिक"""))
m.put("rated",new Simple("""दर्जा दिला"""))
m.put("casualTournament",new Simple("""उद्‍देशरहित"""))
m.put("ratedTournament",new Simple("""रेट केलेले"""))
m.put("thisGameIsRated",new Simple("""या डावाचा दर्जा"""))
m.put("rematch",new Simple("""पुनः खेळा"""))
m.put("rematchOfferSent",new Simple("""पुनः खेळण्याचा प्रस्ताव पाठवला"""))
m.put("rematchOfferAccepted",new Simple("""पुनः खेळण्याचा प्रस्ताव स्वीकारला"""))
m.put("rematchOfferCanceled",new Simple("""पुनः खेळण्याचा प्रस्ताव रद्द"""))
m.put("rematchOfferDeclined",new Simple("""पुनः खेळण्याची विनंती अमान्य"""))
m.put("cancelRematchOffer",new Simple("""पुनः खेळण्याची विनंती रद्द करा"""))
m.put("viewRematch",new Simple("""पुनः खेळ पहा"""))
m.put("play",new Simple("""खेळा"""))
m.put("inbox",new Simple("""इनबॉक्स"""))
m.put("chatRoom",new Simple("""गप्पांची खोली"""))
m.put("youHaveBeenTimedOut",new Simple("""आपण कालबाह्य झाले आहे."""))
m.put("spectatorRoom",new Simple("""Drook kholli"""))
m.put("composeMessage",new Simple("""संदेश लिहा"""))
m.put("noNewMessages",new Simple("""Naveen sandesh nahit"""))
m.put("subject",new Simple("""विषय"""))
m.put("recipient",new Simple("""प्राप्तकर्ता"""))
m.put("send",new Simple("""पाठवा"""))
m.put("incrementInSeconds",new Simple("""सेकंदांमध्ये वाढ"""))
m.put("freeOnlineChess",new Simple("""विनामूल्य ऑनलाइन बुद्धिबळ"""))
m.put("spectators",new Simple("""प्रेक्षक"""))
m.put("nbWins",new Plurals(new Map.Map2(One,"""%s विजय""",Other,"""%s विजय""")))
m.put("nbLosses",new Plurals(new Map.Map2(One,"""%s पराभव""",Other,"""%s पराभव""")))
m.put("nbDraws",new Plurals(new Map.Map2(One,"""%s अनिर्णीत""",Other,"""%s अनिर्णीत""")))
m.put("exportGames",new Simple("""खेळ निर्यात करा"""))
m.put("ratingRange",new Simple("""इलो श्रेणी"""))
m.put("giveNbSeconds",new Plurals(new Map.Map2(One,"""%s सेकंद द्या""",Other,"""%s सेकंद द्या""")))
m.put("thisPlayerUsesChessComputerAssistance",new Simple("""हा खेळाडू संगणकाची मदत घेतो."""))
m.put("takeback",new Simple("""परत घ्या"""))
m.put("proposeATakeback",new Simple("""Mage ghenyas vinanti"""))
m.put("takebackPropositionSent",new Simple("""Mage ghenyas vinanti pohochli"""))
m.put("takebackPropositionDeclined",new Simple("""Mage ghenyas vinanti aamanya"""))
m.put("takebackPropositionAccepted",new Simple("""Mage ghenyas vinanti manya"""))
m.put("takebackPropositionCanceled",new Simple("""Mage ghenyas vinanti radda"""))
m.put("yourOpponentProposesATakeback",new Simple("""Mitrachi mage ghenyas vinanti"""))
m.put("bookmarkThisGame",new Simple("""Khelala bookamrk kara"""))
m.put("tournament",new Simple("""स्पर्धा"""))
m.put("tournaments",new Simple("""स्पर्धा"""))
m.put("tournamentPoints",new Simple("""स्पधेतील अंक"""))
m.put("viewTournament",new Simple("""स्पर्धा पाहा"""))
m.put("backToTournament",new Simple("""स्पर्धेत परत या"""))
m.put("thematic",new Simple("""विषयगत"""))
m.put("backToGame",new Simple("""खेळात परत या"""))
m.put("averageElo",new Simple("""सरासरी गुण"""))
m.put("location",new Simple("""स्थळ"""))
m.put("filterGames",new Simple("""चाळलेले खेळ"""))
m.put("reset",new Simple("""पहिल्यासारखे करा"""))
m.put("apply",new Simple("""लागू करा"""))
m.put("leaderboard",new Simple("""आघाडीचे खेळाडू"""))
m.put("pasteTheFenStringHere",new Simple("""FEN टेक्स्ट येथे पेस्ट करा"""))
m.put("pasteThePgnStringHere",new Simple("""PGN टेक्स्ट येथे पेस्ट करा"""))
m.put("fromPosition",new Simple("""या जागे पासून चालू करा"""))
m.put("continueFromHere",new Simple("""येथून खेळायला सुरवात करा"""))
m.put("importGame",new Simple("""खेळ मागवा"""))
m.put("thisIsAChessCaptcha",new Simple("""हा बुद्धिबळाचा CAPTCHA आहे"""))
m.put("clickOnTheBoardToMakeYourMove",new Simple("""तुम्ही मनुष्य आहात हे सिद्धा करण्यासाठी पटावर क्लिक करून आपली चाल खेळा"""))
m.put("notACheckmate",new Simple("""ही शहमात नाही"""))
m.put("retry",new Simple("""परत प्रयत्न करा"""))
m.put("reconnecting",new Simple("""पुन्हा जोडणी करत आहोत"""))
m.put("noFriendsOnline",new Simple("""कुठलेच मित्र उपस्थित नाही"""))
m.put("findFriends",new Simple("""मित्र शोधा"""))
m.put("favoriteOpponents",new Simple("""आवडणारे प्रतिस्पर्धी"""))
m.put("more",new Simple("""आणखी"""))
m.put("memberSince",new Simple("""या काळा पासून सदस्य आहेत"""))
m.put("player",new Simple("""खेळाडू"""))
m.put("list",new Simple("""यादी"""))
m.put("graph",new Simple("""आलेख"""))
m.put("required",new Simple("""गरजेचे आहे"""))
m.put("openTournaments",new Simple("""खुली स्पर्धा"""))
m.put("duration",new Simple("""कालावधी"""))
m.put("winner",new Simple("""विजेता"""))
m.put("createANewTournament",new Simple("""नवीन स्पर्धा तयार  करा"""))
m.put("join",new Simple("""सामील व्हा"""))
m.put("withdraw",new Simple("""मागे घ्या"""))
m.put("points",new Simple("""गुण"""))
m.put("wins",new Simple("""एकूण  विजय"""))
m.put("losses",new Simple("""एकूण  पराभव"""))
m.put("winStreak",new Simple("""सलग विजय"""))
m.put("youArePlaying",new Simple("""आपण खेळत आहात!"""))
m.put("performance",new Simple("""कामगिरी"""))
m.put("viewMoreTournaments",new Simple("""अजून स्पर्धा पहा"""))
m.put("averageOpponent",new Simple("""प्रतिस्पर्धी सरासरी"""))
m.put("membersOnly",new Simple("""फक्त सदस्यांसाठी"""))
m.put("boardEditor",new Simple("""पट संपादक (Board editor)"""))
m.put("setTheBoard",new Simple("""पट मांडा"""))
m.put("popularOpenings",new Simple("""लोकप्रिय प्रारंभिक चाली"""))
m.put("startPosition",new Simple("""सुरवातीची स्थिती"""))
m.put("clearBoard",new Simple("""पट रिकामा करा"""))
m.put("savePosition",new Simple("""स्थिती संग्रहीत करा (Save position)"""))
m.put("isPrivate",new Simple("""खाजगी"""))
m.put("reportXToModerators",new Simple("""सरपरिक्षकाकडे (moderator) %s तक्रार करा"""))
m.put("profile",new Simple("""प्रोफाइल"""))
m.put("lastName",new Simple("""आडनाव"""))
m.put("biography",new Simple("""चरित्र"""))
m.put("country",new Simple("""देश"""))
m.put("watchLichessTV",new Simple("""Lichess दूरदर्शन पाहा"""))
m.put("previouslyOnLichessTV",new Simple("""यापूर्वी लिचेस चित्रफलकावर"""))
m.put("onlinePlayers",new Simple("""उपलब्ध खेळाडू"""))
m.put("activeToday",new Simple("""आज सक्रिय"""))
m.put("activePlayers",new Simple("""सक्रिय बुद्धिबळपटू"""))
m.put("clickToSolve",new Simple("""सोडवण्यासाठी क्लिक करा"""))
m.put("goodMove",new Simple("""चांगली चाल"""))
m.put("butYouCanDoBetter",new Simple("""पण आपण चांगले करू शकता."""))
m.put("bestMove",new Simple("""उत्तम चाल!"""))
m.put("puzzleFailed",new Simple("""कोड्याचे उत्तर चुकीचे आहे"""))
m.put("success",new Simple("""यशस्वी"""))
m.put("thankYou",new Simple("""आभारी आहे"""))
m.put("puzzles",new Simple("""कोडी"""))
m.put("name",new Simple("""नाव"""))
m.put("description",new Simple("""माहिती"""))
m.put("no",new Simple("""नाही"""))
m.put("yes",new Simple("""हो"""))
m.put("help",new Simple("""मदत"""))
m.put("createANewTopic",new Simple("""नवीन विषय तयार करा"""))
m.put("topics",new Simple("""विषय"""))
m.put("posts",new Simple("""लेख"""))
m.put("lastPost",new Simple("""मागील लेख"""))
m.put("replies",new Simple("""प्रतिक्रिया"""))
m.put("replyToThisTopic",new Simple("""या विषयावरील प्रतिक्रिया"""))
m.put("reply",new Simple("""प्रतिक्रिया"""))
m.put("message",new Simple("""संदेश"""))
m.put("createTheTopic",new Simple("""विषय बनवा"""))
m.put("reportAUser",new Simple("""या वापरकर्त्या विषयी तक्रार नोंदवा"""))
m.put("user",new Simple("""वापरकर्ता"""))
m.put("reason",new Simple("""कारण"""))
m.put("whatIsIheMatter",new Simple("""काय समस्या आहे"""))
m.put("cheat",new Simple("""फसवणूक"""))
m.put("insult",new Simple("""अपमान"""))
m.put("troll",new Simple("""थट्टा"""))
m.put("other",new Simple("""इतर"""))
m.put("thisTopicIsNowClosed",new Simple("""हा विषय आता संपला आहे."""))
m.put("victory",new Simple("""शाब्बास रे! पठ्ठ्या!!!"""))
m.put("noInternetConnection",new Simple("""आंतरजालाशी संपर्क  नाही. तरीदेखील तुम्ही offline खेळू शकता"""))
m.put("playOnTheBoardOffline",new Simple("""त्या समयी सुचलेली चाल"""))
m.put("playOfflineComputer",new Simple("""संगणक"""))
m.put("opponent",new Simple("""प्रतिस्पर्धी"""))
m.put("community",new Simple("""समुदाय"""))
m.put("tools",new Simple("""साधने"""))
m.put("increment",new Simple("""वाढ"""))
m.put("mobileApp",new Simple("""भ्रमणध्वनी App"""))
m.put("settings:settings",new Simple("""सेटिंग्ज"""))
m.put("preferences:preferences",new Simple("""प्राधान्ये"""))
m.put("preferences:giveMoreTime",new Simple("""अजून वेळ द्या"""))
m.put("team:teams",new Simple("""संघ"""))
m.put("team:nbMembers",new Plurals(new Map.Map2(One,"""%s सदस्य""",Other,"""%s सदस्य""")))
m.put("team:allTeams",new Simple("""सर्व संघ"""))
m.put("team:newTeam",new Simple("""नवीन संघ"""))
m.put("team:myTeams",new Simple("""माझे  संघ"""))
m.put("team:noTeamFound",new Simple("""कुठलाच संघ सापडला नाही"""))
m.put("team:joinTeam",new Simple("""संघात सहभागी व्हा"""))
m.put("team:quitTeam",new Simple("""संघातून बाहेर पडा"""))
m.put("team:anyoneCanJoin",new Simple("""सर्वांसाठी मोफत"""))
m.put("team:joiningPolicy",new Simple("""सहभागी होण्याचे नियम"""))
m.put("team:teamLeader",new Simple("""कर्णधार"""))
m.put("team:teamBestPlayers",new Simple("""सर्वोत्कृष्ट खेळाडूंची यादी"""))
m.put("team:teamRecentMembers",new Simple("""अलीकडचे सदस्य"""))
m.put("search:search",new Simple("""Shodha"""))
m.put("search:advancedSearch",new Simple("""प्रगत शोध"""))
    m
  }
}
