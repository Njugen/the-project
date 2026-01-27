const {
    readdirSync,
    existsSync,
    writeFileSync,
    unlinkSync
} = require('fs');

const { join } = require('path');
const path = process.env['storage.path.images'] || "/usr/src/files/images";
const filename = process.env['images.staticfilename'] || "random-image";

const imageExists = () => {
    if (!existsSync(path)) return false;

    return readdirSync(path).some(f => f.startsWith(`${filename}.`));
};

const saveImageToFileStorage = (imageData) => {
    const { filetype, buffer } = imageData;

    if (existsSync(path)) {
        const files = readdirSync(path).filter(f => f.startsWith(`${filename}.`));
        files.forEach(file => {
            unlinkSync(join(path, file));
        });
    }

    writeFileSync(`${path}/${filename}.${filetype}`, buffer);
};

const getImageFilePath = () => {
    if (!existsSync(path)) return null;

    const file = readdirSync(path).find(item => item.startsWith(`${filename}.`));

    return file ? join(path, file) : null;
};

const getMimeType = (filetype) => {
    const fileTypeLowerCase = filetype.toLowerCase();
    const envKey = `mimes.${fileTypeLowerCase}`;

    return process.env[envKey] || 'application/octet-stream';
};

const getRandomWebImageData = async () => {
    const response = await fetch(process.env['images.datasrc'] || 'https://picsum.photos/1200', { method: 'GET' });
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const format = response.headers.get('Content-Type');

    const formatParts = format?.split('/');
    const filetype = formatParts ? formatParts[1] : 'jpg';

    return {
        buffer,
        filetype
    };
};

const runAnonymousImagePrep = () => {
    (async () => {
        try {
            const imageData = await getRandomWebImageData();
            saveImageToFileStorage(imageData);
        } catch (error) {
            console.error("Error saving image to file storage:", error);
        }
    })();
}

module.exports = {
    imageExists,
    getImageFilePath,
    getMimeType,
    runAnonymousImagePrep
};