const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Request = require('./models/Request');
const RequestLog = require('./models/RequestLog');

const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const usersData = [
  {
    name: 'Standard User',
    email: 'user@example.com',
    password: 'Password123',
    role: 'User',
  },
  {
    name: 'Operations Manager',
    email: 'manager@example.com',
    password: 'Password123',
    role: 'Manager',
  },
  {
    name: 'System Admin',
    email: 'admin@example.com',
    password: 'Password123',
    role: 'Admin',
  },
];

const seedDB = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/approval-workflow');
    console.log('MongoDB connected for seeding...');

    // Clear existing collection records
    await User.deleteMany();
    await Request.deleteMany();
    await RequestLog.deleteMany();
    console.log('Cleared database collections...');

    // Create users (pre-save hook will hash passwords)
    const createdUsers = await User.create(usersData);
    console.log('Seeded Users:');
    createdUsers.forEach((u) => console.log(`- ${u.name} (${u.role})`));

    const userUser = createdUsers.find((u) => u.role === 'User');
    const managerUser = createdUsers.find((u) => u.role === 'Manager');
    const adminUser = createdUsers.find((u) => u.role === 'Admin');

    // Seed mock requests & workflow logs
    console.log('Seeding requests and audit logs...');

    // 1. A request in "Submitted" status (needs manager action)
    const r1 = await Request.create({
      title: 'Upgrade Workstation Laptop',
      description: 'Requesting a Macbook Pro upgrade for mobile app development tasks as the current development machine has hardware limitations running simulators.',
      category: 'Hardware',
      priority: 'High',
      status: 'Submitted',
      user_id: userUser._id,
    });
    await RequestLog.create({
      request_id: r1._id,
      old_status: null,
      new_status: 'Submitted',
      changed_by: userUser._id,
      role: 'User',
      comment: 'Initial request submitted for laptop replacement.',
    });

    // 2. A request in "Needs Clarification" status
    const r2 = await Request.create({
      title: 'Adobe Suite Subscription',
      description: 'Need access to Adobe Creative Cloud for designing marketing flyers and web assets.',
      category: 'Software License',
      priority: 'Medium',
      status: 'Needs Clarification',
      user_id: userUser._id,
    });
    await RequestLog.create([
      {
        request_id: r2._id,
        old_status: null,
        new_status: 'Submitted',
        changed_by: userUser._id,
        role: 'User',
        comment: 'Request submitted.',
      },
      {
        request_id: r2._id,
        old_status: 'Submitted',
        new_status: 'Needs Clarification',
        changed_by: managerUser._id,
        role: 'Manager',
        comment: 'Please specify which Adobe products you need. Do you need the full suite or only Photoshop/Illustrator?',
      },
    ]);

    // 3. A request in "Approved" status (needs admin action to close)
    const r3 = await Request.create({
      title: 'AWS Sandbox Environment Access',
      description: 'Requesting access to AWS sandbox for prototype deployment of the new workflow feature.',
      category: 'Cloud Services',
      priority: 'High',
      status: 'Approved',
      user_id: userUser._id,
    });
    await RequestLog.create([
      {
        request_id: r3._id,
        old_status: null,
        new_status: 'Submitted',
        changed_by: userUser._id,
        role: 'User',
        comment: 'AWS sandbox access requested.',
      },
      {
        request_id: r3._id,
        old_status: 'Submitted',
        new_status: 'Approved',
        changed_by: managerUser._id,
        role: 'Manager',
        comment: 'Approved. Approved budget is within departmental limits.',
      },
    ]);

    // 4. A request in "Closed" status
    const r4 = await Request.create({
      title: 'Office Ergonomic Chair',
      description: 'Requesting an ergonomic chair due to back pain from extended sitting periods.',
      category: 'Office Supplies',
      priority: 'Low',
      status: 'Closed',
      user_id: userUser._id,
    });
    await RequestLog.create([
      {
        request_id: r4._id,
        old_status: null,
        new_status: 'Submitted',
        changed_by: userUser._id,
        role: 'User',
        comment: 'Ergonomic chair request submitted.',
      },
      {
        request_id: r4._id,
        old_status: 'Submitted',
        new_status: 'Approved',
        changed_by: managerUser._id,
        role: 'Manager',
        comment: 'Ergonomic request approved based on medical/physical recommendations.',
      },
      {
        request_id: r4._id,
        old_status: 'Approved',
        new_status: 'Closed',
        changed_by: adminUser._id,
        role: 'Admin',
        comment: 'Item purchased, shipped, and tracking details delivered to user.',
      },
    ]);

    // 5. A request in "Rejected" status
    const r5 = await Request.create({
      title: 'Noise Cancelling Headphones (Bose)',
      description: 'Requesting premium Bose headphones for deep focus in open-office setting.',
      category: 'Electronics',
      priority: 'Low',
      status: 'Rejected',
      user_id: userUser._id,
    });
    await RequestLog.create([
      {
        request_id: r5._id,
        old_status: null,
        new_status: 'Submitted',
        changed_by: userUser._id,
        role: 'User',
        comment: 'Request submitted.',
      },
      {
        request_id: r5._id,
        old_status: 'Submitted',
        new_status: 'Rejected',
        changed_by: managerUser._id,
        role: 'Manager',
        comment: 'Company provides standard noise-cancelling equipment. Premium brand requests are not covered by current budget policies.',
      },
    ]);

    // 6. A request in "Reopened" status
    const r6 = await Request.create({
      title: 'GitHub Enterprise Seat License',
      description: 'Need access to enterprise features like advanced security scanning and branch protections.',
      category: 'Software License',
      priority: 'Medium',
      status: 'Reopened',
      user_id: userUser._id,
    });
    await RequestLog.create([
      {
        request_id: r6._id,
        old_status: null,
        new_status: 'Submitted',
        changed_by: userUser._id,
        role: 'User',
        comment: 'Request submitted.',
      },
      {
        request_id: r6._id,
        old_status: 'Submitted',
        new_status: 'Approved',
        changed_by: managerUser._id,
        role: 'Manager',
        comment: 'Approved.',
      },
      {
        request_id: r6._id,
        old_status: 'Approved',
        new_status: 'Closed',
        changed_by: adminUser._id,
        role: 'Admin',
        comment: 'License assigned to user enterprise account.',
      },
      {
        request_id: r6._id,
        old_status: 'Closed',
        new_status: 'Reopened',
        changed_by: adminUser._id,
        role: 'Admin',
        comment: 'Reopened due to license activation issue reported by employee.',
      },
    ]);

    console.log('Successfully seeded database!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
