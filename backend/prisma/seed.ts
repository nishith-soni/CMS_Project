// ===========================================
// Database Seed Script
// ===========================================
// 
// WHY: Creates initial data for development/testing
// Run with: npx prisma db seed
//
// This creates:
// - Super Admin user
// - Sample categories, posts
// - Sample contacts, leads, deals
// - Sample products, customers, orders

import { PrismaClient, Role, PostStatus, LeadStatus, DealStage, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';

// Load env variables
config();

async function main() {
  // Create connection
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL not set');
  }
  
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('🌱 Starting database seed...');

  // ===========================================
  // Create Super Admin User
  // ===========================================
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cms.local' },
    update: {},
    create: {
      email: 'admin@cms.local',
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });
  
  console.log('✅ Super Admin created:', admin.email);

  // ===========================================
  // Create Sample Categories (CMS)
  // ===========================================
  const categoriesData = [
    { name: 'Technology', slug: 'technology', description: 'Tech news, tutorials, and updates' },
    { name: 'Business', slug: 'business', description: 'Business insights and industry trends' },
    { name: 'Marketing', slug: 'marketing', description: 'Marketing tips and strategies' },
    { name: 'Development', slug: 'development', description: 'Software development guides' },
    { name: 'Design', slug: 'design', description: 'UI/UX design principles and inspiration' },
    { name: 'News', slug: 'news', description: 'Company announcements and news' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  
  console.log('✅ Categories created');

  // ===========================================
  // Create Sample Posts (CMS)
  // ===========================================
  const postsData = [
    {
      title: 'Getting Started with Our Platform',
      slug: 'getting-started-with-our-platform',
      content: `Welcome to our comprehensive CMS, CRM, and ERP platform! This guide will walk you through the essential features and help you get the most out of your experience.\n\n## Key Features\n\n1. **Content Management** - Create and manage blog posts, pages, and media\n2. **Customer Relationship Management** - Track contacts, leads, and deals\n3. **Enterprise Resource Planning** - Manage products, customers, and orders\n\n## Getting Started\n\nStart by exploring the dashboard to see an overview of your business metrics. From there, you can dive into specific modules based on your needs.`,
      excerpt: 'A comprehensive guide to getting started with our all-in-one business platform.',
      status: PostStatus.PUBLISHED,
      categorySlug: 'technology',
      metaTitle: 'Getting Started Guide | Platform Documentation',
      metaDescription: 'Learn how to get started with our CMS, CRM, and ERP platform.',
    },
    {
      title: '10 Best Practices for Content Management',
      slug: '10-best-practices-content-management',
      content: `Effective content management is crucial for any business. Here are 10 best practices to help you succeed:\n\n1. **Plan Your Content Strategy** - Define goals and target audience\n2. **Maintain Consistency** - Use templates and style guides\n3. **Optimize for SEO** - Use keywords and meta descriptions\n4. **Regular Updates** - Keep content fresh and relevant\n5. **Organize with Categories** - Use logical categorization\n6. **Quality Over Quantity** - Focus on valuable content\n7. **Mobile-First Approach** - Ensure responsive design\n8. **Analytics Integration** - Track performance metrics\n9. **User Feedback** - Listen to your audience\n10. **Continuous Improvement** - Iterate based on data`,
      excerpt: 'Essential content management practices for business success.',
      status: PostStatus.PUBLISHED,
      categorySlug: 'marketing',
      metaTitle: '10 Content Management Best Practices',
      metaDescription: 'Learn the top 10 content management best practices for your business.',
    },
    {
      title: 'Understanding CRM: A Complete Guide',
      slug: 'understanding-crm-complete-guide',
      content: `Customer Relationship Management (CRM) is essential for modern businesses. This guide covers everything you need to know.\n\n## What is CRM?\n\nCRM is a strategy for managing your company's relationships and interactions with customers and potential customers.\n\n## Key Components\n\n- **Contact Management** - Store and organize customer information\n- **Lead Tracking** - Monitor potential customers through the sales funnel\n- **Deal Management** - Track opportunities and close more sales\n- **Activity Logging** - Record all customer interactions\n\n## Benefits\n\n1. Improved customer relationships\n2. Increased sales efficiency\n3. Better data organization\n4. Enhanced communication`,
      excerpt: 'Everything you need to know about Customer Relationship Management.',
      status: PostStatus.PUBLISHED,
      categorySlug: 'business',
      metaTitle: 'Complete CRM Guide for Businesses',
      metaDescription: 'A comprehensive guide to understanding and implementing CRM.',
    },
    {
      title: 'Building a Modern Tech Stack',
      slug: 'building-modern-tech-stack',
      content: `Learn how to build a modern, scalable technology stack for your business.\n\n## Frontend Technologies\n\n- **React** - Component-based UI library\n- **TypeScript** - Type-safe JavaScript\n- **Material UI** - Professional UI components\n\n## Backend Technologies\n\n- **NestJS** - Scalable Node.js framework\n- **PostgreSQL** - Reliable relational database\n- **Prisma** - Modern ORM\n\n## DevOps\n\n- **Docker** - Containerization\n- **GitHub Actions** - CI/CD pipelines\n- **AWS/Azure** - Cloud hosting`,
      excerpt: 'A guide to selecting and implementing modern technologies.',
      status: PostStatus.PUBLISHED,
      categorySlug: 'development',
      metaTitle: 'Building a Modern Tech Stack',
      metaDescription: 'Learn how to build a scalable technology stack for your business.',
    },
    {
      title: 'ERP Systems: Streamlining Business Operations',
      slug: 'erp-systems-streamlining-business-operations',
      content: `Enterprise Resource Planning (ERP) systems are the backbone of efficient business operations.\n\n## Core ERP Modules\n\n### Inventory Management\nTrack stock levels, manage reorders, and optimize warehouse operations.\n\n### Order Management\nProcess sales orders from creation to fulfillment.\n\n### Customer Management\nMaintain detailed customer records and history.\n\n### Financial Integration\nConnect with accounting and invoicing systems.\n\n## Implementation Tips\n\n1. Start with core modules\n2. Train your team thoroughly\n3. Migrate data carefully\n4. Monitor and optimize`,
      excerpt: 'How ERP systems can transform your business operations.',
      status: PostStatus.PUBLISHED,
      categorySlug: 'business',
      metaTitle: 'ERP Systems Guide',
      metaDescription: 'Discover how ERP systems can streamline your business operations.',
    },
    {
      title: 'UI/UX Design Principles for Business Apps',
      slug: 'ui-ux-design-principles-business-apps',
      content: `Creating user-friendly business applications requires attention to UI/UX design principles.\n\n## Key Principles\n\n### Clarity\nMake interfaces intuitive and self-explanatory.\n\n### Consistency\nUse consistent patterns throughout the application.\n\n### Efficiency\nMinimize steps required to complete tasks.\n\n### Feedback\nProvide clear feedback for user actions.\n\n## Best Practices\n\n- Use familiar patterns\n- Prioritize mobile responsiveness\n- Implement accessibility features\n- Test with real users`,
      excerpt: 'Essential design principles for creating effective business applications.',
      status: PostStatus.PUBLISHED,
      categorySlug: 'design',
      metaTitle: 'UI/UX Design for Business Applications',
      metaDescription: 'Learn essential UI/UX design principles for business applications.',
    },
    {
      title: 'Q3 Product Updates and New Features',
      slug: 'q3-product-updates-new-features',
      content: `We're excited to announce our Q3 product updates!\n\n## New Features\n\n### Enhanced Dashboard\n- Real-time analytics\n- Customizable widgets\n- Performance metrics\n\n### CRM Improvements\n- Advanced lead scoring\n- Email integration\n- Pipeline visualization\n\n### ERP Updates\n- Batch order processing\n- Inventory alerts\n- Report generator\n\n## Coming Soon\n\n- Mobile app\n- API marketplace\n- Advanced integrations`,
      excerpt: 'Discover the latest features and improvements in our Q3 update.',
      status: PostStatus.PUBLISHED,
      categorySlug: 'news',
      metaTitle: 'Q3 Product Updates',
      metaDescription: 'Check out our latest Q3 product updates and new features.',
    },
    {
      title: 'Advanced Data Analytics for Decision Making',
      slug: 'advanced-data-analytics-decision-making',
      content: `Leverage data analytics to make better business decisions.\n\n## Types of Analytics\n\n### Descriptive Analytics\nUnderstand what happened in the past.\n\n### Diagnostic Analytics\nDetermine why things happened.\n\n### Predictive Analytics\nForecast future trends.\n\n### Prescriptive Analytics\nGet recommendations for actions.\n\n## Implementation\n\n1. Define your KPIs\n2. Collect relevant data\n3. Choose the right tools\n4. Build dashboards\n5. Take action on insights`,
      excerpt: 'How to use data analytics for better business decisions.',
      status: PostStatus.DRAFT,
      categorySlug: 'technology',
      metaTitle: 'Data Analytics for Business',
      metaDescription: 'Learn how to leverage data analytics for better decision making.',
    },
  ];

  for (const post of postsData) {
    const { categorySlug, ...postData } = post;
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...postData,
        authorId: admin.id,
        categoryId: categories[categorySlug].id,
        publishedAt: post.status === PostStatus.PUBLISHED ? new Date() : null,
      },
    });
  }
  
  console.log('✅ Posts created');

  // ===========================================
  // Create Sample Contacts (CRM)
  // ===========================================
  const contactsData = [
    { firstName: 'John', lastName: 'Smith', email: 'john.smith@acmecorp.com', phone: '+1-555-0101', company: 'Acme Corporation', jobTitle: 'CEO', city: 'New York', country: 'USA' },
    { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@techstartup.io', phone: '+1-555-0102', company: 'Tech Startup Inc', jobTitle: 'CTO', city: 'San Francisco', country: 'USA' },
    { firstName: 'Michael', lastName: 'Chen', email: 'mchen@globalenterprises.com', phone: '+1-555-0103', company: 'Global Enterprises', jobTitle: 'VP of Operations', city: 'Los Angeles', country: 'USA' },
    { firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@innovate.co', phone: '+1-555-0104', company: 'Innovate Co', jobTitle: 'Director of Marketing', city: 'Chicago', country: 'USA' },
    { firstName: 'David', lastName: 'Wilson', email: 'dwilson@megacorp.net', phone: '+1-555-0105', company: 'MegaCorp', jobTitle: 'Procurement Manager', city: 'Houston', country: 'USA' },
    { firstName: 'Jessica', lastName: 'Brown', email: 'jbrown@financeplus.com', phone: '+1-555-0106', company: 'Finance Plus', jobTitle: 'CFO', city: 'Boston', country: 'USA' },
    { firstName: 'Robert', lastName: 'Taylor', email: 'rtaylor@retailking.com', phone: '+1-555-0107', company: 'Retail King', jobTitle: 'Head of IT', city: 'Seattle', country: 'USA' },
    { firstName: 'Amanda', lastName: 'Martinez', email: 'amanda.m@healthcare.org', phone: '+1-555-0108', company: 'Healthcare Solutions', jobTitle: 'Operations Director', city: 'Miami', country: 'USA' },
    { firstName: 'James', lastName: 'Anderson', email: 'janderson@logisticspro.com', phone: '+1-555-0109', company: 'Logistics Pro', jobTitle: 'Supply Chain Manager', city: 'Denver', country: 'USA' },
    { firstName: 'Lisa', lastName: 'Thomas', email: 'lisa.t@edutech.edu', phone: '+1-555-0110', company: 'EduTech Academy', jobTitle: 'Director', city: 'Austin', country: 'USA' },
    { firstName: 'Mark', lastName: 'Garcia', email: 'mgarcia@manufacturing.com', phone: '+1-555-0111', company: 'Manufacturing Solutions', jobTitle: 'Plant Manager', city: 'Phoenix', country: 'USA' },
    { firstName: 'Rachel', lastName: 'Lee', email: 'rlee@designstudio.co', phone: '+1-555-0112', company: 'Design Studio', jobTitle: 'Creative Director', city: 'Portland', country: 'USA' },
  ];

  const contacts: any[] = [];
  for (const contact of contactsData) {
    const created = await prisma.contact.upsert({
      where: { email: contact.email },
      update: {},
      create: {
        ...contact,
        ownerId: admin.id,
      },
    });
    contacts.push(created);
  }
  
  console.log('✅ Contacts created');

  // ===========================================
  // Create Sample Leads (CRM)
  // ===========================================
  const leadsData = [
    { title: 'Enterprise Software License', source: 'Website', status: LeadStatus.NEW, value: 25000, contactIndex: 0 },
    { title: 'Annual Subscription Renewal', source: 'Account Manager', status: LeadStatus.CONTACTED, value: 24000, contactIndex: 1 },
    { title: 'Consulting Services Package', source: 'Referral', status: LeadStatus.QUALIFIED, value: 15000, contactIndex: 2 },
    { title: 'Platform Integration Project', source: 'Partner Referral', status: LeadStatus.QUALIFIED, value: 45000, contactIndex: 3 },
    { title: 'Cloud Migration Assessment', source: 'LinkedIn', status: LeadStatus.NEW, value: 12000, contactIndex: 4 },
    { title: 'Multi-Year Contract', source: 'Sales Team', status: LeadStatus.CONTACTED, value: 150000, contactIndex: 5 },
    { title: 'Training Program', source: 'Marketing Campaign', status: LeadStatus.UNQUALIFIED, value: 8000, contactIndex: 6 },
    { title: 'Custom Development Project', source: 'Website', status: LeadStatus.NEW, value: 35000, contactIndex: 7 },
    { title: 'Support Contract Extension', source: 'Customer Success', status: LeadStatus.QUALIFIED, value: 18000, contactIndex: 8 },
    { title: 'Pilot Program', source: 'Trade Show', status: LeadStatus.CONVERTED, value: 5000, contactIndex: 9 },
  ];

  const leads: any[] = [];
  for (const lead of leadsData) {
    const { contactIndex, ...leadData } = lead;
    const created = await prisma.lead.create({
      data: {
        title: leadData.title,
        source: leadData.source,
        status: leadData.status,
        value: leadData.value,
        contactId: contacts[contactIndex].id,
        ownerId: admin.id,
      },
    });
    leads.push(created);
  }
  
  console.log('✅ Leads created');

  // ===========================================
  // Create Sample Deals (CRM)
  // ===========================================
  const dealsData = [
    { title: 'Acme Corp Enterprise Deal', value: 75000, stage: DealStage.PROPOSAL, probability: 60, contactIndex: 0 },
    { title: 'Tech Startup Annual Contract', value: 36000, stage: DealStage.NEGOTIATION, probability: 75, contactIndex: 1 },
    { title: 'Global Enterprises Expansion', value: 120000, stage: DealStage.QUALIFICATION, probability: 30, contactIndex: 2 },
    { title: 'Innovate Co Marketing Suite', value: 28000, stage: DealStage.CLOSED_WON, probability: 100, contactIndex: 3 },
    { title: 'MegaCorp Integration', value: 95000, stage: DealStage.PROSPECTING, probability: 10, contactIndex: 4 },
    { title: 'Finance Plus Premium Package', value: 42000, stage: DealStage.PROPOSAL, probability: 50, contactIndex: 5 },
    { title: 'Retail King Implementation', value: 68000, stage: DealStage.NEGOTIATION, probability: 80, contactIndex: 6 },
    { title: 'Healthcare Solutions Contract', value: 55000, stage: DealStage.CLOSED_LOST, probability: 0, contactIndex: 7 },
    { title: 'Logistics Pro Optimization', value: 38000, stage: DealStage.QUALIFICATION, probability: 40, contactIndex: 8 },
    { title: 'EduTech Academy License', value: 22000, stage: DealStage.CLOSED_WON, probability: 100, contactIndex: 9 },
  ];

  for (const deal of dealsData) {
    const { contactIndex, ...dealData } = deal;
    await prisma.deal.create({
      data: {
        title: dealData.title,
        value: dealData.value,
        stage: dealData.stage,
        probability: dealData.probability,
        expectedCloseDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        contactId: contacts[contactIndex].id,
        ownerId: admin.id,
      },
    });
  }
  
  console.log('✅ Deals created');

  // ===========================================
  // Create Sample Products (ERP)
  // ===========================================
  const productsData = [
    { name: 'Basic Plan - Monthly', sku: 'PLAN-BASIC-M', description: 'Basic subscription plan with essential features', price: 29.99, cost: 5.00, stockQuantity: 999 },
    { name: 'Professional Plan - Monthly', sku: 'PLAN-PRO-M', description: 'Professional plan with advanced features', price: 79.99, cost: 15.00, stockQuantity: 999 },
    { name: 'Enterprise Plan - Monthly', sku: 'PLAN-ENT-M', description: 'Enterprise plan with full feature set', price: 199.99, cost: 40.00, stockQuantity: 999 },
    { name: 'Basic Plan - Annual', sku: 'PLAN-BASIC-A', description: 'Annual basic subscription (2 months free)', price: 299.99, cost: 50.00, stockQuantity: 999 },
    { name: 'Professional Plan - Annual', sku: 'PLAN-PRO-A', description: 'Annual professional subscription (2 months free)', price: 799.99, cost: 150.00, stockQuantity: 999 },
    { name: 'Enterprise Plan - Annual', sku: 'PLAN-ENT-A', description: 'Annual enterprise subscription (2 months free)', price: 1999.99, cost: 400.00, stockQuantity: 999 },
    { name: 'Implementation Service', sku: 'SVC-IMPL', description: 'Professional implementation and setup service', price: 2499.99, cost: 1000.00, stockQuantity: 100 },
    { name: 'Training Package', sku: 'SVC-TRAIN', description: 'Comprehensive training for your team', price: 999.99, cost: 300.00, stockQuantity: 100 },
    { name: 'Premium Support', sku: 'SVC-SUPPORT', description: '24/7 premium support add-on', price: 149.99, cost: 30.00, stockQuantity: 999 },
    { name: 'API Access Add-on', sku: 'ADD-API', description: 'Extended API access and higher rate limits', price: 99.99, cost: 10.00, stockQuantity: 999 },
    { name: 'Custom Integration', sku: 'SVC-INTEG', description: 'Custom integration development service', price: 4999.99, cost: 2000.00, stockQuantity: 50 },
    { name: 'Data Migration Service', sku: 'SVC-MIGRATE', description: 'Professional data migration assistance', price: 1499.99, cost: 500.00, stockQuantity: 100 },
  ];

  const products: any[] = [];
  for (const product of productsData) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
    products.push(created);
  }
  
  console.log('✅ Products created');

  // ===========================================
  // Create Sample Customers (ERP)
  // ===========================================
  const customersData = [
    { name: 'Acme Corporation', email: 'billing@acmecorp.com', phone: '+1-555-1001', billingAddress: '123 Business Ave', billingCity: 'New York', billingCountry: 'USA', billingPostal: '10001' },
    { name: 'Tech Startup Inc', email: 'accounts@techstartup.io', phone: '+1-555-1002', billingAddress: '456 Innovation Blvd', billingCity: 'San Francisco', billingCountry: 'USA', billingPostal: '94105' },
    { name: 'Global Enterprises', email: 'finance@globalenterprises.com', phone: '+1-555-1003', billingAddress: '789 Corporate Dr', billingCity: 'Los Angeles', billingCountry: 'USA', billingPostal: '90001' },
    { name: 'Innovate Co', email: 'payments@innovate.co', phone: '+1-555-1004', billingAddress: '321 Startup Lane', billingCity: 'Chicago', billingCountry: 'USA', billingPostal: '60601' },
    { name: 'MegaCorp', email: 'ap@megacorp.net', phone: '+1-555-1005', billingAddress: '555 Enterprise Way', billingCity: 'Houston', billingCountry: 'USA', billingPostal: '77001' },
    { name: 'Finance Plus', email: 'invoices@financeplus.com', phone: '+1-555-1006', billingAddress: '888 Money St', billingCity: 'Boston', billingCountry: 'USA', billingPostal: '02101' },
    { name: 'Retail King', email: 'billing@retailking.com', phone: '+1-555-1007', billingAddress: '999 Commerce Pkwy', billingCity: 'Seattle', billingCountry: 'USA', billingPostal: '98101' },
    { name: 'Healthcare Solutions', email: 'accounts@healthcare.org', phone: '+1-555-1008', billingAddress: '111 Medical Center Dr', billingCity: 'Miami', billingCountry: 'USA', billingPostal: '33101' },
  ];

  const customers: any[] = [];
  for (const customer of customersData) {
    const created = await prisma.customer.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        ...customer,
        shippingAddress: customer.billingAddress,
        shippingCity: customer.billingCity,
        shippingCountry: customer.billingCountry,
        shippingPostal: customer.billingPostal,
      },
    });
    customers.push(created);
  }
  
  console.log('✅ Customers created');

  // ===========================================
  // Create Sample Orders (ERP)
  // ===========================================
  const ordersData = [
    { customerIndex: 0, status: OrderStatus.DELIVERED, items: [{ productIndex: 5, quantity: 1 }, { productIndex: 6, quantity: 1 }] },
    { customerIndex: 1, status: OrderStatus.PROCESSING, items: [{ productIndex: 2, quantity: 1 }, { productIndex: 8, quantity: 1 }] },
    { customerIndex: 2, status: OrderStatus.DRAFT, items: [{ productIndex: 4, quantity: 2 }] },
    { customerIndex: 3, status: OrderStatus.CONFIRMED, items: [{ productIndex: 1, quantity: 5 }] },
    { customerIndex: 4, status: OrderStatus.SHIPPED, items: [{ productIndex: 7, quantity: 3 }] },
    { customerIndex: 5, status: OrderStatus.DELIVERED, items: [{ productIndex: 5, quantity: 1 }, { productIndex: 9, quantity: 1 }] },
    { customerIndex: 6, status: OrderStatus.PROCESSING, items: [{ productIndex: 10, quantity: 1 }] },
    { customerIndex: 7, status: OrderStatus.CONFIRMED, items: [{ productIndex: 2, quantity: 2 }] },
    { customerIndex: 0, status: OrderStatus.DELIVERED, items: [{ productIndex: 11, quantity: 1 }] },
    { customerIndex: 1, status: OrderStatus.CANCELLED, items: [{ productIndex: 0, quantity: 10 }] },
    { customerIndex: 2, status: OrderStatus.SHIPPED, items: [{ productIndex: 3, quantity: 1 }, { productIndex: 8, quantity: 1 }] },
    { customerIndex: 3, status: OrderStatus.PROCESSING, items: [{ productIndex: 6, quantity: 1 }] },
  ];

  let orderNumber = 1000;
  for (const orderData of ordersData) {
    orderNumber++;
    
    // Calculate totals
    let subtotal = 0;
    const orderItems: any[] = [];
    
    for (const item of orderData.items) {
      const product = products[item.productIndex];
      const total = Number(product.price) * item.quantity;
      subtotal += total;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        discount: 0,
        total: total,
      });
    }
    
    const taxRate = 0.08;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    await prisma.salesOrder.create({
      data: {
        orderNumber: `ORD-${orderNumber}`,
        status: orderData.status,
        customerId: customers[orderData.customerIndex].id,
        userId: admin.id,
        subtotal: subtotal,
        taxRate: taxRate * 100,
        taxAmount: taxAmount,
        discount: 0,
        total: total,
        items: {
          create: orderItems,
        },
      },
    });
  }
  
  console.log('✅ Orders created');

  // ===========================================
  // Done!
  // ===========================================
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - 1 Admin user (admin@cms.local / Admin@123)`);
  console.log(`   - ${categoriesData.length} Categories`);
  console.log(`   - ${postsData.length} Posts`);
  console.log(`   - ${contactsData.length} Contacts`);
  console.log(`   - ${leadsData.length} Leads`);
  console.log(`   - ${dealsData.length} Deals`);
  console.log(`   - ${productsData.length} Products`);
  console.log(`   - ${customersData.length} Customers`);
  console.log(`   - ${ordersData.length} Orders`);
  
  await prisma.$disconnect();
  await pool.end();
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });
