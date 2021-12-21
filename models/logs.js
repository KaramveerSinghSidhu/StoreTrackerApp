const mongoose = require('mongoose')

const logsSchema = new mongoose.Schema({
        date:String,
        timeanddate:Date,
        year:Number,
        month:Number,
        week:Number,
        day: String,

        action:String,

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
        userFor:String,
        userForID:String,
        userID:String,
})

module.exports = mongoose.model('Logs', logsSchema)

    