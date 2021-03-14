// at chats resource routes

const express = require('express');
const router = express.Router(); //sub package express ships with that helps us arrive at different endpoints with different http words
// outside functions
const checkAuth = require('../middleware/check-auth');
const RoomsController = require('../controllers/rooms');

// register different routes
// get all rooms
router.get('/', checkAuth, RoomsController.rooms_get_all);
// post to Rooms table, add room id to User that posted
router.post('/', checkAuth, RoomsController.rooms_post_tbl_and_user);
// get specific room information
router.get('/:roomId', checkAuth, RoomsController.rooms_get_one);
// update specific room information
router.patch('/:roomId', checkAuth, RoomsController.rooms_patch_one);
// delete specific room information
router.delete('/:roomId', checkAuth, RoomsController.rooms_delete_one);

module.exports = router;