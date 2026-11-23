import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  LEAD_SOURCES,
  LEAD_PIPELINE_STAGES,
  LEAD_PRIORITIES
} from '../data/mockData';

export default function ImportLeadsModal({
  isOpen,
  onClose,
  onImportLeads,
  existingLeads = [],
  courses = []
}) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Clean phone helper
  const normalizePhone = (p) => (p || '').replace(/[^0-9]/g, '');

  // Generate and download sample CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      'Full Name',
      'Phone Number',
      'Email',
      'City',
      'Qualification',
      'College/University',
      'Interested Course',
      'Lead Source',
      'Assigned Counsellor',
      'Lead Status',
      'Lead Priority',
      'Next Follow-up Date',
      'Notes'
    ];

    const sampleRow1 = [
      'Kavita Nair',
      '+91 98230 45678',
      'kavita.n@example.com',
      'Pune',
      'B.Tech CS',
      'COEP Tech University',
      'Web Development',
      'Website',
      'Admissions Team',
      'New',
      'Hot',
      '2026-11-22 11:00',
      'Interested in placement assistance and weekday morning batches.'
    ];

    const sampleRow2 = [
      'Manish Sharma',
      '+91 98199 87654',
      'manish.s@example.com',
      'Mumbai',
      'BCA',
      'Mumbai University',
      'Data Science',
      'Google Ads',
      'Admissions Desk',
      'Contacted',
      'Warm',
      '2026-11-23 15:00',
      'Working professional exploring Python and Machine Learning modules.'
    ];

    const csvContent = [
      headers.join(','),
      sampleRow1.map(v => `"${v.replace(/"/g, '""')}"`).join(','),
      sampleRow2.map(v => `"${v.replace(/"/g, '""')}"`).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lead_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Robust CSV parser supporting quotes & multiline
  const parseCSV = (text) => {
    const lines = [];
    let row = [''];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push('');
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        if (row.length > 1 || row[0] !== '') {
          lines.push(row);
        }
        row = [''];
      } else {
        row[row.length - 1] += char;
      }
    }
    if (row.length > 1 || row[0] !== '') {
      lines.push(row);
    }
    return lines;
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setValidationErrors(['The CSV file is empty or missing data rows.']);
          setParsedRows([]);
          return;
        }

        // Header mapping
        const headerRow = rows[0].map(h => h.trim().toLowerCase());
        const getIdx = (candidates) => headerRow.findIndex(h => candidates.some(c => h.includes(c)));

        const nameIdx = getIdx(['name', 'full name', 'student']);
        const phoneIdx = getIdx(['phone', 'mobile', 'contact', 'whatsapp']);
        const emailIdx = getIdx(['email', 'mail']);
        const cityIdx = getIdx(['city', 'location']);
        const qualIdx = getIdx(['qual', 'education', 'degree']);
        const collIdx = getIdx(['college', 'university', 'institute']);
        const courseIdx = getIdx(['course', 'program']);
        const sourceIdx = getIdx(['source', 'channel']);
        const counselorIdx = getIdx(['counselor', 'counsellor', 'staff', 'employee']);
        const statusIdx = getIdx(['status', 'stage']);
        const priorityIdx = getIdx(['priority']);
        const followUpIdx = getIdx(['follow', 'next follow', 'date']);
        const notesIdx = getIdx(['notes', 'remark']);

        const existingPhones = new Set(existingLeads.map(l => normalizePhone(l.phone)));
        const existingEmails = new Set(existingLeads.map(l => (l.email || '').trim().toLowerCase()).filter(Boolean));

        const seenPhonesInCSV = new Set();
        const seenEmailsInCSV = new Set();

        const parsed = [];
        const errors = [];

        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          if (!r || r.length === 0 || (r.length === 1 && !r[0].trim())) continue;

          const name = nameIdx !== -1 && r[nameIdx] ? r[nameIdx].trim() : '';
          const phone = phoneIdx !== -1 && r[phoneIdx] ? r[phoneIdx].trim() : '';
          const email = emailIdx !== -1 && r[emailIdx] ? r[emailIdx].trim() : '';
          const city = cityIdx !== -1 && r[cityIdx] ? r[cityIdx].trim() : '';
          const qualification = qualIdx !== -1 && r[qualIdx] ? r[qualIdx].trim() : '';
          const college = collIdx !== -1 && r[collIdx] ? r[collIdx].trim() : '';
          const course = (courseIdx !== -1 && r[courseIdx]?.trim()) || courses?.[0]?.name || '';
          const source = (sourceIdx !== -1 && r[sourceIdx]?.trim()) || 'Website';
          const counselor = (counselorIdx !== -1 && r[counselorIdx]?.trim()) || 'Unassigned';
          const status = (statusIdx !== -1 && r[statusIdx]?.trim()) || 'New';
          const priority = (priorityIdx !== -1 && r[priorityIdx]?.trim()) || 'Warm';
          const nextFollowUpDate = followUpIdx !== -1 && r[followUpIdx] ? r[followUpIdx].trim() : '';
          const notes = notesIdx !== -1 && r[notesIdx] ? r[notesIdx].trim() : '';

          const normPhone = normalizePhone(phone);
          const normEmail = email.toLowerCase();

          // Validations
          let isDuplicate = false;
          let dupReason = '';

          if (!name) {
            errors.push(`Row ${i + 1}: Missing Full Name.`);
          }
          if (!phone || normPhone.length < 8) {
            errors.push(`Row ${i + 1}: Missing or invalid Phone Number.`);
          }

          // Duplicate checks
          if (normPhone && (existingPhones.has(normPhone) || seenPhonesInCSV.has(normPhone))) {
            isDuplicate = true;
            dupReason = 'Duplicate phone number';
          }
          if (normEmail && (existingEmails.has(normEmail) || seenEmailsInCSV.has(normEmail))) {
            isDuplicate = true;
            dupReason = dupReason ? `${dupReason} & email` : 'Duplicate email';
          }

          if (normPhone) seenPhonesInCSV.add(normPhone);
          if (normEmail) seenEmailsInCSV.add(normEmail);

          parsed.push({
            id: Date.now() + i,
            name,
            phone,
            email,
            city,
            qualification,
            college,
            course,
            source,
            counselor,
            status,
            priority,
            nextFollowUpDate,
            notes,
            createdAt: new Date().toISOString().split('T')[0],
            isDuplicate,
            dupReason,
            isValid: Boolean(name && phone && normPhone.length >= 8)
          });
        }

        setValidationErrors(errors);
        setParsedRows(parsed);
      } catch (err) {
        setValidationErrors(['Error reading CSV file. Please make sure it is properly formatted.']);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleConfirmImport = () => {
    setIsProcessing(true);
    const leadsToImport = parsedRows
      .filter(row => row.isValid)
      .filter(row => !skipDuplicates || !row.isDuplicate)
      .map(row => ({
        id: Date.now() + Math.floor(Math.random() * 100000),
        name: row.name,
        phone: row.phone,
        email: row.email,
        city: row.city,
        qualification: row.qualification,
        college: row.college,
        course: row.course,
        source: row.source,
        counselor: row.counselor,
        status: row.status,
        priority: row.priority,
        nextFollowUpDate: row.nextFollowUpDate,
        notes: row.notes,
        createdAt: row.createdAt,
        notesList: row.notes ? [{
          id: Date.now(),
          text: row.notes,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          author: row.counselor || 'Imported'
        }] : [],
        callHistory: []
      }));

    onImportLeads(leadsToImport);
    setIsProcessing(false);
    onClose();
  };

  const duplicateCount = parsedRows.filter(r => r.isDuplicate).length;
  const validCount = parsedRows.filter(r => r.isValid).length;
  const readyToImportCount = skipDuplicates ? parsedRows.filter(r => r.isValid && !r.isDuplicate).length : validCount;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Clean Light Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Bulk Import Leads via CSV</h3>
              <p className="text-xs text-slate-500">
                Upload lead spreadsheets with auto-validation and duplicate phone/email detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Step 1: Template download & upload zone */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl">
            <div className="space-y-0.5">
              <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Need a ready-made template?</span>
              </h4>
              <p className="text-[11px] text-indigo-800">
                Download our formatted CSV template with required column headers (Full Name, Phone, Email, City, Qualification, College, Course, Source, Counsellor, Status, Priority, Follow-up).
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-white hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-center shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload input */}
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 transition-colors rounded-xl p-6 text-center bg-slate-50 relative cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800 text-xs">
              {file ? file.name : 'Click or Drag & Drop your .CSV file here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supports standard comma-separated values (.csv)
            </p>
          </div>

          {/* Summary / Duplicate Alert Stats */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-base font-bold text-slate-900">{parsedRows.length}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Rows</div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <div className="text-base font-bold text-emerald-700">{validCount}</div>
                  <div className="text-[10px] text-emerald-600 uppercase font-semibold">Valid Format</div>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <div className="text-base font-bold text-amber-700">{duplicateCount}</div>
                  <div className="text-[10px] text-amber-600 uppercase font-semibold">Duplicates Detected</div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                  <div className="text-base font-bold text-indigo-700">{readyToImportCount}</div>
                  <div className="text-[10px] text-indigo-600 uppercase font-semibold">Ready to Import</div>
                </div>
              </div>

              {/* Duplicate Handling Option */}
              {duplicateCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs text-amber-900 font-semibold">
                      Found {duplicateCount} duplicate phone or email entries.
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-amber-950 font-bold cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={skipDuplicates}
                      onChange={(e) => setSkipDuplicates(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Skip Duplicates (Recommended)</span>
                  </label>
                </div>
              )}

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-2.5 bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-xs flex justify-between items-center">
                  <span>File Data Preview (First 8 Rows)</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    Showing {Math.min(parsedRows.length, 8)} of {parsedRows.length} entries
                  </span>
                </div>
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Full Name</th>
                        <th className="px-3 py-2">Phone</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Course</th>
                        <th className="px-3 py-2">Source</th>
                        <th className="px-3 py-2">Counsellor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {parsedRows.slice(0, 8).map((row, idx) => (
                        <tr key={idx} className={row.isDuplicate ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                          <td className="px-3 py-2">
                            {row.isDuplicate ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                Duplicate
                              </span>
                            ) : row.isValid ? (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Valid
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Error
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-bold text-slate-900">{row.name || '—'}</td>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-700">{row.phone || '—'}</td>
                          <td className="px-3 py-2 text-slate-600">{row.email || '—'}</td>
                          <td className="px-3 py-2 text-slate-800">{row.course}</td>
                          <td className="px-3 py-2 text-slate-600">{row.source}</td>
                          <td className="px-3 py-2 text-slate-600">{row.counselor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-xs"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={readyToImportCount === 0 || isProcessing}
            className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg shadow-sm transition-all text-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Importing...'
                : `Import ${readyToImportCount} Valid ${readyToImportCount === 1 ? 'Lead' : 'Leads'}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
