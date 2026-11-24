import React, { useState, useRef } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Sparkles,
  Smartphone,
  School,
  Info,
  Share2,
  Download,
  ImageIcon
} from 'lucide-react';

export default function ShareQRModal({ isOpen, onClose, courses }) {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copiedCaptionToast, setCopiedCaptionToast] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'standee'
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Compute public form inquiry URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'http://localhost:3000';
  const publicInquiryUrl = `${baseUrl.replace(/\/$/, '')}/#inquire`;

  // High-res QR code URL using standard public QR generator API with high error correction
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(publicInquiryUrl)}&margin=10`;

  const admissionCaption = `🎓 Here's our official QR code! Scan the QR code or click the link below to get admission in EduPulse Academy:\n👉 ${publicInquiryUrl}\n\n✨ Fill the form in 30 seconds for direct admission & free demo class!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicInquiryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getQrBlob = async () => {
    const res = await fetch(qrImageUrl);
    if (!res.ok) throw new Error('Failed to fetch QR image');
    return await res.blob();
  };

  // Generate a Paytm-style clean branded QR card image with clear admission text on the card itself
  const generatePaytmQRCardBlob = async () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 620;
          canvas.height = 840;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);

          // Card Background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Paytm-style top header band (EduPulse Indigo)
          ctx.fillStyle = '#4f46e5';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(24, 24, canvas.width - 48, 88, 18);
            ctx.fill();
          } else {
            ctx.fillRect(24, 24, canvas.width - 48, 88);
          }

          // Header Text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('EduPulse Academy', canvas.width / 2, 64);

          ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#e0e7ff';
          ctx.fillText('OFFICIAL CAMPUS ADMISSIONS', canvas.width / 2, 88);

          // Primary Heading requested: "Here's our official QR Code!"
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText("Here's our official QR Code!", canvas.width / 2, 148);

          // Subtitle requested: "Scan & get admission in our academy"
          ctx.fillStyle = '#4f46e5';
          ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText("Scan & get admission in our academy", canvas.width / 2, 174);

          ctx.fillStyle = '#64748b';
          ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText("Quick admission form • Free demo class • Career counseling", canvas.width / 2, 196);

          // QR Code Container Box
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(140, 220, 340, 340, 20);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillRect(140, 220, 340, 340);
            ctx.strokeRect(140, 220, 340, 340);
          }

          // Draw QR Code
          ctx.drawImage(img, 160, 240, 300, 300);

          // Paytm-style bottom badge
          ctx.fillStyle = '#eef2ff';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(145, 580, 330, 36, 18);
            ctx.fill();
          } else {
            ctx.fillRect(145, 580, 330, 36);
          }

          ctx.fillStyle = '#4338ca';
          ctx.font = 'bold 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText("📷 Point phone camera or WhatsApp scanner to apply", canvas.width / 2, 603);

          // Link & Footer
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
          ctx.fillText(publicInquiryUrl, canvas.width / 2, 648);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillText('EduPulse CRM • Admissions Desk', canvas.width / 2, 678);

          // Generous bottom whitespace (678px to 840px = 162px of clean white space)
          // prevents WhatsApp's timestamp overlay (e.g. "11:06 am ✓✓") from obscuring any text

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/png');
        } catch (e) {
          console.warn('Canvas card rendering failed:', e);
          resolve(null);
        }
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src = qrImageUrl;
    });
  };

  // Single Paytm-style share handler
  const handleShareQRCode = async () => {
    try {
      setSharing(true);
      let cardBlob = await generatePaytmQRCardBlob();
      if (!cardBlob) {
        cardBlob = await getQrBlob();
      }

      const qrFile = new File([cardBlob], 'EduPulse-Academy-QR.png', { type: 'image/png' });

      // Copy the admission message to clipboard so user can also instantly Ctrl+V in WhatsApp Web
      try {
        await navigator.clipboard.writeText(admissionCaption);
        setCopiedCaptionToast(true);
        setTimeout(() => setCopiedCaptionToast(false), 3500);
      } catch (clipErr) {
        // Clipboard optional
      }

      if (navigator.canShare && navigator.canShare({ files: [qrFile] })) {
        await navigator.share({
          title: 'EduPulse Academy - QR Admission',
          text: admissionCaption,
          files: [qrFile]
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'EduPulse Academy - QR Admission',
          text: admissionCaption,
          url: publicInquiryUrl
        });
      } else {
        // Fallback: download Paytm-style QR card image and open WhatsApp with the admission message
        const url = URL.createObjectURL(cardBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'EduPulse-Academy-QR.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(admissionCaption)}`;
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Share failed, opening WhatsApp fallback:', err);
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(admissionCaption)}`, '_blank');
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      setDownloading(true);
      const blob = await getQrBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'EduPulse-Student-Inquiry-QR.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn('Direct blob download failed, falling back to window.open:', err);
      window.open(qrImageUrl, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyQRImage = async () => {
    try {
      const blob = await getQrBlob();
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2500);
      } else {
        handleDownloadQR();
      }
    } catch (err) {
      console.warn('Could not copy image to clipboard:', err);
      handleDownloadQR();
    }
  };

  const handleOpenPreview = () => {
    window.open(publicInquiryUrl, '_blank');
  };

  const handlePrintStandee = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to print the front-desk standee.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>EduPulse Academy - Reception QR Standee</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 1.5cm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              text-align: center;
              margin: 0;
              padding: 40px 20px;
              background: #ffffff;
            }
            .standee-card {
              border: 3px solid #4f46e5;
              border-radius: 24px;
              padding: 48px 36px;
              max-width: 580px;
              margin: 0 auto;
              box-shadow: 0 10px 25px rgba(0,0,0,0.06);
            }
            .brand {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin-bottom: 24px;
            }
            .logo-icon {
              width: 48px;
              height: 48px;
              background: #4f46e5;
              color: #ffffff;
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 26px;
              font-weight: bold;
            }
            .brand-name {
              font-size: 28px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              letter-spacing: -0.5px;
            }
            .brand-sub {
              font-size: 13px;
              color: #64748b;
              margin-top: 2px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            h1 {
              font-size: 26px;
              font-weight: 800;
              margin: 20px 0 8px 0;
              color: #1e1b4b;
              line-height: 1.25;
            }
            p.lead {
              font-size: 15px;
              color: #475569;
              margin: 0 0 28px 0;
            }
            .qr-wrapper {
              display: inline-block;
              padding: 16px;
              background: #ffffff;
              border: 2px dashed #cbd5e1;
              border-radius: 20px;
              margin: 10px 0 24px 0;
            }
            .qr-wrapper img {
              width: 240px;
              height: 240px;
              display: block;
            }
            .scan-badge {
              display: inline-block;
              background: #eef2ff;
              color: #4338ca;
              font-size: 13px;
              font-weight: 700;
              padding: 6px 16px;
              border-radius: 999px;
              margin-bottom: 24px;
            }
            .steps {
              display: flex;
              justify-content: space-between;
              text-align: left;
              margin: 20px 0;
              padding: 16px 20px;
              background: #f8fafc;
              border-radius: 14px;
              font-size: 13px;
              gap: 12px;
            }
            .step-item {
              flex: 1;
            }
            .step-num {
              font-weight: bold;
              color: #4f46e5;
              margin-bottom: 2px;
            }
            .footer-contact {
              margin-top: 30px;
              font-size: 12px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 18px;
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <div class="brand">
              <div class="logo-icon">E</div>
              <div>
                <h2 class="brand-name">EduPulse Academy</h2>
                <div class="brand-sub">Campus Admissions Desk</div>
              </div>
            </div>

            <h1>Here's Our Official QR Code</h1>
            <p class="lead">Scan & get direct admission in our academy in 30 seconds</p>

            <div class="qr-wrapper">
              <img src="${qrImageUrl}" alt="Scan to Inquire" />
            </div>

            <div>
              <span class="scan-badge">Point Phone Camera or Google Lens</span>
            </div>

            <div class="steps">
              <div class="step-item">
                <div class="step-num">1. Scan QR</div>
                <div style="color: #64748b;">Open phone camera and point at QR code.</div>
              </div>
              <div class="step-item">
                <div class="step-num">2. Fill Form</div>
                <div style="color: #64748b;">Enter name, course of interest & schedule.</div>
              </div>
              <div class="step-item">
                <div class="step-num">3. Get Admission</div>
                <div style="color: #64748b;">Instant verification, syllabus & demo access.</div>
              </div>
            </div>

            <div class="footer-contact">
              <strong>EduPulse Academy Front Desk:</strong> +91 98765 43210 &bull; info@edupulse.org &bull; Main Campus
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 600);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Share Student Inquiry QR Code
              </h2>
              <p className="text-xs text-slate-500">
                Digital registration form for campus front-desk, posters, and WhatsApp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'qr'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>QR Code & Share Link</span>
          </button>

          <button
            onClick={() => setActiveTab('standee')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'standee'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>Print Front-Desk Standee (A4)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'qr' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* QR Code Card */}
              <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm relative group">
                  <img
                    src={qrImageUrl}
                    alt="Student Inquiry QR Code"
                    className="w-44 h-44 object-contain rounded-lg"
                  />
                </div>

                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan with any Phone Camera</span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2 font-medium">
                  Here's our QR code — scan & get admission in our academy
                </p>

                {/* QR Image Download and Copy Buttons */}
                <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-3 border-t border-slate-200/80">
                  <button
                    onClick={handleDownloadQR}
                    disabled={downloading}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Download QR code PNG image file"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{downloading ? 'Downloading...' : 'Save PNG'}</span>
                  </button>

                  <button
                    onClick={handleCopyQRImage}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Copy QR code image to clipboard for pasting into chats"
                  >
                    {copiedImage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* URL & Instant Actions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Direct Public Inquiry URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={publicInquiryUrl}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 select-all focus:outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      title="Copy Public Link"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Only ONE Primary Share Button (Paytm-style) */}
                <div className="pt-1 space-y-2.5">
                  <button
                    onClick={handleShareQRCode}
                    disabled={sharing}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
                    title="Share QR code card with admission message"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>{sharing ? 'Sharing QR Code...' : 'Share QR Code'}</span>
                  </button>

                  {/* Toast/Hint letting user know caption was copied */}
                  {copiedCaptionToast ? (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Admission message copied! Ready to paste (Ctrl+V)</span>
                    </div>
                  ) : (
                    <p className="text-[10.5px] text-slate-400 text-center leading-relaxed">
                      Shares branded QR card with: <span className="text-slate-600 font-semibold">"Here's our QR code, scan & get admission in our academy"</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleOpenPreview}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      <span>Live Preview</span>
                    </button>

                    <button
                      onClick={handlePrintStandee}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      <span>Print Standee</span>
                    </button>
                  </div>
                </div>

                {/* Workflow explanation box */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                    <Info className="w-3.5 h-3.5" />
                    <span>How it feeds your CRM:</span>
                  </div>
                  <p className="text-emerald-700 leading-relaxed text-[10.5px]">
                    When a student scans the QR or opens the link, submissions immediately enter your <strong>Leads & Inquiries</strong> table with source tag <span className="font-semibold underline">QR Code (Campus Reception)</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'standee' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center max-w-md mx-auto shadow-xs">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <School className="w-5 h-5 text-indigo-600" />
                  <span className="font-black text-slate-900 text-base">EduPulse Academy</span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  Here's Our Official QR Code
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Scan & get direct admission in our academy in 30 seconds
                </p>

                <div className="my-4 inline-block p-3 bg-white border-2 border-dashed border-indigo-200 rounded-xl shadow-xs">
                  <img
                    src={qrImageUrl}
                    alt="Scan to Inquire"
                    className="w-36 h-36 mx-auto object-contain"
                  />
                </div>

                <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 text-left space-y-1">
                  <div className="font-semibold text-slate-800">Available Courses:</div>
                  <div className="text-slate-500 truncate">
                    {courses?.map(c => c.name).slice(0, 3).join(', ')}...
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handlePrintStandee}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Standee Now</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Target Destination: <strong>Leads & Inquiries Table</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
