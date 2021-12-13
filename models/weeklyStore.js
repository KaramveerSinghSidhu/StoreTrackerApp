const mongoose = require('mongoose')

const weeklyStoreSchema = new mongoose.Schema({
        totalSubs: Number,
        termSubs: Number,
        acc: Number,
        ars: Number,
        fdpAttach: Number,
        fdp: Number,

        week:Number,
        year:Number,

        weeklyAchieved:String,
        weeklyhours:Number,
        target:Number,
        strech:Number,
        endOfWeek:String,
})

module.exports = mongoose.model('WeeklyStore', weeklyStoreSchema)