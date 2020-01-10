const async = require('async');
const Book = require('../models/book');
const Genre = require('../models/genre');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// 显示完整的类型列表
exports.genre_list = (req, res, next) => {
    Genre.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_genres) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('genre_list', { title: 'Genre List', genre_list: list_genres });
        });
};

// 为每位类型显示详细信息的页面
exports.genre_detail = (req, res, next) => {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id })
                .exec(callback);
        }
    },
        function (err, results) {
            if (err) { return next(err); }
            if (results.genre == null) { // No results.
                var err = new Error('Genre not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render
            res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books });
        }
    );
};

// 由 GET 显示创建类型的表单
exports.genre_create_get = (req, res, next) => {
    res.render('genre_form', { title: 'Create Genre' });
};

// 由 POST 处理类型创建操作
exports.genre_create_post = [
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    sanitizeBody('name').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var genre = new Genre({ name: req.body.name });
        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            Genre.findOne({ 'name': req.body.name })
                .exec(function (err, found_genre) {
                    if (err) { return next(err); }
                    if (found_genre) {
                        res.redirect(found_genre.url);
                    } else {
                        genre.save(function (err) {
                            if (err) { return next(err); }
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

// 由 GET 显示删除类型的表单
exports.genre_delete_get = (req, res, next) => {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.params.id }).exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre == null) { // No results.
            res.redirect('/catalog/genres');
        }
        // Successful, so render.
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
    });
};

// 由 POST 处理类型删除操作
exports.genre_delete_post = (req, res, next) => {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.body.genreid).exec(callback)
        },
        genre_books: function (callback) {
            Book.find({ 'genre': req.body.genreid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        if (results.genre_books.length > 0) {
            // Genre has books.
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books });
            return;
        }
        else {
            // Genre has no books.
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if (err) { return next(err); }
                res.redirect('/catalog/genres')
            })
        }
    });
};

// 由 GET 显示更新类型的表单
exports.genre_update_get = (req, res, next) => {
    async.parallel({
        genre: function (callback) {
            Genre.findById(req.params.id).exec(callback);
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.genre == null) {
            var err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        res.render('genre_form', { title: 'Update Genre', genre: results.genre });
    });
};

// 由 POST 处理类型更新操作
exports.genre_update_post = [
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    sanitizeBody('name').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        var genre = new Genre({ name: req.body.name, _id:req.params.id });
        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors.array() });
            return;
        }
        else {
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function(err, thegenre){
                if (err) { return next(err); }
                res.redirect(thegenre.url);
            });              
        }
    }
];