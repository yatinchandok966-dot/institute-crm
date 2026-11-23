import React, { useState } from "react";
import {
  ArrowLeft,
  UserRound,
  GraduationCap,
  BookOpen,
  Wallet,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  User,
  Building2,
  MessageSquare,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

export default function StudentProfile({ student, onBack, onOpenPayment }) {
  const [activeSection, setActiveSection] = useState("Overview");

  if (!student) return null;

  // Helper for fields that may not exist yet
  const showValue = (value) => {
    return value !== undefined && value !== null && value !== "" ?
        value
      : "Not added";
  };

  // Student financial information
  const totalFee = Number(student.feeTotal || 0);
  const paidFee = Number(student.feePaid || 0);
  const pendingFee = Number(student.feeDue ?? Math.max(0, totalFee - paidFee));

  const paymentPercentage =
    totalFee > 0 ? Math.min(100, (paidFee / totalFee) * 100) : 0;

  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN")}`;

  // Support multiple enrolments, with fallback to existing fields
  const enrolments =
    student.enrollments?.length ? student.enrollments
    : student.course ?
      [
        {
          course: student.course,
          batch: student.batch,
          trainer: student.trainer,
          enrollmentDate: student.enrollmentDate,
          totalFee: student.feeTotal,
          paidFee: student.feePaid,
          dueFee: student.feeDue,
          status: student.status || "Enrolled",
        },
      ]
    : [];

  const sections = [
    { name: "Overview", icon: UserRound },
    { name: "Personal", icon: User },
    { name: "Education", icon: GraduationCap },
    { name: "Enrolments", icon: BookOpen },
    { name: "Financial", icon: Wallet },
    { name: "Activity", icon: MessageSquare },
  ];

  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-3">
      {Icon && (
        <div className="p-2 rounded-lg bg-slate-50 text-slate-500">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-800 mt-1 break-words">
          {showValue(value)}
        </p>
      </div>
    </div>
  );

  const SectionCard = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      {children}
    </div>
  );

  const statusStyles = {
    Active: "bg-emerald-100 text-emerald-700",
    Completed: "bg-blue-100 text-blue-700",
    "On Hold": "bg-amber-100 text-amber-700",
    Dropped: "bg-rose-100 text-rose-700",
  };

  const studentStatus = student.enrollmentStatus || student.status || "Active";

  const renderOverview = () => (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-semibold">Total Fees</p>
            <Wallet className="w-4 h-4 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mt-3">
            {formatCurrency(totalFee)}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-semibold">Amount Paid</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-emerald-700 mt-3">
            {formatCurrency(paidFee)}
          </h3>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500 font-semibold">Pending Fees</p>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-amber-700 mt-3">
            {formatCurrency(pendingFee)}
          </h3>
        </div>
      </div>

      {/* Profile Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Personal Information">
          <DetailItem label="Full Name" value={student.name} icon={User} />
          <DetailItem label="Email Address" value={student.email} icon={Mail} />
          <DetailItem label="Phone Number" value={student.phone} icon={Phone} />
          <DetailItem
            label="Date of Birth"
            value={student.dob || student.dateOfBirth}
            icon={Calendar}
          />
          <DetailItem label="Gender" value={student.gender} icon={UserRound} />
          <DetailItem label="Address" value={student.address} icon={MapPin} />
        </SectionCard>

        <SectionCard title="Education Information">
          <DetailItem
            label="Qualification"
            value={student.qualification}
            icon={GraduationCap}
          />
          <DetailItem
            label="College / Institution"
            value={student.college}
            icon={Building2}
          />
          <DetailItem
            label="Passing Year"
            value={student.passingYear}
            icon={Calendar}
          />
          <DetailItem
            label="Guardian Name"
            value={student.guardian}
            icon={User}
          />
          <DetailItem
            label="Guardian Phone"
            value={student.guardianPhone}
            icon={Phone}
          />
        </SectionCard>
      </div>

      {/* Course Summary */}
      <SectionCard title="Course Enrolments">
        {enrolments.length > 0 ?
          <div className="space-y-3">
            {enrolments.map((item, index) => (
              <div
                key={item.id || index}
                className="border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {showValue(item.course || item.courseName)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {showValue(item.batch || item.batchName)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Trainer: {showValue(item.trainer || item.instructor)}
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 w-fit">
                  {showValue(item.status)}
                </span>
              </div>
            ))}
          </div>
        : <p className="text-sm text-slate-400 py-4">
            No course enrolments available.
          </p>
        }
      </SectionCard>

      {/* Fee Progress */}
      <SectionCard title="Fee Payment Progress">
        <div className="flex justify-between text-xs font-semibold mb-2">
          <span className="text-slate-600">Payment completion</span>
          <span className="text-indigo-700">
            {Math.round(paymentPercentage)}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all"
            style={{ width: `${paymentPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs mt-3">
          <span className="text-emerald-700 font-semibold">
            Paid: {formatCurrency(paidFee)}
          </span>
          <span className="text-amber-700 font-semibold">
            Due: {formatCurrency(pendingFee)}
          </span>
        </div>
      </SectionCard>
    </div>
  );

  const renderPersonal = () => (
    <SectionCard title="Personal Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <DetailItem label="Student Name" value={student.name} />
        <DetailItem label="Student ID" value={student.studentId} />
        <DetailItem label="Admission Number" value={student.admissionNo} />
        <DetailItem
          label="Date of Birth"
          value={student.dob || student.dateOfBirth}
        />
        <DetailItem label="Gender" value={student.gender} />
        <DetailItem label="Phone" value={student.phone} />
        <DetailItem label="Email" value={student.email} />
        <DetailItem label="Address" value={student.address} />
        <DetailItem label="Guardian" value={student.guardian} />
        <DetailItem label="Guardian Phone" value={student.guardianPhone} />
      </div>
    </SectionCard>
  );

  const renderEducation = () => (
    <SectionCard title="Education Information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
        <DetailItem label="Qualification" value={student.qualification} />
        <DetailItem label="College / Institution" value={student.college} />
        <DetailItem label="Passing Year" value={student.passingYear} />
      </div>
    </SectionCard>
  );

  const renderEnrolments = () => (
    <SectionCard title="Student Course Enrolments">
      {enrolments.length > 0 ?
        <div className="space-y-4">
          {enrolments.map((item, index) => (
            <div
              key={item.id || index}
              className="border border-slate-200 rounded-xl p-5"
            >
              <div className="flex justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-900">
                    {showValue(item.course || item.courseName)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {showValue(item.batch || item.batchName)}
                  </p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-3 py-1 h-fit">
                  {showValue(item.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <DetailItem
                  label="Trainer"
                  value={item.trainer || item.instructor}
                />
                <DetailItem
                  label="Enrolment Date"
                  value={item.enrollmentDate}
                />
                <DetailItem
                  label="Total Fee"
                  value={
                    item.totalFee != null ? formatCurrency(item.totalFee) : null
                  }
                />
                <DetailItem
                  label="Paid Fee"
                  value={
                    item.paidFee != null ? formatCurrency(item.paidFee) : null
                  }
                />
              </div>
            </div>
          ))}
        </div>
      : <p className="text-sm text-slate-400 py-4">No enrolments found.</p>}
    </SectionCard>
  );

  const renderFinancial = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SectionCard title="Total Fees">
          <h2 className="text-xl font-bold">{formatCurrency(totalFee)}</h2>
        </SectionCard>
        <SectionCard title="Paid Amount">
          <h2 className="text-xl font-bold text-emerald-700">
            {formatCurrency(paidFee)}
          </h2>
        </SectionCard>
        <SectionCard title="Pending Amount">
          <h2 className="text-xl font-bold text-amber-700">
            {formatCurrency(pendingFee)}
          </h2>
        </SectionCard>
      </div>

      <SectionCard title="Payment Summary">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-500">Payment completion</span>
          <strong>{Math.round(paymentPercentage)}%</strong>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full"
            style={{ width: `${paymentPercentage}%` }}
          />
        </div>

        <div className="mt-5 flex flex-wrap justify-between gap-3">
          <span className="text-sm text-slate-600">
            Fee Status: <strong>{showValue(student.feeStatus)}</strong>
          </span>

          {onOpenPayment && (
            <button
              onClick={onOpenPayment}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
            >
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>
          )}
        </div>
      </SectionCard>
    </div>
  );

  const renderActivity = () => (
    <SectionCard title="Notes & Communication History">
      <div className="text-center py-10">
        <ClipboardList className="w-10 h-10 mx-auto text-slate-300" />
        <h3 className="font-bold text-sm text-slate-700 mt-3">
          Activity History
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
          Student notes and communication records will appear here once the
          activity management functionality is connected.
        </p>
      </div>
    </SectionCard>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "Personal":
        return renderPersonal();
      case "Education":
        return renderEducation();
      case "Enrolments":
        return renderEnrolments();
      case "Financial":
        return renderFinancial();
      case "Activity":
        return renderActivity();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Students
      </button>

      {/* Student Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                {student.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {showValue(student.studentId)} · Admission:{" "}
                {showValue(student.admissionNo)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {showValue(student.course)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${statusStyles[studentStatus] || "bg-slate-100 text-slate-600"}`}
            >
              {studentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex gap-1 overflow-x-auto">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <button
              key={section.name}
              onClick={() => setActiveSection(section.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeSection === section.name ?
                  "bg-indigo-600 text-white"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {section.name}
            </button>
          );
        })}
      </div>

      {/* Selected Section */}
      {renderSection()}
    </div>
  );
}
