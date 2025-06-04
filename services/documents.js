const DocumentModel = require('../models/documents');

async function addDocument(content, userId) {
    try {
        const newDoc = await DocumentModel.create({
            user_id: userId,
            content: content,
        });
        return newDoc;
    } catch (error) {
        throw new Error(`Không thể thêm tài liệu: ${error.message}`);
    }
}

async function deleteDocument(documentId, userId) {
    try {
        const deleted = await DocumentModel.destroy({
            where: {
                id: documentId,
                user_id: userId,
            },
        });

        if (deleted === 0) {
            throw new Error('Tài liệu không tồn tại hoặc bạn không có quyền xoá');
        }

        return true;
    } catch (error) {
        throw new Error(`Không thể xoá tài liệu: ${error.message}`);
    }
}

async function getAllDocument(userId) {
    try {
        const documents = await DocumentModel.find({ user_id: userId });

        return documents;
    } catch (error) {
        throw new Error(`Không thể xoá tài liệu: ${error.message}`);
    }
}

module.exports = {
    addDocument,
    deleteDocument,
    getAllDocument,
};
