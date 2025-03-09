import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  pncpId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  organization: String,
  status: String,
  region: String,
  modality: String,
  publicationDate: Date,
  openingDate: Date,
  value: Number,
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  watchedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;
