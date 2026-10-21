/**
 * Standalone S3 Image Migration Script
 * Run with: node src/scripts/migrate-uploads.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../../');
const envPath = path.join(backendRoot, '.env');

// Simple .env parser to avoid extra dependencies
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const bucket = process.env.AWS_S3_BUCKET || process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_REGION || 'ap-south-1';
const mongoUri = process.env.MONGODB_URI;

console.log('--- AWS S3 Uploads Migration ---');
console.log(`Region: ${region}`);
console.log(`Bucket: ${bucket}`);
console.log(`Access Key: ${accessKeyId ? accessKeyId.slice(0, 6) + '...' : 'NOT SET'}`);

if (!accessKeyId || !secretAccessKey || !bucket) {
  console.error('ERROR: Missing AWS S3 credentials in backend/.env');
  process.exit(1);
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const uploadsDir = path.join(backendRoot, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('No local uploads directory found. Nothing to migrate.');
  process.exit(0);
}

const files = fs.readdirSync(uploadsDir);
const imageFiles = files.filter((f) => {
  const ext = path.extname(f).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
});

console.log(`Found ${imageFiles.length} image file(s) in local uploads directory.`);

const mimeMap = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

async function run() {
  let dbConnected = false;
  if (mongoUri) {
    try {
      console.log('Connecting to MongoDB to update store/rating photo references...');
      await mongoose.connect(mongoUri);
      dbConnected = true;
      console.log('Connected to MongoDB successfully.');
    } catch (err) {
      console.warn('MongoDB connection failed. Files will still be uploaded to S3:', err.message);
    }
  }

  const StoreModel = dbConnected
    ? mongoose.model('Store', new mongoose.Schema({ photos: [String] }, { strict: false }))
    : null;

  const RatingModel = dbConnected
    ? mongoose.model('Rating', new mongoose.Schema({ photos: [String] }, { strict: false }))
    : null;

  let uploadedCount = 0;
  let dbUpdateCount = 0;

  for (const fileName of imageFiles) {
    const filePath = path.join(uploadsDir, fileName);
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const contentType = mimeMap[ext] || 'image/jpeg';
    const s3Key = `shops/${fileName}`;

    console.log(`Uploading ${fileName} (${(fileBuffer.length / 1024).toFixed(1)} KB) to S3...`);

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: contentType,
        }),
      );

      const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;
      console.log(`  -> Uploaded successfully: ${s3Url}`);
      uploadedCount++;

      if (StoreModel) {
        const stores = await StoreModel.find({
          photos: { $elemMatch: { $regex: fileName } },
        });

        for (const s of stores) {
          let updated = false;
          s.photos = s.photos.map((p) => {
            if (p && p.includes(fileName) && !p.startsWith('https://')) {
              updated = true;
              return s3Url;
            }
            return p;
          });
          if (updated) {
            await s.save();
            dbUpdateCount++;
            console.log(`  -> Updated store photo reference in MongoDB for store: ${s._id}`);
          }
        }
      }

      if (RatingModel) {
        const ratings = await RatingModel.find({
          photos: { $elemMatch: { $regex: fileName } },
        });

        for (const r of ratings) {
          let updated = false;
          r.photos = (r.photos || []).map((p) => {
            if (p && p.includes(fileName) && !p.startsWith('https://')) {
              updated = true;
              return s3Url;
            }
            return p;
          });
          if (updated) {
            await r.save();
            dbUpdateCount++;
            console.log(`  -> Updated rating photo reference in MongoDB for rating: ${r._id}`);
          }
        }
      }
    } catch (err) {
      console.error(`  -> Failed to upload ${fileName}:`, err.message);
    }
  }

  if (dbConnected) {
    await mongoose.disconnect();
  }

  console.log('\n=============================================');
  console.log(`Migration Complete:`);
  console.log(`- Files uploaded to S3: ${uploadedCount} / ${imageFiles.length}`);
  console.log(`- Database records updated: ${dbUpdateCount}`);
  console.log('=============================================');
}

run().catch((err) => {
  console.error('Fatal error during migration:', err);
  process.exit(1);
});
