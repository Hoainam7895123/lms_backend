const { OpenAIEmbeddings } = require('@langchain/openai');

async function embedTexts(textChunks) {
    console.log(`🔹 Embedding ${textChunks.length} chunks using embedDocuments...`);

    const embedder = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY, // Đừng hardcode key
        model: 'text-embedding-3-large',
    });

    try {
        const embeddings = await embedder.embedDocuments(textChunks);

        const embeddingsDataArr = embeddings.map((embedding, index) => ({
            embedding,
            chunk: textChunks[index],
        }));

        console.log('✅ Complete Embedding.');
        return embeddingsDataArr;
    } catch (error) {
        console.error(`❌ Error during batch embedding:`, error.message);
        return [];
    }
}

module.exports = { embedTexts };
