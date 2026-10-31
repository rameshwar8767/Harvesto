import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Address from "../models/address.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/greencart";

const SAMPLE_PRODUCTS = [
    // Vegetables
    {
        name: "Farm Fresh Potatoes 1kg",
        category: "vegetables",
        price: 40,
        offerPrice: 32,
        image: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80"],
        description: ["Locally harvested organic potatoes", "Rich in dietary fiber and potassium", "Perfect for daily curries and roasting"],
        inStock: true,
    },
    {
        name: "Vine Ripened Tomatoes 500g",
        category: "vegetables",
        price: 35,
        offerPrice: 28,
        image: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80"],
        description: ["Sweet and juicy greenhouse tomatoes", "High in lycopene and vitamin C", "Hand-sorted for peak firmness"],
        inStock: true,
    },
    {
        name: "Crunchy Orange Carrots 500g",
        category: "vegetables",
        price: 45,
        offerPrice: 38,
        image: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80"],
        description: ["Crisp farm carrots", "Rich in beta-carotene and vitamin A", "Ideal for salads and healthy snacking"],
        inStock: true,
    },
    {
        name: "Fresh Baby Spinach 250g",
        category: "vegetables",
        price: 30,
        offerPrice: 24,
        image: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80"],
        description: ["Tender hydroponic baby spinach leaves", "Triple-washed and ozone sanitized", "Packed with iron and folate"],
        inStock: true,
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
    },
    {
        name: "Robusta Ripe Bananas 6 pcs",
        category: "fruits",
        price: 50,
        offerPrice: 39,
        image: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80"],
        description: ["Naturally ripened without calcium carbide", "Instant energy booster", "Rich source of potassium"],
        inStock: true,
    },
    {
        name: "Nagpur Sweet Oranges 1kg",
        category: "fruits",
        price: 90,
        offerPrice: 75,
        image: ["https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80"],
        description: ["Juicy citrus bursting with natural sweetness", "High antioxidant vitamin C content", "Hand-selected from Maharashtra orchards"],
        inStock: true,
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
    },
    {
        name: "Artisanal Fresh Paneer 200g",
        category: "dairy",
        price: 95,
        offerPrice: 85,
        image: ["https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"],
        description: ["Soft malai paneer crafted from whole milk", "High in bioavailable protein", "Perfect for paneer tikka and gravies"],
        inStock: true,
    },
    {
        name: "Natural Cheddar Cheese Slices 200g",
        category: "dairy",
        price: 150,
        offerPrice: 135,
        image: ["https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=600&q=80"],
        description: ["Individually wrapped slices", "Melts evenly on burgers and toast", "Rich calcium source"],
        inStock: true,
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
    },
    {
        name: "Butter French Croissants 2 pcs",
        category: "bakery",
        price: 110,
        offerPrice: 95,
        image: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"],
        description: ["Flaky, golden-baked with pure European butter", "Soft honeycombed airy crumb", "Pairs perfectly with morning coffee"],
        inStock: true,
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
    },
    {
        name: "Sparkling Lemon Lime Tonic 330ml",
        category: "drinks",
        price: 60,
        offerPrice: 48,
        image: ["https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80"],
        description: ["Refreshing carbonated craft beverage", "Natural citrus infusions", "Low calorie hydration"],
        inStock: true,
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
    },
    {
        name: "Stoneground Whole Wheat Chakki Atta 5kg",
        category: "grains",
        price: 240,
        offerPrice: 215,
        image: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"],
        description: ["100% Sharbati whole wheat grains", "Unbleached with intact bran and germ", "Yields super soft, puffed rotis"],
        inStock: true,
        stock: 35,
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

    // Smart Electronics
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

    // Mobiles & Gadgets
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

    // Clothes & Fashion
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

    // Daily Uses & Home Essentials
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

async function seedDatabase() {
    try {
        console.log("🌱 Connecting to MongoDB:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log("✔ Connected to database.");

        // Clean existing seed collections
        await Product.deleteMany({});
        await User.deleteMany({});
        await Address.deleteMany({});
        await Order.deleteMany({});
        console.log("✔ Cleared existing collections.");

        // 1. Seed Seller / Admin account
        const sellerPasswordHash = await bcrypt.hash(process.env.SELLER_PASSWORD || "harvesto_seller_password", 10);
        const seller = await User.create({
            name: "Harvesto Farm Hub",
            email: process.env.SELLER_EMAIL || "seller@harvesto.com",
            password: sellerPasswordHash,
            role: "seller",
        });
        console.log(`✔ Seeded Seller account: ${seller.email}`);

        // 2. Seed Demo Customer account
        const customerPasswordHash = await bcrypt.hash("customer123", 10);
        const customer = await User.create({
            name: "Aarav Sharma",
            email: "aarav@harvesto.com",
            password: customerPasswordHash,
            role: "user",
        });
        console.log(`✔ Seeded Customer account: ${customer.email} (Password: customer123)`);

        // 3. Seed Delivery Address
        const address = await Address.create({
            userId: customer._id,
            firstName: "Aarav",
            lastName: "Sharma",
            email: "aarav@harvesto.com",
            street: "Flat 402, Green Meadows, Sunrise Avenue",
            city: "Mumbai",
            state: "Maharashtra",
            zipCode: "400001",
            country: "India",
            phone: "+91 98765 43210",
            isDefault: true,
        });
        console.log(`✔ Seeded default delivery address for ${customer.name}`);

        // 4. Seed Products
        const createdProducts = await Product.insertMany(SAMPLE_PRODUCTS);
        console.log(`✔ Seeded ${createdProducts.length} farm-fresh catalog products.`);

        // 5. Seed Demo Order
        await Order.create({
            userId: customer._id,
            items: [
                { product: createdProducts[0]._id, quantity: 2 },
                { product: createdProducts[4]._id, quantity: 1 },
                { product: createdProducts[7]._id, quantity: 2 },
            ],
            amount: 337,
            address: {
                firstName: address.firstName,
                lastName: address.lastName,
                email: address.email,
                street: address.street,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                country: address.country,
                phone: address.phone,
            },
            status: "Processing",
            paymentMethod: "COD",
            isPaid: false,
        });
        console.log("✔ Seeded demo customer order with live tracking.");

        console.log("\n🎉 Database seeding completed successfully!");
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedDatabase();

