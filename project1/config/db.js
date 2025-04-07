const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gfsBucket;

mongoose.connection.once('open', () => {
    gfsBucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'uploads'
    });
    console.log('GridFS bucket initialized');
});

const getGFSBucket = () => {
    if (!gfsBucket) {
        throw new Error('GridFS bucket not initialized yet.');
    }
    return gfsBucket;
};

module.exports = getGFSBucket;
