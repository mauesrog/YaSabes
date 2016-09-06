import { Router } from 'express';

// import all controllers
import * as User from './controllers/user_controller';
import * as Conversation from './controllers/conversation_controller';
// import * as Picture from './controllers/picture-controller';

// passport
import { requireSignin, requireAuth } from './services/passport';

// set up router
const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to the ya sabes? api!' });
});

router.route('/signin')
      .post(requireSignin, User.signin);

router.route('/signup')
      .post(User.signup);

router.route('/users/:id')
      .put(requireAuth, User.updateUserData)
      .get(requireAuth, User.getUserData);

router.route('/conversations')
      .get(requireAuth, Conversation.getConversations)
      .put(requireAuth, Conversation.createConversation);

router.route('/conversations/:conversationId')
      .put(requireAuth, Conversation.popConversationToTop);

export default router;
