const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CanvasSchema = new Schema({
  width: { type: Number, default: 800 },
  height: { type: Number, default: 600 },
  backgroundColor: { type: String, default: '#FFFFFF' },
  elements: [{ type: Schema.Types.ObjectId, ref: 'Element' }]
}, { timestamps: true });

CanvasSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
  }
});

module.exports = mongoose.model('Canvas', CanvasSchema);