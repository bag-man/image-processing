const gm = require('gm'); // depends on graphicsmagick (gm) which appears to be installed on our servers already
const fs = require('fs');

class ImageProcessor {
    constructor (imageBuffer, name) {
        this.MAX_SIZE = 1200;
        this.THUMBNAIL = { width: 60, height: 60 };
        this.images = {};
        this.buffer = imageBuffer;
        this.name = name;
    }

    getImageSize () {
        return new Promise((resolve, reject) => {
            gm(this.buffer).size((err, size) => {
                if (err) { reject(err); }
                if (size.width === undefined || size.height === undefined || err) {
                    reject('Image metadata could not be found.', err);
                } else {
                    this.saveOriginal().then((filename) => {
                        this.images.original = {};
                        this.images.original.size = size;
                        this.images.original.name = filename;
                        this.images.original.type = 'original';
                        resolve(size);
                    });
                }
            });
        });
    }

    getWebImageDimensions (height, width) {
        let largest = height > width ? height : width;

        if (largest > this.MAX_SIZE) {
            let scale = largest / this.MAX_SIZE;
            height = Math.floor(height / scale);
            width = Math.floor(width / scale);
        }

        return { height, width };
    }

    resizeImage (width, height, suffix) {
        return new Promise((resolve, reject) => {
            gm(this.buffer)
                .resize(width, height, '!') // This might need sorting
                .write(this.name + '-' + suffix, (err, data) => {
                    if (err) { reject(err); }
                    resolve(data);
                });
        });
    }

    saveOriginal () {
        let filename = this.name + '-original';

        return new Promise((resolve, reject) => {
            fs.writeFile(filename, this.buffer, 'buffer', (err) => {
                if (err) { reject(err); }
                resolve(filename);
            });
        });
    }

    createImageObject (size, suffix) {
        return { type: suffix, size, name: this.name + '-' + suffix };
    }

    getWebImage () {
        return this.getImageSize().then((size) => {
            let suffix = 'web';
            size = this.getWebImageDimensions(size.height, size.width);
            return this.resizeImage(size.width, size.height, 'web').then(() => {
                return this.createImageObject(size, suffix);
            });
        });
    }

    getThumbnail() {
        let suffix = 'thumb';
        return this.resizeImage(this.THUMBNAIL.width, this.THUMBNAIL.height, 'thumb').then(() => {
            return this.createImageObject(this.THUMBNAIL, suffix);
        });
    }

    processImage () {
        return Promise.all([ this.getThumbnail(), this.getWebImage() ]).then((images) => {
            images.forEach((image) => {
                this.images[image.type] = image;
            });
            return this.images;
        });
    }
}

module.exports = ImageProcessor;

// fs.readFile('./large.jpg', (err, imageBuffer) => {
//     let imageProcessor = new ImageProcessor(imageBuffer, 'large.jpg');

//     imageProcessor.processImage().then((images) => {
//         console.log(images);
//     });
// });
