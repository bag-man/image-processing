const assert = require('assert');
const ImageProcessor = require('../ImageProcessor');

describe('ImageProcessor', () => {
    let imageProcessor;

    beforeEach((done) => {
        imageProcessor = new ImageProcessor('./large.jpg');
        done();
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

    describe('getImageMeta', () => {
        it('should get the image meta data', () => {
            imageProcessor.findImageMeta().then((meta) => {
                assert.deepEqual(meta.width, 4962, 'meta data not gathered');
                assert.deepEqual(meta.height, 3214, 'meta data not gathered');
            });
        });
    });

    describe('saveOriginal', () => {
        it('should save the original file', (done) => {
            imageProcessor.saveOriginal();
            done();
        });
    });

    describe('getWebImage', () => {
        it('should get the web version of the image', (done) => {
            imageProcessor.getWebImage().then((data) => {
                assert.deepEqual(data, { format: 'jpeg', width: 1200, height: 777, channels: 3, premultiplied: false, size: 126116 }, 'Image not processed correctly');
                done();
            });
        });
    });

    describe('getThumbnail', () => {
        it('should get the thumbnail version of the image', (done) => {
            imageProcessor.getThumbnail().then((data) => {
                assert.deepEqual(data, { format: 'jpeg', width: 60, height: 60, channels: 3, premultiplied: false, size: 1102 }, 'Image not processed correctly');
                done();
            });
        });
    });

    describe('processImage', () => {
        it('should process a given image, and return object of results', (done) => {
            imageProcessor.processImage().then((data) => {
                done();
            });
        });
    });
});
