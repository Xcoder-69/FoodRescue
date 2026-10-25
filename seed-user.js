require('dotenv').config();
require('./src/config/firebase');
const AuthService = require('./src/modules/auth/auth.service');
const { db } = require('./src/config/firebase');

const usersToCreate = [
  { email: 'test.restaurant@foodrescue.org', password: 'Password123!', role: 'restaurant' },
  { email: 'test.ngo@foodrescue.org', password: 'Password123!', role: 'ngo' },
  { email: 'test.volunteer@foodrescue.org', password: 'Password123!', role: 'volunteer' },
  { email: 'test.admin@foodrescue.org', password: 'Password123!', role: 'admin', adminCode: 'FOOD_RESCUE_ADMIN_2026' }
];

async function seedUsers() {
  console.log('Seeding users...\n');
  
  for (const u of usersToCreate) {
    try {
      const result = await AuthService.register(u.email, u.password, u.role, u.adminCode, '127.0.0.1', 'seed-script');
      
      await db.collection('users').doc(result.user.uid).update({
        isEmailVerified: true,
        status: 'active'
      });

      console.log(`✅ Created [${u.role.toUpperCase()}]`);
      console.log(`   Email:    ${u.email}`);
      console.log(`   Password: ${u.password}\n`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists' || (error.message && error.message.includes('already in use'))) {
        console.log(`✅ Exists  [${u.role.toUpperCase()}]`);
        console.log(`   Email:    ${u.email}`);
        console.log(`   Password: ${u.password}\n`);
      } else {
        console.error(`❌ Error creating ${u.role}:`, error.message);
      }
    }
  }
  process.exit(0);
}

seedUsers();
