const mongoose = require('mongoose')

const weeklyStoreSchema = new mongoose.Schema({
        express: Number,
        nac: Number,
        termNac: Number,
        hup: Number,
        mbb: Number,
        termMbb: Number,
        tvm: Number,
        fdp: Number,
        acc: Number,
        mc: Number,
        mca: Number,
        mcr: Number,
        fdpAttach: Number,
        tvmAttach: Number,
        termSubs: Number,

        week:Number,
        year:Number,

        weeklyAchieved:String,
        weeklyhours:Number,
        target:Number,
        strech:Number,
        endOfWeek:String,
        store:Number,
        area:Number,
        brand:String
})

module.exports = mongoose.model('WeeklyStore', weeklyStoreSchema)