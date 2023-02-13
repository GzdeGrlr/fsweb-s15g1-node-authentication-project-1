const UsersModel = require("../users/users-model");

/*
  Kullanıcının sunucuda kayıtlı bir oturumu yoksa

  durum 401
  {
    "mesaj": "Geçemezsiniz!"
  }
*/
function sinirli(req, res, next) {
  try {
    if (req.session.user) {
      next();
    } else {
      next({
        status: 401,
        message: "Geçemezsiniz!",
      });
    }
  } catch (error) {
    next(error);
  }
}

/*
  req.body de verilen username halihazırda veritabanında varsa

  durum 422
  {
    "mesaj": "Username kullaniliyor"
  }
*/
async function usernameBostami(req, res, next) {
  try {
    const presentUser = await UsersModel.goreBul({
      username: req.body.username,
    }); // user var => array içinde user objesi döner.
    //user yoksa boş array döner. Karşılığı olan bir şey, o yüzden length'e bakmamız lazım

    if (presentUser.length > 0) {
      next({ status: 422, message: "Username kullaniliyor" });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

/*
  req.body de verilen username veritabanında yoksa

  durum 401
  {
    "mesaj": "Geçersiz kriter"
  }
*/
async function usernameVarmi(req, res, next) {
  try {
    const presentUser = await UsersModel.goreBul({
      username: req.body.username,
    }); // user var => array içinde user objesi döner.
    //user yoksa boş array döner. Karşılığı olan bir şey, o yüzden length'e bakmamız lazım

    if (!presentUser.length) {
      next({ status: 401, message: "Geçersiz kriter" });
    } else {
      req.user = presentUser[0];
      next();
    }
  } catch (error) {
    next(error);
  }
}

/*
  req.body de şifre yoksa veya 3 karakterden azsa

  durum 422
  {
    "mesaj": "Şifre 3 karakterden fazla olmalı"
  }
*/
function sifreGecerlimi(req, res, next) {
  try {
    const { password } = req.body;

    if (!password || password.length < 4) {
      next({ status: 422, message: "Şifre 3 karakterden fazla olmalı" });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

// Diğer modüllerde kullanılabilmesi için fonksiyonları "exports" nesnesine eklemeyi unutmayın.

module.exports = {
  sinirli,
  sifreGecerlimi,
  usernameBostami,
  usernameVarmi,
};
