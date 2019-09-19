var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage')
const db = require('../../module/pool');

router.post('/', async (req, res) => {
    const selectIdQuery = 'SELECT * FROM user WHERE email = ?'
    const selectIdResult = await db.queryParam_Parse(selectIdQuery, req.body.email);
    const signupQuery = 'INSERT INTO user (email, nickname, password, salt, pickPlaceCount, reviewCount, editCourseCount) VALUES (?, ?, ?, ?, ?, ?, ?)';

    console.log(selectIdResult);
    if (selectIdResult[0] == null) {
        console.log("일치 없음");
        const buf = await crypto.randomBytes(64);
        const salt = buf.toString('base64');
        const hashedPw = await crypto.pbkdf2(req.body.password.toString(), salt, 1000, 32, 'SHA512');
        const signupResult = await db.queryParam_Arr(signupQuery, [req.body.email, req.body.nickname, hashedPw.toString('base64'), salt, 0, 0, 0]);
        console.log(signupResult);
        if (!signupResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.SIGNUP_FAIL));
        } else { //쿼리문이 성공했을 때
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SIGNUP_SUCCESS));
        }
    } else {// 이미존재
        console.log("이미 존재");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DUPLICATED_ID_FAIL));
    }

});

module.exports = router;