export const LEAD_SOURCES = [
  'Website',
  'Facebook',
  'Instagram',
  'LinkedIn',
  'Google Ads',
  'Referral',
  'Walk-in',
  'Phone Call'
];

export const LEAD_PIPELINE_STAGES = [
  'New',
  'Contacted',
  'Counselling Scheduled',
  'Interested',
  'Follow-up Required',
  'Converted / Lost'
];

export const LEAD_PRIORITIES = ['Hot', 'Warm', 'Cold'];

export const COUNSELLORS_LIST = [
  'Pooja Verma',
  'Karan Singhania',
  'Rohit Sharma',
  'Ananya Sen',
  'Vikram Mehta'
];

export const initialInstituteData = {
  stats: {
    totalStudents: 342,
    activeStudentsGrowth: '+14.5%',
    newLeadsThisMonth: 86,
    leadConversionRate: '28.4%',
    confirmedAdmissions: 24,
    activeCourses: 6,
    activeBatches: 5,
    monthlyRevenue: 642000,
    revenueGrowth: '+18.2%',
    pendingFees: 128500,
    attendanceAverage: '92.4%',
    feeCollectionRate: '83.3%'
  },

  revenueTimeline: [
    { month: 'Jun', collected: 420000, target: 400000, admissions: 16 },
    { month: 'Jul', collected: 485000, target: 450000, admissions: 19 },
    { month: 'Aug', collected: 530000, target: 500000, admissions: 22 },
    { month: 'Sep', collected: 510000, target: 520000, admissions: 20 },
    { month: 'Oct', collected: 590000, target: 550000, admissions: 25 },
    { month: 'Nov', collected: 642000, target: 600000, admissions: 24 }
  ],

  courses: [
    {
      id: 1,
      name: 'Full Stack Web Development (MERN)',
      code: 'FSWD-101',
      category: 'Software Development',
      durationWeeks: 16,
      fee: 45000,
      activeStudents: 82,
      description: 'Comprehensive web development program covering React, Node.js, Express, PostgreSQL, and full-stack deployment.',
      modules: ['JavaScript & TypeScript Fundamentals', 'React 18 & Frontend Architecture', 'Node.js & Express REST APIs', 'PostgreSQL & Database Design', 'Final Capstone Project']
    },
    {
      id: 2,
      name: 'Data Science & Machine Learning with Python',
      code: 'DSML-201',
      category: 'Data & AI',
      durationWeeks: 20,
      fee: 55000,
      activeStudents: 64,
      description: 'Practical data science covering statistical modeling, Pandas, Scikit-Learn, and applied Machine Learning.',
      modules: ['Python for Data Analysis', 'Exploratory Data Analysis & SQL', 'Machine Learning Models', 'Deep Learning Basics', 'Applied Industry Project']
    },
    {
      id: 3,
      name: 'UI/UX Product Design Masterclass',
      code: 'UIUX-301',
      category: 'Design',
      durationWeeks: 12,
      fee: 35000,
      activeStudents: 45,
      description: 'User research, wireframing, Figma design systems, prototyping, and design portfolio creation.',
      modules: ['User Research & Wireframing', 'Figma Design Systems', 'Visual & Interactive Prototyping', 'Usability Testing', 'Portfolio Case Studies']
    },
    {
      id: 4,
      name: 'Digital Marketing & Growth Hacking',
      code: 'DM-401',
      category: 'Marketing',
      durationWeeks: 10,
      fee: 28000,
      activeStudents: 38,
      description: 'Performance marketing, Meta Ads, Google Ads, SEO, and conversion rate optimization.',
      modules: ['SEO & Organic Growth', 'Paid Ads (Google & Meta)', 'Content Marketing & Copywriting', 'Analytics & Reporting']
    },
    {
      id: 5,
      name: 'Cyber Security & Ethical Hacking',
      code: 'SEC-501',
      category: 'Cyber Security',
      durationWeeks: 18,
      fee: 50000,
      activeStudents: 29,
      description: 'Network defense, vulnerability assessments, penetration testing, and incident response.',
      modules: ['Networking & Linux Essentials', 'Reconnaissance & Footprinting', 'Penetration Testing Tools', 'Security Audits & Reports']
    },
    {
      id: 6,
      name: 'Cloud Computing & DevOps',
      code: 'CLD-601',
      category: 'Software Development',
      durationWeeks: 14,
      fee: 48000,
      activeStudents: 34,
      description: 'AWS architecture, CI/CD pipelines, Docker containerization, and Terraform.',
      modules: ['Cloud Infrastructure Basics', 'Docker Containerization', 'Kubernetes Deployment', 'CI/CD Pipelines with GitHub Actions']
    }
  ],

  batches: [
    {
      id: 1,
      name: 'FSWD Morning Batch (M26)',
      course: 'Full Stack Web Development (MERN)',
      instructor: 'Prof. Alex Rivera',
      timing: 'Mon-Fri 09:00 AM - 11:30 AM',
      startDate: '2026-12-01',
      enrolled: 21,
      capacity: 25,
      mode: 'Hybrid',
      room: 'Lab 3 / Online',
      status: 'Upcoming'
    },
    {
      id: 2,
      name: 'Data Science Weekend Cohort (DS-14)',
      course: 'Data Science & Machine Learning with Python',
      instructor: 'Dr. Sunita Sharma',
      timing: 'Sat-Sun 10:00 AM - 02:00 PM',
      startDate: '2026-12-06',
      enrolled: 26,
      capacity: 30,
      mode: 'Online',
      room: 'Virtual Classroom 1',
      status: 'Upcoming'
    },
    {
      id: 3,
      name: 'UI/UX Evening Batch (U4)',
      course: 'UI/UX Product Design Masterclass',
      instructor: 'Vikram Mehta',
      timing: 'Mon-Wed-Fri 06:30 PM - 08:30 PM',
      startDate: '2026-11-10',
      enrolled: 18,
      capacity: 20,
      mode: 'Classroom',
      room: 'Design Studio A',
      status: 'Ongoing'
    },
    {
      id: 4,
      name: 'Cyber Security Sprint Cohort (SEC-09)',
      course: 'Cyber Security & Ethical Hacking',
      instructor: 'Rohan Kapoor',
      timing: 'Tue-Thu-Sat 03:00 PM - 05:30 PM',
      startDate: '2026-12-15',
      enrolled: 14,
      capacity: 20,
      mode: 'Hybrid',
      room: 'Security Lab 1',
      status: 'Upcoming'
    },
    {
      id: 5,
      name: 'Digital Marketing FastTrack',
      course: 'Digital Marketing & Growth Hacking',
      instructor: 'Ananya Sen',
      timing: 'Mon-Thu 07:00 PM - 09:00 PM',
      startDate: '2026-10-20',
      enrolled: 22,
      capacity: 22,
      mode: 'Online',
      room: 'Virtual Classroom 2',
      status: 'Ongoing'
    }
  ],

  // Inquiries / Prospective Leads (Pre-admission stage)
  recentLeads: [
    {
      id: 101,
      name: 'Riya Kapoor',
      phone: '+91 98765 43210',
      email: 'riya.k@example.com',
      city: 'Pune',
      qualification: 'B.Tech CS',
      college: 'Pune Institute of Computer Technology (PICT)',
      course: 'Full Stack Web Development (MERN)',
      source: 'Website',
      counselor: 'Pooja Verma',
      createdAt: '2026-11-18',
      status: 'Counselling Scheduled',
      priority: 'Hot',
      nextFollowUpDate: '2026-11-20T11:00',
      notes: 'B.Tech CS graduate. Attending demo counseling session. Looking for placement assistance.',
      notesList: [
        { id: 1, text: 'Inquired about weekend vs weekday MERN batch and placement track record.', date: '2026-11-18 10:30', author: 'Pooja Verma' },
        { id: 2, text: 'Shared syllabus and scheduled 1-on-1 counseling demo.', date: '2026-11-19 14:15', author: 'Pooja Verma' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-18 10:25', duration: '4m 10s', outcome: 'Connected - Interested', notes: 'First intro call. High interest in React & Node.js.', counselor: 'Pooja Verma' },
        { id: 2, date: '2026-11-19 16:00', duration: '2m 30s', outcome: 'Counseling Scheduled', notes: 'Confirmed demo session for today 11 AM.', counselor: 'Pooja Verma' }
      ]
    },
    {
      id: 102,
      name: 'Aman Verma',
      phone: '+91 98111 22334',
      email: 'aman.v@example.com',
      city: 'Mumbai',
      qualification: 'B.Sc Statistics',
      college: "St. Xavier's College, Mumbai",
      course: 'Data Science & Machine Learning with Python',
      source: 'Instagram',
      counselor: 'Pooja Verma',
      createdAt: '2026-11-17',
      status: 'Follow-up Required',
      priority: 'Hot',
      nextFollowUpDate: '2026-11-19T16:00',
      notes: 'Working as business analyst. Wants weekend batch. Requested installment options.',
      notesList: [
        { id: 1, text: 'Requested fee installment options and curriculum details for NLP modules.', date: '2026-11-17 11:20', author: 'Pooja Verma' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-17 11:15', duration: '5m 05s', outcome: 'Connected - Interested', notes: 'Discussed weekend schedule and fees.', counselor: 'Pooja Verma' },
        { id: 2, date: '2026-11-19 15:45', duration: '1m 20s', outcome: 'Call Back Requested', notes: 'In a meeting; follow-up call needed.', counselor: 'Pooja Verma' }
      ]
    },
    {
      id: 103,
      name: 'Neha Deshmukh',
      phone: '+91 97234 56789',
      email: 'neha.d@example.com',
      city: 'Pune',
      qualification: 'B.Des',
      college: 'MIT Institute of Design',
      course: 'UI/UX Product Design Masterclass',
      source: 'Walk-in',
      counselor: 'Karan Singhania',
      createdAt: '2026-11-20',
      status: 'Interested',
      priority: 'Warm',
      nextFollowUpDate: '2026-11-21T14:30',
      notes: 'Visited campus today. Very keen on Figma design systems and UX portfolio project.',
      notesList: [
        { id: 1, text: 'Visited academy in person. Took lab tour with Karan.', date: '2026-11-20 12:00', author: 'Karan Singhania' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-20 16:30', duration: '3m 15s', outcome: 'Connected - Interested', notes: 'Follow-up after in-person visit. Sent brochure to parents.', counselor: 'Karan Singhania' }
      ]
    },
    {
      id: 104,
      name: 'Siddharth Joshi',
      phone: '+91 91234 09876',
      email: 'sid.j@example.com',
      city: 'Nagpur',
      qualification: 'BCA 3rd Year',
      college: 'Raisoni College of Engineering',
      course: 'Cyber Security & Ethical Hacking',
      source: 'Google Ads',
      counselor: 'Rohit Sharma',
      createdAt: '2026-11-19',
      status: 'Contacted',
      priority: 'Warm',
      nextFollowUpDate: '2026-11-22T10:00',
      notes: 'Final year student looking for CEH certification curriculum and hands-on lab access.',
      notesList: [
        { id: 1, text: 'Filled inquiry from Google Ad campaign.', date: '2026-11-19 14:00', author: 'Rohit Sharma' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-19 15:30', duration: '3m 40s', outcome: 'Connected - Interested', notes: 'Introductory discussion regarding lab setup and timings.', counselor: 'Rohit Sharma' }
      ]
    },
    {
      id: 105,
      name: 'Tanvi Agarwal',
      phone: '+91 98334 11223',
      email: 'tanvi.a@example.com',
      city: 'Bengaluru',
      qualification: 'BE Information Science',
      college: 'BMS College of Engineering',
      course: 'Cloud Computing & DevOps',
      source: 'LinkedIn',
      counselor: 'Karan Singhania',
      createdAt: '2026-11-20',
      status: 'New',
      priority: 'Hot',
      nextFollowUpDate: '2026-11-20T17:30',
      notes: 'QA Engineer with 2 years experience transitioning to Cloud/DevOps. High intent.',
      notesList: [
        { id: 1, text: 'Inbound message on LinkedIn regarding AWS + Docker batch.', date: '2026-11-20 09:15', author: 'Karan Singhania' }
      ],
      callHistory: []
    },
    {
      id: 106,
      name: 'Rahul Kulkarni',
      phone: '+91 98450 11998',
      email: 'rahul.k@example.com',
      city: 'Pune',
      qualification: 'B.Com Graduate',
      college: 'BMCC Pune',
      course: 'Digital Marketing & Growth Hacking',
      source: 'Facebook',
      counselor: 'Ananya Sen',
      createdAt: '2026-11-15',
      status: 'Converted / Lost',
      priority: 'Cold',
      nextFollowUpDate: '2026-11-16T12:00',
      notes: 'Opted for distant university MBA instead. Retained for future short-term workshops.',
      notesList: [
        { id: 1, text: 'Expressed budget constraints and opted for alternate program.', date: '2026-11-16 12:10', author: 'Ananya Sen' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-15 11:00', duration: '4m 00s', outcome: 'Connected - Interested', notes: 'First briefing on course fees.', counselor: 'Ananya Sen' },
        { id: 2, date: '2026-11-16 12:05', duration: '2m 10s', outcome: 'Not Interested / Lost', notes: 'Decided not to enroll this session.', counselor: 'Ananya Sen' }
      ]
    },
    {
      id: 107,
      name: 'Sneha Reddy',
      phone: '+91 98555 44332',
      email: 'sneha.r@example.com',
      city: 'Hyderabad',
      qualification: 'B.Tech ECE',
      college: 'JNTU Hyderabad',
      course: 'Full Stack Web Development (MERN)',
      source: 'Referral',
      counselor: 'Vikram Mehta',
      createdAt: '2026-11-19',
      status: 'Interested',
      priority: 'Hot',
      nextFollowUpDate: '2026-11-23T11:00',
      notes: 'Referred by alumni Dev Patel. Wants to join the morning hybrid cohort.',
      notesList: [
        { id: 1, text: 'Friend of current student Dev Patel. Fast-track admission interest.', date: '2026-11-19 16:40', author: 'Vikram Mehta' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-19 17:00', duration: '6m 20s', outcome: 'Connected - Interested', notes: 'Very positive call. Reviewing admission form.', counselor: 'Vikram Mehta' }
      ]
    },
    {
      id: 108,
      name: 'Aditya Saxena',
      phone: '+91 98222 33441',
      email: 'aditya.s@example.com',
      city: 'Noida',
      qualification: 'BCA',
      college: 'Amity University',
      course: 'Cyber Security & Ethical Hacking',
      source: 'Phone Call',
      counselor: 'Pooja Verma',
      createdAt: '2026-11-20',
      status: 'New',
      priority: 'Warm',
      nextFollowUpDate: '2026-11-20T15:00',
      notes: 'Inbounded via direct phone call inquiry. Sent syllabus brochure on WhatsApp.',
      notesList: [
        { id: 1, text: 'Direct incoming call on center hotline.', date: '2026-11-20 10:05', author: 'Pooja Verma' }
      ],
      callHistory: [
        { id: 1, date: '2026-11-20 10:06', duration: '3m 50s', outcome: 'Connected - Interested', notes: 'Counseling scheduled for afternoon call.', counselor: 'Pooja Verma' }
      ]
    }
  ],

  // Admissions Pipeline (When leads are confirmed, they move here)
  admissions: [
    {
      id: 1,
      admissionNo: 'ADM-2026-0041',
      applicationNo: 'APP-2026-081',
      studentName: 'Aarav Mehta',
      phone: '+91 98223 11445',
      email: 'aarav.m@gmail.com',
      guardianName: 'Rajesh Mehta (Father)',
      guardianPhone: '+91 98223 99887',
      address: '402 Sunrise Heights, MG Road, Pune',
      course: 'Full Stack Web Development (MERN)',
      batch: 'FSWD Morning Batch (M26)',
      duration: '16 Weeks',
      admissionDate: '2026-10-15',
      totalCourseFee: 45000,
      discount: 0,
      netFee: 45000,
      admissionFeePaid: 45000,
      feeDue: 0,
      paymentPlan: 'One-Time Full Payment',
      status: 'Admission Confirmed',
      counselor: 'Pooja Verma',
      notes: 'Full payment made at time of admission. Verification complete.'
    },
    {
      id: 2,
      admissionNo: 'ADM-2026-0042',
      applicationNo: 'APP-2026-082',
      studentName: 'Priya Iyer',
      phone: '+91 98450 33211',
      email: 'priya.iyer@gmail.com',
      guardianName: 'Laxmi Iyer (Mother)',
      guardianPhone: '+91 98450 77665',
      address: '12 Emerald Park, Kothrud, Pune',
      course: 'Data Science & Machine Learning with Python',
      batch: 'Data Science Weekend Cohort (DS-14)',
      duration: '20 Weeks',
      admissionDate: '2026-10-22',
      totalCourseFee: 55000,
      discount: 5000,
      netFee: 50000,
      admissionFeePaid: 30000,
      feeDue: 20000,
      paymentPlan: '2 Installments (60/40)',
      status: 'Admission Confirmed',
      counselor: 'Pooja Verma',
      notes: 'Early bird scholarship applied. 2nd installment due on Dec 1st.'
    },
    {
      id: 3,
      admissionNo: 'ADM-2026-0043',
      applicationNo: 'APP-2026-083',
      studentName: 'Kunal Deshmukh',
      phone: '+91 99123 44556',
      email: 'kunal.d@gmail.com',
      guardianName: 'Anand Deshmukh (Father)',
      guardianPhone: '+91 99123 88990',
      address: '77 Royal Palms, Aundh, Pune',
      course: 'UI/UX Product Design Masterclass',
      batch: 'UI/UX Evening Batch (U4)',
      duration: '12 Weeks',
      admissionDate: '2026-11-02',
      totalCourseFee: 35000,
      discount: 0,
      netFee: 35000,
      admissionFeePaid: 15000,
      feeDue: 20000,
      paymentPlan: '2 Installments (50/50)',
      status: 'Fee Pending',
      counselor: 'Karan Singhania',
      notes: 'Initial admission fee paid. Second installment overdue by 3 days.'
    },
    {
      id: 4,
      admissionNo: 'ADM-2026-0044',
      applicationNo: 'APP-2026-084',
      studentName: 'Dev Patel',
      phone: '+91 99887 76655',
      email: 'dev.p@example.com',
      guardianName: 'Suresh Patel (Father)',
      guardianPhone: '+91 99887 11223',
      address: 'B-14 Silver Oak, Baner, Pune',
      course: 'Full Stack Web Development (MERN)',
      batch: 'FSWD Morning Batch (M26)',
      duration: '16 Weeks',
      admissionDate: '2026-11-18',
      totalCourseFee: 45000,
      discount: 3000,
      netFee: 42000,
      admissionFeePaid: 15000,
      feeDue: 27000,
      paymentPlan: '3 Installments (Installment 1 paid)',
      status: 'Document Verification',
      counselor: 'Karan Singhania',
      notes: 'Converted directly from referral lead. ID proof submitted; graduation marksheet pending.'
    },
    {
      id: 5,
      admissionNo: 'ADM-2026-0045',
      applicationNo: 'APP-2026-085',
      studentName: 'Simran Kaur',
      phone: '+91 98777 66554',
      email: 'simran.k@outlook.com',
      guardianName: 'Harpreet Kaur (Mother)',
      guardianPhone: '+91 98777 11223',
      address: 'Flat 502, Green Valley, Viman Nagar, Pune',
      course: 'Digital Marketing & Growth Hacking',
      batch: 'Digital Marketing FastTrack',
      duration: '10 Weeks',
      admissionDate: '2026-10-18',
      totalCourseFee: 28000,
      discount: 0,
      netFee: 28000,
      admissionFeePaid: 28000,
      feeDue: 0,
      paymentPlan: 'One-Time Full Payment',
      status: 'Admission Confirmed',
      counselor: 'Pooja Verma',
      notes: 'Full fees cleared. Student kit issued.'
    }
  ],

  // Enrolled Students Directory
  students: [
    {
      id: 1,
      studentId: 'STU-2026-081',
      admissionNo: 'ADM-2026-0041',
      name: 'Aarav Mehta',
      email: 'aarav.m@gmail.com',
      phone: '+91 98223 11445',
      guardian: 'Rajesh Mehta (Father)',
      guardianPhone: '+91 98223 99887',
      course: 'Full Stack Web Development (MERN)',
      batch: 'FSWD Morning Batch (M26)',
      enrollmentDate: '2026-10-15',
      feeTotal: 45000,
      feePaid: 45000,
      feeDue: 0,
      feeStatus: 'Paid',
      attendance: 96,
      status: 'Active'
    },
    {
      id: 2,
      studentId: 'STU-2026-082',
      admissionNo: 'ADM-2026-0042',
      name: 'Priya Iyer',
      email: 'priya.iyer@gmail.com',
      phone: '+91 98450 33211',
      guardian: 'Laxmi Iyer (Mother)',
      guardianPhone: '+91 98450 77665',
      course: 'Data Science & Machine Learning with Python',
      batch: 'Data Science Weekend Cohort (DS-14)',
      enrollmentDate: '2026-10-22',
      feeTotal: 50000,
      feePaid: 30000,
      feeDue: 20000,
      feeStatus: 'Partial',
      attendance: 92,
      status: 'Active'
    },
    {
      id: 3,
      studentId: 'STU-2026-083',
      admissionNo: 'ADM-2026-0043',
      name: 'Kunal Deshmukh',
      email: 'kunal.d@gmail.com',
      phone: '+91 99123 44556',
      guardian: 'Anand Deshmukh (Father)',
      guardianPhone: '+91 99123 88990',
      course: 'UI/UX Product Design Masterclass',
      batch: 'UI/UX Evening Batch (U4)',
      enrollmentDate: '2026-11-02',
      feeTotal: 35000,
      feePaid: 15000,
      feeDue: 20000,
      feeStatus: 'Overdue',
      attendance: 78,
      status: 'Active'
    },
    {
      id: 4,
      studentId: 'STU-2026-084',
      admissionNo: 'ADM-2026-0044',
      name: 'Dev Patel',
      email: 'dev.p@example.com',
      phone: '+91 99887 76655',
      guardian: 'Suresh Patel (Father)',
      guardianPhone: '+91 99887 11223',
      course: 'Full Stack Web Development (MERN)',
      batch: 'FSWD Morning Batch (M26)',
      enrollmentDate: '2026-11-18',
      feeTotal: 42000,
      feePaid: 15000,
      feeDue: 27000,
      feeStatus: 'Partial',
      attendance: 100,
      status: 'Active'
    },
    {
      id: 5,
      studentId: 'STU-2026-085',
      admissionNo: 'ADM-2026-0045',
      name: 'Simran Kaur',
      email: 'simran.k@outlook.com',
      phone: '+91 98777 66554',
      guardian: 'Harpreet Kaur (Mother)',
      guardianPhone: '+91 98777 11223',
      course: 'Digital Marketing & Growth Hacking',
      batch: 'Digital Marketing FastTrack',
      enrollmentDate: '2026-10-18',
      feeTotal: 28000,
      feePaid: 28000,
      feeDue: 0,
      feeStatus: 'Paid',
      attendance: 94,
      status: 'Active'
    }
  ],

  feeTransactions: [
    {
      receiptNo: 'RCP-2026-091',
      studentName: 'Aarav Mehta',
      studentId: 'STU-2026-081',
      course: 'Full Stack Web Development (MERN)',
      amount: 45000,
      mode: 'UPI (Google Pay)',
      date: '2026-11-19 14:32',
      collectedBy: 'Pooja Verma',
      status: 'Success'
    },
    {
      receiptNo: 'RCP-2026-090',
      studentName: 'Dev Patel',
      studentId: 'STU-2026-084',
      course: 'Full Stack Web Development (MERN)',
      amount: 15000,
      mode: 'Netbanking (HDFC)',
      date: '2026-11-18 11:20',
      collectedBy: 'Karan Singhania',
      status: 'Success'
    },
    {
      receiptNo: 'RCP-2026-089',
      studentName: 'Priya Iyer',
      studentId: 'STU-2026-082',
      course: 'Data Science & Machine Learning with Python',
      amount: 30000,
      mode: 'Credit Card',
      date: '2026-11-17 16:45',
      collectedBy: 'Finance Desk',
      status: 'Success'
    },
    {
      receiptNo: 'RCP-2026-088',
      studentName: 'Simran Kaur',
      studentId: 'STU-2026-085',
      course: 'Digital Marketing & Growth Hacking',
      amount: 28000,
      mode: 'UPI (PhonePe)',
      date: '2026-11-16 10:15',
      collectedBy: 'Front Desk',
      status: 'Success'
    }
  ]
};
