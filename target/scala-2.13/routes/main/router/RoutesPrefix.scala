// @GENERATOR:play-routes-compiler
// @SOURCE:/home/benjamin/app.ystemandchess.com/conf/routes
// @DATE:Tue Apr 07 17:22:43 MDT 2020


package router {
  object RoutesPrefix {
    private var _prefix: String = "/"
    def setPrefix(p: String): Unit = {
      _prefix = p
    }
    def prefix: String = _prefix
    val byNamePrefix: Function0[String] = { () => prefix }
  }
}
