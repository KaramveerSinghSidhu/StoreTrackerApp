const mongoose = require('mongoose')

const dailySalesSchema = new mongoose.Schema({
        date:String,
        year:Number,
        month: String,
        week:Number,
        day: String,
        nac:Number,
        termNac:Number,
        mbb:Number,
        termMbb:Number,
        hup:Number,
        express:Number,
        fdp:Number,
        mc:Number,
        acc:Number,
        bpo:Number,
        user:String,
        totalSubs:Number,
        termSubs:Number,
        ars:Number,
        fdpAttach:Number,
        mcApproved:Number,
        mcReview:Number,
        month:Number,
        userID:String,
        userCommission:Number,
        store:Number,
        area:Number,
        brand:String
})

module.exports = mongoose.model('DailySales', dailySalesSchema)

    