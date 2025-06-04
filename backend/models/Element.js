const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ElementSchema = new Schema({
  type: { type: String, required: true }, // 'rectangle', 'circle', 'text', 'image'
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: Number,
  height: Number,
  radius: Number,
  color: String,
  fillColor: String,
  borderColor: String,
  borderWidth: Number,
  text: String,
  size: Number,
  font: String,
  src: String,
  url: String
}, { timestamps: true });

ElementSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Element', ElementSchema);