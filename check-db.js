const { db } = require('./src/config/firebase');

async function checkDatabase() {
  console.log('--- FETCHING USERS FROM FIREBASE ---');
  try {
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found in the database.');
      return;
    }
    
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nUser ID: ${doc.id}`);
      console.log(`Email: ${data.email}`);
      console.log(`Role: ${data.role}`);
      if (data.status) console.log(`Status: ${data.status}`);
      if (data.organizationName) console.log(`Organization Name: ${data.organizationName}`);
      if (data.restaurantName) console.log(`Restaurant Name: ${data.restaurantName}`);
      if (data.name) console.log(`Name: ${data.name}`);
      console.log('------------------------------------');
    });
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

checkDatabase();
