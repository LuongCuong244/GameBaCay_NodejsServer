const User = require('../models/User')

class SiteController {
    _logIn(req, res) {
        if (!req.body) {
            res.json({ error: 'Server không nhận được dữ liệu!' });
            return;
        }
        let userName = req.body.userName;
        User.find({ userName: userName })
            .then((users) => {
                if (users.length > 0) {
                    res.json({ error: 'Tên người dùng đã tồn tại!' });
                    return;
                }
                let newUser = {
                    userName: userName,
                    avatar: 'https://media.viezone.vn/prod/2021/10/25/image_976fcc8867.png',
                    coin: 10000,
                    diamond: 100,
                    connected: true,
                    logInWith: req.body.logInWith,
                }
                User.create(newUser, (error) => {
                    if (error) console.log(error);
                })
                res.json({ user: newUser });
            }).catch((error) => {
                console.log(error.message);
            })
    }
}

module.exports = new SiteController();