/**
 * Seed Script — Sonatek Steel Inventory
 * ----------------------------------------
 * Seeds: Users (1 director), Warehouses, Grades, Widths,
 *        Thicknesses, Parties, and Items.
 *
 * Usage:
 *   node scripts/seed.js <directorEmail>
 *
 * Example:
 *   node scripts/seed.js john@sonatek.com
 *
 * The director account must already exist (i.e. you signed up first).
 * This script will verify that account and seed all test data.
 * Existing data is cleared before seeding (except the director user).
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User       = require('../models/userModel');
const Warehouse  = require('../models/warehouseModel');
const Grade      = require('../models/gradeModel');
const Width      = require('../models/widthModel');
const Thickness  = require('../models/thicknessModel');
const Party      = require('../models/partyModel');
const Item       = require('../models/itemModel');

const directorEmail = process.argv[2];

if (!directorEmail) {
    console.error('❌  Please provide the director email.\n   Usage: node scripts/seed.js <email>');
    process.exit(1);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const warehouseData = [
    { name: 'Warehouse A - Navi Mumbai',  address: 'Plot 12, MIDC, Navi Mumbai, MH 400710', phoneNumber: '9876543210' },
    { name: 'Warehouse B - Pune',         address: '45 Industrial Estate, Bhosari, Pune 411026', phoneNumber: '9823456789' },
    { name: 'Warehouse C - Surat',        address: 'Survey No. 78, Sachin GIDC, Surat 394230', phoneNumber: '9765432100' },
];

const gradeData = [
    { name: 'IS 2062 E250',   type: 'Hot Rolled' },
    { name: 'IS 2062 E350',   type: 'Hot Rolled' },
    { name: 'IS 513 CR1',     type: 'Cold Rolled' },
    { name: 'IS 513 CR2',     type: 'Cold Rolled' },
    { name: 'IS 513 CR3',     type: 'Cold Rolled' },
    { name: 'IS 1079 HR',     type: 'Hot Rolled' },
];

// Width in mm
const widthData = [
    { name: 900,  type: 'Both' },
    { name: 1000, type: 'Both' },
    { name: 1200, type: 'Hot Rolled' },
    { name: 1250, type: 'Cold Rolled' },
    { name: 1500, type: 'Hot Rolled' },
    { name: 1800, type: 'Hot Rolled' },
];

// Thickness in mm
const thicknessData = [
    { name: 0.5,  type: 'Cold Rolled' },
    { name: 0.8,  type: 'Cold Rolled' },
    { name: 1.0,  type: 'Both' },
    { name: 1.5,  type: 'Both' },
    { name: 2.0,  type: 'Both' },
    { name: 2.5,  type: 'Hot Rolled' },
    { name: 3.0,  type: 'Hot Rolled' },
    { name: 4.0,  type: 'Hot Rolled' },
    { name: 5.0,  type: 'Hot Rolled' },
    { name: 6.0,  type: 'Hot Rolled' },
];

const partyData = [
    { name: 'Agarwal Steel Traders' },
    { name: 'Mehta Iron Works' },
    { name: 'Bharat Engineering Co.' },
    { name: 'Sinha Fabricators Pvt. Ltd.' },
    { name: 'Kapoor & Sons Metals' },
    { name: 'Rajput Construction Materials' },
];

const extraUserData = [
    {
        firstName: 'Ravi', lastName: 'Sharma',
        email: 'ravi.sharma@sonatek.com', password: 'Password@123',
        role: 'admin', isVerified: true,
    },
    {
        firstName: 'Priya', lastName: 'Mehta',
        email: 'priya.mehta@sonatek.com', password: 'Password@123',
        role: 'inventory_associate', isVerified: true,
    },
    {
        firstName: 'Arjun', lastName: 'Patel',
        email: 'arjun.patel@sonatek.com', password: 'Password@123',
        role: 'agent', isVerified: true,
    },
    {
        firstName: 'Neha', lastName: 'Gupta',
        email: 'neha.gupta@sonatek.com', password: 'Password@123',
        role: 'accountant', isVerified: true,
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅  Connected to MongoDB\n');

        // ── 1. Verify director account ─────────────────────────────────────
        const director = await User.findOne({ email: directorEmail });
        if (!director) {
            console.error(`❌  No user found with email: ${directorEmail}`);
            console.error('   Sign up first, then run this script.');
            process.exit(1);
        }
        director.isVerified = true;
        director.role = 'director';
        await director.save();
        console.log(`✅  Director verified: ${director.firstName} ${director.lastName} (${directorEmail})`);

        // ── 2. Clear existing seed data ────────────────────────────────────
        console.log('\n🧹  Clearing old seed data...');
        await Promise.all([
            Item.deleteMany({}),
            Warehouse.deleteMany({}),
            Grade.deleteMany({}),
            Width.deleteMany({}),
            Thickness.deleteMany({}),
            Party.deleteMany({}),
            // Remove only extra test users (not the director)
            User.deleteMany({ email: { $in: extraUserData.map(u => u.email) } }),
        ]);
        console.log('✅  Old data cleared');

        // ── 3. Seed reference data ─────────────────────────────────────────
        console.log('\n📦  Seeding reference data...');

        const warehouses  = await Warehouse.insertMany(warehouseData);
        const grades      = await Grade.insertMany(gradeData);
        const widths      = await Width.insertMany(widthData);
        const thicknesses = await Thickness.insertMany(thicknessData);
        const parties     = await Party.insertMany(partyData);

        console.log(`   • ${warehouses.length} warehouses`);
        console.log(`   • ${grades.length} grades`);
        console.log(`   • ${widths.length} widths`);
        console.log(`   • ${thicknesses.length} thicknesses`);
        console.log(`   • ${parties.length} parties`);

        // ── 4. Seed extra users ────────────────────────────────────────────
        console.log('\n👥  Seeding users...');
        const hashedUsers = await Promise.all(
            extraUserData.map(async (u) => ({
                ...u,
                password: await bcrypt.hash(u.password, 10),
            }))
        );
        const savedUsers = await User.insertMany(hashedUsers);
        console.log(`   • ${savedUsers.length} extra users created (password: Password@123)`);

        // ── 5. Seed items ──────────────────────────────────────────────────
        console.log('\n🔩  Seeding inventory items...');

        const itemTypes = ['Hot Rolled', 'Cold Rolled', 'Galvanized', 'Color Coated'];
        const itemForms = ['Coil', 'Sheet'];
        const statuses  = ['In Stock', 'In Stock', 'In Stock', 'Reserved', 'Sold']; // weighted

        const itemDocs = [];
        for (let i = 0; i < 30; i++) {
            const type = pick(itemTypes);

            // Pick grade compatible with type
            const compatibleGrades = grades.filter(g =>
                type === 'Hot Rolled' ? g.type === 'Hot Rolled' :
                type === 'Cold Rolled' ? g.type === 'Cold Rolled' :
                true
            );
            const grade = compatibleGrades.length ? pick(compatibleGrades) : pick(grades);

            // Pick width/thickness compatible with type
            const compatibleWidths = widths.filter(w =>
                w.type === 'Both' || w.type === type
            );
            const compatibleThicknesses = thicknesses.filter(t =>
                t.type === 'Both' || t.type === type
            );

            const qty = randInt(5, 200);
            const challanNum = `CH-2025-${String(1000 + i).padStart(4, '0')}`;
            const invoiceNum = `INV-2025-${String(2000 + i).padStart(4, '0')}`;
            const warehouse  = pick(warehouses);

            itemDocs.push({
                type,
                grade: grade._id,
                form: pick(itemForms),
                width: pick(compatibleWidths)._id,
                thickness: pick(compatibleThicknesses)._id,
                wagonNumber: `WGN-${randInt(1000, 9999)}`,
                challan: {
                    challanDate:   daysAgo(randInt(10, 120)),
                    challanNumber: challanNum,
                },
                invoice: {
                    invoiceDate:   daysAgo(randInt(5, 110)),
                    invoiceNumber: invoiceNum,
                },
                currentStatus: pick(statuses),
                originalQuantity: qty,
                quantity: qty,
                warehouse: warehouse._id,
                transport: {
                    vehicleNumber:   `MH${randInt(10,99)} AB ${randInt(1000,9999)}`,
                    loader:          pick(['Ashok Traders', 'Ramesh Logistics', 'Speed Cargo', 'National Movers']),
                    transporterName: pick(['Fast Freight Co.', 'Sahil Transport', 'Bharat Cargo', 'Hari Om Logistics']),
                },
                remark: pick(['', '', 'Prime quality', 'Secondary grade', 'Awaiting inspection']),
                date: daysAgo(randInt(1, 90)),
            });
        }

        // Insert one at a time to trigger pre-save (item_id auto-increment)
        let itemCount = 0;
        for (const doc of itemDocs) {
            await new Item(doc).save();
            itemCount++;
        }
        console.log(`   • ${itemCount} items inserted`);

        // ── Summary ────────────────────────────────────────────────────────
        console.log('\n────────────────────────────────────────');
        console.log('🎉  Seed complete! Test credentials:\n');
        console.log(`   Director  : ${directorEmail} (your password)`);
        console.log('   Admin     : ravi.sharma@sonatek.com   / Password@123');
        console.log('   Inv. Assoc: priya.mehta@sonatek.com   / Password@123');
        console.log('   Agent     : arjun.patel@sonatek.com   / Password@123');
        console.log('   Accountant: neha.gupta@sonatek.com    / Password@123');
        console.log('────────────────────────────────────────\n');

    } catch (err) {
        console.error('❌  Seed failed:', err.message);
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
})();
