const sharp = require('sharp');
const fs = require('fs');

sharp.cache(true);
sharp.simd(true);

class ImageProcessor {
    constructor (imageBuffer, name) {
        this.MAX_SIZE = 1200;
        this.THUMBNAIL = { width: 60, height: 60 };
        this.images = {};
        this.buffer = imageBuffer;
        this.name = name;
    }

    findImageMeta () {
        return sharp(this.buffer).metadata().then((meta) => {
            if (meta.width === undefined || meta.height === undefined) {
                throw new TypeError('Image metadata could not be found.');
            } else {
                this.meta = meta;
                this.saveOriginal().then((filename) => {
                    this.images.original = {};
                    this.images.original.format = this.meta.format;
                    this.images.original.width = this.meta.width;
                    this.images.original.height = this.meta.height;
                    this.images.original.size = this.buffer.byteLength;
                    this.images.original.name = filename;
                    this.images.original.type = 'original';
                });
                return meta;
            }
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
        return sharp(this.buffer)
            .resize(width, height)
            .jpeg({ quality: 50 })
            .toFile(this.name + '-' + suffix);
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

    trimImageObject (image, suffix) {
        image.name = this.name + '-' + suffix;
        image.type = suffix;
        delete image.channels;
        delete image.premultiplied;
        return image;
    }

    getWebImage () {
        return this.findImageMeta().then(() => {
            let suffix = 'web';
            let { height, width } = this.getWebImageDimensions(this.meta.height, this.meta.width);
            return this.resizeImage(width, height, 'web').then((image) => {
                return this.trimImageObject(image, suffix);
            });
        });
    }

    getThumbnail() {
        let suffix = 'thumb';
        return this.resizeImage(this.THUMBNAIL.width, this.THUMBNAIL.height, 'thumb').then((image) => {
            return this.trimImageObject(image, suffix);
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
