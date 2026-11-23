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

// Official Standard Academic Curriculum Programs
export const OFFICIAL_COURSES = [
  {
    id: 1,
    name: 'Full Stack Web Development (MERN)',
    code: 'FSWD-101',
    category: 'Software Development',
    durationWeeks: 16,
    fee: 45000,
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
    description: 'Practical data science covering statistical modeling, Pandas, Scikit-Learn, and applied Machine Learning models.',
    modules: ['Python for Data Analysis', 'Exploratory Data Analysis & SQL', 'Machine Learning Models', 'Deep Learning Basics', 'Applied Industry Project']
  },
  {
    id: 3,
    name: 'UI/UX Product Design Masterclass',
    code: 'UIUX-301',
    category: 'Design',
    durationWeeks: 12,
    fee: 35000,
    description: 'User research, wireframing, Figma design systems, visual prototyping, and design portfolio creation.',
    modules: ['User Research & Wireframing', 'Figma Design Systems', 'Visual & Interactive Prototyping', 'Usability Testing', 'Portfolio Case Studies']
  },
  {
    id: 4,
    name: 'Cyber Security & Ethical Hacking',
    code: 'SEC-501',
    category: 'Cyber Security',
    durationWeeks: 18,
    fee: 50000,
    description: 'Network defense, vulnerability assessments, penetration testing, and security incident response.',
    modules: ['Networking & Linux Essentials', 'Reconnaissance & Footprinting', 'Penetration Testing Tools', 'Security Audits & Reports']
  },
  {
    id: 5,
    name: 'Cloud Computing & DevOps',
    code: 'CLD-601',
    category: 'Software Development',
    durationWeeks: 14,
    fee: 48000,
    description: 'AWS architecture, CI/CD pipelines, Docker containerization, and Terraform infrastructure as code.',
    modules: ['Cloud Infrastructure Basics', 'Docker Containerization', 'Kubernetes Deployment', 'CI/CD Pipelines with GitHub Actions']
  },
  {
    id: 6,
    name: 'Digital Marketing & Growth Hacking',
    code: 'DM-401',
    category: 'Marketing',
    durationWeeks: 10,
    fee: 28000,
    description: 'Performance marketing, Meta Ads, Google Ads, SEO, and conversion rate optimization.',
    modules: ['SEO & Organic Growth', 'Paid Ads (Google & Meta)', 'Content Marketing & Copywriting', 'Analytics & Reporting']
  }
];

// Official Standard Active Cohort Batches
export const OFFICIAL_BATCHES = [
  {
    id: 1,
    name: 'FSWD Morning Batch (M26)',
    course: 'Full Stack Web Development (MERN)',
    instructor: 'Technical Trainer',
    timing: 'Mon-Fri 09:00 AM - 11:30 AM',
    startDate: '2026-12-01',
    enrolled: 18,
    capacity: 25,
    mode: 'Classroom',
    room: 'Lab 1',
    status: 'Upcoming'
  },
  {
    id: 2,
    name: 'FSWD Evening Batch (E12)',
    course: 'Full Stack Web Development (MERN)',
    instructor: 'Technical Trainer',
    timing: 'Mon-Fri 06:00 PM - 08:30 PM',
    startDate: '2026-12-08',
    enrolled: 14,
    capacity: 25,
    mode: 'Hybrid',
    room: 'Lab 2',
    status: 'Upcoming'
  },
  {
    id: 3,
    name: 'Data Science Weekend Cohort (DS-14)',
    course: 'Data Science & Machine Learning with Python',
    instructor: 'Data Science Faculty',
    timing: 'Sat-Sun 10:00 AM - 02:00 PM',
    startDate: '2026-12-06',
    enrolled: 22,
    capacity: 30,
    mode: 'Online',
    room: 'Virtual Classroom 1',
    status: 'Upcoming'
  },
  {
    id: 4,
    name: 'UI/UX Evening Batch (U4)',
    course: 'UI/UX Product Design Masterclass',
    instructor: 'Design Mentor',
    timing: 'Mon-Wed-Fri 06:30 PM - 08:30 PM',
    startDate: '2026-11-10',
    enrolled: 16,
    capacity: 20,
    mode: 'Classroom',
    room: 'Design Studio A',
    status: 'Ongoing'
  },
  {
    id: 5,
    name: 'Cyber Security Sprint Cohort (SEC-09)',
    course: 'Cyber Security & Ethical Hacking',
    instructor: 'Security Specialist',
    timing: 'Tue-Thu-Sat 03:00 PM - 05:30 PM',
    startDate: '2026-12-15',
    enrolled: 12,
    capacity: 20,
    mode: 'Hybrid',
    room: 'Security Lab 1',
    status: 'Upcoming'
  },
  {
    id: 6,
    name: 'Cloud DevOps Weekend (CLD-02)',
    course: 'Cloud Computing & DevOps',
    instructor: 'Cloud Architect',
    timing: 'Sat-Sun 02:00 PM - 06:00 PM',
    startDate: '2026-12-12',
    enrolled: 15,
    capacity: 25,
    mode: 'Online',
    room: 'Virtual Classroom 2',
    status: 'Upcoming'
  }
];

// Official Standard Faculty & Trainers
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
    status: 'Active',
    bio: 'Specialist in MERN stack, React.js, Node.js, and cloud application development.',
    skills: [
      'React.js',
      'Node.js',
      'Python',
      'JavaScript',
      'Java',
      'Docker & DevOps',
      'MongoDB'
    ],
    assignedCourses: ['Full Stack Web Development (MERN)'],
    assignedBatches: ['FSWD Morning Batch (M26)', 'FSWD Evening Batch (E12)'],
    schedule: [
      {
        id: 1,
        day: 'Monday to Friday',
        time: '09:00 AM - 11:30 AM',
        batch: 'FSWD Morning Batch (M26)',
        course: 'Full Stack Web Development (MERN)',
        room: 'Lab 1',
        mode: 'Classroom'
      },
      {
        id: 2,
        day: 'Monday to Friday',
        time: '06:00 PM - 08:30 PM',
        batch: 'FSWD Evening Batch (E12)',
        course: 'Full Stack Web Development (MERN)',
        room: 'Lab 2',
        mode: 'Hybrid'
      }
    ],
    joiningDate: '2026-11-22'
  }
];

// Production Initial State for EduPulse CRM
export const initialInstituteData = {
  stats: {
    totalStudents: 0,
    activeStudentsGrowth: '0%',
    newLeadsThisMonth: 0,
    leadConversionRate: '0%',
    confirmedAdmissions: 0,
    activeCourses: OFFICIAL_COURSES.length,
    activeBatches: OFFICIAL_BATCHES.length,
    monthlyRevenue: 0,
    revenueGrowth: '0%',
    pendingFees: 0,
    attendanceAverage: '0%',
    feeCollectionRate: '0%'
  },

  // Revenue chart timeline (populated dynamically from actual fee transactions)
  revenueTimeline: [],

  // Official Standard Academic Curriculum Programs
  courses: OFFICIAL_COURSES,

  // Real data lists
  batches: OFFICIAL_BATCHES,
  recentLeads: [],
  admissions: [],
  students: [],
  trainers: OFFICIAL_TRAINERS,
  feeTransactions: []
};
