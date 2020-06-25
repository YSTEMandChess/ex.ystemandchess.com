// @GENERATOR:play-routes-compiler
// @SOURCE:/home/owenoertell/Documents/ystem/app.ystemandchess.com/conf/routes
// @DATE:Wed Jun 17 13:43:21 EDT 2020


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
