const TopicModel = require('../models/lms_topic');
const BlockModel = require('../models/lms_block');

async function getBlocksOfTopic(topicID) {
    const topic = await TopicModel.findById(topicID);
    if (!topic) {
        throw new Error('Topic not found');
    }
    const blocks = await BlockModel.find({ topic_id: topicID });
    return blocks;
}

async function addBlock(name, description, video, deadline, topicID) {
    const topic = await TopicModel.findById(topicID);
    if (!topic) {
        throw new Error('Topic created failed');
    }
    const block = new BlockModel({
        name,
        description,
        video,
        deadline,
        topic_id: topicID,
    });
    await block.save();
    return block;
}

async function updatedBlock(name, description, video, deadline, blockID) {
    const block = await BlockModel.findById(blockID);
    if (!block) {
        throw new Error('Topic not found');
    }
    block.name = name;
    block.description = description;
    block.video = video;
    block.deadline = deadline;
    await block.save();
    return block;
}

async function getBlockByID(blockID) {
    const block = await BlockModel.findById(blockID);
    if (!block) {
        throw new Error('Block not found');
    }
    return block;
}

async function deleteBlockById(blockID) {
    const result = await BlockModel.deleteOne({ _id: blockID });
    if (result.deletedCount === 0) {
        throw new Error('Block not found');
    }
    return true;
}

module.exports = {
    getBlocksOfTopic,
    addBlock,
    updatedBlock,
    getBlockByID,
    deleteBlockById,
};
