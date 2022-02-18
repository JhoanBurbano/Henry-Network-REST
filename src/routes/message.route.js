const router = require("express").Router();
const {newMessage, getMessage} = require('../controllers/message.controller')
//ADD
router.post("/", newMessage);

//GET
router.get("/:conversationId", getMessage);

module.exports = router;