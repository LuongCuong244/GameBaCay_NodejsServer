const User = require('../models/User');
const Statistical = require('../models/Statistical');

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
                            diamond: user[0].diamond,
                        }
                    });
                } else {
                    res.json({ error: "Lỗi khi lấy dữ liệu!" });
                }
            })
            .catch(error => console.log(error))
    }

    _getStatisticalAndInformation(req, res) {
        if (!req.body) {
            res.json({ error: 'Lỗi khi lấy dữ liệu!' });
            return;
        }
        User.find({ userName: req.body.userName })
            .then((user) => {
                if (user.length === 1) {
                    Statistical.find({ userName: req.body.userName })
                        .then((statistical) => {
                            if (statistical.length === 1) {
                                res.json({
                                    information: {
                                        userName: req.body.userName,
                                        coin: user[0].coin,
                                        avatar: user[0].avatar,
                                        diamond: user[0].diamond,
                                    },
                                    statistical: {
                                        numberOfGamesPlayed: statistical[0].numberOfGamesPlayed,
                                        numberOfGamesWon: statistical[0].numberOfGamesWon,
                                        numberOfGamesDraw: statistical[0].numberOfGamesDraw,
                                        currentWinStreak: statistical[0].currentWinStreak,
                                        longestWinStreak: statistical[0].longestWinStreak,
                                        getTenScore: statistical[0].getTenScore,
                                        getOneScore: statistical[0].getOneScore,
                                    }
                                });
                            } else {
                                res.json({ error: "Lỗi khi lấy dữ liệu!" });
                            }
                        })
                        .catch(error => console.log(error))

                } else {
                    res.json({ error: "Lỗi khi lấy dữ liệu!" });
                }
            })
            .catch(error => console.log(error))
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