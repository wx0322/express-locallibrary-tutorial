const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Book = require('../models/book');
var async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res, next) {

  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });

};

exports.bookinstance_detail = function (req, res, next) {

  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance == null) { // No results.
        var err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Book:', bookinstance: bookinstance });
    });

};

// 由 GET 显示创建副本的表单
exports.bookinstance_create_get = function (req, res, next) {

  Book.find({}, 'title')
    .exec(function (err, books) {
      if (err) { return next(err); }
      // Successful, so render.
      res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books });
    });

};

// 由 POST 处理副本创建操作
exports.bookinstance_create_post = [

  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  }
];

// 由 GET 显示删除副本的表单
exports.bookinstance_delete_get = (req, res, next) => {
  async.parallel({
    bookinstance: function (callback) {
      BookInstance.findById(req.params.id).exec(callback);
    }
  }, function (err, results) {
    if (err) { return next(err); }
    if (results.bookinstance == null) {
      res.redirect('/catalog/bookinstances');
    }
    res.render('bookinstance_delete', { title: 'Delete BookInstance', bookinstance: results.bookinstance });
  });
};

// 由 POST 处理副本删除操作
exports.bookinstance_delete_post = (req, res) => {
  async.parallel({
    book_instance: function (callback) {
      BookInstance.findById(req.body.bookinstanceid).exec(callback);
    }
  }, function (err, results) {
    if (err) { return next(err); }
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
      if (err) { return next(err); }
      res.redirect('/catalog/bookinstances');
    });
  });
};

// 由 GET 显示更新副本的表单
exports.bookinstance_update_get = (req, res, next) => {
  async.parallel({
    bookinstance: function (callback) {
      BookInstance.findById(req.params.id).exec(callback);
    },
    books: function (callback) {
      Book.find({}, 'title').exec(callback);
    }
  }, function (err, results) {
    if (err) { return next(err); }
    res.render('bookinstance_form', { title: 'Update BookInstance', bookinstance: results.bookinstance, book_list: results.books });
  });
};

// 由 POST 处理副本更新操作
exports.bookinstance_update_post = [

  // Validate fields.
  body('book', 'Book must be specified').isLength({ min: 1 }).trim(),
  body('imprint', 'Imprint must be specified').isLength({ min: 1 }).trim(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').trim().escape(),
  sanitizeBody('imprint').trim().escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    var bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
        _id: req.params.id
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          // Successful, so render.
          res.render('bookinstance_form', { title: 'Update BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(thebookinstance.url);
      });
    }
  }
];