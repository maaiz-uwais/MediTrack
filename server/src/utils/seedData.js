const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const Test = require('../models/Test');
const Package = require('../models/Package');
const TestBooking = require('../models/TestBooking');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const Prescription = require('../models/Prescription');
const Review = require('../models/Review');

const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/meditrack'
    );
    console.log(`\n======================================================`);
    console.log(`[MediTrack Seeder] Connected to MongoDB: ${conn.connection.name}`);
    console.log(`======================================================`);

    // Clean existing data
    console.log(`Clearing existing collections...`);
    await Promise.all([
      User.deleteMany({}),
      PatientProfile.deleteMany({}),
      DoctorProfile.deleteMany({}),
      Test.deleteMany({}),
      Package.deleteMany({}),
      TestBooking.deleteMany({}),
      Appointment.deleteMany({}),
      Payment.deleteMany({}),
      Report.deleteMany({}),
      Notification.deleteMany({}),
      Complaint.deleteMany({}),
      Prescription.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log(`Database cleared successfully.`);

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@meditrack.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9900000001',
      isApproved: true,
      isBlocked: false,
    });

    // 2. Create Doctors
    // Approved Doctor 1 (Cardiologist)
    const doc1User = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@meditrack.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9811122233',
      isApproved: true,
      isBlocked: false,
    });
    await DoctorProfile.create({
      user: doc1User._id,
      specialization: 'Cardiologist',
      experience: 14,
      licenseNumber: 'MCI-CARD-78421',
      fee: 800,
      qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology)'],
      bio: 'Senior Consultant Interventional Cardiologist with over a decade of clinical experience in preventive cardiac care and hypertension management.',
      ratingsAverage: 4.9,
      ratingsQuantity: 42,
      availability: [1, 2, 3, 4, 5].map((d) => ({
        dayOfWeek: d,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
        startTime: '09:00',
        endTime: '15:00',
        slotDuration: 30,
        isAvailable: true,
      })),
    });

    // Approved Doctor 2 (Neurologist)
    const doc2User = await User.create({
      name: 'Dr. Priya Nair',
      email: 'dr.nair@meditrack.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9822233344',
      isApproved: true,
      isBlocked: false,
    });
    await DoctorProfile.create({
      user: doc2User._id,
      specialization: 'Neurologist',
      experience: 9,
      licenseNumber: 'MCI-NEUR-55109',
      fee: 950,
      qualifications: ['MBBS', 'MD', 'DNB (Neurology)'],
      bio: 'Specialist in migraine management, neuromuscular disorders, cognitive assessments, and comprehensive neuro-rehabilitation.',
      ratingsAverage: 4.8,
      ratingsQuantity: 28,
      availability: [1, 3, 5, 6].map((d) => ({
        dayOfWeek: d,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
        startTime: '10:00',
        endTime: '16:00',
        slotDuration: 30,
        isAvailable: true,
      })),
    });

    // Pending Approval Doctor 3 (Dermatologist - to test Admin approval flow!)
    const doc3User = await User.create({
      name: 'Dr. Amit Verma',
      email: 'dr.verma@meditrack.com',
      password: 'doctor123',
      role: 'doctor',
      phone: '+91 9833344455',
      isApproved: false, // PENDING APPROVAL
      isBlocked: false,
    });
    await DoctorProfile.create({
      user: doc3User._id,
      specialization: 'Dermatologist',
      experience: 6,
      licenseNumber: 'MCI-DERM-99214',
      fee: 600,
      qualifications: ['MBBS', 'MD (Dermatology & Venereology)'],
      bio: 'Expert clinical dermatologist offering cutting-edge treatments for acne, eczema, psoriasis, and cosmetic dermatology.',
      ratingsAverage: 4.7,
      ratingsQuantity: 12,
      availability: [2, 4, 6].map((d) => ({
        dayOfWeek: d,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d],
        startTime: '11:00',
        endTime: '17:00',
        slotDuration: 30,
        isAvailable: true,
      })),
    });

    // 3. Create Lab Staff
    const lab1User = await User.create({
      name: 'Suresh Kumar',
      email: 'lab@meditrack.com',
      password: 'labstaff123',
      role: 'lab_staff',
      phone: '+91 9844455566',
      isApproved: true,
      isBlocked: false,
    });

    const lab2User = await User.create({
      name: 'Anita Desai',
      email: 'lab.anita@meditrack.com',
      password: 'labstaff123',
      role: 'lab_staff',
      phone: '+91 9855566677',
      isApproved: true,
      isBlocked: false,
    });

    // 4. Create Patients
    const patient1User = await User.create({
      name: 'Rahul Gupta',
      email: 'patient@meditrack.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 9866677788',
      isApproved: true,
      isBlocked: false,
    });
    await PatientProfile.create({
      user: patient1User._id,
      dob: new Date('1992-06-15'),
      gender: 'Male',
      bloodGroup: 'B+',
      address: {
        street: '42 Lotus Enclave, 4th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
      },
      emergencyContact: {
        name: 'Sunita Gupta',
        relation: 'Spouse',
        phone: '+91 9866677799',
      },
      medicalHistory: ['Mild Hypertension', 'Asthma (Childhood)'],
      allergies: ['Penicillin', 'Sulfa drugs'],
    });

    const patient2User = await User.create({
      name: 'Sneha Patel',
      email: 'sneha@meditrack.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 9877788899',
      isApproved: true,
      isBlocked: false,
    });
    await PatientProfile.create({
      user: patient2User._id,
      dob: new Date('1988-11-20'),
      gender: 'Female',
      bloodGroup: 'O+',
      address: {
        street: '15 Silver Birch Apartments',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
      },
      emergencyContact: {
        name: 'Kiran Patel',
        relation: 'Brother',
        phone: '+91 9877788800',
      },
      medicalHistory: ['Thyroid Deficiency (Hypothyroidism)'],
      allergies: ['Dust mites', 'Peanuts'],
    });

    const patient3User = await User.create({
      name: 'Vikram Malhotra',
      email: 'vikram@meditrack.com',
      password: 'patient123',
      role: 'patient',
      phone: '+91 9888899900',
      isApproved: true,
      isBlocked: false,
    });
    await PatientProfile.create({
      user: patient3User._id,
      dob: new Date('1975-03-10'),
      gender: 'Male',
      bloodGroup: 'A+',
      address: {
        street: '88 Green Glen Layout',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110016',
      },
      emergencyContact: {
        name: 'Meena Malhotra',
        relation: 'Spouse',
        phone: '+91 9888899911',
      },
      medicalHistory: ['Type 2 Diabetes', 'Elevated LDL'],
      allergies: [],
    });

    // 5. Create 10 Sample Diagnostic Tests
    const testsData = [
      {
        name: 'Complete Blood Count (CBC) with ESR',
        code: 'TEST-CBC-01',
        category: 'Hematology',
        description: 'Measures RBC, WBC, Platelets, Hemoglobin, Hematocrit and Erythrocyte Sedimentation Rate.',
        price: 450,
        discountPrice: 350,
        sampleType: 'Blood',
        fastingRequired: false,
        tatHours: 12,
        precautions: 'No special dietary restrictions required.',
      },
      {
        name: 'Lipid Profile (Full Cardiovascular Risk)',
        code: 'TEST-LIPID-02',
        category: 'Biochemistry',
        description: 'Comprehensive evaluation of Total Cholesterol, HDL, LDL, VLDL, and Triglycerides.',
        price: 850,
        discountPrice: 650,
        sampleType: 'Blood',
        fastingRequired: true,
        fastingDurationHours: 12,
        tatHours: 16,
        precautions: '10 to 12 hours overnight fasting mandatory. Water intake permitted.',
      },
      {
        name: 'Fasting Blood Glucose & HbA1c Glycated Hemoglobin',
        code: 'TEST-GLU-03',
        category: 'Endocrinology',
        description: 'Evaluates current fasting plasma glucose along with 3-month average glycemic control.',
        price: 600,
        discountPrice: 480,
        sampleType: 'Blood',
        fastingRequired: true,
        fastingDurationHours: 8,
        tatHours: 8,
        precautions: 'Minimum 8 hours fasting before sample collection.',
      },
      {
        name: 'Comprehensive Metabolic Panel (CMP - 14 Parameters)',
        code: 'TEST-CMP-04',
        category: 'Biochemistry',
        description: 'Measures electrolyte balance, kidney function, liver enzymes, and protein status.',
        price: 1100,
        discountPrice: 890,
        sampleType: 'Blood',
        fastingRequired: true,
        fastingDurationHours: 10,
        tatHours: 24,
      },
      {
        name: 'Thyroid Profile Total (T3, T4, TSH Ultra)',
        code: 'TEST-THY-05',
        category: 'Endocrinology',
        description: 'Accurate hormonal evaluation for hyperthyroidism, hypothyroidism, and pituitary function.',
        price: 750,
        discountPrice: 550,
        sampleType: 'Serum',
        fastingRequired: false,
        tatHours: 12,
      },
      {
        name: 'Vitamin D3 (25-Hydroxy) & Vitamin B12 Duo',
        code: 'TEST-VIT-06',
        category: 'Biochemistry',
        description: 'Assesses bone density health, nerve conduction, energy metabolism, and fatigue factors.',
        price: 1600,
        discountPrice: 1199,
        sampleType: 'Blood',
        fastingRequired: false,
        tatHours: 24,
      },
      {
        name: 'Liver Function Test (LFT with GGT & Bilirubin)',
        code: 'TEST-LFT-07',
        category: 'Biochemistry',
        description: 'Comprehensive liver profiling: SGOT/AST, SGPT/ALT, Alkaline Phosphatase, Bilirubin Direct/Total.',
        price: 800,
        discountPrice: 599,
        sampleType: 'Blood',
        fastingRequired: true,
        fastingDurationHours: 8,
        tatHours: 12,
      },
      {
        name: 'Kidney Function Test (KFT with Electrolytes & BUN)',
        code: 'TEST-KFT-08',
        category: 'Biochemistry',
        description: 'Evaluates Serum Creatinine, Blood Urea Nitrogen, Uric Acid, Sodium, Potassium, Chloride.',
        price: 750,
        discountPrice: 580,
        sampleType: 'Blood',
        fastingRequired: false,
        tatHours: 12,
      },
      {
        name: 'Urine Routine & Automated Microscopy Examination',
        code: 'TEST-URN-09',
        category: 'Pathology',
        description: 'Screening for urinary tract infections, renal stones, proteinuria, and occult blood.',
        price: 300,
        discountPrice: 220,
        sampleType: 'Urine',
        fastingRequired: false,
        tatHours: 6,
        precautions: 'First morning midstream urine sample recommended in sterile container.',
      },
      {
        name: 'Cardiac Troponin-I High Sensitivity Screen',
        code: 'TEST-TROP-10',
        category: 'Cardiology',
        description: 'Critical biomarker for acute coronary syndromes, myocardial injury, and cardiac ischemia.',
        price: 1400,
        discountPrice: 1150,
        sampleType: 'Serum',
        fastingRequired: false,
        tatHours: 4,
      },
    ];

    const createdTests = await Test.insertMany(testsData);
    console.log(`Created ${createdTests.length} diagnostic tests.`);

    // 6. Create 3 Health Packages
    const pkg1 = await Package.create({
      title: 'Basic Wellness & Immunity Screen',
      tests: [createdTests[0]._id, createdTests[8]._id, createdTests[2]._id], // CBC, Urine, Glucose
      price: 1350,
      discountPrice: 899,
      description: 'Essential preventive health evaluation covering hematology, kidney screening, and fasting blood sugar.',
      recommendedFor: 'Individuals under 40 seeking annual general health baseline.',
      fastingRequired: true,
    });

    const pkg2 = await Package.create({
      title: 'Executive Cardio-Diabetic Checkup',
      tests: [createdTests[1]._id, createdTests[2]._id, createdTests[3]._id, createdTests[9]._id], // Lipid, Glucose, CMP, Troponin
      price: 3950,
      discountPrice: 2499,
      description: 'In-depth cardiovascular risk analysis, arterial health biomarkers, kidney-liver balance, and long-term diabetes control.',
      recommendedFor: 'Adults with family history of heart disease, sedentary lifestyle, or hypertension.',
      fastingRequired: true,
    });

    const pkg3 = await Package.create({
      title: 'Comprehensive Senior Full Body Master Check',
      tests: [
        createdTests[0]._id, // CBC
        createdTests[1]._id, // Lipid
        createdTests[4]._id, // Thyroid
        createdTests[5]._id, // Vitamin D3 & B12
        createdTests[6]._id, // LFT
        createdTests[7]._id, // KFT
        createdTests[8]._id, // Urine
      ],
      price: 6450,
      discountPrice: 3899,
      description: 'Our most comprehensive diagnostic screening covering all major organ systems: bone, liver, kidneys, thyroid, and blood profile.',
      recommendedFor: 'Adults aged 45+ or anyone desiring total health transparency.',
      fastingRequired: true,
    });
    console.log(`Created 3 comprehensive health packages.`);

    // 7. Create Sample Test Bookings (Testing various statuses)
    // Booking 1: Report Ready (for Rahul Gupta)
    const booking1 = await TestBooking.create({
      bookingId: 'MT-TEST-2026-001',
      patient: patient1User._id,
      tests: [createdTests[0]._id, createdTests[1]._id], // CBC & Lipid Profile
      packages: [],
      collectionType: 'home_collection',
      scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      slot: '08:00 AM - 09:00 AM',
      address: {
        street: '42 Lotus Enclave, 4th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
      },
      assignedStaff: lab1User._id,
      status: 'Report Ready',
      statusHistory: [
        {
          status: 'Booked',
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          changedBy: patient1User._id,
          notes: 'Test booking created by patient',
        },
        {
          status: 'Paid',
          changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 300000),
          changedBy: patient1User._id,
          notes: 'Payment confirmed via Razorpay',
        },
        {
          status: 'Sample Collected',
          changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          changedBy: lab1User._id,
          notes: 'Home collection phlebotomist secured EDTA and serum tubes',
        },
        {
          status: 'Processing',
          changedAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
          changedBy: lab1User._id,
          notes: 'Samples loaded in automated analyzer',
        },
        {
          status: 'Report Ready',
          changedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          changedBy: lab1User._id,
          notes: 'Biochemical report authorized and signed by Chief Pathologist',
        },
      ],
      paymentStatus: 'Paid',
      totalAmount: 1000,
      homeCollectionFee: 150,
    });

    // Create Report Document for Booking 1
    await Report.create({
      reportId: 'REP-2026-9041',
      booking: booking1._id,
      patient: patient1User._id,
      fileUrl: '/uploads/sample_diagnostic_report.pdf',
      fileName: 'Rahul_Gupta_CBC_Lipid_Report.pdf',
      fileSize: 245760,
      uploadedBy: lab1User._id,
      summary: 'All parameters within normal clinical ranges. Mild elevation in serum triglycerides noted.',
      criticalFlag: false,
    });

    // Payment for Booking 1
    await Payment.create({
      paymentId: 'PAY-RZP-9001',
      bookingRef: booking1._id,
      bookingType: 'TestBooking',
      patient: patient1User._id,
      amount: 1150,
      currency: 'INR',
      razorpayOrderId: 'order_test_MT001_rzp',
      razorpayPaymentId: 'pay_test_succ_9901',
      razorpaySignature: 'sig_verified_mock_test_001',
      status: 'Captured',
      invoiceNumber: 'INV-2026-0001',
      invoiceDate: new Date(),
      receiptDetails: {
        billingName: 'Rahul Gupta',
        billingEmail: 'patient@meditrack.com',
        billingPhone: '+91 9866677788',
        description: 'Complete Blood Count & Lipid Profile (Home Collection)',
      },
    });

    // Booking 2: In "Processing" state (for Sneha Patel)
    await TestBooking.create({
      bookingId: 'MT-TEST-2026-002',
      patient: patient2User._id,
      tests: [createdTests[4]._id, createdTests[5]._id], // Thyroid & Vitamin D3
      packages: [],
      collectionType: 'lab_visit',
      scheduledDate: new Date(),
      slot: '10:00 AM - 11:00 AM',
      address: {
        street: 'MediTrack Central Lab, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
      },
      assignedStaff: lab2User._id,
      status: 'Processing',
      statusHistory: [
        {
          status: 'Booked',
          changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          changedBy: patient2User._id,
          notes: 'Test booking created',
        },
        {
          status: 'Paid',
          changedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
          changedBy: patient2User._id,
          notes: 'Payment confirmed via Razorpay',
        },
        {
          status: 'Sample Collected',
          changedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          changedBy: lab2User._id,
          notes: 'Sample checked in at lab reception desk',
        },
        {
          status: 'Processing',
          changedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          changedBy: lab2User._id,
          notes: 'Centrifugation complete; running CLIA assay',
        },
      ],
      paymentStatus: 'Paid',
      totalAmount: 1749,
      homeCollectionFee: 0,
    });

    // 8. Create Doctor Appointments
    // Appointment 1: Scheduled with Dr. Rajesh Sharma for Rahul Gupta
    const apt1 = await Appointment.create({
      appointmentId: 'MT-APT-2026-001',
      patient: patient1User._id,
      doctor: doc1User._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      slot: '10:00 AM - 10:30 AM',
      status: 'Confirmed',
      statusHistory: [
        {
          status: 'Scheduled',
          changedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          notes: 'Patient requested consultation for cardiac palpitation check',
        },
        {
          status: 'Confirmed',
          changedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          notes: 'Doctor confirmed slot schedule',
        },
      ],
      consultationType: 'In-Person',
      symptoms: 'Mild chest tightness after jogging, shortness of breath on stairs.',
      fee: 800,
      paymentStatus: 'Paid',
    });

    // Payment for Appointment 1
    await Payment.create({
      paymentId: 'PAY-RZP-9002',
      bookingRef: apt1._id,
      bookingType: 'Appointment',
      patient: patient1User._id,
      amount: 800,
      currency: 'INR',
      razorpayOrderId: 'order_test_APT001_rzp',
      razorpayPaymentId: 'pay_test_succ_9902',
      razorpaySignature: 'sig_verified_mock_test_002',
      status: 'Captured',
      invoiceNumber: 'INV-2026-0002',
      invoiceDate: new Date(),
      receiptDetails: {
        billingName: 'Rahul Gupta',
        billingEmail: 'patient@meditrack.com',
        billingPhone: '+91 9866677788',
        description: 'Cardiology Specialist Consultation with Dr. Rajesh Sharma',
      },
    });

    // Appointment 2: Scheduled with Dr. Priya Nair for Sneha Patel
    await Appointment.create({
      appointmentId: 'MT-APT-2026-002',
      patient: patient2User._id,
      doctor: doc2User._id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      slot: '11:00 AM - 11:30 AM',
      status: 'Confirmed',
      consultationType: 'Video',
      symptoms: 'Recurring morning migraines with light sensitivity.',
      fee: 950,
      paymentStatus: 'Paid',
    });

    // Appointment 3: Completed consultation with Digital Prescription
    const apt3 = await Appointment.create({
      appointmentId: 'MT-APT-2026-003',
      patient: patient1User._id,
      doctor: doc1User._id,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      slot: '02:00 PM - 02:30 PM',
      status: 'Completed',
      consultationType: 'In-Person',
      symptoms: 'Follow-up for blood pressure monitoring and cholesterol review.',
      fee: 800,
      paymentStatus: 'Paid',
    });

    // 9. Create Digital Prescription for Appointment 3
    await Prescription.create({
      appointment: apt3._id,
      doctor: doc1User._id,
      patient: patient1User._id,
      diagnosis: 'Essential Hypertension Stage 1 with Mild Dyslipidemia',
      medicines: [
        {
          name: 'Telmisartan 40mg',
          dosage: '40mg',
          frequency: '1-0-0',
          duration: '30 days',
          instructions: 'Take once daily in morning with water',
        },
        {
          name: 'Atorvastatin 10mg',
          dosage: '10mg',
          frequency: '0-0-1',
          duration: '30 days',
          instructions: 'Take at night after food',
        },
      ],
      recommendedTests: ['Lipid Profile', 'Serum Creatinine', 'ECG (12 Lead)'],
      doctorNotes: 'Maintain low sodium diet, avoid saturated fats, 30 min brisk walk daily.',
      followUpDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    });

    // 10. Create Doctor Review
    await Review.create({
      doctor: doc1User._id,
      patient: patient1User._id,
      appointment: apt3._id,
      rating: 5,
      comment: 'Dr. Sharma is very knowledgeable and patient. Explained my lipid reports thoroughly!',
    });

    // 11. Create Sample Support Complaint Ticket
    await Complaint.create({
      complaintId: 'TKT-2026-101',
      user: patient1User._id,
      category: 'Report Delay',
      subject: 'Clarification regarding lipid report turnaround time',
      description: 'Would like to know the typical processing window for advanced lipid fractions.',
      status: 'Resolved',
      resolutionNotes: 'Standard turnaround time is 12-24 hours. Report was delivered at 14 hours.',
      resolvedBy: adminUser._id,
      resolvedAt: new Date(),
    });

    // 12. Create Notifications
    await Notification.create({
      user: patient1User._id,
      title: 'Diagnostic Report Ready',
      message: 'Your laboratory report for CBC & Lipid Profile (MT-TEST-2026-001) is ready for download.',
      type: 'report',
      link: '/patient/reports',
      isRead: false,
    });

    await Notification.create({
      user: patient1User._id,
      title: 'Appointment Confirmed',
      message: 'Your cardiology consultation with Dr. Rajesh Sharma is confirmed for tomorrow at 10:00 AM.',
      type: 'appointment',
      link: '/patient/appointments',
      isRead: true,
    });

    await Notification.create({
      user: adminUser._id,
      title: 'New Doctor Application',
      message: 'Dr. Amit Verma has applied for registration. Medical license verification is pending.',
      type: 'admin',
      link: '/admin/doctor-approvals',
      isRead: false,
    });

    console.log(`\n======================================================`);
    console.log(`[MediTrack Seeder] Database populated successfully!`);
    console.log(`======================================================`);
    console.log(`\nDEMO LOGIN CREDENTIALS:`);
    console.log(`------------------------------------------------------`);
    console.log(`1. PATIENT:`);
    console.log(`   Email:    patient@meditrack.com`);
    console.log(`   Password: patient123`);
    console.log(`   (Additional: sneha@meditrack.com / patient123, vikram@meditrack.com / patient123)`);
    console.log(`------------------------------------------------------`);
    console.log(`2. DOCTOR (Approved):`);
    console.log(`   Email:    dr.sharma@meditrack.com  (Cardiologist)`);
    console.log(`   Password: doctor123`);
    console.log(`   (Additional Approved: dr.nair@meditrack.com / doctor123 - Neurologist)`);
    console.log(`   (Doctor Pending Approval: dr.verma@meditrack.com / doctor123 - Dermatologist)`);
    console.log(`------------------------------------------------------`);
    console.log(`3. LAB STAFF:`);
    console.log(`   Email:    lab@meditrack.com`);
    console.log(`   Password: labstaff123`);
    console.log(`   (Additional: lab.anita@meditrack.com / labstaff123)`);
    console.log(`------------------------------------------------------`);
    console.log(`4. ADMIN:`);
    console.log(`   Email:    admin@meditrack.com`);
    console.log(`   Password: admin123`);
    console.log(`======================================================\n`);

    process.exit(0);
  } catch (error) {
    console.error(`[MediTrack Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
