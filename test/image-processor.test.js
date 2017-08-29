const assert = require('assert');
const fs = require('fs');

const ImageProcessor = require('../ImageProcessor');
const TEST_IMAGE = './large.jpg';

describe('ImageProcessor', () => {
    let imageProcessor;

    beforeEach((done) => {
        fs.readFile(TEST_IMAGE, (err, imageBuffer) => {
            imageProcessor = new ImageProcessor(imageBuffer, 'large.jpg');
            done();
        });
    });

    describe('getWebImageDimensions', () => {
        it('should scale an image with a width or height > 1200 down', () => {
            assert.deepEqual(imageProcessor.getWebImageDimensions(1200, 2400), { width: 1200, height: 600 }, 'Wrong dimensions found');
            assert.deepEqual(imageProcessor.getWebImageDimensions(2400, 1200), { width: 600, height: 1200 }, 'Wrong dimensions found');
        });

        it('should round down scaled values', () => {
            assert.deepEqual(imageProcessor.getWebImageDimensions(1201, 2401), { width: 1200, height: 600 }, 'Wrong dimensions found');
            assert.deepEqual(imageProcessor.getWebImageDimensions(1201, 1201), { width: 1200, height: 1200 }, 'Wrong dimensions found');
        });

        it('should not modify images equal to or smaller than 1200x1200', () => {
            assert.deepEqual(imageProcessor.getWebImageDimensions(1200, 1200), { width: 1200, height: 1200 }, 'Wrong dimensions found');
            assert.deepEqual(imageProcessor.getWebImageDimensions(600, 600), { width: 600, height: 600 }, 'Wrong dimensions found');
        });
    });

    describe('getImageSize', () => {
        it('should get the image size', (done) => {
            imageProcessor.getImageSize().then((size) => {
                assert.deepEqual(size.width, 4962, 'meta data not gathered');
                assert.deepEqual(size.height, 3214, 'meta data not gathered');
                done();
            });
        });
    });

    describe('saveOriginal', () => {
        it('should save the original file', (done) => {
            imageProcessor.saveOriginal().then((data) => {
                assert.equal(data, 'large.jpg-original');
                done();
            });
        });
    });

    describe('getWebImage', () => {
        it('should get the web version of the image', (done) => {
            imageProcessor.getWebImage().then((data) => {
                assert.deepEqual(data, { size: { width: 1200, height: 777 }, type: 'web', name: 'large.jpg-web' }, 'Web image not processed correctly');
                done();
            });
        });
    });

    describe('getThumbnail', () => {
        it('should get the thumbnail version of the image', (done) => {
            imageProcessor.getThumbnail().then((data) => {
                assert.deepEqual(data, { size: { width: 60, height: 60 }, type: 'thumb', name: 'large.jpg-thumb' }, 'Thumbnail image not processed correctly');
                done();
            });
        });
    });

    describe('processImage', () => {
        it('should process a given image, and return object of results', (done) => {
            imageProcessor.processImage().then((data) => {
                assert.deepEqual(data, {
                    original: { name: 'large.jpg-original', size: { width: 4962, height: 3214}, type: 'original' },
                    thumb: { size: { width: 60, height: 60 }, name: 'large.jpg-thumb', type: 'thumb' },
                    web: { size: { width: 1200, height: 777 }, name: 'large.jpg-web', type: 'web' }
                }, 'Incorrect values found');
                done();
            });
        });
    });
});
