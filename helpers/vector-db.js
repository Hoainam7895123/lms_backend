const { Pinecone } = require('@pinecone-database/pinecone');

const { embedTexts } = require('./embed-text');

const DB_INDEX = 'learn-smart-pinecone';

const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});

async function storeEmbeddings(embeddings, documentId) {
    const index = pc.index(DB_INDEX);
    const namespace = `user`;

    for (let i = 0; i < embeddings.length; i++) {
        await index.namespace(namespace).upsert([
            {
                id: `${documentId}-chunk-${i}`,
                values: embeddings[i].embedding,
                metadata: {
                    chunk: embeddings[i].chunk,
                    chunkIndex: i,
                },
            },
        ]);
    }
}

const createIndex = async () => {
    await pc.createIndex({
        name: DB_INDEX,

        dimension: 3072,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1',
            },
        },
    });

    console.log('Index created', DB_INDEX);
};

async function checkIndexExists() {
    const index = pc.Index(DB_INDEX);
    try {
        const stats = await index.describeIndexStats();
        return stats;
    } catch (error) {
        if (error.statusCode === 404) {
            return null;
        }
        throw error;
    }
}

// Get info about the index
const describeIndexStats = async () => {
    try {
        const index = pc.Index(DB_INDEX);

        const stats = await index.describeIndexStats();

        return stats;
    } catch (error) {
        console.error('❌ Error while describing index stats:', error.message);
        return null;
    }
};

async function retrieveRelevantChunks(query) {
    const namespace = `user`;
    const embeddingDataArr = await embedTexts([query]);
    const index = pc.index(DB_INDEX);

    const queryOptions = {
        vector: embeddingDataArr[0].embedding,
        topK: 5,
        includeValues: true,
        includeMetadata: true,
    };

    const result = await index.namespace(namespace).query(queryOptions);

    console.log('Result: ', result.matches);

    return result.matches.map(match => ({ id: match.id, text: match.metadata.chunk }));
}

module.exports = {
    storeEmbeddings,
    createIndex,
    checkIndexExists,
    describeIndexStats,
    retrieveRelevantChunks,
};
