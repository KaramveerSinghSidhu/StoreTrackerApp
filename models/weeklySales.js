const mongoose = require('mongoose')

const weeklySalesSchema = new mongoose.Schema({
        user:String,
        userID:{
                type:String,
                required:true
        },

        totalSubs: Number,
        termSubs: Number,
        acc: Number,
        ars: Number,
        fdpAttach: Number,
        fdp: Number,

        week:Number,
        year:Number,

        weeklyhours:Number,
        target:Number,
        strech:Number,
        weeklyAchieved:String,
        userCommission:Number,
        weeklyAchieved:String,

        bpo:Number,
        store:Number,
        area:Number,
        brand:String


})

module.exports = mongoose.model('WeeklySales', weeklySalesSchema)