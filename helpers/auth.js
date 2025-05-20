const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.TOKEN_KEY, async (err, user) => {
    if (err) {
      return res.sendStatus(401);
    }
    /*
        if (!await checkSingleSignOnRedis(user.uid, token)) {
            console.log('Account logged on another device ' + user.uid);
            return res.status(403).json({
                error: true,
                msg: "Account logged on another device"
            });
        }*/
    /*let users = await UsersDBI.findOne({'token': token});
        if (!users) {
            return res.sendStatus(401);
        }*/
    req.user = {
      id: user.uid,
    };
    next();
  });
}

module.exports = { authenticateToken };
