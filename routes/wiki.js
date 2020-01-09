const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('ά����ҳ');
});

router.get(/.*fish$/, (req, res) => {
    res.json('ffff');
});

router.get('/users/:userId/books/:bookId', (req, res) => {
    // ͨ�� req.params.userId ���� userId
    // ͨ�� req.params.bookId ���� bookId
    res.send(req.params.userId);
});

module.exports = router;