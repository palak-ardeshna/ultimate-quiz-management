import { User } from '../models/user.js';
import bcrypt from 'bcryptjs';

export const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@gmail.com';
        
        // Check if admin already exists
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('ℹ️ Admin already exists');
            return;
        }

        // Hash admin password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create default admin
        await User.create({
            username: 'admin',
            email: adminEmail,
            password: hashedPassword,
            isAdmin: true
        });

        console.log('✅ Default admin created successfully');
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
    }
};
