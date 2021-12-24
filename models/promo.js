const mongoose = require('mongoose')

const promoSchema = new mongoose.Schema({
        Title: String,
        StartDate: String,
        EndDate: String,
        PromoDesc: String,
        PromoFor: String,
        PromoTerm: String,
        PromoSocCode: String,
        OneSourceID: String,
        Eligibility: String,
        isActive: Boolean,
        BeginDate: Date,
        FinishDate: Date
})

module.exports = mongoose.model('promo', promoSchema)