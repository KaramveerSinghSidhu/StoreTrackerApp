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

        
        nac:Number,
        termNac:Number,
        mbb:Number,
        termMbb:Number,
        hup:Number,
        tvm:Number,
        express:Number,
        tvm:Number,
        tvmAttach:Number,
        mc:Number,
        mca:Number,
        mcr:Number,

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
        brand:String,
        retired: Boolean


})

module.exports = mongoose.model('WeeklySales', weeklySalesSchema)