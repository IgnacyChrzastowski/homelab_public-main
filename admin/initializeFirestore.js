const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Complete Firestore initialization script
 * Creates all required collections, subcollections, and counter documents
 * Designed to work from empty Firestore database
 */
async function initializeFirestore() {
    console.log('🚀 Starting complete Firestore initialization...\n');
    console.log('=' .repeat(80));

    try {
        // Get all Firebase Auth users
        const usersSnapshot = await admin.auth().listUsers();

        if (usersSnapshot.users.length === 0) {
            console.log('⚠️  No users found in Firebase Auth.');
            console.log('   Please create at least one user first.');
            return;
        }

        console.log(`\n📊 Found ${usersSnapshot.users.length} user(s) in Firebase Auth\n`);

        for (const userRecord of usersSnapshot.users) {
            const userId = userRecord.uid;
            const userEmail = userRecord.email || 'No email';

            console.log('👤 Processing user:');
            console.log(`   Email: ${userEmail}`);
            console.log(`   UID:   ${userId}\n`);

            // Base path for all user data
            const basePath = `artifacts/default-app-id/users/${userId}`;

            // ========================================
            // 1. Initialize main collections
            // ========================================
            console.log('📁 Creating main collections...\n');

            const collections = [
                { name: 'categories', prefix: 'K', description: 'Categories' },
                { name: 'components', prefix: 'U', description: 'Components (Urządzenia)' },
                { name: 'parameters', prefix: 'P', description: 'Parameters' },
                { name: 'uploaded_documents', prefix: 'R', description: 'Uploaded Documents (Ręczne)' }
            ];

            for (const col of collections) {
                const collectionPath = `${basePath}/${col.name}`;
                const collectionRef = db.collection(collectionPath);

                try {
                    // Check if collection exists
                    const snapshot = await collectionRef.limit(1).get();

                    if (snapshot.empty) {
                        // Create placeholder document to initialize collection
                        await collectionRef.add({
                            _placeholder: true,
                            _description: `Placeholder for ${col.description}`,
                            createdAt: new Date().toISOString(),
                            userId: userId,
                            note: 'This document can be safely deleted after first real document is added'
                        });
                        console.log(`   ✅ Created: ${col.name}/ (prefix: ${col.prefix})`);
                    } else {
                        console.log(`   ⏭️  Exists:  ${col.name}/ (${snapshot.size} document(s))`);
                    }
                } catch (error) {
                    console.error(`   ❌ Error creating ${col.name}:`, error.message);
                }
            }

            // ========================================
            // 2. Initialize counters subcollection
            // ========================================
            console.log('\n🔢 Creating counters subcollection...\n');

            const countersPath = `${basePath}/counters`;
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = String(now.getFullYear()).slice(-2);

            // Counter prefixes used in the application:
            // U - Components (Urządzenia)
            // K - Categories (Kategorie)
            // P - Parameters (Parametry)
            // R - Uploaded Documents (Ręczne)
            // G - Generated Documents (Generowane)
            // F - Invoices (Faktury)
            const counterPrefixes = [
                { prefix: 'U', description: 'Components counter' },
                { prefix: 'K', description: 'Categories counter' },
                { prefix: 'P', description: 'Parameters counter' },
                { prefix: 'R', description: 'Manual documents counter' },
                { prefix: 'G', description: 'Generated documents counter' },
                { prefix: 'F', description: 'Invoices counter' }
            ];

            for (const counter of counterPrefixes) {
                const counterKey = `${counter.prefix}_${month}_${year}`;
                const counterRef = db.doc(`${countersPath}/${counterKey}`);

                try {
                    const counterDoc = await counterRef.get();

                    if (!counterDoc.exists) {
                        await counterRef.set({
                            count: 0,
                            prefix: counter.prefix,
                            month: month,
                            year: year,
                            description: counter.description,
                            lastUpdated: now.toISOString(),
                            createdAt: now.toISOString()
                        });
                        console.log(`   ✅ Created counter: ${counterKey} (${counter.description})`);
                    } else {
                        const currentCount = counterDoc.data().count || 0;
                        console.log(`   ⏭️  Counter exists: ${counterKey} (count: ${currentCount})`);
                    }
                } catch (error) {
                    console.error(`   ❌ Error creating counter ${counterKey}:`, error.message);
                }
            }

            // ========================================
            // 3. Verify structure
            // ========================================
            console.log('\n🔍 Verifying created structure...\n');

            for (const col of collections) {
                const collectionPath = `${basePath}/${col.name}`;
                const snapshot = await db.collection(collectionPath).limit(1).get();
                const status = snapshot.empty ? '❌ EMPTY' : `✅ OK (${snapshot.size} docs)`;
                console.log(`   ${status} ${col.name}/`);
            }

            console.log('\n   Counters:');
            for (const counter of counterPrefixes) {
                const counterKey = `${counter.prefix}_${month}_${year}`;
                const counterDoc = await db.doc(`${countersPath}/${counterKey}`).get();
                const status = counterDoc.exists ? `✅ OK (count: ${counterDoc.data().count})` : '❌ MISSING';
                console.log(`   ${status} ${counterKey}`);
            }

            console.log('\n' + '='.repeat(80) + '\n');
        }

        // ========================================
        // 4. Summary
        // ========================================
        console.log('✨ Firestore initialization complete!\n');
        console.log('📋 Created structure for each user:');
        console.log('');
        console.log('   artifacts/default-app-id/users/{userId}/');
        console.log('   ├── categories/           (prefix: K)');
        console.log('   ├── components/           (prefix: U)');
        console.log('   ├── parameters/           (prefix: P)');
        console.log('   ├── uploaded_documents/   (prefix: R)');
        console.log('   └── counters/');
        console.log('       ├── K_{MM}_{YY}      (Categories)');
        console.log('       ├── U_{MM}_{YY}      (Components)');
        console.log('       ├── P_{MM}_{YY}      (Parameters)');
        console.log('       ├── R_{MM}_{YY}      (Manual docs)');
        console.log('       ├── G_{MM}_{YY}      (Generated docs)');
        console.log('       └── F_{MM}_{YY}      (Invoices)');
        console.log('');
        console.log('💡 Current month/year: ' + String(new Date().getMonth() + 1).padStart(2, '0') + '/' + String(new Date().getFullYear()).slice(-2));
        console.log('');
        console.log('📝 Notes:');
        console.log('   - Placeholder documents can be deleted after adding real data');
        console.log('   - Counters will auto-increment when creating new items');
        console.log('   - New month/year counters will be created automatically');
        console.log('');

    } catch (error) {
        console.error('\n❌ Fatal error during initialization:', error);
        console.error('\nStack trace:', error.stack);
        throw error;
    }
}

// Run initialization
initializeFirestore()
    .then(() => {
        console.log('🎉 Initialization script completed successfully!\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Initialization failed:', error.message);
        process.exit(1);
    });