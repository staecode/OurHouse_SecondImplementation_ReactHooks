// at users resource routes

const express = require('express');
const router = express.Router(); // sub package express ships with that helps us arrive at different endpoints with different http words
// outside functions
const checkAuth = require('../middleware/check-auth');
const UsersController = require('../controllers/users');


//register different routes
// get all users
router.get('/', UsersController.users_get_all); 
// sign user in to system, provide token
router.post('/signin', UsersController.users_sign_in);
// add a user to the system
router.post('/signup', UsersController.users_sign_up);
// get one user
router.get('/:userId', checkAuth, UsersController.users_get_one);
// get one user by handle
router.get('/friend/:handle', checkAuth, UsersController.users_get_friend);
// update one user
router.patch('/:userId', checkAuth, UsersController.users_patch_one);
// remove one user
router.delete('/:userId', checkAuth, UsersController.users_delete_one);
// get users list of rooms
router.get('/roomList/:userId', checkAuth, UsersController.users_get_rooms);
// add a room id to a user
router.post('/addRoom/:userId/:roomId', checkAuth, UsersController.users_add_room);


module.exports = router;