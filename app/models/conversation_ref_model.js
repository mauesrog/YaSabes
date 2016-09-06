import mongoose, { Schema } from 'mongoose';

const ConversationRefSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  convoId: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
  },
}, {
  timestamp: true,
}
);

const ConversationRefModel = mongoose.model('ConversationRef', ConversationRefSchema);

export default ConversationRefModel;
