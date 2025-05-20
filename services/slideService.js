const BlockModel = require('../models/lms_block');
const SlideModel = require('../models/slides');

async function getSlidesOfBlock(blockID) {
    const block = await BlockModel.findById(blockID);
    if (!block) {
        throw new Error('Block not found');
    }
    const slides = await SlideModel.find({ block_id: blockID });
    return slides;
}

async function addSlide(title, description, file, blockID) {
    const block = await BlockModel.findById(blockID);
    if (!block) {
        throw new Error('Topic created failed');
    }
    const slide = new SlideModel({
        title,
        description,
        file,
        block_id: blockID,
    });
    await slide.save();
    return slide;
}

async function updatedSlide(title, description, file, slideID) {
    const slide = await SlideModel.findById(slideID);
    if (!slide) {
        throw new Error('Slide not found');
    }
    slide.title = title;
    slide.description = description;
    slide.file = file;
    await slide.save();
    return slide;
}

async function getSlideByID(slideID) {
    const slide = await SlideModel.findById(slideID);
    if (!slide) {
        throw new Error('Slide not found');
    }
    return slide;
}

async function deleteSlideById(slideID) {
    const result = await SlideModel.deleteOne({ _id: slideID });
    if (result.deletedCount === 0) {
        throw new Error('Slide not found');
    }
    return true;
}

module.exports = {
    getSlidesOfBlock,
    addSlide,
    updatedSlide,
    getSlideByID,
    deleteSlideById,
};
