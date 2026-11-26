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

// Authentic Social & Messaging Platform Icons
const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const LinkedInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.27a1.64 1.64 0 0 0-1.66 1.63 1.64 1.64 0 0 0 1.66 1.64 1.64 1.64 0 0 0 1.65-1.64c0-.9-.74-1.63-1.65-1.63Z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterXIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GmailIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
  </svg>
);

export default function ShareQRModal({ isOpen, onClose, courses }) {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [shareToast, setShareToast] = useState(null);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'standee'
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Compute public form inquiry URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'http://localhost:3000';
  const publicInquiryUrl = `${baseUrl.replace(/\/$/, '')}/#inquire`;

  // High-res QR code URL using standard public QR generator API with high error correction
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(publicInquiryUrl)}&margin=10`;

  // Clear, accurate admission message requested by user (Shares ONLY link, no scanner image)
  const admissionCaption = `🎓 *Here's our official admission link! Apply & get admission in our academy:*\n\n👉 Apply directly here: ${publicInquiryUrl}\n\n✨ Fill the form in 30 seconds to book your demo seat & receive the course syllabus!`;

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
  // Using blob URL prevents any CORS or cache-tainting issues
  const generatePaytmQRCardBlob = async () => {
    try {
      const qrBlob = await getQrBlob();
      const objectUrl = URL.createObjectURL(qrBlob);

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 860;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              URL.revokeObjectURL(objectUrl);
              return resolve(qrBlob);
            }

            // 1. Card Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Paytm-style top header band (EduPulse Indigo)
            ctx.fillStyle = '#4f46e5';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(24, 24, canvas.width - 48, 88, 18);
              ctx.fill();
            } else {
              ctx.fillRect(24, 24, canvas.width - 48, 88);
            }

            // Header Brand Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('EduPulse Academy', canvas.width / 2, 64);

            ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#e0e7ff';
            ctx.fillText('OFFICIAL CAMPUS ADMISSIONS', canvas.width / 2, 88);

            // 3. User Requested Message Heading
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText("Here's our official QR Code!", canvas.width / 2, 150);

            // 4. User Requested Message Subheading
            ctx.fillStyle = '#4f46e5';
            ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText("Scan & get admission in our academy", canvas.width / 2, 178);

            ctx.fillStyle = '#64748b';
            ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText("Quick admission form • Free demo class • Career counseling", canvas.width / 2, 202);

            // 5. QR Code Box
            ctx.fillStyle = '#f8fafc';
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 2;
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(145, 226, 350, 350, 20);
              ctx.fill();
              ctx.stroke();
            } else {
              ctx.fillRect(145, 226, 350, 350);
              ctx.strokeRect(145, 226, 350, 350);
            }

            // Draw QR Code
            ctx.drawImage(img, 165, 246, 310, 310);

            // 6. Pill Badge under QR
            ctx.fillStyle = '#eef2ff';
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(145, 595, 350, 36, 18);
              ctx.fill();
            } else {
              ctx.fillRect(145, 595, 350, 36);
            }

            ctx.fillStyle = '#4338ca';
            ctx.font = 'bold 12.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText("📷 Point phone camera or WhatsApp scanner to apply", canvas.width / 2, 618);

            // 7. Direct Link & Footer
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
            ctx.fillText(publicInquiryUrl, canvas.width / 2, 665);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText('EduPulse CRM • Admissions Desk', canvas.width / 2, 695);

            // Generous 165px of bottom whitespace ensures WhatsApp timestamp never covers text
            URL.revokeObjectURL(objectUrl);

            canvas.toBlob((blob) => {
              resolve(blob || qrBlob);
            }, 'image/png');
          } catch (e) {
            console.warn('Canvas export failed:', e);
            URL.revokeObjectURL(objectUrl);
            resolve(qrBlob);
          }
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(qrBlob);
        };

        img.src = objectUrl;
      });
    } catch (err) {
      console.warn('Failed to load blob for canvas:', err);
      return null;
    }
  };

  // Multi-Platform Share Handler: Shares link & invitation to WhatsApp, LinkedIn, Instagram, Facebook, Twitter, Gmail
  const handlePlatformShare = async (platform) => {
    // 1. Copy link and invitation message to clipboard for seamless sharing
    try {
      await navigator.clipboard.writeText(admissionCaption);
    } catch (clipErr) {
      console.warn('Could not copy link to clipboard:', clipErr);
    }

    const encodedUrl = encodeURIComponent(publicInquiryUrl);
    const encodedCaption = encodeURIComponent(admissionCaption);
    const emailSubject = encodeURIComponent("EduPulse Academy - Student Course Inquiry & Admission Link");

    switch (platform) {
      case 'whatsapp': {
        const waUrl = `https://api.whatsapp.com/send?text=${encodedCaption}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        setShareToast({
          platform: 'WhatsApp',
          text: 'Opening WhatsApp with inquiry link and admission invite!'
        });
        break;
      }

      case 'linkedin': {
        const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        window.open(liUrl, '_blank', 'noopener,noreferrer,width=650,height=600');
        setShareToast({
          platform: 'LinkedIn',
          text: 'Opening LinkedIn! Invitation message copied to clipboard for your post.'
        });
        break;
      }

      case 'instagram': {
        // Instagram does not offer a public URL parameter for pre-filling posts or DMs from web.
        // We copy the full link and invitation to clipboard and open Instagram Direct / Web.
        const igUrl = 'https://www.instagram.com/direct/inbox/';
        window.open(igUrl, '_blank', 'noopener,noreferrer');
        setShareToast({
          platform: 'Instagram',
          text: 'Link & invite copied to clipboard! Opening Instagram to paste in DM or Story.'
        });
        break;
      }

      case 'facebook': {
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodeURIComponent("Here's our official admission link! Apply & get admission in our academy")}`;
        window.open(fbUrl, '_blank', 'noopener,noreferrer,width=650,height=550');
        setShareToast({
          platform: 'Facebook',
          text: 'Opening Facebook share dialog with your inquiry link!'
        });
        break;
      }

      case 'twitter': {
        const tweetText = `🎓 Here's our official admission link! Apply & get admission in our academy:\n\n${publicInquiryUrl}\n\n#admission #courses #education #edupulse`;
        const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
        window.open(twUrl, '_blank', 'noopener,noreferrer,width=650,height=480');
        setShareToast({
          platform: 'Twitter (X)',
          text: 'Opening Twitter / X composer with your inquiry link!'
        });
        break;
      }

      case 'gmail': {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${emailSubject}&body=${encodedCaption}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        setShareToast({
          platform: 'Gmail',
          text: 'Opening Gmail with pre-filled admission inquiry email!'
        });
        break;
      }

      case 'more':
      default: {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile && navigator.share) {
          try {
            await navigator.share({
              title: 'EduPulse Academy - Inquiry Link',
              text: admissionCaption,
              url: publicInquiryUrl
            });
            setShareToast({
              platform: 'Device Share',
              text: 'Inquiry link shared successfully!'
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              window.open(`https://api.whatsapp.com/send?text=${encodedCaption}`, '_blank');
            }
          }
        } else {
          setShareToast({
            platform: 'Clipboard',
            text: 'Inquiry link & admission invite copied to clipboard!'
          });
        }
        break;
      }
    }

    setTimeout(() => {
      setShareToast(null);
    }, 4000);
  };

  const handleDownloadQR = async () => {
    try {
      setDownloading(true);
      const blob = await generatePaytmQRCardBlob() || await getQrBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'EduPulse-Academy-QR.png';
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
      const blob = await generatePaytmQRCardBlob() || await getQrBlob();
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
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
              {/* Left Side: Branded Admission QR Card Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center shadow-2xs">
                {/* Brand Header Band */}
                <div className="w-full bg-indigo-600 text-white rounded-xl py-2 px-3 mb-3 shadow-2xs">
                  <div className="font-bold text-xs tracking-tight">EduPulse Academy</div>
                  <div className="text-[9px] uppercase tracking-wider text-indigo-200 font-semibold">Campus Admissions Desk</div>
                </div>

                {/* Primary Heading requested by user */}
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Here's our official QR Code!
                </h4>
                <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">
                  Scan & get admission in our academy
                </p>

                {/* QR Code Container */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs my-2.5">
                  <img
                    src={qrImageUrl}
                    alt="Student Inquiry QR Code"
                    className="w-36 h-36 object-contain rounded-md"
                  />
                </div>

                {/* Scan Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>Scan with Phone Camera or WhatsApp</span>
                </div>

                <p className="text-[10px] font-mono font-medium text-slate-600 mt-2 truncate max-w-[220px]" title={publicInquiryUrl}>
                  {publicInquiryUrl}
                </p>

                {/* QR Image Download and Copy Buttons */}
                <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-slate-200/80">
                  <button
                    onClick={handleDownloadQR}
                    disabled={downloading}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Download branded QR card PNG image file"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{downloading ? 'Downloading...' : 'Save PNG'}</span>
                  </button>

                  <button
                    onClick={handleCopyQRImage}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Copy branded QR card image to clipboard for pasting into chats"
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

                {/* Multi-Platform Sharing: WhatsApp, LinkedIn, Instagram, Facebook, Twitter, Gmail */}
                <div className="pt-1 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Share Link on Every Platform:
                    </label>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      1-Click Direct Share
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {/* 1. WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handlePlatformShare('whatsapp')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 hover:border-emerald-300 active:scale-[0.98] transition-all text-left group cursor-pointer shadow-2xs"
                      title="Share link directly to WhatsApp"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <WhatsAppIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold text-slate-800 group-hover:text-emerald-700 leading-tight">WhatsApp</div>
                        <div className="text-[9.5px] text-slate-500 truncate">Chat & Status</div>
                      </div>
                    </button>

                    {/* 2. LinkedIn */}
                    <button
                      type="button"
                      onClick={() => handlePlatformShare('linkedin')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 hover:border-sky-300 active:scale-[0.98] transition-all text-left group cursor-pointer shadow-2xs"
                      title="Share link directly to LinkedIn"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0A66C2] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <LinkedInIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold text-slate-800 group-hover:text-[#0A66C2] leading-tight">LinkedIn</div>
                        <div className="text-[9.5px] text-slate-500 truncate">Post & Network</div>
                      </div>
                    </button>

                    {/* 3. Instagram */}
                    <button
                      type="button"
                      onClick={() => handlePlatformShare('instagram')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-pink-200 bg-pink-50/70 hover:bg-pink-100 hover:border-pink-300 active:scale-[0.98] transition-all text-left group cursor-pointer shadow-2xs"
                      title="Share link via Instagram DM or Story"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#C13584] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <InstagramIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold text-slate-800 group-hover:text-pink-700 leading-tight">Instagram</div>
                        <div className="text-[9.5px] text-slate-500 truncate">DM & Story</div>
                      </div>
                    </button>

                    {/* 4. Facebook */}
                    <button
                      type="button"
                      onClick={() => handlePlatformShare('facebook')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 hover:border-blue-300 active:scale-[0.98] transition-all text-left group cursor-pointer shadow-2xs"
                      title="Share link directly to Facebook"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <FacebookIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold text-slate-800 group-hover:text-[#1877F2] leading-tight">Facebook</div>
                        <div className="text-[9.5px] text-slate-500 truncate">Feed & Groups</div>
                      </div>
                    </button>

                    {/* 5. Twitter (X) */}
                    <button
                      type="button"
                      onClick={() => handlePlatformShare('twitter')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-300 bg-slate-100/70 hover:bg-slate-200 hover:border-slate-400 active:scale-[0.98] transition-all text-left group cursor-pointer shadow-2xs"
                      title="Share link on Twitter / X"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#000000] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <TwitterXIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold text-slate-800 group-hover:text-black leading-tight">Twitter (X)</div>
                        <div className="text-[9.5px] text-slate-500 truncate">Tweet Link</div>
                      </div>
                    </button>

                    {/* 6. Gmail */}
                    <button
                      type="button"
                      onClick={() => handlePlatformShare('gmail')}
                      className="flex items-center gap-2.5 p-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 hover:border-rose-300 active:scale-[0.98] transition-all text-left group cursor-pointer shadow-2xs"
                      title="Send link via Gmail"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#EA4335] text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        <GmailIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11.5px] font-bold text-slate-800 group-hover:text-[#EA4335] leading-tight">Gmail</div>
                        <div className="text-[9.5px] text-slate-500 truncate">Email Invite</div>
                      </div>
                    </button>
                  </div>

                  {/* Universal Share Sheet / More Apps Button */}
                  <button
                    type="button"
                    onClick={() => handlePlatformShare('more')}
                    className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-[0.99] text-slate-700 rounded-lg text-[11px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 shadow-2xs"
                    title="Open device share sheet or copy invite for other apps"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>More Apps / Device Share Sheet (Telegram, SMS, etc.)</span>
                  </button>

                  {/* Dynamic Feedback Toast */}
                  {shareToast && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>{shareToast.platform}:</strong> {shareToast.text}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-500 text-center leading-relaxed pt-0.5">
                    Shares direct link with: <span className="text-indigo-700 font-semibold">"Here's our official admission link! Apply & get admission in our academy"</span>
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleOpenPreview}
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      <span>Live Preview</span>
                    </button>

                    <button
                      onClick={handlePrintStandee}
                      className="flex-1 py-2 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
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
