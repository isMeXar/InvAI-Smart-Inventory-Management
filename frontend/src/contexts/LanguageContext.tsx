import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'de' | 'fr';

interface TranslationValues {
  // Navigation
  dashboard: string;
  users: string;
  products: string;
  suppliers: string;
  orders: string;
  forecasts: string;
  profile: string;
  settings: string;
  logout: string;
  manageAccount: string;
  
  // Dashboard translations
  welcomeBackUser: string;
  inventoryToday: string;
  fromLastMonth: string;
  recentOrders: string;
  orderedBy: string;
  qty: string;
  lowStockAlerts: string;
  left: string;
  reorderNeeded: string;
  allProductsStocked: string;
  unknownUser: string;
  delivered: string;
  shipped: string;
  processing: string;
  totalOrders: string;   // Added to match fr translations
  
  // AI Insights translations
  aiInsights: string;
  analyzingData: string;
  dataVisualization: string;
  aiRecommendations: string;
  close: string;
  regenerateInsights: string;
  generateInsights: string;
  generateAiInsights: string;
  smartInventoryAIInsights: string;
  basedOnInventoryData: string;
  laptopProLow: string;
  electronicsGrowth: string;
  officeSuppliesOptimal: string;
  considerBundleDeals: string;
  productPerformanceAnalysis: string;
  aiAnalysisProducts: string;
  topPerformerHeadphones: string;
  slowMoverDesk: string;
  reorderAlertSmartphone: string;
  
  // Forecasts translations
  demandForecasting: string;
  aiPoweredPredictions: string;
  forecastPeriod: string;
  predictedDemand: string;
  expectedUnits: string;
  monthOverMonth: string;
  predictedRevenue: string;
  expectedRevenue: string;
  growthRate: string;
  productsTracked: string;
  activeForecasts: string;
  acrossCategories: string;
  forecastAnalysis: string;
  productsWithSufficientStock: string;
  needReordering: string;
  clients: string;
  revenue: string;
  detailedForecasts: string;
  product: string;
  category: string;
  month: string;
  currentStock: string;
  stockStatus: string;
  id: string;
  sufficient: string;
  needMore: string;
  accessDenied: string;
  noPermissionToView: string;
  onlyManagersAndAdminsCanAccessForecasting: string;
  unitsNextMonths: string;
  priceOptimizationMonitor: string;
  orderPatternIntelligence: string;
  machineLearningAnalysis: string;
  peakOrderingTime: string;
  bulkOrderOpportunity: string;
  seasonalTrendElectronics: string;
  crossSellPotential: string;
  demandForecastingInsights: string;
  predictiveAnalytics: string;
  projectedSmartphoneIncrease: string;
  seasonalDeclineOfficeSupplies: string;
  recommendedSafetyStock: string;
  considerPreordering: string;
  
  // Login
  welcomeBack: string;
  signInToAccount: string;
  password: string;
  enterPassword: string;
  signIn: string;
  signingIn: string;
  demoUsers: string;
  noAccount: string;
  backToHome: string;
  admin: string;
  manager: string;
  employee: string;
  
  // Landing Page
  smartInventory: string;
  management: string;
  landingSubtitle: string;
  getStarted: string;
  watchDemo: string;
  powerfulFeatures: string;
  featuresSubtitle: string;
  howItWorks: string;
  howItWorksSubtitle: string;
  readyTransform: string;
  readySubtitle: string;
  getStartedNow: string;
  copyright: string;
  smartInventoryTracking: string;
  smartInventoryTrackingDesc: string;
  aiPoweredInsights: string;
  aiPoweredInsightsDesc: string;
  multiUserSupport: string;
  multiUserSupportDesc: string;
  demandForecastingDesc: string;
  secureReliable: string;
  secureReliableDesc: string;
  lightningFast: string;
  lightningFastDesc: string;
  setupInventory: string;
  setupInventoryDesc: string;
  configureTeam: string;
  configureTeamDesc: string;
  getAIInsights: string;
  getAIInsightsDesc: string;
  
  // Common
  search: string;
  add: string;
  edit: string;
  delete: string;
  view: string;
  save: string;
  cancel: string;
  loading: string;
  actions: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  price: string;
  quantity: string;
  total: string;
  description: string;
  contact: string;
  supplier: string;
  customer: string;
  date: string;
  client: string;
  
  // Auth & Registration
  confirmPassword: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  profilePicture: string;
  joinSmartInventory: string;
  createYourAccount: string;
  enterYourName: string;
  enterYourEmail: string;
  enterYourPhoneNumber: string;
  createPassword: string;
  creatingAccount: string;
  createAccount: string;
  alreadyHaveAccount: string;
  signInHere: string;
  passwordMismatchTitle: string;
  passwordMismatchDescription: string;
  accountCreatedTitle: string;
  accountCreatedDescription: string;
  
  // User Management
  userManagement: string;
  addUser: string;
  totalUsers: string;
  administrators: string;
  managers: string;
  userDirectory: string;
  manageUserAccounts: string;
  activeSystemUsers: string;
  systemAdministrators: string;
  departmentManagers: string;
  usersByRole: string;
  onlyAdministrators: string;
  searchUsers: string;
  filterByRole: string;
  allRoles: string;
  userNotFound: string;
  
  // Products
  productManagement: string;
  addProduct: string;
  totalProducts: string;
  lowStockItems: string;
  categories: string;
  inventoryLevel: string;
  revenuePerProduct: string;
  manageProductInventory: string;
  trackStockLevels: string;
  activeProducts: string;
  fromProductSales: string;
  needRestocking: string;
  productCategories: string;
  addNewProduct: string;
  productName: string;
  selectCategory: string;
  selectSupplier: string;
  quantityInStock: string;
  minimumStockLevel: string;
  productDescription: string;
  searchProducts: string;
  searchByNameCategory: string;
  allCategories: string;
  allSuppliers: string;
  allLevels: string;
  low: string;
  stockLevel: string;
  minStock: string;
  totalValue: string;
  loadingProducts: string;
  unknownProduct: string;
  
  // Suppliers
  supplierManagement: string;
  addSupplier: string;
  totalSuppliers: string;
  supplierDirectory: string;
  manageSupplierRelationships: string;
  trackPerformance: string;
  activeSuppliers: string;
  suppliedProducts: string;
  fromAllSuppliers: string;
  productsBySupplier: string;
  revenueBySupplier: string;
  contactInformation: string;
  searchSuppliers: string;
  supplierNotFound: string;
  addNewSupplier: string;
  contactEmail: string;
  address: string;
  productsSupplied: string;
  viewSupplier: string;
  editSupplier: string;
  supplierName: string;
  enterSupplierName: string;
  enterContactEmail: string;
  enterPhoneNumber: string;
  
  // Orders
  orderManagement: string;
  newOrder: string;
  pendingOrders: string;
  completed: string;
  orderHistory: string;
  trackCustomerOrders: string;
  manageFulfillment: string;
  allTimeOrders: string;
  fromAllOrders: string;
  needAttention: string;
  successfullyDelivered: string;
  ordersByStatus: string;
  ordersPerProduct: string;
  monthlyOrdersRevenue: string;
  orderID: string;
  searchOrders: string;
  filterByStatus: string;
  allStatus: string;
  pending: string;
  orderNotFound: string;
  addNewOrder: string;
  clientName: string;
  orderDate: string;
  orderStatus: string;
  ordersLineName: string;
  revenueLineName: string;
  
  // Profile
  personalInformation: string;
  activitySummary: string;
  editProfile: string;
  totalSpent: string;
  favoriteCategories: string;
  orderHistoryChart: string;
  totalEarned: string;
  totalGenerated: string;
  noUserData: string;
  unableToLoadProfile: string;
  
  // Settings
  accountSecurity: string;
  appearance: string;
  notificationPreferences: string;
  systemPreferences: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  updatePassword: string;
  twoFactorAuth: string;
  theme: string;
  light: string;
  dark: string;
  system: string;
  language: string;
  saveAllSettings: string;
  manageAccountPreferences: string;
  securitySettings: string;
  enterCurrentPassword: string;
  enterNewPassword: string;
  confirmNewPassword: string;
  enable2FA: string;
  extraLayerSecurity: string;
  compactMode: string;
  showMoreContent: string;
  animations: string;
  enableSmoothTransitions: string;
  deliveryMethods: string;
  emailNotifications: string;
  receiveUpdatesEmail: string;
  pushNotifications: string;
  receiveBrowserNotifications: string;
  notificationTypes: string;
  orderUpdates: string;
  statusChangesTracking: string;
  inventoryAlerts: string;
  lowStockReorder: string;
  weeklyReports: string;
  performanceSummaries: string;
  dataPrivacy: string;
  analytics: string;
  helpImproveSystem: string;
  dataExport: string;
  downloadYourData: string;
  export: string;
  languageRegion: string;
  timezone: string;

  // Other
  details: string;

}

const translations: Record<Language, TranslationValues> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    users: 'Users',
    products: 'Products',
    suppliers: 'Suppliers',
    orders: 'Orders',
    forecasts: 'Forecasts',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    manageAccount: 'Manage your account settings and view your activity',
    
    // Dashboard translations
    welcomeBackUser: 'Welcome back, {name}! 👋',
    inventoryToday: 'Here\'s what\'s happening with your inventory today.',
    fromLastMonth: 'from last month',
    recentOrders: 'Recent Orders',
    orderedBy: 'Ordered by {name}',
    qty: 'Qty:',
    lowStockAlerts: 'Low Stock Alerts',
    left: 'left',
    reorderNeeded: 'Reorder needed',
    allProductsStocked: 'All products are well stocked!',
    unknownUser: 'Unknown User',
    delivered: 'Delivered',
    shipped: 'Shipped',
    processing: 'Processing',
    totalProducts: 'Total Products', // Added to match interface
    totalUsers: 'Total Users',       // Added to match interface
    totalSuppliers: 'Total Suppliers', // Added to match interface
    
    // AI Insights translations
    aiInsights: 'AI Insights',
    analyzingData: 'Analyzing data with AI...',
    dataVisualization: 'Data Visualization',
    aiRecommendations: 'AI Recommendations',
    close: 'Close',
    regenerateInsights: 'Regenerate Insights',
    generateInsights: 'Generate Insights',
    generateAiInsights: 'Generate AI-powered insights from your data',
    smartInventoryAIInsights: 'Smart Inventory AI Insights',
    basedOnInventoryData: 'Based on your current inventory data and trends, here are the key insights:',
    laptopProLow: 'Laptop Pro inventory is running low - consider restocking within 2 weeks',
    electronicsGrowth: 'Electronics category shows 15% growth trend - increase safety stock',
    officeSuppliesOptimal: 'Office Supplies have optimal turnover rates - maintain current levels',
    considerBundleDeals: 'Consider introducing Bundle deals for Laptop Pro + Wireless Headphones',
    productPerformanceAnalysis: 'Product Performance Analysis',
    aiAnalysisProducts: 'AI analysis of your product portfolio reveals optimization opportunities:',
    topPerformerHeadphones: 'Top performer: Wireless Headphones with 23% margin improvement',
    slowMoverDesk: 'Slow mover: Standing Desk - consider promotional pricing',
    reorderAlertSmartphone: 'Reorder alert: Smartphone X stock will deplete in 12 days',
    priceOptimizationMonitor: 'Price optimization: LED Monitor can support 8% price increase',
    orderPatternIntelligence: 'Order Pattern Intelligence',
    machineLearningAnalysis: 'Machine learning analysis of order patterns and customer behavior:',
    peakOrderingTime: 'Peak ordering time: Tuesdays 10-11 AM - schedule staff accordingly',
    bulkOrderOpportunity: 'Bulk order opportunity: Customer #2 shows increasing order frequency',
    seasonalTrendElectronics: 'Seasonal trend: Electronics orders increase 40% in Q4',
    crossSellPotential: 'Cross-sell potential: 67% of laptop buyers also purchase accessories',
    demandForecastingInsights: 'Demand Forecasting Insights',
    predictiveAnalytics: 'Predictive analytics for upcoming inventory and demand trends:',
    projectedSmartphoneIncrease: 'Projected 30% increase in Smartphone X demand next month',
    seasonalDeclineOfficeSupplies: 'Seasonal decline expected for Office Supplies in summer months',
    recommendedSafetyStock: 'Recommended safety stock increase for Wireless Headphones',
    considerPreordering: 'Consider pre-ordering Laptop Pro for Q4 holiday season demand',
    
    // Placeholders
    enterSupplierName: 'Enter supplier name',
    enterContactEmail: 'Enter contact email',
    enterPhoneNumber: 'Enter phone number',
    // Login
    welcomeBack: 'Welcome Back',
    signInToAccount: 'Sign in to your Smart Inventory account',
    password: 'Password',
    enterPassword: 'Enter your password',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    demoUsers: 'Demo Users (Password: demo123)',
    noAccount: 'Don\'t have an account? Only your manager can create one for you.',
    backToHome: 'Back to Home',
    admin: 'Admin',
    manager: 'Manager',
    employee: 'Employee',
    
    // Landing Page
    smartInventory: 'Smart Inventory',
    management: 'Management',
    landingSubtitle: 'Revolutionize your inventory management with AI-powered insights, real-time tracking, and intelligent forecasting. Streamline operations and boost efficiency.',
    getStarted: 'Get Started',
    watchDemo: 'Watch Demo',
    powerfulFeatures: 'Powerful Features',
    featuresSubtitle: 'Everything you need to manage your inventory efficiently and effectively',
    howItWorks: 'How It Works',
    howItWorksSubtitle: 'Get started in minutes with our intuitive three-step process',
    readyTransform: 'Ready to Transform Your Inventory?',
    readySubtitle: 'Join thousands of businesses already using Smart Inventory to optimize their operations',
    getStartedNow: 'Get Started Now',
    copyright: '© 2025 Smart Inventory Management System. All rights reserved.',
    smartInventoryTracking: 'Smart Inventory Tracking',
    smartInventoryTrackingDesc: 'Real-time inventory management with automated alerts and restocking recommendations.',
    aiPoweredInsights: 'AI-Powered Insights',
    aiPoweredInsightsDesc: 'Advanced analytics and forecasting to optimize your inventory levels and reduce waste.',
    multiUserSupport: 'Multi-User Support',
    multiUserSupportDesc: 'Role-based access control for admins, managers, and employees with customizable permissions.',
    demandForecasting: 'Demand Forecasting',
    demandForecastingDesc: 'Predict future demand trends using machine learning algorithms and historical data.',
    secureReliable: 'Secure & Reliable',
    secureReliableDesc: 'Enterprise-grade security with data encryption and regular automated backups.',
    lightningFast: 'Lightning Fast',
    lightningFastDesc: 'Optimized performance with real-time updates and lightning-fast search capabilities.',
    setupInventory: 'Set Up Your Inventory',
    setupInventoryDesc: 'Import your existing inventory or start fresh with our easy-to-use product management system.',
    configureTeam: 'Configure Your Team',
    configureTeamDesc: 'Add team members with appropriate roles and permissions for seamless collaboration.',
    getAIInsights: 'Get AI Insights',
    getAIInsightsDesc: 'Let our AI analyze your data and provide actionable insights for optimal inventory management.',
    
    // Common
    search: 'Search',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading',
    actions: 'Actions',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    status: 'Status',
    category: 'Category',
    price: 'Price',
    quantity: 'Quantity',
    revenue: 'Revenue',
    total: 'Total',
    description: 'Description',
    contact: 'Contact',
    supplier: 'Supplier',
    customer: 'Customer',
    date: 'Date',
    client: 'Client',
    
    // Forecasts
    aiPoweredPredictions: 'AI-powered predictions for inventory planning and revenue forecasting',
    forecastPeriod: 'September - October 2024',
    predictedDemand: 'Predicted Demand',
    expectedUnits: 'Units next 2 months',
    monthOverMonth: 'Month over month',
    predictedRevenue: 'Predicted Revenue',
    expectedRevenue: 'Expected revenue',
    growthRate: 'Growth Rate',
    productsTracked: 'Products Tracked',
    activeForecasts: 'Active forecasts',
    acrossCategories: 'Across {count} categories',
    forecastAnalysis: 'Forecast Analysis',
    productsWithSufficientStock: 'Products with sufficient stock',
    needReordering: 'Need reordering',
    clients: 'Clients',
    detailedForecasts: 'Detailed Forecasts',
    product: 'Product',
    month: 'Month',
    currentStock: 'Current Stock',
    stockStatus: 'Stock Status',
    id: 'ID',
    sufficient: 'Sufficient',
    needMore: 'Need {count} more',
    accessDenied: 'Access Denied',
    noPermissionToView: 'You don\'t have permission to view this page',
    onlyManagersAndAdminsCanAccessForecasting: 'Only managers and administrators can access forecasting data',
    unitsNextMonths: 'Units next 2 months',
    
    // Auth & Registration
    confirmPassword: 'Confirm Password',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    profilePicture: 'Profile Picture',
    joinSmartInventory: 'Join Smart Inventory',
    createYourAccount: 'Create Your Account',
    enterYourName: 'Enter your name',
    enterYourEmail: 'Enter your email',
    enterYourPhoneNumber: 'Enter your phone number',
    createPassword: 'Create Password',
    creatingAccount: 'Creating your account...',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    signInHere: 'Sign in here',
    passwordMismatchTitle: 'Password Mismatch',
    passwordMismatchDescription: 'The passwords you entered do not match.',
    accountCreatedTitle: 'Account Created',
    accountCreatedDescription: 'Your account has been created successfully! You are now logged in.',
    
    // User Management
    userManagement: 'User Management',
    addUser: 'Add User',
    // totalUsers: 'Total Users',
    administrators: 'Administrators',
    managers: 'Managers',
    userDirectory: 'User Directory',
    manageUserAccounts: 'Manage user accounts, roles, and permissions',
    activeSystemUsers: 'Active system users',
    systemAdministrators: 'System administrators',
    departmentManagers: 'Department managers',
    usersByRole: 'Users by Role',
    onlyAdministrators: 'Only administrators can access the user management page.',
    searchUsers: 'Search users...',
    filterByRole: 'Filter by role',
    allRoles: 'All Roles',
    userNotFound: 'No users found matching your criteria.',
    
    // Products
    productManagement: 'Product Management',
    addProduct: 'Add Product',
    lowStockItems: 'Low Stock Items',
    categories: 'Categories',
    inventoryLevel: 'Inventory Level',
    revenuePerProduct: 'Revenue per Product',
    manageProductInventory: 'Manage your product inventory and track stock levels',
    trackStockLevels: 'Track stock levels',
    activeProducts: 'Active products',
    fromProductSales: 'From product sales',
    needRestocking: 'Need restocking',
    productCategories: 'Product categories',
    addNewProduct: 'Add New Product',
    productName: 'Product Name',
    selectCategory: 'Select category',
    selectSupplier: 'Select supplier',
    quantityInStock: 'Quantity in Stock',
    minimumStockLevel: 'Minimum Stock Level',
    productDescription: 'Product description...',
    searchProducts: 'Search Products',
    searchByNameCategory: 'Search by name or category...',
    allCategories: 'All Categories',
    allSuppliers: 'All Suppliers',
    allLevels: 'All Levels',
    low: 'Low',
    stockLevel: 'Stock Level',
    minStock: 'Min Stock',
    totalValue: 'Total Value',
    loadingProducts: 'Loading products...',
    unknownProduct: 'Unknown Product',
    
    // Suppliers
    supplierManagement: 'Supplier Management',
    addSupplier: 'Add Supplier',
    supplierDirectory: 'Supplier Directory',
    manageSupplierRelationships: 'Manage supplier relationships and track performance',
    trackPerformance: 'Track performance',
    activeSuppliers: 'Active suppliers',
    suppliedProducts: 'Supplied products',
    fromAllSuppliers: 'From all suppliers',
    productsBySupplier: 'Products by Supplier',
    revenueBySupplier: 'Revenue by Supplier',
    contactInformation: 'Contact Information',
    searchSuppliers: 'Search suppliers...',
    supplierNotFound: 'No suppliers found matching your criteria.',
    addNewSupplier: 'Add New Supplier',
    contactEmail: 'Contact Email',
    address: 'Address',
    productsSupplied: 'Products Supplied',
    viewSupplier: 'View Supplier',
    editSupplier: 'Edit Supplier',
    supplierName: 'Supplier Name',
    
    // Orders
    orderManagement: 'Order Management',
    newOrder: 'New Order',
    totalOrders: 'Total Orders',
    pendingOrders: 'Pending Orders',
    completed: 'Completed',
    orderHistory: 'Order History',
    trackCustomerOrders: 'Track and manage customer orders and fulfillment',
    manageFulfillment: 'Manage fulfillment',
    allTimeOrders: 'All time orders',
    fromAllOrders: 'From all orders',
    needAttention: 'Need attention',
    successfullyDelivered: 'Successfully delivered',
    ordersByStatus: 'Orders by Status',
    ordersPerProduct: 'Orders per Product',
    monthlyOrdersRevenue: 'Monthly Orders vs Revenue',
    orderID: 'Order ID',
    searchOrders: 'Search orders...',
    filterByStatus: 'Filter by status',
    allStatus: 'All Status',
    pending: 'Pending',
    orderNotFound: 'No orders found matching your criteria.',
    addNewOrder: 'Add New Order',
    clientName: 'Client Name',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    ordersLineName: 'Orders',
    revenueLineName: 'Revenue',
    
    // Profile
    personalInformation: 'Personal Information',
    activitySummary: 'Activity Summary',
    editProfile: 'Edit Profile',
    totalSpent: 'Total Earned',
    favoriteCategories: 'Favorite Categories',
    orderHistoryChart: 'Order History',
    totalEarned: 'Total Earned',
    totalGenerated: 'Total Generated',
    noUserData: 'No user data available',
    unableToLoadProfile: 'Unable to load user profile information.',
    
    // Settings
    accountSecurity: 'Account Security',
    appearance: 'Appearance',
    notificationPreferences: 'Notification Preferences',
    systemPreferences: 'System Preferences',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    updatePassword: 'Update Password',
    twoFactorAuth: 'Two-Factor Authentication',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    saveAllSettings: 'Save All Settings',
    manageAccountPreferences: 'Manage your account preferences and security settings',
    securitySettings: 'Security settings',
    enterCurrentPassword: 'Enter current password',
    enterNewPassword: 'Enter new password',
    confirmNewPassword: 'Confirm new password',
    enable2FA: 'Enable 2FA',
    extraLayerSecurity: 'Add an extra layer of security to your account',
    compactMode: 'Compact Mode',
    showMoreContent: 'Show more content in less space',
    animations: 'Animations',
    enableSmoothTransitions: 'Enable smooth transitions and effects',
    deliveryMethods: 'Delivery Methods',
    emailNotifications: 'Email Notifications',
    receiveUpdatesEmail: 'Receive updates via email',
    pushNotifications: 'Push Notifications',
    receiveBrowserNotifications: 'Receive browser notifications',
    notificationTypes: 'Notification Types',
    orderUpdates: 'Order Updates',
    statusChangesTracking: 'Status changes and tracking',
    inventoryAlerts: 'Inventory Alerts',
    lowStockReorder: 'Low stock and reorder alerts',
    weeklyReports: 'Weekly Reports',
    performanceSummaries: 'Performance summaries',
    dataPrivacy: 'Data & Privacy',
    analytics: 'Analytics',
    helpImproveSystem: 'Help improve the system',
    dataExport: 'Data Export',
    downloadYourData: 'Download your data',
    export: 'Export',
    languageRegion: 'Language & Region',
    timezone: 'Timezone',

    // Other
    details: 'Details', 
  },

  de: {
    // Navigation
    dashboard: 'Dashboard',
    users: 'Benutzer',
    products: 'Produkte',
    suppliers: 'Lieferanten',
    orders: 'Bestellungen',
    forecasts: 'Prognosen',
    profile: 'Profil',
    settings: 'Einstellungen',
    logout: 'Abmelden',
    manageAccount: 'Verwalten Sie Ihre Kontoeinstellungen und sehen Sie Ihre Aktivität',
    
    // Placeholders
    enterSupplierName: 'Lieferantenname eingeben',
    enterContactEmail: 'Kontakt-E-Mail eingeben',
    enterPhoneNumber: 'Telefonnummer eingeben',

    // Dashboard translations
    welcomeBackUser: 'Willkommen zurück, {name}! 👋',
    inventoryToday: 'Hier ist, was heute mit Ihrem Inventar passiert.',
    fromLastMonth: 'vom letzten Monat',
    orderedBy: 'Bestellt von {name}',
    qty: 'Menge:',
    lowStockAlerts: 'Warnungen bei niedrigem Bestand',
    left: 'übrig',
    reorderNeeded: 'Nachbestellung erforderlich',
    allProductsStocked: 'Alle Produkte sind gut bevorratet!',
    unknownUser: 'Unbekannter Benutzer',
    delivered: 'Geliefert',
    shipped: 'Versendet',
    processing: 'In Bearbeitung',
    totalProducts: 'Produkte gesamt', // Added to match interface
    totalUsers: 'Benutzer gesamt',    // Added to match interface
    totalSuppliers: 'Lieferanten gesamt', // Added to match interface
    
    // AI Insights translations
    aiInsights: 'KI-Erkenntnisse',
    analyzingData: 'Analysiere Daten mit KI...',
    dataVisualization: 'Datenvisualisierung',
    aiRecommendations: 'KI-Empfehlungen',
    close: 'Schließen',
    regenerateInsights: 'Erkenntnisse neu generieren',
    generateInsights: 'Erkenntnisse generieren',
    generateAiInsights: 'Generieren Sie KI-gestützte Erkenntnisse aus Ihren Daten',
    smartInventoryAIInsights: 'Smart Inventory KI-Erkenntnisse',
    basedOnInventoryData: 'Basierend auf Ihren aktuellen Bestandsdaten und Trends, hier die wichtigsten Erkenntnisse:',
    laptopProLow: 'Laptop Pro Bestand ist niedrig - erwägen Sie eine Nachbestellung innerhalb von 2 Wochen',
    electronicsGrowth: 'Elektronikkategorie zeigt 15% Wachstumstrend - Sicherheitsbestand erhöhen',
    officeSuppliesOptimal: 'Bürobedarf hat optimale Umschlagsraten - aktuelle Niveaus beibehalten',
    considerBundleDeals: 'Erwägen Sie die Einführung von Bündelangeboten für Laptop Pro + Wireless Kopfhörer',
    productPerformanceAnalysis: 'Produktleistungsanalyse',
    aiAnalysisProducts: 'KI-Analyse Ihres Produktportfolios zeigt Optimierungsmöglichkeiten:',
    topPerformerHeadphones: 'Spitzenreiter: Wireless Kopfhörer mit 23% Margenverbesserung',
    slowMoverDesk: 'Langsamer Verkäufer: Stehschreibtisch - erwägen Sie Aktionspreise',
    reorderAlertSmartphone: 'Nachbestellungsalarm: Smartphone X Bestand wird in 12 Tagen aufgebraucht sein',
    priceOptimizationMonitor: 'Preisoptimierung: LED-Monitor kann 8% Preiserhöhung unterstützen',
    orderPatternIntelligence: 'Bestellmuster-Intelligenz',
    machineLearningAnalysis: 'Maschinelles Lernen Analyse von Bestellmustern und Kundenverhalten:',
    peakOrderingTime: 'Hauptbestellzeit: Dienstags 10-11 Uhr - planen Sie Personal entsprechend',
    bulkOrderOpportunity: 'Großbestellungsmöglichkeit: Kunde #2 zeigt zunehmende Bestellhäufigkeit',
    seasonalTrendElectronics: 'Saisonaler Trend: Elektronikbestellungen steigen im 4. Quartal um 40%',
    crossSellPotential: 'Cross-Selling-Potenzial: 67% der Laptop-Käufer kaufen auch Zubehör',
    demandForecastingInsights: 'Nachfrageprognose-Erkenntnisse',
    predictiveAnalytics: 'Prädiktive Analytik für kommende Bestands- und Nachfragetrends:',
    projectedSmartphoneIncrease: 'Prognostizierte 30% Steigerung der Smartphone X Nachfrage im nächsten Monat',
    seasonalDeclineOfficeSupplies: 'Saisonaler Rückgang für Bürobedarf in den Sommermonaten erwartet',
    recommendedSafetyStock: 'Empfohlene Erhöhung des Sicherheitsbestands für Wireless Kopfhörer',
    considerPreordering: 'Erwägen Sie Vorbestellungen für Laptop Pro für die Nachfrage in der Weihnachtssaison im 4. Quartal',
    
    // Login
    welcomeBack: 'Willkommen zurück',
    signInToAccount: 'Melden Sie sich bei Ihrem Smart Inventory-Konto an',
    password: 'Passwort',
    enterPassword: 'Geben Sie Ihr Passwort ein',
    signIn: 'Anmelden',
    signingIn: 'Anmeldung...',
    demoUsers: 'Demo-Benutzer (Passwort: demo123)',
    noAccount: 'Sie haben kein Konto? Nur Ihr Manager kann eines für Sie erstellen.',
    backToHome: 'Zurück zur Startseite',
    admin: 'Administrator',
    manager: 'Manager',
    employee: 'Mitarbeiter',
    
    // Landing Page
    smartInventory: 'Smart Inventory',
    management: 'Verwaltung',
    landingSubtitle: 'Revolutionieren Sie Ihr Bestandsmanagement mit KI-gestützten Einblicken, Echtzeitverfolgung und intelligenter Prognose. Optimieren Sie Abläufe und steigern Sie die Effizienz.',
    getStarted: 'Loslegen',
    watchDemo: 'Demo ansehen',
    powerfulFeatures: 'Leistungsstarke Funktionen',
    featuresSubtitle: 'Alles was Sie brauchen, um Ihr Inventar effizient und effektiv zu verwalten',
    howItWorks: 'Wie es funktioniert',
    howItWorksSubtitle: 'Starten Sie in wenigen Minuten mit unserem intuitiven dreistufigen Prozess',
    readyTransform: 'Bereit, Ihr Inventar zu transformieren?',
    readySubtitle: 'Schließen Sie sich Tausenden von Unternehmen an, die bereits Smart Inventory verwenden',
    getStartedNow: 'Jetzt loslegen',
    copyright: '© 2025 Smart Inventory Management System. Alle Rechte vorbehalten.',
    smartInventoryTracking: 'Intelligente Lagerverfolgung',
    smartInventoryTrackingDesc: 'Echtzeit-Lagerverwaltung mit automatisierten Benachrichtigungen und Wiederbeschaffungsempfehlungen.',
    aiPoweredInsights: 'KI-gestützte Einblicke',
    aiPoweredInsightsDesc: 'Erweiterte Analysen und Prognosen zur Optimierung Ihrer Lagerbestände und Reduzierung von Abfall.',
    multiUserSupport: 'Multi-Benutzer-Unterstützung',
    multiUserSupportDesc: 'Rollenbasierte Zugriffskontrolle für Administratoren, Manager und Mitarbeiter mit anpassbaren Berechtigungen.',
    demandForecasting: 'Nachfrageprognose',
    demandForecastingDesc: 'Vorhersage zukünftiger Nachfragetrends mit maschinellen Lernalgorithmen und historischen Daten.',
    secureReliable: 'Sicher & Zuverlässig',
    secureReliableDesc: 'Unternehmensklasse-Sicherheit mit Datenverschlüsselung und regelmäßigen automatisierten Backups.',
    lightningFast: 'Blitzschnell',
    lightningFastDesc: 'Optimierte Leistung mit Echtzeit-Updates und blitzschnellen Suchfunktionen.',
    setupInventory: 'Inventar einrichten',
    setupInventoryDesc: 'Importieren Sie Ihr vorhandenes Inventar oder beginnen Sie neu mit unserem benutzerfreundlichen Produktverwaltungssystem.',
    configureTeam: 'Team konfigurieren',
    configureTeamDesc: 'Fügen Sie Teammitglieder mit entsprechenden Rollen und Berechtigungen für nahtlose Zusammenarbeit hinzu.',
    getAIInsights: 'KI-Einblicke erhalten',
    getAIInsightsDesc: 'Lassen Sie unsere KI Ihre Daten analysieren und umsetzbare Einblicke für optimale Lagerverwaltung bereitstellen.',
    
    // Common
    search: 'Suche',
    add: 'Hinzufügen',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    view: 'Ansehen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    loading: 'Wird geladen',
    actions: 'Aktionen',
    name: 'Name',
    email: 'E-Mail',
    phone: 'Telefon',
    role: 'Rolle',
    status: 'Status',
    category: 'Kategorie',
    price: 'Preis',
    quantity: 'Menge',
    revenue: 'Umsatz',
    total: 'Gesamt',
    description: 'Beschreibung',
    contact: 'Kontakt',
    supplier: 'Lieferant',
    customer: 'Kunde',
    date: 'Datum',
    client: 'Kunde',
    
    // Forecasts
    aiPoweredPredictions: 'KI-gestützte Prognosen für Bestandsplanung und Umsatzprognose',
    forecastPeriod: 'September - Oktober 2024',
    predictedDemand: 'Prognostizierte Nachfrage',
    expectedUnits: 'Einheiten in den nächsten 2 Monaten',
    monthOverMonth: 'Monat für Monat',
    predictedRevenue: 'Prognostizierter Umsatz',
    expectedRevenue: 'Erwarteter Umsatz',
    growthRate: 'Wachstumsrate',
    productsTracked: 'Verfolgte Produkte',
    activeForecasts: 'Aktive Prognosen',
    acrossCategories: 'Über {count} Kategorien',
    forecastAnalysis: 'Prognoseanalyse',
    productsWithSufficientStock: 'Produkte mit ausreichendem Bestand',
    needReordering: 'Nachbestellung erforderlich',
    clients: 'Kunden',
    detailedForecasts: 'Detaillierte Prognosen',
    product: 'Produkt',
    month: 'Monat',
    currentStock: 'Aktueller Bestand',
    stockStatus: 'Bestandsstatus',
    id: 'ID',
    sufficient: 'Ausreichend',
    needMore: '{count} mehr benötigt',
    accessDenied: 'Zugriff verweigert',
    noPermissionToView: 'Sie haben keine Berechtigung, diese Seite anzusehen',
    onlyManagersAndAdminsCanAccessForecasting: 'Nur Manager und Administratoren können auf Prognosedaten zugreifen',
    unitsNextMonths: 'Einheiten in den nächsten 2 Monaten',
    
    // Auth & Registration
    confirmPassword: 'Passwort bestätigen',
    fullName: 'Vollständiger Name',
    emailAddress: 'E-Mail-Adresse',
    phoneNumber: 'Telefonnummer',
    profilePicture: 'Profilbild',
    joinSmartInventory: 'Bei Smart Inventory beitreten',
    createYourAccount: 'Ihr Konto erstellen',
    enterYourName: 'Geben Sie Ihren Namen ein',
    enterYourEmail: 'Geben Sie Ihre E-Mail-Adresse ein',
    enterYourPhoneNumber: 'Geben Sie Ihre Telefonnummer ein',
    createPassword: 'Passwort erstellen',
    creatingAccount: 'Ihr Konto wird erstellt...',
    createAccount: 'Konto erstellen',
    alreadyHaveAccount: 'Sie haben bereits ein Konto?',
    signInHere: 'Hier anmelden',
    passwordMismatchTitle: 'Passwort-Unstimmigkeit',
    passwordMismatchDescription: 'Die Passwörter, die Sie eingegeben haben, stimmen nicht überein.',
    accountCreatedTitle: 'Konto erstellt',
    accountCreatedDescription: 'Ihr Konto wurde erfolgreich erstellt! Sie sind jetzt angemeldet.',
    
    // User Management
    userManagement: 'Benutzerverwaltung',
    addUser: 'Benutzer hinzufügen',
    administrators: 'Administratoren',
    managers: 'Manager',
    userDirectory: 'Benutzerverzeichnis',
    manageUserAccounts: 'Benutzerkonten, Rollen und Berechtigungen verwalten',
    activeSystemUsers: 'Aktive Systembenutzer',
    systemAdministrators: 'Systemadministratoren',
    departmentManagers: 'Abteilungsleiter',
    usersByRole: 'Benutzer nach Rolle',
    onlyAdministrators: 'Nur Administratoren können auf die Benutzerverwaltungsseite zugreifen.',
    searchUsers: 'Benutzer suchen...',
    filterByRole: 'Nach Rolle filtern',
    allRoles: 'Alle Rollen',
    userNotFound: 'Keine Benutzer gefunden, die Ihren Kriterien entsprechen.',
    
    // Products
    productManagement: 'Produktverwaltung',
    addProduct: 'Produkt hinzufügen',
    lowStockItems: 'Niedrige Lagerbestände',
    categories: 'Kategorien',
    inventoryLevel: 'Lagerbestand',
    revenuePerProduct: 'Umsatz pro Produkt',
    manageProductInventory: 'Verwalten Sie Ihr Produktinventar und verfolgen Sie Lagerbestände',
    trackStockLevels: 'Lagerbestände verfolgen',
    activeProducts: 'Aktive Produkte',
    fromProductSales: 'Aus Produktverkäufen',
    needRestocking: 'Bedarf Wiederbeschaffung',
    productCategories: 'Produktkategorien',
    addNewProduct: 'Neues Produkt hinzufügen',
    productName: 'Produktname',
    selectCategory: 'Kategorie auswählen',
    selectSupplier: 'Lieferant auswählen',
    quantityInStock: 'Menge auf Lager',
    minimumStockLevel: 'Mindestlagerbestand',
    productDescription: 'Produktbeschreibung...',
    searchProducts: 'Produkte suchen',
    searchByNameCategory: 'Nach Name oder Kategorie suchen...',
    allCategories: 'Alle Kategorien',
    allSuppliers: 'Alle Lieferanten',
    allLevels: 'Alle Ebenen',
    low: 'Niedrig',
    stockLevel: 'Lagerbestand',
    minStock: 'Min. Lager',
    totalValue: 'Gesamtwert',
    loadingProducts: 'Produkte werden geladen...',
    unknownProduct: 'Unbekanntes Produkt',
    
    // Suppliers
    supplierManagement: 'Lieferantenverwaltung',
    addSupplier: 'Lieferant hinzufügen',
    supplierDirectory: 'Lieferantenverzeichnis',
    manageSupplierRelationships: 'Lieferantenbeziehungen verwalten und Leistung verfolgen',
    trackPerformance: 'Leistung verfolgen',
    activeSuppliers: 'Aktive Lieferanten',
    suppliedProducts: 'Gelieferte Produkte',
    fromAllSuppliers: 'Von allen Lieferanten',
    productsBySupplier: 'Produkte nach Lieferant',
    revenueBySupplier: 'Umsatz nach Lieferant',
    contactInformation: 'Kontaktinformationen',
    searchSuppliers: 'Lieferanten suchen...',
    supplierNotFound: 'Keine Lieferanten gefunden, die Ihren Kriterien entsprechen.',
    addNewSupplier: 'Neuen Lieferant hinzufügen',
    contactEmail: 'Kontakt-E-Mail',
    address: 'Adresse',
    productsSupplied: 'Gelieferte Produkte',
    viewSupplier: 'Lieferant anzeigen',
    editSupplier: 'Lieferant bearbeiten',
    supplierName: 'Name des Lieferanten',
    
    // Orders
    orderManagement: 'Bestellverwaltung',
    newOrder: 'Neue Bestellung',
    totalOrders: 'Bestellungen gesamt',
    pendingOrders: 'Ausstehende Bestellungen',
    completed: 'Abgeschlossen',
    orderHistory: 'Bestellhistorie',
    trackCustomerOrders: 'Kundenbestellungen verfolgen und Erfüllung verwalten',
    manageFulfillment: 'Erfüllung verwalten',
    allTimeOrders: 'Alle Bestellungen',
    fromAllOrders: 'Von allen Bestellungen',
    needAttention: 'Benötigen Aufmerksamkeit',
    successfullyDelivered: 'Erfolgreich geliefert',
    ordersByStatus: 'Bestellungen nach Status',
    ordersPerProduct: 'Bestellungen pro Produkt',
    monthlyOrdersRevenue: 'Monatliche Bestellungen vs. Umsatz',
    orderID: 'Bestell-ID',
    searchOrders: 'Bestellungen suchen...',
    filterByStatus: 'Nach Status filtern',
    allStatus: 'Alle Status',
    pending: 'Ausstehend',
    orderNotFound: 'Keine Bestellungen gefunden, die Ihren Kriterien entsprechen.',
    addNewOrder: 'Neue Bestellung hinzufügen',
    clientName: 'Kundenname',
    orderDate: 'Bestelldatum',
    orderStatus: 'Bestellstatus',
    ordersLineName: 'Bestellungen',
    revenueLineName: 'Umsatz',
    
    // Profile
    personalInformation: 'Persönliche Informationen',
    activitySummary: 'Aktivitätszusammenfassung',
    editProfile: 'Profil bearbeiten',
    totalSpent: 'Gesamt verdient',
    favoriteCategories: 'Lieblingskategorien',
    orderHistoryChart: 'Bestellhistorie',
    recentOrders: 'Letzte Bestellungen',
    totalEarned: 'Gesamt verdient',
    totalGenerated: 'Gesamt generiert',
    noUserData: 'Keine Benutzerdaten verfügbar',
    unableToLoadProfile: 'Benutzerprofilinformationen konnten nicht geladen werden.',
    
    // Settings
    accountSecurity: 'Kontosicherheit',
    appearance: 'Erscheinungsbild',
    notificationPreferences: 'Benachrichtigungseinstellungen',
    systemPreferences: 'Systemeinstellungen',
    changePassword: 'Passwort ändern',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    updatePassword: 'Passwort aktualisieren',
    twoFactorAuth: 'Zwei-Faktor-Authentifizierung',
    theme: 'Design',
    light: 'Hell',
    dark: 'Dunkel',
    system: 'System',
    language: 'Sprache',
    saveAllSettings: 'Alle Einstellungen speichern',
    manageAccountPreferences: 'Verwalten Sie Ihre Kontoeinstellungen und Sicherheitseinstellungen',
    securitySettings: 'Sicherheitseinstellungen',
    enterCurrentPassword: 'Aktuelles Passwort eingeben',
    enterNewPassword: 'Neues Passwort eingeben',
    confirmNewPassword: 'Neues Passwort bestätigen',
    enable2FA: '2FA aktivieren',
    extraLayerSecurity: 'Fügen Sie eine zusätzliche Sicherheitsebene zu Ihrem Konto hinzu',
    compactMode: 'Kompaktmodus',
    showMoreContent: 'Mehr Inhalt auf weniger Platz anzeigen',
    animations: 'Animationen',
    enableSmoothTransitions: 'Sanfte Übergänge und Effekte aktivieren',
    deliveryMethods: 'Zustellmethoden',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    receiveUpdatesEmail: 'Updates per E-Mail erhalten',
    pushNotifications: 'Push-Benachrichtigungen',
    receiveBrowserNotifications: 'Browser-Benachrichtigungen erhalten',
    notificationTypes: 'Benachrichtigungstypen',
    orderUpdates: 'Bestellaktualisierungen',
    statusChangesTracking: 'Statusänderungen und Verfolgung',
    inventoryAlerts: 'Lagerbenachrichtigungen',
    lowStockReorder: 'Niedrige Lagerbestände und Nachbestellungsbenachrichtigungen',
    weeklyReports: 'Wöchentliche Berichte',
    performanceSummaries: 'Leistungszusammenfassungen',
    dataPrivacy: 'Daten & Datenschutz',
    analytics: 'Analysen',
    helpImproveSystem: 'Helfen Sie, das System zu verbessern',
    dataExport: 'Datenexport',
    downloadYourData: 'Ihre Daten herunterladen',
    export: 'Exportieren',
    languageRegion: 'Sprache & Region',
    timezone: 'Zeitzone',

    // Other
    details: 'Details', 
  },
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    users: 'Utilisateurs',
    products: 'Produits',
    suppliers: 'Fournisseurs',
    orders: 'Commandes',
    forecasts: 'Prévisions',
    profile: 'Profil',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    manageAccount: 'Gérer vos paramètres de compte et vos activités',
    
    // Placeholders
    enterSupplierName: 'Entrer le nom du fournisseur',
    enterContactEmail: 'Entrer l\'email de contact',
    enterPhoneNumber: 'Entrer le numéro de téléphone',

    // Dashboard translations
    welcomeBackUser: 'Bon retour, {name}! 👋',
    inventoryToday: 'Voici ce qui se passe avec votre inventaire aujourd\'hui.',
    fromLastMonth: 'du mois dernier',
    recentOrders: 'Commandes récentes',
    orderedBy: 'Commandé par {name}',
    qty: 'Qté:',
    lowStockAlerts: 'Alertes de stock bas',
    left: 'restant',
    reorderNeeded: 'Réapprovisionnement nécessaire',
    allProductsStocked: 'Tous les produits sont bien approvisionnés!',
    unknownUser: 'Utilisateur inconnu',
    delivered: 'Livré',
    shipped: 'Expédié',
    processing: 'En traitement',
    
    // AI Insights translations
    aiInsights: 'Insights IA',
    analyzingData: 'Analyse des données avec l\'IA...',
    dataVisualization: 'Visualisation des données',
    aiRecommendations: 'Recommandations IA',
    close: 'Fermer',
    regenerateInsights: 'Régénérer les insights',
    generateInsights: 'Générer des insights',
    generateAiInsights: 'Générer des insights alimentés par l\'IA à partir de vos données',
    smartInventoryAIInsights: 'Insights IA Smart Inventory',
    basedOnInventoryData: 'Basé sur vos données d\'inventaire actuelles et les tendances, voici les principaux insights:',
    laptopProLow: 'Le stock de Laptop Pro est bas - envisagez un réapprovisionnement dans les 2 semaines',
    electronicsGrowth: 'La catégorie Électronique montre une tendance de croissance de 15% - augmentez le stock de sécurité',
    officeSuppliesOptimal: 'Les fournitures de bureau ont des taux de rotation optimaux - maintenez les niveaux actuels',
    considerBundleDeals: 'Envisagez d\'introduire des offres groupées pour Laptop Pro + Écouteurs sans fil',
    productPerformanceAnalysis: 'Analyse de performance des produits',
    aiAnalysisProducts: 'L\'analyse IA de votre portefeuille de produits révèle des opportunités d\'optimisation:',
    topPerformerHeadphones: 'Meilleur performant: Écouteurs sans fil avec 23% d\'amélioration de marge',
    slowMoverDesk: 'Produit à rotation lente: Bureau debout - envisagez des prix promotionnels',
    reorderAlertSmartphone: 'Alerte de réapprovisionnement: Le stock de Smartphone X sera épuisé dans 12 jours',
    priceOptimizationMonitor: 'Optimisation des prix: Le moniteur LED peut supporter une augmentation de prix de 8%',
    orderPatternIntelligence: 'Intelligence des modèles de commande',
    machineLearningAnalysis: 'Analyse par apprentissage automatique des modèles de commande et du comportement client:',
    peakOrderingTime: 'Heure de pointe des commandes: Mardis 10-11h - planifiez le personnel en conséquence',
    bulkOrderOpportunity: 'Opportunité de commande en gros: Le client #2 montre une fréquence de commande croissante',
    seasonalTrendElectronics: 'Tendance saisonnière: Les commandes d\'électronique augmentent de 40% au Q4',
    crossSellPotential: 'Potentiel de vente croisée: 67% des acheteurs d\'ordinateurs portables achètent également des accessoires',
    demandForecastingInsights: 'Insights de prévision de la demande',
    predictiveAnalytics: 'Analyses prédictives pour les tendances futures d\'inventaire et de demande:',
    projectedSmartphoneIncrease: 'Augmentation projetée de 30% de la demande de Smartphone X le mois prochain',
    seasonalDeclineOfficeSupplies: 'Baisse saisonnière attendue pour les fournitures de bureau pendant les mois d\'été',
    recommendedSafetyStock: 'Augmentation recommandée du stock de sécurité pour les écouteurs sans fil',
    considerPreordering: 'Envisagez de précommander Laptop Pro pour la demande de la saison des fêtes du Q4',
    
    // Login
    welcomeBack: 'Bienvenue à nouveau',
    signInToAccount: 'Connectez-vous à votre compte Smart Inventory',
    password: 'Mot de passe',
    enterPassword: 'Entrez votre mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    demoUsers: 'Utilisateurs de démonstration (Mot de passe: demo123)',
    noAccount: 'Vous n\'avez pas de compte? Seul votre responsable peut en créer un pour vous.',
    backToHome: 'Retour à l\'accueil',
    admin: 'Administrateur',
    manager: 'Responsable',
    employee: 'Employé',
    
    // Landing Page
    smartInventory: 'Smart Inventory',
    management: 'Gestion',
    landingSubtitle: 'Révolutionnez votre gestion d\'inventaire avec des insights alimentés par l\'IA, un suivi en temps réel et des prévisions intelligentes. Simplifiez les opérations et améliorez l\'efficacité.',
    getStarted: 'Commencer',
    watchDemo: 'Voir la démo',
    powerfulFeatures: 'Fonctionnalités puissantes',
    featuresSubtitle: 'Tout ce dont vous avez besoin pour gérer votre inventaire efficacement',
    howItWorks: 'Comment ça marche',
    howItWorksSubtitle: 'Commencez en quelques minutes avec notre processus intuitif en trois étapes',
    readyTransform: 'Prêt à transformer votre inventaire ?',
    readySubtitle: 'Rejoignez des milliers d\'entreprises qui utilisent déjà Smart Inventory',
    getStartedNow: 'Commencer maintenant',
    copyright: '© 2025 Smart Inventory Management System. Tous droits réservés.',
    smartInventoryTracking: 'Suivi d\'inventaire intelligent',
    smartInventoryTrackingDesc: 'Gestion d\'inventaire en temps réel avec alertes automatisées et recommandations de réapprovisionnement.',
    aiPoweredInsights: 'Insights alimentés par l\'IA',
    aiPoweredInsightsDesc: 'Analyses avancées et prévisions pour optimiser vos niveaux d\'inventaire et réduire les déchets.',
    multiUserSupport: 'Support multi-utilisateurs',
    multiUserSupportDesc: 'Contrôle d\'accès basé sur les rôles pour les administrateurs, managers et employés avec des permissions personnalisables.',
    demandForecasting: 'Prévision de la demande',
    demandForecastingDesc: 'Prédisez les tendances futures de la demande en utilisant des algorithmes d\'apprentissage automatique et des données historiques.',
    secureReliable: 'Sécurisé & Fiable',
    secureReliableDesc: 'Sécurité de niveau entreprise avec chiffrement des données et sauvegardes automatisées régulières.',
    lightningFast: 'Ultra-rapide',
    lightningFastDesc: 'Performance optimisée avec mises à jour en temps réel et capacités de recherche ultra-rapides.',
    setupInventory: 'Configurez votre inventaire',
    setupInventoryDesc: 'Importez votre inventaire existant ou commencez à zéro avec notre système de gestion de produits facile à utiliser.',
    configureTeam: 'Configurez votre équipe',
    configureTeamDesc: 'Ajoutez des membres d\'équipe avec des rôles et permissions appropriés pour une collaboration fluide.',
    getAIInsights: 'Obtenez des insights IA',
    getAIInsightsDesc: 'Laissez notre IA analyser vos données et fournir des insights actionnables pour une gestion d\'inventaire optimale.',
    
    // Common
    search: 'Rechercher',
    add: 'Ajouter',
    edit: 'Modifier',
    delete: 'Supprimer',
    view: 'Voir',
    save: 'Enregistrer',
    cancel: 'Annuler',
    loading: 'Chargement',
    actions: 'Actions',
    name: 'Nom',
    email: 'Email',
    phone: 'Téléphone',
    role: 'Rôle',
    status: 'Statut',
    category: 'Catégorie',
    price: 'Prix',
    quantity: 'Quantité',
    revenue: 'Revenu',
    total: 'Total',
    description: 'Description',
    contact: 'Contact',
    supplier: 'Fournisseur',
    customer: 'Client',
    date: 'Date',
    client: 'Client',
    
    // Forecasts
    aiPoweredPredictions: 'Prévisions alimentées par l\'IA pour la planification des stocks et la prévision des revenus',
    forecastPeriod: 'Septembre - Octobre 2024',
    predictedDemand: 'Demande prévue',
    expectedUnits: 'Unités pour les 2 prochains mois',
    monthOverMonth: 'Mois après mois',
    predictedRevenue: 'Revenu prévu',
    expectedRevenue: 'Revenu attendu',
    growthRate: 'Taux de croissance',
    productsTracked: 'Produits suivis',
    activeForecasts: 'Prévisions actives',
    acrossCategories: 'Sur {count} catégories',
    forecastAnalysis: 'Analyse des prévisions',
    productsWithSufficientStock: 'Produits avec stock suffisant',
    needReordering: 'Nécessite réapprovisionnement',
    clients: 'Clients',
    detailedForecasts: 'Prévisions détaillées',
    product: 'Produit',
    month: 'Mois',
    currentStock: 'Stock actuel',
    stockStatus: 'État du stock',
    id: 'ID',
    needMore: 'Besoin de {count} en plus',
    accessDenied: 'Accès refusé',
    noPermissionToView: 'Vous n\'avez pas la permission de voir cette page',
    onlyManagersAndAdminsCanAccessForecasting: 'Seuls les managers et les administrateurs peuvent accéder aux données de prévision',
    unitsNextMonths: 'Unités pour les 2 prochains mois',
    
    // Auth & Registration
    confirmPassword: 'Confirmer le mot de passe',
    fullName: 'Nom complet',
    emailAddress: 'Adresse e-mail',
    phoneNumber: 'Numéro de téléphone',
    profilePicture: 'Photo de profil',
    joinSmartInventory: 'Rejoindre Smart Inventory',
    createYourAccount: 'Créer votre compte',
    enterYourName: 'Entrer votre nom',
    enterYourEmail: 'Entrer votre e-mail',
    enterYourPhoneNumber: 'Entrer votre numéro de téléphone',
    createPassword: 'Créer un mot de passe',
    creatingAccount: 'Création de votre compte...',
    createAccount: 'Créer un compte',
    alreadyHaveAccount: 'Vous avez déjà un compte ?',
    signInHere: 'Se connecter ici',
    passwordMismatchTitle: 'Déconnexion de mot de passe',
    passwordMismatchDescription: 'Les mots de passe que vous avez entrés ne correspondent pas.',
    accountCreatedTitle: 'Compte créé',
    accountCreatedDescription: 'Votre compte a été créé avec succès ! Vous êtes maintenant connecté.',
    
    // User Management
    userManagement: 'Gestion des utilisateurs',
    addUser: 'Ajouter un utilisateur',
    totalUsers: 'Total des utilisateurs',
    administrators: 'Administrateurs',
    managers: 'Managers',
    userDirectory: 'Répertoire des utilisateurs',
    manageUserAccounts: 'Gérer les comptes utilisateurs, rôles et permissions',
    activeSystemUsers: 'Utilisateurs système actifs',
    systemAdministrators: 'Administrateurs système',
    departmentManagers: 'Managers de département',
    usersByRole: 'Utilisateurs par rôle',
    onlyAdministrators: 'Seuls les administrateurs peuvent accéder à la page de gestion des utilisateurs.',
    searchUsers: 'Rechercher des utilisateurs...',
    filterByRole: 'Filtrer par rôle',
    allRoles: 'Tous les rôles',
    userNotFound: 'Aucun utilisateur trouvé correspondant à vos critères.',
    
    // Products
    productManagement: 'Gestion des produits',
    addProduct: 'Ajouter un produit',
    totalProducts: 'Total des produits',
    lowStockItems: 'Articles en stock faible',
    categories: 'Catégories',
    inventoryLevel: 'Niveau d\'inventaire',
    revenuePerProduct: 'Revenus par produit',
    manageProductInventory: 'Gérez votre inventaire de produits et suivez les niveaux de stock',
    trackStockLevels: 'Suivre les niveaux de stock',
    activeProducts: 'Produits actifs',
    fromProductSales: 'Des ventes de produits',
    needRestocking: 'Nécessitent un réapprovisionnement',
    productCategories: 'Catégories de produits',
    addNewProduct: 'Ajouter un nouveau produit',
    productName: 'Nom du produit',
    selectCategory: 'Sélectionner une catégorie',
    selectSupplier: 'Sélectionner un fournisseur',
    quantityInStock: 'Quantité en stock',
    minimumStockLevel: 'Niveau de stock minimum',
    productDescription: 'Description du produit...',
    searchProducts: 'Rechercher des produits',
    searchByNameCategory: 'Rechercher par nom ou catégorie...',
    allCategories: 'Toutes les catégories',
    allSuppliers: 'Tous les fournisseurs',
    allLevels: 'Tous les niveaux',
    sufficient: 'Suffisant',
    low: 'Faible',
    stockLevel: 'Niveau de stock',
    minStock: 'Stock min',
    totalValue: 'Valeur totale',
    loadingProducts: 'Chargement des produits...',
    unknownProduct: 'Produit inconnue',
    
    // Suppliers
    supplierManagement: 'Gestion des fournisseurs',
    addSupplier: 'Ajouter un fournisseur',
    totalSuppliers: 'Total des fournisseurs',
    supplierDirectory: 'Répertoire des fournisseurs',
    manageSupplierRelationships: 'Gérer les relations avec les fournisseurs et suivre les performances',
    trackPerformance: 'Suivre les performances',
    activeSuppliers: 'Fournisseurs actifs',
    suppliedProducts: 'Produits fournis',
    fromAllSuppliers: 'De tous les fournisseurs',
    productsBySupplier: 'Produits par fournisseur',
    revenueBySupplier: 'Revenus par fournisseur',
    contactInformation: 'Informations de contact',
    searchSuppliers: 'Rechercher des fournisseurs...',
    supplierNotFound: 'Aucun fournisseur trouvé correspondant à vos critères.',
    addNewSupplier: 'Ajouter un nouveau fournisseur',
    contactEmail: 'E-mail de contact',
    address: 'Adresse',
    productsSupplied: 'Produits fournis',
    viewSupplier: 'Voir le fournisseur',
    editSupplier: 'Modifier le fournisseur',
    supplierName: 'Nom du fournisseur',
    
    // Orders
    orderManagement: 'Gestion des commandes',
    newOrder: 'Nouvelle commande',
    totalOrders: 'Total des commandes',
    pendingOrders: 'Commandes en attente',
    completed: 'Terminé',
    orderHistory: 'Historique des commandes',
    trackCustomerOrders: 'Suivre et gérer les commandes clients et l\'exécution',
    manageFulfillment: 'Gérer l\'exécution',
    allTimeOrders: 'Toutes les commandes',
    fromAllOrders: 'De toutes les commandes',
    needAttention: 'Nécessitent une attention',
    successfullyDelivered: 'Livrées avec succès',
    ordersByStatus: 'Commandes par statut',
    ordersPerProduct: 'Commandes par produit',
    monthlyOrdersRevenue: 'Commandes mensuelles vs Revenus',
    orderID: 'ID de commande',
    searchOrders: 'Rechercher des commandes...',
    filterByStatus: 'Filtrer par statut',
    allStatus: 'Tous les statuts',
    pending: 'En attente',
    orderNotFound: 'Aucune commande trouvée correspondant à vos critères.',
    addNewOrder: 'Ajouter une nouvelle commande',
    clientName: 'Nom du client',
    orderDate: 'Date de commande',
    orderStatus: 'Statut de commande',
    ordersLineName: 'Commandes',
    revenueLineName: 'Revenus',
    
    // Profile
    personalInformation: 'Informations personnelles',
    activitySummary: 'Résumé d\'activité',
    editProfile: 'Modifier le profil',
    totalSpent: 'Total gagné',
    favoriteCategories: 'Catégories préférées',
    orderHistoryChart: 'Historique des commandes',
    totalEarned: 'Total gagné',
    totalGenerated: 'Total généré',
    noUserData: 'Aucune donnée d\'utilisateur disponible',
    unableToLoadProfile: 'Impossible de charger les informations de profil utilisateur.',
    
    // Settings
    accountSecurity: 'Sécurité du compte',
    appearance: 'Apparence',
    notificationPreferences: 'Préférences de notification',
    systemPreferences: 'Préférences système',
    changePassword: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    updatePassword: 'Mettre à jour le mot de passe',
    twoFactorAuth: 'Authentification à deux facteurs',
    theme: 'Thème',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Système',
    language: 'Langue',
    saveAllSettings: 'Enregistrer tous les paramètres',
    manageAccountPreferences: 'Gérez vos préférences de compte et paramètres de sécurité',
    securitySettings: 'Paramètres de sécurité',
    enterCurrentPassword: 'Entrer le mot de passe actuel',
    enterNewPassword: 'Entrer le nouveau mot de passe',
    confirmNewPassword: 'Confirmer le nouveau mot de passe',
    enable2FA: 'Activer 2FA',
    extraLayerSecurity: 'Ajouter une couche de sécurité supplémentaire à votre compte',
    compactMode: 'Mode compact',
    showMoreContent: 'Afficher plus de contenu dans moins d\'espace',
    animations: 'Animations',
    enableSmoothTransitions: 'Activer les transitions et effets fluides',
    deliveryMethods: 'Méthodes de livraison',
    emailNotifications: 'Notifications par e-mail',
    receiveUpdatesEmail: 'Recevoir des mises à jour par e-mail',
    pushNotifications: 'Notifications push',
    receiveBrowserNotifications: 'Recevoir des notifications du navigateur',
    notificationTypes: 'Types de notification',
    orderUpdates: 'Mises à jour de commande',
    statusChangesTracking: 'Changements de statut et suivi',
    inventoryAlerts: 'Alertes d\'inventaire',
    lowStockReorder: 'Stock faible et alertes de réapprovisionnement',
    weeklyReports: 'Rapports hebdomadaires',
    performanceSummaries: 'Résumés de performance',
    dataPrivacy: 'Données & Confidentialité',
    analytics: 'Analyses',
    helpImproveSystem: 'Aider à améliorer le système',
    dataExport: 'Export de données',
    downloadYourData: 'Télécharger vos données',
    export: 'Exporter',
    languageRegion: 'Langue & Région',
    timezone: 'Fuseau horaire',

    // Other
    details: 'Détails', 
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslationValues;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};