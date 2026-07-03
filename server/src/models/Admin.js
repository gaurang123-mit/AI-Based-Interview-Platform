const mongoose = require("mongoose")

const AdminSchema = new mongoose.Schema({

    name: {
        type:String
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    role:{
        type:String,
        default:"recruiter"
    },

    password:{
        type: String,
        required:true
    },

    passwordChanged:{
        type: Boolean,
        default:false
    }
})

module.exports = mongoose.model("Admin", AdminSchema);