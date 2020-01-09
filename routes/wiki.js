const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('维基主页');
});

router.get(/.*fish$/, (req, res) => {
    res.json('ffff');
});

router.get('/users/:userId/books/:bookId', (req, res) => {
    // 通过 req.params.userId 访问 userId
    // 通过 req.params.bookId 访问 bookId
    res.send(req.params.userId);
});

module.exports = router;