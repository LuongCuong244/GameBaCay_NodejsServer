const User = require('../models/User')

class UserController {
    _getPublicInformation(req, res) {
        if (!req.body) {
            res.json({ error: 'Lỗi khi lấy dữ liệu!' });
            return;
        }
        User.find({ userName: req.body.userName })
            .then((user) => {
                if (user.length === 1) {
                    res.json({
                        information: {
                            userName: req.body.userName,
                            coin: user[0].coin,
                            avatar: user[0].avatar,
                        }
                    });
                } else{
                    res.json({error: "Lỗi khi lấy dữ liệu!"});
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    _userConnected(req, res) {
        if (!req.body) {
            res.json({ error: 'Lỗi khi lấy dữ liệu!' });
            return;
        }
        res.json({
            status: 'Successfully',
        }); 
    }
}

module.exports = new UserController();