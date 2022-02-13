const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
        name : {
            type:String,
            required: true
        },
        role : {
            type:String,
            required: true
        },
        username : {
            type:String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        area: {
            type: Number
        },
        store: {
            type: Number
        },
        brand: {
            type:String
        }
})

module.exports = mongoose.model('User', userSchema)

