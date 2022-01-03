const mongoose = require('mongoose')

const promoSchema = new mongoose.Schema({
        title: String,
        startDate: String,
        endDate: String,
        desc: String,
        type: String,
        plan: String,
        terms: String,
        soccode: String,
        onesourceID: String,
        
        isActive: Boolean,
        BeginDate: Date,
        FinishDate: Date
})

module.exports = mongoose.model('promo', promoSchema)