const { User, UserProfile } = require('../../models'); // Assuming UserProfile is in the models directory
const argon2 = require('argon2');
const { getConfig } = require('../helpers/config');
const logger = require('../logging/logger');

/**
 * Advanced Admin Bootstrapping Function
 * This function ensures that an admin user exists in the system. If one doesn't exist, it creates one.
 * If an existing admin doesn't have the correct role, it updates the user to admin.
 * It also ensures an admin profile is created for the user.
 */
const bootstrapAdmin = async () => {
    try {
        const adminEmail = getConfig('ADMIN_EMAIL', 'admin@example.com');
        const adminPassword = getConfig('ADMIN_PASSWORD', 'AdminPassword123');
        const adminPhone = getConfig('ADMIN_PHONE', '1234567890');
        const adminUsername = getConfig('ADMIN_USERNAME', 'admin');
        const adminFirstName = getConfig('ADMIN_FIRST_NAME', 'Admin');
        const adminLastName = getConfig('ADMIN_LAST_NAME', 'User');
        const shouldBypass = getConfig('BYPASS_ADMIN_BOOTSTRAP', false);

        // Bypass admin creation in some environments (e.g., development, testing)
        if (shouldBypass && process.env.NODE_ENV !== 'development') {
            logger.info('Admin bootstrapping bypassed in non-production environment.');
            return;
        }

        // Check if the admin user already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            // If the user exists but is not an admin, update the role
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                logger.info('Existing user promoted to admin role.');
            }

            // Ensure the admin profile exists
            let adminProfile = await UserProfile.findOne({ user_id: existingAdmin._id });
            if (!adminProfile) {
                adminProfile = new UserProfile({
                    user_id: existingAdmin._id,
                    first_name: adminFirstName,
                    last_name: adminLastName,
                    bio: 'Admin account',
                    experience_level: 'advanced', // Assuming admin has advanced experience
                    privacy_settings: {
                        show_phone_number: false,
                        show_address: false
                    }
                });
                await adminProfile.save();
                logger.info('Admin profile successfully created.');
            } else {
                logger.info('Admin profile already exists.');
            }

            return;
        }

        // If no admin user exists, create one
        logger.info('No admin found, creating a new admin user.');

        // Hash the admin password
        const hashedPassword = await argon2.hash(adminPassword, {
            type: argon2.argon2id,  // Use argon2id for stronger security
            memoryCost: 2 ** 16,    // Increase memory cost for better security (can be adjusted)
            timeCost: 3,            // Increase time cost (number of iterations)
            parallelism: 1          // Number of threads used
        });

        // Create new admin user
        const newAdmin = new User({
            username: adminUsername,
            email: adminEmail,
            password_hash: hashedPassword,
            phone_number: adminPhone,
            role: 'admin',
            status: 'active',
            two_factor_enabled: true,  // Enforce 2FA for admin users
            created_at: Date.now(),
            updated_at: Date.now()
        });

        await newAdmin.save();

        // Create admin profile
        const adminProfile = new UserProfile({
            user_id: newAdmin._id,
            first_name: adminFirstName,
            last_name: adminLastName,
            bio: 'Admin account',
            experience_level: 'advanced', // Assuming admin has advanced experience
            privacy_settings: {
                show_phone_number: false,
                show_address: false
            }
        });

        await adminProfile.save();
        logger.info('Admin user and profile successfully created.');

    } catch (error) {
        logger.error(`Error bootstrapping admin user: ${error.message}`);
        
        // Optionally, notify through other means (e.g., email alert, webhook)
        // Example: sendAlert(`Critical error during admin bootstrapping: ${error.message}`);

        throw error;
    }
};

module.exports = bootstrapAdmin;
