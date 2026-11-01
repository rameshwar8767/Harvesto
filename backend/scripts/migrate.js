import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/greencart";
const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");

// Schema for tracking applied migrations
const migrationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    batch: { type: Number, required: true },
    appliedAt: { type: Date, default: Date.now },
});

const MigrationModel = mongoose.models.Migration || mongoose.model("Migration", migrationSchema, "_migrations");

async function getMigrationFiles() {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
        return [];
    }
    const files = fs.readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith(".js"))
        .sort();
    return files;
}

async function connectDB() {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
    }
}

export async function up() {
    await connectDB();
    console.log("🚀 Starting database migration (up)...");

    const files = await getMigrationFiles();
    const appliedMigrations = await MigrationModel.find().sort({ appliedAt: 1 }).lean();
    const appliedNames = new Set(appliedMigrations.map((m) => m.name));

    const pending = files.filter((f) => !appliedNames.has(f));

    if (pending.length === 0) {
        console.log("✨ Database is already up to date. No pending migrations.");
        return;
    }

    const currentMaxBatch = appliedMigrations.reduce((max, m) => Math.max(max, m.batch || 0), 0);
    const newBatch = currentMaxBatch + 1;

    for (const file of pending) {
        const filePath = path.join(MIGRATIONS_DIR, file);
        console.log(`▶ Applying migration: ${file}`);
        const migrationModule = await import(pathToFileURL(filePath).href);

        if (typeof migrationModule.up !== "function") {
            throw new Error(`Migration ${file} must export an 'up' function`);
        }

        const startTime = Date.now();
        await migrationModule.up(mongoose.connection.db);
        const duration = Date.now() - startTime;

        await MigrationModel.create({
            name: file,
            batch: newBatch,
            appliedAt: new Date(),
        });

        console.log(`✔ Applied: ${file} (${duration}ms)`);
    }

    console.log(`\n🎉 Successfully applied ${pending.length} migration(s) in batch ${newBatch}.`);
}

export async function down() {
    await connectDB();
    console.log("⏪ Starting rollback (down)...");

    const appliedMigrations = await MigrationModel.find().sort({ batch: -1, appliedAt: -1 }).lean();

    if (appliedMigrations.length === 0) {
        console.log("ℹ No migrations to roll back.");
        return;
    }

    const lastBatch = appliedMigrations[0].batch;
    const toRollback = appliedMigrations.filter((m) => m.batch === lastBatch);

    console.log(`Rolling back batch ${lastBatch} (${toRollback.length} migration(s))...`);

    for (const record of toRollback) {
        const filePath = path.join(MIGRATIONS_DIR, record.name);
        console.log(`◀ Reverting migration: ${record.name}`);

        if (fs.existsSync(filePath)) {
            const migrationModule = await import(pathToFileURL(filePath).href);
            if (typeof migrationModule.down === "function") {
                await migrationModule.down(mongoose.connection.db);
            } else {
                console.warn(`⚠ Migration ${record.name} does not export a 'down' function. Skipping revert logic.`);
            }
        } else {
            console.warn(`⚠ Migration file ${record.name} not found on disk.`);
        }

        await MigrationModel.deleteOne({ _id: record._id });
        console.log(`✔ Reverted: ${record.name}`);
    }

    console.log(`\n🎉 Successfully rolled back batch ${lastBatch}.`);
}

export async function status() {
    await connectDB();
    const files = await getMigrationFiles();
    const applied = await MigrationModel.find().sort({ batch: 1, appliedAt: 1 }).lean();
    const appliedMap = new Map(applied.map((m) => [m.name, m]));

    console.log("\n=================== MIGRATION STATUS ===================");
    console.log(`Total migration files found: ${files.length}`);
    console.log("--------------------------------------------------------");
    console.log("Status      | Batch | File Name                         | Applied At");
    console.log("--------------------------------------------------------");

    for (const file of files) {
        const info = appliedMap.get(file);
        if (info) {
            const dateStr = new Date(info.appliedAt).toISOString().replace("T", " ").substring(0, 19);
            console.log(`Applied     |   ${String(info.batch).padStart(3, " ")} | ${file.padEnd(33, " ")} | ${dateStr}`);
        } else {
            console.log(`Pending     |   --- | ${file.padEnd(33, " ")} | ---`);
        }
    }
    console.log("========================================================\n");
}

// CLI Execution handler
const command = process.argv[2] || "up";

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    (async () => {
        try {
            if (command === "up") {
                await up();
            } else if (command === "down") {
                await down();
            } else if (command === "status") {
                await status();
            } else {
                console.error(`❌ Unknown command '${command}'. Use 'up', 'down', or 'status'.`);
                process.exit(1);
            }
            await mongoose.connection.close();
            process.exit(0);
        } catch (err) {
            console.error("❌ Migration error:", err);
            await mongoose.connection.close().catch(() => {});
            process.exit(1);
        }
    })();
}
