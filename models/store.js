const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema({
        month:{
            type: Number
        },
        year:{
            type: Number
        },
        storeBPO:{
            type: Number
        },
        store:Number,
        area:Number,
        brand:String
})

module.exports = mongoose.model('Store', storeSchema)