const moment = require('moment');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
    first_name: { type: String, required: true, max: 100 },
    family_name: { type: String, required: true, max: 100 },
    date_of_birth: Date,
    date_of_death: Date
});

AuthorSchema
    .virtual('name')
    .get(function () {
        return this.family_name + ', ' + this.first_name;
    });

AuthorSchema
    .virtual('lifespan')
    .get(function () {
        return this.date_of_death ? (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString() : "";
    });

AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });

AuthorSchema
    .virtual('date_of_birth_formatted')
    .get(function () {
        return this.date_of_birth ? moment(this.date_of_birth).format('MMMM Do, YYYY') : '';
    });
    
AuthorSchema
    .virtual('date_of_death_formatted')
    .get(function () {
        return this.date_of_death ? moment(this.date_of_death).format('MMMM Do, YYYY') : '';
    });

AuthorSchema
    .virtual('date_birth')
    .get(function () {
        return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
    });

    
AuthorSchema
    .virtual('date_death')
    .get(function () {
        return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
    });

module.exports = mongoose.model('Author', AuthorSchema);