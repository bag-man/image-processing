const sharp = require('sharp');
const fs = require('fs');

sharp.cache(true);
sharp.simd(true);

class ImageProcessor {
    constructor (imageBuffer, imageName) {
        this.MAX_SIZE = 1200;
        this.THUMBNAIL = { width: 60, height: 60 };
        this.images = { original: { buffer: imageBuffer }, thumnail: {}, web: {} };
        this.imageBuffer = imageBuffer;
        this.imageName = imageName;
    }

    findImageMeta () {
        return sharp(this.imageBuffer).metadata().then((meta) => {
            if (meta.width === undefined || meta.height === undefined) {
                throw new TypeError('Image metadata could not be found.');
            } else {
                this.meta = meta;
                this.saveOriginal().then((filename) => {
                    this.images.original.filename = filename;
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

    resizeImage (width, height, prefix) {
        return sharp(this.imageBuffer)
            .resize(width, height)
            .jpeg({ quality: 50 })
            .toFile(this.imageName + '-' + prefix);
    }

    saveOriginal () {
        let filename = this.imageName + '-original';

        return new Promise((resolve, reject) => {
            fs.writeFile(filename, this.imageBuffer, 'buffer', (err) => {
                if (err) { reject(err); }
                resolve(filename);
            });
        });
    }

    getWebImage () {
        return this.findImageMeta().then(() => {
            let { height, width } = this.getWebImageDimensions(this.meta.height, this.meta.width);
            return this.resizeImage(width, height, 'web');
        });
    }

    getThumbnail() {
        return this.resizeImage(this.THUMBNAIL.width, this.THUMBNAIL.height, 'thumb');
    }

    processImage () {
        return Promise.all([ this.getThumbnail(), this.getWebImage() ]).then((images) => {
            this.images = images;
            return { meta: this.meta, images: this.images };
        });
    }
}

module.exports = ImageProcessor;
