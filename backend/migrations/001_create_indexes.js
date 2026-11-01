/**
 * Migration 001: Create Database Indexes
 * Ensures performance and uniqueness constraints across Users, Products, Orders, and Addresses.
 */
export async function up(db) {
    console.log("  -> Creating indexes on 'users' collection...");
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("users").createIndex({ role: 1 });

    console.log("  -> Creating indexes on 'products' collection...");
    await db.collection("products").createIndex({ category: 1, inStock: 1 });
    await db.collection("products").createIndex({ offerPrice: 1 });
    await db.collection("products").createIndex({ name: "text" });

    console.log("  -> Creating indexes on 'orders' collection...");
    await db.collection("orders").createIndex({ userId: 1, createdAt: -1 });
    await db.collection("orders").createIndex({ status: 1 });

    console.log("  -> Creating indexes on 'addresses' collection...");
    await db.collection("addresses").createIndex({ userId: 1 });
}

export async function down(db) {
    console.log("  -> Dropping indexes on 'products'...");
    try {
        await db.collection("products").dropIndex({ category: 1, inStock: 1 });
        await db.collection("products").dropIndex({ offerPrice: 1 });
    } catch {
        // Ignore if index doesn't exist
    }

    console.log("  -> Dropping indexes on 'orders'...");
    try {
        await db.collection("orders").dropIndex({ userId: 1, createdAt: -1 });
        await db.collection("orders").dropIndex({ status: 1 });
    } catch {
        // Ignore if index doesn't exist
    }
}
