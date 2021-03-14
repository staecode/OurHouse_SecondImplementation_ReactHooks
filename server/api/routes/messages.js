express = require('express');
const router = express.Router();
// outside functions
const checkAuth = require('../middleware/check-auth');
const MessagesController = require('../controllers/messages');

// get all room messages
router.get('/:roomId', checkAuth, MessagesController.messages_get_all_in_room);
// add one room message
router.post('/:roomId', checkAuth, MessagesController.messages_add_in_room);
// delete one message
router.delete('/:messageId', checkAuth, MessagesController.messages_remove_one);
// // delete entire room messages (for use in room delete deallocation)
// router.delete('/:roomId', checkAuth, MessagesController.message_clear_room);

module.exports = router;