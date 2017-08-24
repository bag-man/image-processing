const sharp = require('sharp');
const fs = require('fs');

sharp.cache(true);
sharp.simd(true);

class ImageProcessor {
    constructor (imagePath) {
        this.MAX_SIZE = 1200;
        this.THUMBNAIL = { width: 60, height: 60 };
        this.imagePath = imagePath;
        this.images = { original: {}, thumnail: {}, web: {} };
    }

    findImageMeta () {
        return sharp(this.imagePath).metadata().then((meta) => {
            if (meta.width === undefined || meta.height === undefined) {
                throw new TypeError('Image metadata could not be found.');
            } else {
                this.meta = meta;
                this.saveOriginal();
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
        return sharp(this.imagePath)
            .resize(width, height)
            .jpeg({ quality: 50 })
            .toFile(this.imagePath + '-' + prefix);
    }

    saveOriginal () {
        fs.readFile(this.imagePath, (err, imageBuffer) => {
            if (err) throw err;
            let fileName = this.imagePath + '-original';
            fs.writeFile(fileName, imageBuffer, 'binary', () => {
                if (err) throw err;
                this.images.original.name = fileName;
            })
        })
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
