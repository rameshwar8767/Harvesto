import bcrypt from "bcryptjs";

/**
 * Migration 002: Seed Initial Accounts, Addresses, and Catalog
 * Populates default admin/seller, customer, and full multi-category product inventory.
 */
export async function up(db) {
    console.log("  -> Ensuring default seller account exists...");
    const sellerPasswordHash = await bcrypt.hash(process.env.SELLER_PASSWORD || "harvesto_seller_password", 10);
    const sellerEmail = process.env.SELLER_EMAIL || "seller@harvesto.com";

    let seller = await db.collection("users").findOne({ email: sellerEmail });
    if (!seller) {
        const result = await db.collection("users").insertOne({
            name: "Harvesto Farm Hub",
            email: sellerEmail,
            password: sellerPasswordHash,
            role: "seller",
            cartItems: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        seller = { _id: result.insertedId };
        console.log(`     ✔ Created seller account (${sellerEmail})`);
    }

    console.log("  -> Ensuring demo customer account exists...");
    const customerPasswordHash = await bcrypt.hash("customer123", 10);
    const customerEmail = "aarav@harvesto.com";

    let customer = await db.collection("users").findOne({ email: customerEmail });
    if (!customer) {
        const custResult = await db.collection("users").insertOne({
            name: "Aarav Sharma",
            email: customerEmail,
            password: customerPasswordHash,
            role: "user",
            cartItems: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        customer = { _id: custResult.insertedId };
        console.log(`     ✔ Created demo customer account (${customerEmail})`);
    }

    console.log("  -> Ensuring customer default address exists...");
    const addressCount = await db.collection("addresses").countDocuments({ userId: customer._id });
    if (addressCount === 0) {
        await db.collection("addresses").insertOne({
            userId: customer._id,
            firstName: "Aarav",
            lastName: "Sharma",
            email: customerEmail,
            street: "Flat 402, Green Meadows, Sunrise Avenue",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001",
            country: "India",
            phone: "+91 98765 43210",
            isDefault: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log("     ✔ Created customer address");
    }

    console.log("  -> Seeding catalog products...");
    const CATALOG = [
        // Vegetables
        {
            name: "Farm Fresh Potatoes 1kg",
            category: "vegetables",
            price: 40,
            offerPrice: 32,
            image: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80"],
            description: ["Locally harvested organic potatoes", "Rich in dietary fiber and potassium", "Perfect for daily curries and roasting"],
            inStock: true,
            stock: 50,
        },
        {
            name: "Vine Ripened Tomatoes 500g",
            category: "vegetables",
            price: 35,
            offerPrice: 28,
            image: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"],
            description: ["Sweet and juicy greenhouse tomatoes", "High in lycopene and vitamin C", "Hand-sorted for peak firmness"],
            inStock: true,
            stock: 45,
        },
        {
            name: "Crunchy Orange Carrots 500g",
            category: "vegetables",
            price: 45,
            offerPrice: 38,
            image: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"],
            description: ["Crisp farm carrots", "Rich in beta-carotene and vitamin A", "Ideal for salads and healthy snacking"],
            inStock: true,
            stock: 40,
        },
        {
            name: "Fresh Baby Spinach 250g",
            category: "vegetables",
            price: 30,
            offerPrice: 24,
            image: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80"],
            description: ["Tender hydroponic baby spinach leaves", "Triple-washed and ozone sanitized", "Packed with iron and folate"],
            inStock: true,
            stock: 35,
        },

        // Fruits
        {
            name: "Kashmiri Royal Apples 1kg",
            category: "fruits",
            price: 180,
            offerPrice: 149,
            image: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80"],
            description: ["Sweet, aromatic mountain-grown apples", "Naturally crisp and pesticide-free", "Great for fresh juicing and pies"],
            inStock: true,
            stock: 30,
        },
        {
            name: "Robusta Ripe Bananas 6 pcs",
            category: "fruits",
            price: 50,
            offerPrice: 39,
            image: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80"],
            description: ["Naturally ripened without calcium carbide", "Instant energy booster", "Rich source of potassium"],
            inStock: true,
            stock: 25,
        },
        {
            name: "Nagpur Sweet Oranges 1kg",
            category: "fruits",
            price: 90,
            offerPrice: 75,
            image: ["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80"],
            description: ["Juicy citrus bursting with natural sweetness", "High antioxidant vitamin C content", "Hand-selected from Maharashtra orchards"],
            inStock: true,
            stock: 30,
        },

        // Dairy
        {
            name: "Farm Pure Toned Milk 1L",
            category: "dairy",
            price: 66,
            offerPrice: 62,
            image: ["https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80"],
            description: ["Pasteurized and homogenized fresh dairy milk", "3.0% fat, 8.5% SNF", "Cold-chain dispatched within 4 hours of milking"],
            inStock: true,
            stock: 40,
        },
        {
            name: "Artisanal Fresh Paneer 200g",
            category: "dairy",
            price: 95,
            offerPrice: 85,
            image: ["https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"],
            description: ["Soft malai paneer crafted from whole milk", "High in bioavailable protein", "Perfect for paneer tikka and gravies"],
            inStock: true,
            stock: 35,
        },

        // Bakery
        {
            name: "Artisan Whole Wheat Sourdough 400g",
            category: "bakery",
            price: 65,
            offerPrice: 55,
            image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"],
            description: ["Naturally fermented with 24-hour slow proofing", "Zero artificial preservatives or palm oil", "High fiber breakfast essential"],
            inStock: true,
            stock: 20,
        },

        // Drinks
        {
            name: "Cold-Pressed Valencia Orange Juice 300ml",
            category: "drinks",
            price: 99,
            offerPrice: 85,
            image: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=600&q=80"],
            description: ["100% pure juice with pulp", "Zero added sugar or water", "Cold high-pressure processed (HPP)"],
            inStock: true,
            stock: 25,
        },

        // Grains
        {
            name: "Aged Royal Basmati Rice 1kg",
            category: "grains",
            price: 160,
            offerPrice: 139,
            image: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80"],
            description: ["2-year aged extra long grain basmati", "Pearlescent white, fragrant aroma", "Fluffy and non-sticky when cooked"],
            inStock: true,
            stock: 30,
        },

        // Mithai & Sweets
        {
            name: "Silver Leaf Kaju Katli 250g",
            category: "mithai",
            price: 320,
            offerPrice: 289,
            image: ["https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80"],
            description: ["Diamond-cut premium sweet crafted from ground Goan cashews", "Adorned with pure vegetarian silver foil (Vark)", "Traditional Indian festive celebration delicacy"],
            inStock: true,
            stock: 25,
        },
        {
            name: "Royal Desi Ghee Gulab Jamun 500g",
            category: "mithai",
            price: 240,
            offerPrice: 210,
            image: ["https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80"],
            description: ["Melt-in-mouth fried mawa dumplings soaked in cardamom rose syrup", "Fried slowly in 100% pure cow desi ghee", "Served warm for royal dessert experience"],
            inStock: true,
            stock: 20,
        },

        // Cakes & Pastries
        {
            name: "Belgian Chocolate Truffle Cake 500g",
            category: "cakes",
            price: 499,
            offerPrice: 429,
            image: ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"],
            description: ["Rich dark Belgian ganache layered on moist chocolate sponge", "Handcrafted by master artisanal pastry chefs", "Ideal centerpiece for birthdays and special moments"],
            inStock: true,
            stock: 14,
        },

        // Electronics & Gadgets
        {
            name: "Harvesto Pro Wireless Earbuds ANC",
            category: "electronics",
            price: 2499,
            offerPrice: 1699,
            image: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"],
            description: ["Active Noise Cancellation (ANC 32dB) with Environmental Mic", "32-hour extended battery playtime with USB-C quick charge", "IPX5 sweat-proof resistance for fitness"],
            inStock: true,
            stock: 15,
        },
        {
            name: "Harvesto Neo 5G (8GB RAM, 128GB)",
            category: "mobiles",
            price: 14999,
            offerPrice: 12499,
            image: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"],
            description: ["6.67-inch FHD+ 120Hz Super AMOLED Display", "50MP AI Triple Camera with Optical Image Stabilization", "5000mAh battery with 67W Turbo Flash Charging"],
            inStock: true,
            stock: 6,
        },

        // Clothes & Apparel
        {
            name: "100% Organic Cotton Crew T-Shirt",
            category: "clothes",
            price: 699,
            offerPrice: 449,
            image: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"],
            description: ["180 GSM combed organic cotton with super soft bio-wash", "Pre-shrunk fabric retains fit wash after wash", "Breathable, lightweight all-day comfort"],
            inStock: true,
            stock: 30,
        },

        // Daily Essentials
        {
            name: "Ariel Matic Liquid Detergent 1L",
            category: "daily uses",
            price: 240,
            offerPrice: 215,
            image: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80"],
            description: ["Deep stain removal enzyme formula for washing machines", "Dissolves quickly without leaving powdery white residue on clothes", "Fresh floral fragrance that lasts up to 7 days"],
            inStock: true,
            stock: 25,
        },
    ];

    let upsertCount = 0;
    for (const prod of CATALOG) {
        await db.collection("products").updateOne(
            { name: prod.name },
            {
                $setOnInsert: {
                    ...prod,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );
        upsertCount++;
    }
    console.log(`     ✔ Ensured ${upsertCount} catalog items exist.`);
}

export async function down(db) {
    console.log("  -> Rolling back migration 002 (skipping destructive drop of user accounts)...");
}
