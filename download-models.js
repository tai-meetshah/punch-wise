const fs = require('fs');
const https = require('https');
const path = require('path');

const CDN_BASE_URL = 'https://justadudewhohacks.github.io/face-api.js/models/';
const MODELS = [
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'ssd_mobilenetv1_model-weights_manifest.json',
    'ssd_mobilenetv1_model-shard1',
];

const modelDir = path.join(__dirname, 'models');
if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir);
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https
            .get(url, response => {
                if (response.statusCode !== 200) {
                    return reject(
                        `Failed to get '${url}' (${response.statusCode})`
                    );
                }
                response.pipe(file);
                file.on('finish', () => {
                    file.close(resolve);
                });
            })
            .on('error', err => {
                fs.unlink(dest, () => reject(err));
            });
    });
}

(async () => {
    console.log('📦 Downloading face-api.js models...');
    for (const filename of MODELS) {
        const url = `${CDN_BASE_URL}${filename}`;
        const dest = path.join(modelDir, filename);
        console.log(`➡️  Downloading ${filename}`);
        try {
            await downloadFile(url, dest);
        } catch (error) {
            console.error(`❌ Error downloading ${filename}: ${error}`);
        }
    }
    console.log('✅ All models downloaded to ./models');
})();
