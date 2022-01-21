const User = require('../models/User');
const Statistical = require('../models/Statistical');

class SiteController {
    _logIn(req, res) {
        if (!req.body) {
            res.json({ error: 'Server không nhận được dữ liệu!' });
            return;
        }
        let userName = req.body.userName;
        User.find({ userName: userName })
            .then(async (users) => {
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
                await User.create(newUser, (error) => {
                    if (error) console.log(error);
                })
                let newStatistical = {
                    userName: userName,
                    numberOfGamesPlayed: 0,
                    numberOfGamesWon: 0,
                    numberOfGamesDraw: 0,
                    currentWinStreak: 0,
                    longestWinStreak: 0,
                    getTenScore: 0,
                    getOneScore: 0,
                }
                await Statistical.create(newStatistical, (error) => {
                    if (error) console.log(error);
                })
                res.json({ user: newUser });
            })
            .catch((error) => {
                console.log(error.message);
            })
    }

    _getDataForLeaderBoards(req, res) {
        if (!req.body) {
            res.json({ error: 'Server không nhận được dữ liệu!' });
            return;
        }
        User.find({})
            .then((users) => {
                Statistical.find({})
                    .then((statisticals) => {
                        let listUsers = users.map((item) => {
                            return {
                                coin: item.coin,
                                diamond: item.diamond,
                                avatar: item.avatar,
                                userName: item.userName,
                            }
                        })
                        res.json({
                            listUsers: listUsers,
                            listStatistical: statisticals,
                        })
                        return;
                    })
                    .catch((error) => {
                        res.json({ error: 'Lỗi khi lấy dữ liệu từ server!' });
                    })
            })
            .catch((error) => {
                res.json({ error: 'Lỗi khi lấy dữ liệu từ server!' });
            })
    }

}

module.exports = new SiteController();