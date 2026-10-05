/**
 * Seed script to create test users for all roles.
 * Run: node src/utils/seedUsers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedUsers = async () => {
  await connectDB();

  // Clear existing local users
  await User.deleteMany({ authProvider: 'local' });
  console.log('🗑️  Cleared existing local users');

  const users = [
    {
      name: 'Super Admin',
      email: 'superadmin@securegateway.com',
      password: 'SuperAdmin@123',
      role: 'SuperAdmin',
      authProvider: 'local',
      isVerified: true,
    },
    {
      name: 'Manager User',
      email: 'manager@securegateway.com',
      password: 'Manager@123',
      role: 'Manager',
      authProvider: 'local',
      isVerified: true,
    },
    {
      name: 'Employee User',
      email: 'employee@securegateway.com',
      password: 'Employee@123',
      role: 'Employee',
      authProvider: 'local',
      isVerified: true,
    },
  ];

  for (const userData of users) {
    await User.create(userData);
    console.log(`✅ Created ${userData.role}: ${userData.email}`);
  }

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n─── Test Credentials ───────────────────────────');
  console.log('SuperAdmin → superadmin@securegateway.com / SuperAdmin@123');
  console.log('Manager   → manager@securegateway.com    / Manager@123');
  console.log('Employee  → employee@securegateway.com   / Employee@123');
  console.log('────────────────────────────────────────────────');

  process.exit(0);
};

seedUsers().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
