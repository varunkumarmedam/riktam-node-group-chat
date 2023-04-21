module.exports = class Middleware {
  static isLogged(req, res, next) {
    if (req.session.user_id) next();
    else res.status(401).send({ message: "user not logged in" });
  }

  static isAdmin(req, res, next) {
    const is_admin = req.session.is_admin;
    if (is_admin) next();
    else res.status(401).send("You are not admin buddy");
  }
};
