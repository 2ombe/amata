const mongoose = require('mongoose')

const userSchema = new mongoose.Schema( {
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    isFarmer:{type:Boolean,default:false},
    isCollrctionCenter:{type:Boolean,default:false},
    isSupplier:{type:Boolean,default:false},
    isAdmin:{type:String, default:false},
    isProccessor:{type:Boolean,default:false},
    phone: { type: String, required: true },
    contactPerson:{type:String},
    center:{type:mongoose.Schema.ObjectId,ref:"CollectionCenter"}
  },
  {
    timestamps: true,
  })

const User = mongoose.model("User", userSchema);
module.exports = User;