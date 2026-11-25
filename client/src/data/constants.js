export const LEAD_SOURCES = [
  'QR Code (Campus Reception)',
  'Website',
  'Walk-in',
  'Instagram',
  'Facebook',
  'LinkedIn',
  'Google Ads',
  'Referral',
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

export const OFFICIAL_TRAINERS = [
  {
    id: 1795363539407,
    employeeId: 'EMP-2026-001',
    name: 'Deepika',
    role: 'Technical Trainer',
    department: 'Academic Faculty',
    phone: '9856429756',
    email: 'deepika@gmail.com',
    qualification: 'M.Tech.',
    experience: '2+ Years',
    status: 'Full Time',
    bio: 'Specialist in MERN stack, React.js, Node.js, and cloud application development.',
    skills: ['React.js', 'Node.js', 'Python', 'JavaScript', 'Java', 'Docker & DevOps', 'MongoDB'],
    assignedCourses: ['Full Stack Web Development (MERN)'],
    assignedBatches: ['FSWD Morning Batch (M26)', 'FSWD Evening Batch (E12)'],
    schedule: [
      { id: 1, day: 'Mon-Fri', time: '09:00 AM - 11:30 AM', batch: 'FSWD Morning Batch (M26)', course: 'Full Stack Web Development (MERN)', room: 'Lab 1', mode: 'Classroom' },
      { id: 2, day: 'Mon-Fri', time: '06:00 PM - 08:30 PM', batch: 'FSWD Evening Batch (E12)', course: 'Full Stack Web Development (MERN)', room: 'Lab 2', mode: 'Hybrid' }
    ],
    joiningDate: '2026-11-22'
  }
];

export const OFFICIAL_COURSES = [
  {
    id: 1,
    name: 'Full Stack Web Development (MERN)',
    code: 'FSWD-101',
    category: 'Software Development',
    durationWeeks: 16,
    fee: 45000,
    description: 'Master modern full-stack web applications with React, Node.js, and MongoDB/PostgreSQL.',
    modules: ['Module 1: Frontend & UI Foundations', 'Module 2: Backend APIs & Microservices', 'Module 3: Full Stack Integration & Cloud Deploy']
  },
  {
    id: 2,
    name: 'MERN',
    code: 'CRS-2970',
    category: 'Software Development',
    durationWeeks: 12,
    fee: 25000,
    description: 'Practical hands-on training in MongoDB, Express, React, and Node.js.',
    modules: ['Module 1: Foundations', 'Module 2: Advanced Implementation']
  },
  {
    id: 3,
    name: 'Data Science & Machine Learning with Python',
    code: 'DSML-201',
    category: 'Data & AI',
    durationWeeks: 20,
    fee: 55000,
    description: 'Python, Pandas, Scikit-learn, PyTorch, and hands-on LLM engineering.',
    modules: ['Module 1: Python for Data Science', 'Module 2: Machine Learning Models', 'Module 3: Deep Learning & AI']
  },
  {
    id: 4,
    name: 'UI/UX Design Masterclass',
    code: 'UIUX-301',
    category: 'Design',
    durationWeeks: 12,
    fee: 35000,
    description: 'Figma, wireframing, design systems, usability testing, and portfolio creation.',
    modules: ['Module 1: Design Fundamentals & Wireframing', 'Module 2: Figma & Design Systems']
  },
  {
    id: 5,
    name: 'Digital Marketing & Growth Hacking',
    code: 'DM-401',
    category: 'Marketing',
    durationWeeks: 10,
    fee: 28000,
    description: 'SEO, Meta & Google Ads, analytics, content strategy, and performance marketing.',
    modules: ['Module 1: SEO & Content Marketing', 'Module 2: Paid Ads & Performance Marketing']
  },
  {
    id: 6,
    name: 'Cyber Security & Ethical Hacking',
    code: 'SEC-501',
    category: 'Cyber Security',
    durationWeeks: 18,
    fee: 50000,
    description: 'Network security, penetration testing, CEH syllabus, and vulnerability assessment.',
    modules: ['Module 1: Networking & Linux Fundamentals', 'Module 2: Penetration Testing & Defense']
  }
];

// Clean initial empty state for Institute CRM
export const initialInstituteData = {
  stats: {
    totalStudents: 0,
    activeStudentsGrowth: '0%',
    newLeadsThisMonth: 0,
    leadConversionRate: '0%',
    confirmedAdmissions: 0,
    activeCourses: OFFICIAL_COURSES.length,
    activeBatches: 0,
    monthlyRevenue: 0,
    revenueGrowth: '0%',
    pendingFees: 0,
    attendanceAverage: '0%',
    feeCollectionRate: '0%'
  },
  revenueTimeline: [],
  courses: [],
  batches: [],
  recentLeads: [],
  admissions: [],
  students: [],
  trainers: OFFICIAL_TRAINERS,
  feeTransactions: []
};
