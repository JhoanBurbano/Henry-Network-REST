const { Schema, model } = require('mongoose');

const Report= new Schema({
    idreported: String,
    idreporter: String,
    reporttype: String,
    message: String,
    state: {
        type:Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = model('report', Report);