const { chunkTexts } = require('../helpers/chunk-text');
const { embedTexts } = require('../helpers/embed-text');
const { storeEmbeddings } = require('../helpers/vector-db');
const DocumentModel = require('../models/documents');

async function bot_train(documentId) {
    const document = await DocumentModel.findById(documentId);

    if (!document) {
        throw new Error('Không tìm thấy tài liệu');
    }

    if (!document.content || document.content.trim().length === 0) {
        throw new Error('Nội dung tài liệu trống');
    }

    const textChunks = chunkTexts(document.content);

    if (!textChunks || textChunks.length === 0) {
        throw new Error('Không thể chia nhỏ nội dung tài liệu');
    }

    const embeddings = await embedTexts(textChunks);

    if (!embeddings || embeddings.length === 0) {
        throw new Error('Không thể tạo embedding từ nội dung');
    }

    const store = await storeEmbeddings(embeddings, documentId);

    return store;
}

module.exports = {
    bot_train,
};
