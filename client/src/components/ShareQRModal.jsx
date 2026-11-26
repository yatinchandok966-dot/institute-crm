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
  ImageIcon,
  ArrowLeft,
  CheckCheck
} from 'lucide-react';

// Official Brand Icons for Sharing Platforms
const WhatsAppIcon = ({ className = "w-6 h-6 text-white" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.588-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.075-2.079-.499-1.614-.668-2.671-2.316-2.753-2.427-.08-.109-.652-.868-.652-1.656 0-.787.411-1.174.557-1.332.144-.158.314-.198.42-.198.106 0 .211.002.304.007.1.005.234-.038.365.279.136.327.464 1.132.505 1.215.041.083.069.181.012.294-.055.114-.083.186-.166.282-.083.097-.175.216-.25.29-.083.082-.17.171-.073.338.098.166.435.718.934 1.162.641.572 1.182.748 1.349.831.166.083.264.072.362-.041.099-.114.422-.491.536-.66.113-.169.227-.141.381-.084.155.056.985.464 1.155.549.17.085.283.127.325.197.042.071.042.41-.102.815z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.05 21.95l4.908-1.353C8.414 21.492 10.155 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.05c-1.625 0-3.136-.454-4.43-1.241l-.318-.194-2.909.803.805-2.836-.211-.336C4.1 14.939 3.6 13.511 3.6 12c0-4.632 3.768-8.4 8.4-8.4 4.633 0 8.4 3.768 8.4 8.4 0 4.633-3.767 8.05-8.4 8.05z" />
  </svg>
);

const LinkedInIcon = ({ className = "w-6 h-6 text-white" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46V10.9M7.86 6.5a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63.9 0 1.63-.73 1.63-1.63 0-.9-.73-1.63-1.63-1.63Z" />
  </svg>
);

const InstagramIcon = ({ className = "w-6 h-6 text-white" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const FacebookIcon = ({ className = "w-6 h-6 text-white" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.82 0-1.611.233-1.916.634-.305.402-.305 1.08-.305 2.128v1.222h4.524l-.619 3.667h-3.905v7.98H9.101z" />
  </svg>
);

const TwitterIcon = ({ className = "w-5 h-5 text-white" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const GmailIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22 6.5l-10 7.5L2 6.5V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6.5z" />
    <path fill="#34A853" d="M22 6.5V5a2 2 0 0 0-2-2h-3l-5 4-5-4H4a2 2 0 0 0-2 2v1.5l10 7.5 10-7.5z" />
    <path fill="#EA4335" d="M12 14l10-7.5L20 5l-8 6-8-6-2 1.5L12 14z" />
    <path fill="#FBBC05" d="M2 6.5V19a2 2 0 0 0 2 2h2V8.5L2 6.5z" />
  </svg>
);

const TelegramIcon = ({ className = "w-6 h-6 text-white" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

export default function ShareQRModal({ isOpen, onClose, courses }) {
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareSuccessToast, setShareSuccessToast] = useState(null);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [copiedFullMessage, setCopiedFullMessage] = useState(false);
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

  const showToast = (message) => {
    setShareSuccessToast(message);
    setTimeout(() => {
      setShareSuccessToast(null);
    }, 3500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicInquiryUrl);
    setCopied(true);
    showToast('Inquiry link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyFullMessage = () => {
    navigator.clipboard.writeText(admissionCaption);
    setCopiedFullMessage(true);
    showToast('Full invitation message & link copied to clipboard!');
    setTimeout(() => setCopiedFullMessage(false), 2500);
  };

  const getQrBlob = async () => {
    const res = await fetch(qrImageUrl);
    if (!res.ok) throw new Error('Failed to fetch QR image');
    return await res.blob();
  };

  // Platform Share Handler: shares the direct link and invitation message across any selected platform
  const handlePlatformShare = async (platformId) => {
    switch (platformId) {
      case 'whatsapp': {
        try {
          await navigator.clipboard.writeText(admissionCaption);
        } catch (_) {}
        const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(admissionCaption)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening WhatsApp with inquiry link and invitation message...');
        break;
      }
      case 'linkedin': {
        try {
          await navigator.clipboard.writeText(admissionCaption);
        } catch (_) {}
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicInquiryUrl)}`;
        window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
        showToast('Link & message copied! Opening LinkedIn share...');
        break;
      }
      case 'instagram': {
        try {
          await navigator.clipboard.writeText(admissionCaption);
        } catch (_) {}
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
        showToast('Admission link copied! Opening Instagram to paste in DM, Bio, or Story...');
        break;
      }
      case 'facebook': {
        try {
          await navigator.clipboard.writeText(publicInquiryUrl);
        } catch (_) {}
        const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicInquiryUrl)}&quote=${encodeURIComponent(admissionCaption)}`;
        window.open(fbUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening Facebook to share inquiry link...');
        break;
      }
      case 'twitter': {
        const tweetText = `🎓 Here's our official admission link! Apply & get admission in EduPulse Academy:`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(publicInquiryUrl)}&hashtags=Education,Admissions,EduPulse`;
        window.open(twitterUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening X (Twitter) tweet intent...');
        break;
      }
      case 'gmail': {
        const subject = `🎓 EduPulse Academy - Course Inquiry & Admission Link`;
        const body = `Hello,\n\nHere is our official course inquiry and admission registration link:\n\n${publicInquiryUrl}\n\nPlease click the link to submit your application and book a free demo session.\n\n✨ Fill the form in 30 seconds to book your demo seat & receive the course syllabus!\n\nBest regards,\nEduPulse Academy Admissions Desk`;
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening Gmail with pre-filled admission link...');
        break;
      }
      case 'telegram': {
        const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(publicInquiryUrl)}&text=${encodeURIComponent(admissionCaption)}`;
        window.open(tgUrl, '_blank', 'noopener,noreferrer');
        showToast('Opening Telegram with inquiry link...');
        break;
      }
      case 'system': {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'EduPulse Academy - Course Inquiry & Admission Link',
              text: admissionCaption,
              url: publicInquiryUrl
            });
            showToast('Shared via device share sheet');
          } catch (e) {
            if (e.name !== 'AbortError') {
              handleCopyLink();
            }
          }
        } else {
          handleCopyLink();
          showToast('Inquiry link copied to clipboard!');
        }
        break;
      }
      default:
        handleCopyLink();
    }
  };

  // Supported Platforms List with Official Brand Styling matching reference image
  const sharePlatforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      subtitle: 'Direct Chat',
      bg: 'bg-[#25D366]',
      hoverBg: 'hover:bg-[#20ba5a]',
      icon: <WhatsAppIcon className="w-6 h-6 text-white" />
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      subtitle: 'Feed / Post',
      bg: 'bg-[#0A66C2]',
      hoverBg: 'hover:bg-[#095196]',
      icon: <LinkedInIcon className="w-6 h-6 text-white" />
    },
    {
      id: 'instagram',
      name: 'Instagram',
      subtitle: 'DM / Story',
      bg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
      hoverBg: 'hover:opacity-90',
      icon: <InstagramIcon className="w-6 h-6 text-white" />
    },
    {
      id: 'facebook',
      name: 'Facebook',
      subtitle: 'Social Feed',
      bg: 'bg-[#1877F2]',
      hoverBg: 'hover:bg-[#166fe5]',
      icon: <FacebookIcon className="w-6 h-6 text-white" />
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      subtitle: 'Tweet',
      bg: 'bg-slate-900',
      hoverBg: 'hover:bg-black',
      icon: <TwitterIcon className="w-5 h-5 text-white" />
    },
    {
      id: 'gmail',
      name: 'Gmail',
      subtitle: 'Google Mail',
      bg: 'bg-white border border-slate-200 shadow-2xs',
      hoverBg: 'hover:bg-slate-50',
      icon: <GmailIcon className="w-6 h-6" />
    },
    {
      id: 'telegram',
      name: 'Telegram',
      subtitle: 'Messenger',
      bg: 'bg-[#229ED9]',
      hoverBg: 'hover:bg-[#1e8ec3]',
      icon: <TelegramIcon className="w-6 h-6 text-white" />
    },
    {
      id: 'system',
      name: 'Device Share',
      subtitle: 'Windows / OS',
      bg: 'bg-indigo-600',
      hoverBg: 'hover:bg-indigo-700',
      icon: <Share2 className="w-5 h-5 text-white" />
    }
  ];

  // Generate a Paytm-style clean branded QR card image with clear admission text on the card itself
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              {isShareSheetOpen ? <Share2 className="w-5 h-5" /> : <QrCode className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isShareSheetOpen ? 'Share Admission Link' : 'Share Student Inquiry QR Code'}
              </h2>
              <p className="text-xs text-slate-500">
                {isShareSheetOpen
                  ? 'Share official admission registration link across all platforms'
                  : 'Digital registration form for campus front-desk, posters, and WhatsApp'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isShareSheetOpen && (
              <button
                onClick={() => setIsShareSheetOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Back to QR Code"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to QR</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Toast Notification */}
        {shareSuccessToast && (
          <div className="mx-6 mt-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1">{shareSuccessToast}</span>
          </div>
        )}

        {/* Tab Switcher (Only visible when not in sub-share-sheet view) */}
        {!isShareSheetOpen && (
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
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================
              VIEW 1: SHARE SHEET (Requested by User like 2nd reference image)
              ======================================================== */}
          {isShareSheetOpen ? (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Item Preview Card (Matches reference image 2 top card) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs font-black text-lg">
                    🎓
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">
                      EduPulse Academy - Course Inquiry & Admission Link
                    </h3>
                    <p className="text-[11px] font-mono text-indigo-600 truncate mt-0.5" title={publicInquiryUrl}>
                      {publicInquiryUrl}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="shrink-0 p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg border border-slate-200 bg-white shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Copy direct admission link"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-[11px]">Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Section Heading: "Share using" (Reference image layout) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Share using
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Shares direct link & official invite
                  </span>
                </div>

                {/* Platforms Grid (WhatsApp, LinkedIn, Instagram, Facebook, Twitter, Gmail, Telegram, Device Share) */}
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-3.5 sm:gap-4">
                  {sharePlatforms.map((platform) => (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformShare(platform.id)}
                      className="group flex flex-col items-center text-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer active:scale-95"
                    >
                      {/* Brand Logo Container */}
                      <div
                        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-108 group-hover:shadow-md ${platform.bg} ${platform.hoverBg}`}
                      >
                        {platform.icon}
                      </div>

                      {/* Label */}
                      <span className="text-xs font-semibold text-slate-800 mt-2 truncate w-full group-hover:text-indigo-600 transition-colors">
                        {platform.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                        {platform.subtitle}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Action: Copy Full Invitation Text */}
              <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleCopyFullMessage}
                  className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedFullMessage ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Full Invitation Message Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Copy Full Invitation Message & Link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsShareSheetOpen(false)}
                  className="w-full sm:w-auto py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
                  <span>Back to QR Code</span>
                </button>
              </div>
            </div>
          ) : activeTab === 'qr' ? (
            /* ========================================================
               VIEW 2: QR CODE & SHARE LINK (Standard Modal View)
               ======================================================== */
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

                {/* Primary Share Button: Opens the platform Share Sheet requested by user */}
                <div className="pt-1 space-y-2.5">
                  <button
                    onClick={() => setIsShareSheetOpen(true)}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 shadow-sm transition-all cursor-pointer"
                    title="Share direct inquiry link across WhatsApp, LinkedIn, Instagram, Facebook, Twitter, Gmail"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Link</span>
                  </button>

                  <p className="text-[10.5px] text-slate-500 text-center leading-relaxed">
                    Shares direct link with: <span className="text-indigo-700 font-semibold">"Here's our official admission link! Apply & get admission in our academy"</span>
                  </p>

                  {/* Quick-Access Platform Icons right on modal for instant 1-click sharing */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Quick Share to:
                      </span>
                      <button
                        onClick={() => setIsShareSheetOpen(true)}
                        className="text-[10.5px] text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        View all platforms &rarr;
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1.5">
                      {sharePlatforms.slice(0, 6).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handlePlatformShare(p.id)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs transition-all hover:scale-110 active:scale-95 cursor-pointer ${p.bg} ${p.hoverBg}`}
                          title={`Share directly to ${p.name}`}
                        >
                          <div className="scale-75">
                            {p.icon}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

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
          ) : (
            /* ========================================================
               VIEW 3: FRONT-DESK STANDEE PREVIEW & PRINT
               ======================================================== */
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
          <div className="flex items-center gap-2">
            {isShareSheetOpen && (
              <button
                onClick={() => setIsShareSheetOpen(false)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
              >
                Back
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
