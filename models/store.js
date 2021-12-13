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
        }
})

module.exports = mongoose.model('Store', storeSchema)