const messageModel = require("../models/message.model");
require('dotenv').config()
const jwt = require('jsonwebtoken')

const newMessage = async(req, res, next)=>{
    try {
        const newMessage = new messageModel({...req.body})
        await newMessage.save()
        res.status(200).json(newMessage)
    } catch (error) {
        res.send(error)
    }
}

const getMessage = async(req, res, next)=>{
    try {
        const messages = await messageModel.find({
            conversationId: req.params.conversationId
        })
        res.json(messages)
    } catch (error) {
        res.send(error)
    }
}



module.exports = {
    newMessage,
    getMessage
}