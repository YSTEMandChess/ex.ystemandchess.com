// @GENERATOR:play-routes-compiler
// @SOURCE:/home/benjaminclark964/app.ystemandchess.com/conf/routes
// @DATE:Tue Mar 10 14:11:49 MDT 2020


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
