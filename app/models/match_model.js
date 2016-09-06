import mongoose, { Schema } from 'mongoose';
import { validateArrayLength } from '../utils';

const passthrough = v => {
  return validateArrayLength(v, 3);
};

// create a schema for posts with a field
const MatchSchema = new Schema({
  matchType: {
    type: Number,
    min: 0,
    max: 2,
    get: v => {
      Math.round(v);
    },
    set: v => {
      Math.round(v);
    },
  },
  parties: [{
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: [],
    validate: [passthrough, '{PATH} exceeds the limit of 2'],
  }],
}, {
  timestamp: true,
}
);

const MatchModel = mongoose.model('Match', MatchSchema);

export default MatchModel;
