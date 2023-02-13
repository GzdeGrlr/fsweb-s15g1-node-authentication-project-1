const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

/**
  Kullanıcı oturumlarını desteklemek için `express-session` paketini kullanın!
  Kullanıcıların gizliliğini ihlal etmemek için, kullanıcılar giriş yapana kadar onlara cookie göndermeyin. 
  'saveUninitialized' öğesini false yaparak bunu sağlayabilirsiniz
  ve `req.session` nesnesini, kullanıcı giriş yapana kadar değiştirmeyin.

  Kimlik doğrulaması yapan kullanıcıların sunucuda kalıcı bir oturumu ve istemci tarafında bir cookiesi olmalıdır,
  Cookienin adı "cikolatacips" olmalıdır.

  Oturum ramde tutulabilir (canlı üründe uygun olmaz)
  veya "connect-session-knex" gibi bir oturum deposu kullanabilirsiniz.
 */

const server = express();
const authRouter = require("./auth/auth-router");
const usersRouter = require("./users/users-router");

const session = require("express-session");
const Store = require("connect-session-knex")(session);

server.use(helmet());
server.use(express.json());
server.use(cors());

server.use(
  session({
    name: "cikolatacips",
    secret: "abcdef123456",
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 1000 * 60 * 60,
    },
    saveUninitialized: false,
    resave: false,
    store: new Store({
      knex: require("../data/db-config"),
      tablename: "sessions",
      sidfieldname: "sid",
      createtable: true,
      clearInterval: 1000 * 60 * 60,
      disabledDbCleanup: false,
    }),
  })
);

server.use("/api/users", usersRouter);
server.use("/api/auth", authRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

server.use("*", (req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

server.use((err, req, res, next) => {
  // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  });
});

module.exports = server;
