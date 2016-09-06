import mongoose, { Schema } from 'mongoose';
import { validateArrayLength } from '../utils';

const passthrough = v => {
  return validateArrayLength(v, 3);
};

// conversation schema
const ConversationSchema = new Schema({
  users: { type: [Schema.Types.ObjectId], ref: 'User', default: [], validate: [passthrough, '{PATH} exceeds the limit of 2'] },
  messages: { type: [Schema.Types.ObjectId], ref: 'Message', default: [] },
  prev: { type: [Schema.Types.ObjectId], ref: 'ConversationRef', validate: [passthrough, '{PATH} exceeds the limit of 2'] },
  next: { type: [Schema.Types.ObjectId], ref: 'ConversationRef', validate: [passthrough, '{PATH} exceeds the limit of 2'] },
  head: { type: Boolean, default: false },
});

// create model class
const ConversationModel = mongoose.model('Conversation', ConversationSchema);

export default ConversationModel;
