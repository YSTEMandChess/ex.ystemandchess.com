// @GENERATOR:play-routes-compiler
// @SOURCE:/home/benjaminclark964/lila/conf/routes
// @DATE:Tue Feb 18 20:18:04 MST 2020


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
