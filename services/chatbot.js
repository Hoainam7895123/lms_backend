const ChatThreadModel = require('../models/chat_thread');
const ChatHistoryModel = require('../models/chat_history');

async function createChatThread(userId, name = 'Cuộc trò chuyện mới') {
    try {
        const thread = await ChatThreadModel.create({
            user_id: userId,
            name,
        });
        return thread;
    } catch (error) {
        throw new Error('Không thể tạo cuộc trò chuyện: ' + error.message);
    }
}

async function deleteChatThread(threadId) {
    try {
        const thread = await ChatThreadModel.findOneAndDelete({
            _id: threadId,
        });

        if (!thread) {
            throw new Error('Không tìm thấy cuộc trò chuyện hoặc không có quyền xóa.');
        }

        // Xoá toàn bộ lịch sử liên quan
        await ChatHistoryModel.deleteMany({ thread_id: threadId });

        return { success: true };
    } catch (error) {
        throw new Error('Xoá thất bại: ' + error.message);
    }
}

async function updateChatThreadName(threadId, newName) {
    try {
        const thread = await ChatThreadModel.findOneAndUpdate(
            { _id: threadId },
            { name: newName },
            { new: true }
        );

        if (!thread) {
            throw new Error('Không tìm thấy hoặc không có quyền cập nhật.');
        }

        return thread;
    } catch (error) {
        throw new Error('Cập nhật thất bại: ' + error.message);
    }
}

async function addChatMessage(threadId, sender, content) {
    try {
        const message = await ChatHistoryModel.create({
            thread_id: threadId,
            sender,
            content,
        });

        return message;
    } catch (error) {
        throw new Error('Không thể thêm tin nhắn: ' + error.message);
    }
}

async function getAllThreadsByUser(userId) {
    try {
        const threads = await ChatThreadModel.find({ user_id: userId }).sort({ created_at: -1 });
        return threads;
    } catch (error) {
        throw new Error('Không thể lấy danh sách thread: ' + error.message);
    }
}

async function getChatHistoryByThreadId(threadId) {
    try {
        const messages = await ChatHistoryModel.find({ thread_id: threadId }).sort({
            created_at: 1,
        });
        return messages;
    } catch (error) {
        throw new Error('Không thể lấy lịch sử chat: ' + error.message);
    }
}

module.exports = {
    createChatThread,
    deleteChatThread,
    addChatMessage,
    updateChatThreadName,
    getAllThreadsByUser,
    getChatHistoryByThreadId,
};
