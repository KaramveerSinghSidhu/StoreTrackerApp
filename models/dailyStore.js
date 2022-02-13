const mongoose = require('mongoose')

const dailyStoreSchema = new mongoose.Schema({
        date:String,
        year:Number,
        week:Number,
        day: Number,
        totalSubs:Number,
        termSubs:Number,
        acc:Number,
        ars:Number,
        fdp:Number,
        fdpAttach:Number,
        bpo:Number,
        store:Number,
        area:Number,
        brand:String
})

module.exports = mongoose.model('dailyStore', dailyStoreSchema)

    