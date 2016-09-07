import User from '../models/user_model';
import Conversation from '../models/conversation_model';
import ConversationRef from '../models/conversation_ref_model';
import { tokenForUser } from '../utils';

export const signup = (req, res) => {
  try {
    const user = new User();
    const conversationHead = new Conversation();
    const conversationInitialRef = new ConversationRef();

    if (typeof req.body.email === 'undefined' || typeof req.body.password === 'undefined' ||
      typeof req.body.username === 'undefined') {
      console.log('not all fields present');
      res.json({
        error: 'ERR: Users need \'email\', \'password\', and  \'username\' fields',
      });
    } else {
      user.email = req.body.email;
      user.password = req.body.password;
      user.username = req.body.username;

      if (typeof req.body.bio !== 'undefined') {
        user.bio = req.body.bio;
      }

      conversationInitialRef.userId = user._id;
      conversationInitialRef.convoId = conversationHead._id;

      conversationInitialRef.save()
      .then(convoRef => {
        try {
          conversationHead.users = [user._id, user._id];
          conversationHead.head = true;
          conversationHead.next = [];
          conversationHead.next.push(convoRef._id);
          conversationHead.prev = conversationHead.next;

          conversationHead.save()
          .then(resultConvo => {
            try {
              user.conversations = resultConvo._id;

              user.save()
              .then(result => {
                try {
                  res.json({
                    user: result,
                    token: tokenForUser(result),
                    message: `User created with \'id\' ${result._id}!`,
                  });
                } catch (err) {
                  console.log(`res json error: ${err}`);
                  res.json({ error: `${err}` });
                }
              })
              .catch(error => {
                console.log(`user save error: ${error}`);
                res.json({ error: `${error}` });
              });
            } catch (err) {
              console.log(`general error level 2: ${err}`);
              res.json({ error: `${err}` });
            }
          })
          .catch(error => {
            console.log(`conversation save error: ${error}`);
            res.json({ error: `${error}` });
          });
        } catch (err) {
          res.json({ error: `${err}` });
        }
      })
      .catch(error => {
        res.json({ error: `${error}` });
      });
    }
  } catch (err) {
    console.log(`general error: ${err}`);
    res.json({ error: `${err}` });
  }
};

export const signin = (req, res) => {
  try {
    User.findById(req.user._id)
    .then(user => {
      res.json({
        user,
        message: `User ${user._id}, ${user.username} successfully logged in`,
        token: tokenForUser(req.user),
      });
    })
    .catch(error => {
      console.log(`signing: ${error}`);
      res.json({ error: `${error}` });
    });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const getUserData = (req, res) => {
  try {
    res.json({ message: 'yes' });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};

export const updateUserData = (req, res) => {
  try {
    res.json({ message: 'yes' });
  } catch (err) {
    res.json({ error: `${err}` });
  }
};
