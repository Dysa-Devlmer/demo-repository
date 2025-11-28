const bcrypt = require('bcryptjs');

const password = 'Admin123!';
const saltRounds = 10;

console.log('🔐 Generating bcrypt hash for password:', password);
console.log('Salt rounds:', saltRounds);
console.log('');

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  }

  console.log('✅ Generated hash:');
  console.log(hash);
  console.log('');

  // Verify the hash works
  bcrypt.compare(password, hash, (err, result) => {
    if (err) {
      console.error('❌ Error verifying:', err);
      process.exit(1);
    }

    if (result) {
      console.log('✅ Verification successful! Hash is valid.');
      console.log('');
      console.log('📋 SQL UPDATE Statement:');
      console.log('=========================================');
      console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@zgamersa.com';`);
      console.log('=========================================');
    } else {
      console.log('❌ Verification failed!');
      process.exit(1);
    }
  });
});
