const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const TaskSchema = new mongoose.Schema({
content: {
type: String,
required: true
},
cicon: {
type: String
},
parent:{
  type: Schema.Types.ObjectId,
},
chaild_count:{
  type:Number,
  default:0
},
weight:{
  type:Number,
  default:100
},
date: {
type: Date,
default: Date.now
}
})
module.exports = mongoose.model('Task',TaskSchema);
