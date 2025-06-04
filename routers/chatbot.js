const { Router } = require('express');
const router = Router();
const { bot_train } = require('../services/bot-train');
const DocumentModel = require('../models/documents');
const { authenticateToken } = require('../helpers/auth');
const { retrieveRelevantChunks } = require('../helpers/vector-db');
const { generateAnswer } = require('../helpers/generate-answer');
const {
    createChatThread,
    deleteChatThread,
    addChatMessage,
    updateChatThreadName,
    getAllThreadsByUser,
    getChatHistoryByThreadId,
} = require('../services/chatbot');
const { getAllDocument } = require('../services/documents');

router.post('/api/train-bot', authenticateToken, async function (req, res) {
    try {
        const userId = req.user.id;
        const text = req.body.text;
        const document = await DocumentModel.create({
            user_id: userId,
            content: text,
        });
        console.log('Create document successfully!');
        const result = await bot_train(document._id);
        return res.status(200).json({ error: false, data: result });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ error: true, msg: `Error: ${error.message}` });
    }
});

router.get('/api/documents', authenticateToken, async function (req, res) {
    try {
        const userId = req.user.id;
        const documents = await getAllDocument(userId);

        return res.status(200).json({ error: false, data: documents });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ error: true, msg: `Error: ${error.message}` });
    }
});

router.post('/api/chat', authenticateToken, async function (req, res) {
    try {
        const userId = req.user.id;
        const { question, threadId } = req.body;
        console.log('Question: ', question);
        console.log('Thread Id: ', threadId);

        await addChatMessage(threadId, 'User', question);
        const relevantChunks = await retrieveRelevantChunks(question);
        console.log('Relevan Chunks: ', relevantChunks);
        const answer = await generateAnswer(question, relevantChunks);
        await addChatMessage(threadId, 'Bot', answer.answer);
        res.json({ error: false, message: answer.answer, sources: answer.sources });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ error: true, msg: `Error: ${error.message}` });
    }
});

router.get('/api/chat-threads', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await getAllThreadsByUser(userId);
        return res.status(200).json({
            error: false,
            data: response,
        });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ error: true, msg: `Error: ${error.message}` });
    }
});

router.get('/api/chat-threads/:chat_thread_id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const chatThreadId = req.params.chat_thread_id;
        const response = await getChatHistoryByThreadId(chatThreadId);
        return res.status(200).json({
            error: false,
            data: response,
        });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ error: true, msg: `Error: ${error.message}` });
    }
});

router.post('/api/chat-threads', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const response = await createChatThread(userId);
        return res.status(200).json({
            error: false,
            data: response,
        });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ error: true, msg: `Error: ${error.message}` });
    }
});

router.post('/api/chat-threads/:threadId', async (req, res) => {
    try {
        const threadId = req.params.threadId;
        const newName = req.body.newName;
        await updateChatThreadName(threadId, newName);
        return res.status(200).json({
            error: false,
            msg: 'Thread name updated successfully',
        });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ error: true, msg: `Error: ${error.message}` });
    }
});

router.delete('/api/chat-threads/:threadId', async (req, res) => {
    try {
        const threadId = req.params.threadId;
        console.log('Thread Id: ', threadId);
        await deleteChatThread(threadId);
        return res.status(200).json({
            error: false,
            msg: 'Thread deleted successfully',
        });
    } catch (error) {
        console.log('Error: ', error);
        return res.status(500).json({ error: true, msg: `Error: ${error.message}` });
    }
});

router.delete('/api/documents/:documentId', async (req, res) => {
    try {
        const documentId = req.params.documentId;

        const result = await DocumentModel.deleteOne({ _id: documentId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                error: true,
                message: 'Không tìm thấy tài liệu để xoá.',
            });
        }

        res.status(200).json({
            error: false,
            message: 'Tài liệu đã được xoá thành công.',
        });
    } catch (error) {
        console.error('Lỗi xoá tài liệu:', error);
        res.status(500).json({
            error: true,
            message: 'Đã xảy ra lỗi khi xoá tài liệu.',
        });
    }
});

module.exports = router;
