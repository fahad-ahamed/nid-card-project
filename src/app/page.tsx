'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ===== TYPES ===== */
interface NidFormData {
  name_bn: string;
  name_en: string;
  nid: string;
  pin: string;
  father: string;
  mother: string;
  birth: string;
  dob: string;
  blood: string;
  address: string;
  gender: string;
}

interface NidCardData extends NidFormData {
  issue_date: string;
  created_at: string;
  photo_base64?: string;
  photo_type?: string;
  sign_base64?: string;
  sign_type?: string;
}

type ViewType = 'make' | 'view' | 'admin-login' | 'admin-panel' | 'downloader';

/* ===== MAIN COMPONENT ===== */
export default function NidCardApp() {
  const [currentView, setCurrentView] = useState<ViewType>('make');
  const [viewNid, setViewNid] = useState<string>('');
  const [cardData, setCardData] = useState<NidCardData | null>(null);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<React.ReactNode>(null);

  // Navigate to card view
  const viewCard = useCallback((nid: string) => {
    setViewNid(nid);
    setCurrentView('view');
  }, []);

  // Navigate to downloader
  const downloadCard = useCallback((nid: string) => {
    setViewNid(nid);
    setCurrentView('downloader');
  }, []);

  // Search NID
  const doSearchNid = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResult(
        <div style={{ padding: 10, background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, color: '#856404', fontSize: 13 }}>
          <i className="bi bi-exclamation-triangle"></i> NID নম্বর বা PIN নম্বর দিন
        </div>
      );
      return;
    }

    setSearchResult(
      <div style={{ padding: 10, background: '#e8f4f8', border: '1px solid #bee5eb', borderRadius: 8, color: '#0c5460', fontSize: 13 }}>
        <i className="bi bi-arrow-repeat"></i> অনুসন্দান হচ্ছে...
      </div>
    );

    try {
      const res = await fetch('/api/nid?search=' + encodeURIComponent(query));
      const data = await res.json();
      if (data.found) {
        const d = data.data;
        setSearchResult(
          <div style={{ padding: 15, background: '#d4edda', border: '1px solid #c3e6cb', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <i className="bi bi-check-circle-fill" style={{ color: '#28a745', fontSize: 20 }}></i>
              <strong style={{ color: '#155724', fontSize: 15 }}>তথ্য পাওয়া গেছে!</strong>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: 13, color: '#155724' }}>
              <div><strong>নাম (বাংলা):</strong> {d.name_bn}</div>
              <div><strong>Name:</strong> {d.name_en}</div>
              <div><strong>NID:</strong> {d.nid}</div>
              <div><strong>PIN:</strong> {d.pin}</div>
              <div><strong>জন্ম তারিখ:</strong> {d.dob}</div>
              <div><strong>রক্তের গ্রুপ:</strong> {d.blood}</div>
              <div><strong>পিতা:</strong> {d.father}</div>
              <div><strong>মাতা:</strong> {d.mother}</div>
              <div style={{ gridColumn: 'span 2' }}><strong>ঠিকানা:</strong> {d.address}</div>
            </div>
            <button onClick={() => viewCard(d.nid)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '8px 16px', background: 'linear-gradient(135deg, #006a4e, #00875a)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <i className="bi bi-card-text"></i> NID কার্ড দেখুন
            </button>
          </div>
        );
      } else {
        setSearchResult(
          <div style={{ padding: 10, background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: 8, color: '#721c24', fontSize: 13 }}>
            <i className="bi bi-x-circle"></i> {data.message || 'কোনো তথ্য পাওয়া যায়নি'}
          </div>
        );
      }
    } catch {
      setSearchResult(
        <div style={{ padding: 10, background: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: 8, color: '#721c24', fontSize: 13 }}>
          <i className="bi bi-x-circle"></i> সার্ভার ত্রুটি
        </div>
      );
    }
  }, [viewCard]);

  return (
    <div>
      {currentView === 'make' && (
        <NidMakeView
          onCardCreated={viewCard}
          onGoAdmin={() => setCurrentView('admin-login')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResult={searchResult}
          setSearchResult={setSearchResult}
          doSearchNid={doSearchNid}
        />
      )}
      {currentView === 'view' && (
        <NidCardView
          nid={viewNid}
          onBack={() => setCurrentView('make')}
          onDownload={downloadCard}
          setCardData={setCardData}
          cardData={cardData}
        />
      )}
      {currentView === 'admin-login' && (
        <AdminLoginView
          onLogin={() => { setAdminLoggedIn(true); setCurrentView('admin-panel'); }}
          onBack={() => setCurrentView('make')}
        />
      )}
      {currentView === 'admin-panel' && (
        <AdminPanelView
          onLogout={() => { setAdminLoggedIn(false); setCurrentView('make'); }}
          onViewCard={viewCard}
          onDownloadCard={downloadCard}
        />
      )}
      {currentView === 'downloader' && (
        <DownloaderView
          nid={viewNid}
          cardData={cardData}
          onBack={() => setCurrentView('view')}
          onBackToView={() => setCurrentView('view')}
        />
      )}
    </div>
  );
}

/* ===== NID MAKE VIEW ===== */
function NidMakeView({ onCardCreated, onGoAdmin, searchQuery, setSearchQuery, searchResult, setSearchResult, doSearchNid }: {
  onCardCreated: (nid: string) => void;
  onGoAdmin: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResult: React.ReactNode;
  setSearchResult: (r: React.ReactNode) => void;
  doSearchNid: (q: string) => void;
}) {
  const [formData, setFormData] = useState<NidFormData>({
    name_bn: '', name_en: '', nid: '', pin: '',
    father: '', mother: '', birth: '', dob: '',
    blood: '', address: '', gender: 'male'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [signPreview, setSignPreview] = useState<string>('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [photoType, setPhotoType] = useState<string>('');
  const [signBase64, setSignBase64] = useState<string>('');
  const [signType, setSignType] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'sign') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(',')[1];
      if (type === 'photo') {
        setPhotoPreview(result);
        setPhotoBase64(base64);
        setPhotoType(file.type);
      } else {
        setSignPreview(result);
        setSignBase64(base64);
        setSignType(file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  const autoGenerate = () => {
    const firstNames = ['মোঃ', 'মোসাঃ', 'শ্রী'];
    const names = ['রহিম উদ্দিন', 'করিম হাসান', 'ফাতেমা বেগম', 'আলী আকবর', 'নাসরিন সুলতানা', 'কামাল হোসেন', 'জাহিদ হাসান', 'মাহমুদা খাতুন'];
    const fathers = ['আব্দুল করিম', 'মোঃ হাসান', 'শ্রী রমণ', 'মোঃ ইব্রাহিম', 'আব্দুল জলিল'];
    const mothers = ['ফাতেমা বেগম', 'হাসিনা খাতুন', 'রহিমা বেগম', 'নূরজাহান', 'আয়েশা বেগম'];
    const areas = ['ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'সিলেট', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ'];
    const bloods = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const month = months[Math.floor(Math.random() * 12)];
    const year = String(Math.floor(Math.random() * 30) + 1975);

    setFormData({
      name_bn: fn + ' ' + name,
      name_en: fn + ' ' + name,
      nid: String(Math.floor(Math.random() * 9000000000) + 1000000000),
      pin: String(Math.floor(Math.random() * 9000) + 1000),
      father: fathers[Math.floor(Math.random() * fathers.length)],
      mother: mothers[Math.floor(Math.random() * mothers.length)],
      birth: area,
      dob: `${day} ${month} ${year}`,
      blood: bloods[Math.floor(Math.random() * bloods.length)],
      address: `গ্রাম/মহল্লা, উপজেলা/থানা, জেলা: ${area}`,
      gender: Math.random() > 0.5 ? 'male' : 'female',
    });

    // Generate random photo using canvas
    const photoCanvas = document.createElement('canvas');
    photoCanvas.width = 150;
    photoCanvas.height = 180;
    const photoCtx = photoCanvas.getContext('2d');
    if (photoCtx) {
      // Background
      photoCtx.fillStyle = ['#e8d5b7', '#d4c5a9', '#c9b896', '#f0e6d3'][Math.floor(Math.random() * 4)];
      photoCtx.fillRect(0, 0, 150, 180);
      // Hair
      photoCtx.fillStyle = '#1a1a1a';
      photoCtx.beginPath();
      photoCtx.arc(75, 40, 32, Math.PI, 0);
      photoCtx.fill();
      // Face
      photoCtx.fillStyle = '#d4a574';
      photoCtx.beginPath();
      photoCtx.arc(75, 55, 25, 0, Math.PI * 2);
      photoCtx.fill();
      // Eyes
      photoCtx.fillStyle = '#1a1a1a';
      photoCtx.beginPath();
      photoCtx.arc(65, 52, 3, 0, Math.PI * 2);
      photoCtx.arc(85, 52, 3, 0, Math.PI * 2);
      photoCtx.fill();
      // Mouth
      photoCtx.strokeStyle = '#8B4513';
      photoCtx.lineWidth = 1.5;
      photoCtx.beginPath();
      photoCtx.arc(75, 62, 8, 0.1 * Math.PI, 0.9 * Math.PI);
      photoCtx.stroke();
      // Body
      photoCtx.fillStyle = ['#1a5276', '#2e86c1', '#1b4f72', '#2c3e50'][Math.floor(Math.random() * 4)];
      photoCtx.fillRect(30, 85, 90, 95);
      // Collar
      photoCtx.fillStyle = '#fff';
      photoCtx.beginPath();
      photoCtx.moveTo(60, 85);
      photoCtx.lineTo(75, 100);
      photoCtx.lineTo(90, 85);
      photoCtx.closePath();
      photoCtx.fill();
    }
    const photoDataUrl = photoCanvas.toDataURL('image/png');
    setPhotoPreview(photoDataUrl);
    setPhotoBase64(photoDataUrl.split(',')[1]);
    setPhotoType('image/png');

    // Generate random signature using canvas
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 200;
    signCanvas.height = 60;
    const signCtx = signCanvas.getContext('2d');
    if (signCtx) {
      signCtx.fillStyle = '#ffffff';
      signCtx.fillRect(0, 0, 200, 60);
      signCtx.strokeStyle = '#000080';
      signCtx.lineWidth = 2;
      signCtx.beginPath();
      // Random signature-like curve
      const startX = 20;
      signCtx.moveTo(startX, 40);
      for (let i = 0; i < 5; i++) {
        const x = startX + (i * 35) + Math.random() * 10;
        const y = 20 + Math.random() * 30;
        signCtx.quadraticCurveTo(x + 10, y - 15, x + 20, y);
      }
      signCtx.stroke();
    }
    const signDataUrl = signCanvas.toDataURL('image/png');
    setSignPreview(signDataUrl);
    setSignBase64(signDataUrl.split(',')[1]);
    setSignType('image/png');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const required = ['name_bn', 'name_en', 'nid', 'pin', 'father', 'mother', 'birth', 'dob', 'blood', 'address'];
    for (const f of required) {
      if (!formData[f as keyof NidFormData]) errs[f] = 'এই ঘরটি পূরণ করা আবশ্যক';
    }
    if (formData.nid && !/^[0-9]{10,17}$/.test(formData.nid)) errs.nid = 'সঠিক NID নম্বর দিন (10-17 ডিজিট)';
    if (formData.pin && !/^[0-9]{4,10}$/.test(formData.pin)) errs.pin = 'সঠিক PIN নম্বর দিন';
    if (!photoBase64) errs.photo = 'ছবি আপলোড করুন';
    if (!signBase64) errs.signature = 'স্বাক্ষর আপলোড করুন';
    const validBlood = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (formData.blood && !validBlood.includes(formData.blood.toUpperCase())) errs.blood = 'সঠিক রক্তের গ্রুপ নির্বাচন করুন';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      const now = new Date();
      const issueDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

      const res = await fetch('/api/nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameBn: formData.name_bn,
          nameEn: formData.name_en.toUpperCase(),
          nid: formData.nid,
          pin: formData.pin,
          father: formData.father,
          mother: formData.mother,
          birthPlace: formData.birth,
          dob: formData.dob,
          blood: formData.blood,
          address: formData.address,
          gender: formData.gender,
          photoBase64,
          photoType,
          signBase64,
          signType,
          issueDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onCardCreated(formData.nid);
      } else {
        alert(data.message || 'ত্রুটি হয়েছে');
      }
    } catch {
      alert('সার্ভার ত্রুটি');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nid-make-body">
      {/* Top Green Banner */}
      <div className="gov-banner">
        <div className="gov-banner-inner">
          <div className="gov-banner-left">
            <div className="gov-flag"></div>
            <div className="gov-banner-title">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
              <small>Government of the People&apos;s Republic of Bangladesh</small>
            </div>
          </div>
          <div className="gov-banner-right">
            <a href="#"><i className="bi bi-globe"></i> English</a>
            <a href="#"><i className="bi bi-telephone"></i> জরুরি: 999</a>
            <a href="#"><i className="bi bi-shield-check"></i> সাইবার নিরাপত্তা</a>
          </div>
        </div>
      </div>

      {/* Header with Logo */}
      <div className="gov-header">
        <div className="gov-header-inner">
          <div className="gov-logo-area">
            <div className="gov-logo-icon">
              <img src="/assets/Images/bangladeshicon.png" alt="BD" />
            </div>
            <div className="gov-logo-text">
              <h1>জাতীয় পরিচয় পত্র</h1>
              <p>National Identity Card — Election Commission Bangladesh</p>
            </div>
          </div>
          <div className="gov-header-badge">
            <i className="bi bi-lock-fill"></i> সুরক্ষিত পোর্টাল
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="gov-nav">
        <div className="gov-nav-inner">
          <a className="active"><i className="bi bi-house-door"></i> হোম</a>
          <a onClick={onGoAdmin} style={{ cursor: 'pointer' }}><i className="bi bi-shield-lock"></i> Admin</a>
          <div className="nav-search-box">
            <input type="text" className="nav-search-input" placeholder="NID বা PIN নম্বর দিন..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') doSearchNid(searchQuery); }} />
            <button className="nav-search-btn" onClick={() => doSearchNid(searchQuery)}><i className="bi bi-search"></i> অনুসন্দান</button>
          </div>
          <a href="#"><i className="bi bi-question-circle"></i> সাহায্য</a>
          <a href="#"><i className="bi bi-telephone"></i> যোগাযোগ</a>
        </div>
      </div>

      {/* Search Result */}
      <div className="search-result-bar">
        <div id="searchResult" style={{ display: searchResult ? 'block' : 'none' }}>{searchResult}</div>
      </div>

      {/* Form Section */}
      <div className="form-container">
        <div className="form-card">
          <div className="form-card-header">
            <i className="bi bi-person-badge"></i>
            <div>
              <h2>NID কার্ড আবেদন</h2>
              <small>আপনার তথ্য প্রদান করুন এবং জাতীয় পরিচয় পত্র তৈরি করুন</small>
            </div>
          </div>
          <div className="form-card-body">
            {/* Step Indicator */}
            <div className="form-step-indicator">
              <div className="step-item active"><div className="step-circle">1</div><span className="step-label">ব্যক্তিগত</span></div>
              <div className="step-item"><div className="step-circle">2</div><span className="step-label">পিতামাতা</span></div>
              <div className="step-item"><div className="step-circle">3</div><span className="step-label">ঠিকানা</span></div>
              <div className="step-item"><div className="step-circle">4</div><span className="step-label">আপলোড</span></div>
            </div>

            <form onSubmit={handleSubmit} id="nidForm">
              {/* Personal Info */}
              <div className="form-section-title"><i className="bi bi-person"></i> ব্যক্তিগত তথ্য</div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>নাম (বাংলা) <span className="required">*</span></label>
                    <input type="text" className={`form-control-custom ${errors.name_bn ? 'is-invalid' : ''}`} name="name_bn" value={formData.name_bn} onChange={handleChange} placeholder="আপনার নাম বাংলায় লিখুন" />
                    {errors.name_bn && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.name_bn}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>Name (English) <span className="required">*</span></label>
                    <input type="text" className={`form-control-custom ${errors.name_en ? 'is-invalid' : ''}`} name="name_en" value={formData.name_en} onChange={handleChange} placeholder="Your name in English" />
                    {errors.name_en && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.name_en}</div>}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>NID নম্বর <span className="required">*</span></label>
                    <input type="text" className={`form-control-custom ${errors.nid ? 'is-invalid' : ''}`} name="nid" value={formData.nid} onChange={handleChange} placeholder="যেমন: 8252184567" maxLength={17} />
                    {errors.nid && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.nid}</div>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>PIN নম্বর <span className="required">*</span></label>
                    <input type="text" className={`form-control-custom ${errors.pin ? 'is-invalid' : ''}`} name="pin" value={formData.pin} onChange={handleChange} placeholder="PIN নম্বর" maxLength={10} />
                    {errors.pin && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.pin}</div>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>জন্ম তারিখ <span className="required">*</span></label>
                    <input type="text" className={`form-control-custom ${errors.dob ? 'is-invalid' : ''}`} name="dob" value={formData.dob} onChange={handleChange} placeholder="যেমন: 05 Nov 2005" />
                    {errors.dob && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.dob}</div>}
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>রক্তের গ্রুপ <span className="required">*</span></label>
                    <select className={`form-control-custom ${errors.blood ? 'is-invalid' : ''}`} name="blood" value={formData.blood} onChange={handleChange}>
                      <option value="">নির্বাচন করুন</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                    {errors.blood && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.blood}</div>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>লিঙ্গ</label>
                    <select className="form-control-custom" name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="male">পুরুষ</option>
                      <option value="female">মহিলা</option>
                      <option value="other">অন্যান্য</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group-custom">
                    <label>জন্মস্থান <span className="required">*</span></label>
                    <input type="text" className={`form-control-custom ${errors.birth ? 'is-invalid' : ''}`} name="birth" value={formData.birth} onChange={handleChange} placeholder="যেমন: ঢাকা" />
                    {errors.birth && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.birth}</div>}
                  </div>
                </div>
              </div>

              {/* Parent Info */}
              <div className="form-section-title" style={{ marginTop: 25 }}><i className="bi bi-people"></i> পিতামাতার তথ্য</div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>পিতার নাম <span className="required">*</span></label>
                    <input type="text" className={`form-control-custom ${errors.father ? 'is-invalid' : ''}`} name="father" value={formData.father} onChange={handleChange} placeholder="পিতার নাম" />
                    {errors.father && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.father}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>মাতার নাম <span className="required">*</span></label>
                    <input type="text" className={`form-control-custom ${errors.mother ? 'is-invalid' : ''}`} name="mother" value={formData.mother} onChange={handleChange} placeholder="মাতার নাম" />
                    {errors.mother && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.mother}</div>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="form-section-title" style={{ marginTop: 25 }}><i className="bi bi-geo-alt"></i> ঠিকানা</div>
              <div className="form-group-custom">
                <label>সম্পূর্ণ ঠিকানা <span className="required">*</span></label>
                <textarea className={`form-control-custom ${errors.address ? 'is-invalid' : ''}`} name="address" rows={2} placeholder="গ্রাম/মহল্লা, উপজেলা/থানা, জেলা" value={formData.address} onChange={handleChange}></textarea>
                {errors.address && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.address}</div>}
              </div>

              {/* Uploads */}
              <div className="form-section-title" style={{ marginTop: 25 }}><i className="bi bi-cloud-upload"></i> আপলোড</div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>ছবি (পাসপোর্ট সাইজ) <span className="required">*</span></label>
                    <div className="upload-zone" onClick={() => photoInputRef.current?.click()}>
                      <i className="bi bi-camera-fill"></i>
                      <p className="upload-label">ছবি নির্বাচন করুন</p>
                      <p>JPG/PNG, সর্বোচ্চ 5MB</p>
                      <input type="file" ref={photoInputRef} accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e, 'photo')} />
                      {photoPreview && <img src={photoPreview} className="upload-preview" alt="Preview" style={{ display: 'block' }} />}
                    </div>
                    {errors.photo && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.photo}</div>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label>স্বাক্ষর <span className="required">*</span></label>
                    <div className="upload-zone" onClick={() => signInputRef.current?.click()}>
                      <i className="bi bi-pen-fill"></i>
                      <p className="upload-label">স্বাক্ষর নির্বাচন করুন</p>
                      <p>JPG/PNG, সর্বোচ্চ 2MB</p>
                      <input type="file" ref={signInputRef} accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e, 'sign')} />
                      {signPreview && <img src={signPreview} className="upload-preview" alt="Preview" style={{ display: 'block' }} />}
                    </div>
                    {errors.signature && <div className="error-msg"><i className="bi bi-exclamation-circle"></i> {errors.signature}</div>}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 30 }}>
                <button type="button" className="btn-auto-generate" onClick={autoGenerate} disabled={submitting}>
                  <i className="bi bi-magic"></i> Auto Generate — সব তথ্য অটো পূরণ করুন
                </button>
                <button type="submit" className="btn-submit-custom" disabled={submitting}>
                  <i className="bi bi-shield-check"></i> {submitting ? 'তৈরি হচ্ছে...' : 'NID কার্ড তৈরি করুন'}
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: 15, fontSize: 12, color: 'var(--gov-text-light)' }}>
                <i className="bi bi-lock-fill"></i> আপনার তথ্য সুরক্ষিত রাখা হয় এবং কোনো সার্ভারে সংরক্ষণ করা হয় না
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="gov-footer">
        <p>&copy; 2026 নির্বাচন কমিশন বাংলাদেশ | Election Commission Bangladesh</p>
        <p>
          <a href="#">গোপনীয়তা নীতি</a>
          <span className="footer-separator">|</span>
          <a href="#">ব্যবহারের শর্তাবলী</a>
          <span className="footer-separator">|</span>
          <a href="#">সাহায্য</a>
        </p>
      </div>
    </div>
  );
}

/* ===== NID CARD VIEW ===== */
function NidCardView({ nid, onBack, onDownload, setCardData, cardData }: {
  nid: string;
  onBack: () => void;
  onDownload: (nid: string) => void;
  setCardData: (d: NidCardData | null) => void;
  cardData: NidCardData | null;
}) {
  const [data, setData] = useState<NidCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const barcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/nid?nid=' + encodeURIComponent(nid));
        const result = await res.json();
        if (result.found || result.success) {
          const d = result.data || result;
          // Convert from DB field names to original format
          const cardData: NidCardData = {
            name_bn: d.name_bn || d.nameBn || '',
            name_en: d.name_en || d.nameEn || '',
            nid: d.nid || '',
            pin: d.pin || '',
            father: d.father || '',
            mother: d.mother || '',
            birth: d.birth || d.birthPlace || d.birth_place || '',
            dob: d.dob || '',
            blood: d.blood || '',
            address: d.address || '',
            gender: d.gender || 'male',
            issue_date: d.issue_date || d.issueDate || '',
            created_at: d.created_at || d.createdAt || '',
            photo_base64: d.photo_base64 || d.photoBase64 || '',
            photo_type: d.photo_type || d.photoType || '',
            sign_base64: d.sign_base64 || d.signBase64 || '',
            sign_type: d.sign_type || d.signType || '',
          };
          setData(cardData);
          setCardData(cardData);
        }
      } catch (err) {
        console.error('Failed to fetch NID data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [nid, setCardData]);

  // Generate PDF417 barcode
  useEffect(() => {
    if (!data || !barcodeRef.current) return;
    const timer = setTimeout(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const PDF417Lib = (window as any).PDF417;
        if (!PDF417Lib) return;

        const hub3_code = `<pin>${data.pin}</pin><name>${data.name_en}</name><DOB>${data.dob}/DOB><FP></FP><F>Right Index</F><TYPE>A</TYPE><V>2.0</V><ds>302c0214103fc01240542ed736c0b48858c1c03d80006215021416e73728de9618fedcd368c88d8f3a2e72096d</ds>`;
        PDF417Lib.init(hub3_code);
        const barcode = PDF417Lib.getBarcodeArray();
        const bw = 2, bh = 2;
        const canvas = document.createElement('canvas');
        canvas.width = bw * barcode.num_cols;
        canvas.height = bh * barcode.num_rows;
        barcodeRef.current.innerHTML = '';
        barcodeRef.current.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          let y = 0;
          for (let r = 0; r < barcode.num_rows; ++r) {
            let x = 0;
            for (let c = 0; c < barcode.num_cols; ++c) {
              if (barcode.bcode[r][c] === 1) { ctx.fillRect(x, y, bw, bh); }
              x += bw;
            }
            y += bh;
          }
        }

        // Bengali digit conversion for issue date
        const finalEnlishToBanglaNumber: Record<string, string> = { '0': '\u09E6', '1': '\u09E7', '2': '\u09E8', '3': '\u09E9', '4': '\u09EA', '5': '\u09EB', '6': '\u09EC', '7': '\u09ED', '8': '\u09EE', '9': '\u09EF' };
        const cardDateEl = document.getElementById('card_date');
        if (cardDateEl && data.issue_date) {
          const banglaDate = data.issue_date.replace(/[0-9]/g, (d: string) => finalEnlishToBanglaNumber[d] || d);
          cardDateEl.textContent = banglaDate;
        }
      } catch (e) {
        console.error('Barcode generation error:', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [data]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
        <div style={{ textAlign: 'center', color: '#006a4e' }}>
          <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
          <p style={{ marginTop: 10 }}>কার্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
        <div style={{ textAlign: 'center' }}>
          <p>কার্ড পাওয়া যায়নি</p>
          <button onClick={onBack} className="btn-back"><i className="bi bi-arrow-left"></i> ফিরে যান</button>
        </div>
      </div>
    );
  }

  const photoSrc = data.photo_base64 ? `data:${data.photo_type || 'image/png'};base64,${data.photo_base64}` : '/assets/Images/notfound.png';
  const signSrc = data.sign_base64 ? `data:${data.sign_type || 'image/png'};base64,${data.sign_base64}` : '/assets/Images/notfound.png';

  return (
    <div className="nid-view-body">
      {/* Result Header */}
      <div className="result-header no-print">
        <div className="result-header-left">
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: 20 }}></i>
          </div>
          <div>
            <h2>NID কার্ড তৈরি সম্পন্ন</h2>
            <small>আপনার জাতীয় পরিচয় পত্র প্রস্তুত</small>
          </div>
        </div>
        <div className="header-btns">
          <button onClick={() => onDownload(nid)} className="btn-download"><i className="bi bi-download"></i> ডাউনলোড করুন</button>
          <button onClick={onBack} className="btn-back"><i className="bi bi-arrow-left"></i> নতুন কার্ড</button>
        </div>
      </div>

      <div className="card-container">
        <main>
          <div>
            <main className="w-full overflow-hidden">
              <div>
                <div className="container w-full py-12 lg:flex lg:items-start" style={{ paddingTop: 0 }}>
                  <div className="w-full lg:pl-6">
                    <div className="flex items-center justify-center">
                      <div className="w-full">
                        <div className="flex items-start gap-x-2 bg-transparent mx-auto w-fit" id="nid_wrapper" style={{ marginTop: 120, gap: 8 }}>
                          {/* FRONT SIDE */}
                          <div id="nid_front" className="border-[1.999px] border-black" style={{ width: '85.6mm', minWidth: '85.6mm' }}>
                            <header className="px-1.5 flex items-start gap-x-2 justify-between relative">
                              <img className="w-[38px] absolute top-1.5 left-[4.5px]" src="/assets/Images/bangladeshicon.png" alt="bangladeshicon" />
                              <div className="w-full h-[60px] flex flex-col justify-center">
                                <h3 style={{ fontSize: 20 }} className="text-center font-medium tracking-normal pl-11 bn leading-5"><span style={{ marginTop: 1, display: 'inline-block' }}>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span></h3>
                                <p className="text-[#007700] text-right tracking-[-0rem] leading-3" style={{ fontSize: '11.46px', fontFamily: 'arial', marginBottom: '-0.02px' }}>Government of the People&apos;s Republic of Bangladesh</p>
                                <p className="text-center font-medium pl-10 leading-4" style={{ paddingTop: 0 }}><span className="text-[#ff0002]" style={{ fontSize: 10, fontFamily: 'arial' }}>National ID Card</span><span className="ml-1" style={{ display: 'inline-block' }}><span style={{ fontSize: 13, fontFamily: 'arial' }}>/</span></span><span className="bn ml-1" style={{ fontSize: '13.33px' }}>জাতীয় পরিচয় পত্র</span></p>
                              </div>
                            </header>
                            <div className="w-[101%] -ml-[0.5%] border-b-[1.9999px] border-black" style={{ width: '100%', marginLeft: 0 }}></div>
                            <div className="pt-[3.8px] pr-1 pl-[2px] bg-center w-full flex justify-between gap-x-2 pb-5 relative">
                              <div className="absolute inset-x-0 top-[2px] mx-auto z-10 flex items-start justify-center"><img style={{ background: 'transparent', width: 114, height: 114 }} className="ml-[20px] w-[125px] h-[116px" src="/assets/Images/flower-logo.png" alt="" /></div>
                              <div className="relative z-50">
                                <img style={{ marginTop: -2 }} id="userPhoto" className="w-[68.2px] h-[78px]" alt="photo" src={photoSrc} />
                                <div className="text-center text-xs flex items-start justify-center pt-[5px] w-[68.2px] mx-auto h-[38.5px] overflow-hidden" id="card_signature">
                                  <img id="sign" src={signSrc} alt="sign" />
                                </div>
                              </div>
                              <div className="w-full relative z-50">
                                <div style={{ height: 5 }}></div>
                                <div className="flex flex-col gap-y-[10px]" style={{ marginTop: 1 }}>
                                  <div><p className="space-x-4 leading-3" style={{ paddingLeft: 1 }}><span className="bn" style={{ fontSize: '16.53px' }}>নাম:</span><span className="" style={{ fontSize: '16.53px', paddingLeft: 3, WebkitTextStroke: '0.4px black' }} id="nameBn">{data.name_bn}</span></p></div>
                                  <div style={{ marginTop: 1 }}><p className="space-x-2 leading-3" style={{ marginBottom: '-1.4px', marginTop: '1.4px', paddingLeft: 1 }}><span style={{ fontSize: 11 }}>Name:</span><span style={{ fontSize: '12.73px', paddingLeft: 1 }} id="nameEn">{data.name_en}</span></p></div>
                                  <div style={{ marginTop: 1 }}><p className="bn space-x-3 leading-3" style={{ paddingLeft: 1 }}><span id="fatherOrHusband" style={{ fontSize: 14 }}>পিতা: </span><span style={{ fontSize: 14, transform: 'scaleX(0.724)' }} id="card_father_name">{data.father}</span></p></div>
                                  <div style={{ marginTop: 1 }}><p className="bn space-x-3 leading-3" style={{ marginTop: '-2.5px', paddingLeft: 1 }}><span style={{ fontSize: 14 }}>মাতা: </span><span style={{ fontSize: 14, transform: 'scaleX(0.724)' }} id="card_mother_name">{data.mother}</span></p></div>
                                  <div className="leading-4" style={{ fontSize: 12, marginTop: '-1.2px' }}><p style={{ marginTop: -2 }}><span>Date of Birth: </span><span id="card_date_of_birth" className="text-[#ff0000]" style={{ marginLeft: -1 }}>{data.dob}</span></p></div>
                                  <div className="-mt-0.5 leading-4" style={{ fontSize: 12, marginTop: -5 }}><p style={{ marginTop: -3 }}><span>ID NO: </span><span className="text-[#ff0000] font-bold" id="card_nid_no">{data.nid}</span></p></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* BACK SIDE */}
                          <div id="nid_back" className="border-[1.999px] border-[#000]" style={{ width: '85.6mm', minWidth: '85.6mm' }}>
                            <header style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 8px', letterSpacing: '0.05px', textAlign: 'left' }}>
                              <p className="bn" style={{ lineHeight: '13px', fontSize: '11.33px', letterSpacing: '0.05px', margin: 0 }}>এই কার্ডটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সম্পত্তি। কার্ডটি ব্যবহারকারী ব্যতীত অন্য কোথাও পাওয়া গেলে নিকটস্থ পোস্ট অফিসে জমা দেবার জন্য অনুরোধ করা হলো।</p>
                            </header>
                            <div style={{ width: '100%', marginLeft: 0, borderBottom: '1.999px solid black' }}></div>
                            <div style={{ padding: '3px 4px', height: 66, position: 'relative', fontSize: 12 }}>
                              <div className="back-address-row">
                                <span className="back-address-label bn">ঠিকানা:</span>
                                <span className="back-address-value bn" id="card_address">{data.address}</span>
                              </div>
                              <div className="back-bottom-row" style={{ marginTop: 'auto', position: 'absolute', bottom: '1.08px', left: 0, right: 0 }}>
                                <p className="bn back-info-line" style={{ marginBottom: 0, paddingLeft: 6, fontWeight: 500 }}>
                                  <span style={{ fontSize: '11.6px' }}>রক্তের গ্রুপ</span><span style={{ display: 'inline-block', width: 3 }}></span><span style={{ fontSize: 11, fontFamily: 'arial' }}>/</span><span style={{ display: 'inline-block', width: 3 }}></span><span style={{ fontSize: 9 }}>Blood Group:</span><b style={{ fontSize: '9.33px', marginBottom: -3, display: 'inline-block', color: '#ff0000', marginLeft: 4, marginRight: 10, fontWeight: 'bold' }} id="card_blood">{data.blood}</b><span style={{ fontSize: '10.66px' }}>জন্মস্থান:</span><span style={{ display: 'inline-block', width: 3 }}></span><span style={{ fontSize: '10.66px' }} id="card_birth_place">{data.birth}</span>
                                </p>
                                <div className="back-mududdron">
                                  <img src="/assets/Images/mududdron.png" alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
                                </div>
                              </div>
                            </div>
                            <div style={{ width: '100%', marginLeft: 0, borderBottom: '1.999px solid black' }}></div>
                            <div style={{ padding: '4px 8px 4px 4px' }}>
                              <img style={{ width: 78, marginLeft: 18, marginBottom: 3, height: '27.3px', display: 'block' }} src="/assets/Images/adminsign.jpg" alt="admin signature" />
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -5 }}>
                                <p className="bn" style={{ fontSize: 14, margin: 0 }}>প্রদানকারী কর্তৃপক্তের স্বাক্ষর</p>
                                <span className="bn" style={{ fontSize: 12, paddingRight: 16, paddingTop: 1 }}>প্রদানের তারিখ:<span style={{ marginLeft: 10 }} id="card_date">{data.issue_date}</span></span>
                              </div>
                              <div id="barcode" ref={barcodeRef} style={{ width: '100%', height: 39, marginTop: '1.5px', marginLeft: -3 }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===== ADMIN LOGIN VIEW ===== */
function AdminLoginView({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin();
      } else {
        setError(data.message || 'ভুল পাসওয়ার্ড!');
      }
    } catch {
      setError('সার্ভার ত্রুটি');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetCode, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setResetSuccess(true);
        setResetError('');
        setShowReset(false);
      } else {
        setResetError(data.message || 'ত্রুটি');
      }
    } catch {
      setResetError('সার্ভার ত্রুটি');
    }
  };

  return (
    <div className="admin-login-body">
      <div className="login-card">
        <div className="login-icon"><i className="bi bi-shield-lock"></i></div>
        <h2>Admin Login</h2>
        <p className="subtitle">প্রশাসনিক প্যানেলে প্রবেশ করুন</p>

        {resetSuccess && <div className="success-msg-box"><i className="bi bi-check-circle-fill"></i> পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!</div>}
        {error && !showReset && <div className="error-msg-box"><i className="bi bi-exclamation-triangle-fill"></i> {error}</div>}

        <form onSubmit={handleLogin} id="loginForm">
          <div className="form-group">
            <label><i className="bi bi-key"></i> পাসওয়ার্ড</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="পাসওয়ার্ড দিন..." autoFocus required />
          </div>
          <button type="submit" className="login-btn">
            <i className="bi bi-box-arrow-in-right"></i> লগইন করুন
          </button>
        </form>

        <div className="reset-divider"><span>অথবা</span></div>
        <div className="reset-toggle">
          <a onClick={() => setShowReset(!showReset)}><i className="bi bi-key"></i> পাসওয়ার্ড ভুলে গেছেন?</a>
        </div>

        <form onSubmit={handleReset} className={`reset-form ${showReset ? 'show' : ''}`} style={{ marginTop: 15 }}>
          {resetError && <div className="error-msg-box"><i className="bi bi-exclamation-triangle-fill"></i> {resetError}</div>}
          <div className="form-group">
            <label><i className="bi bi-shield-lock"></i> রিসেট কোড</label>
            <input type="text" value={resetCode} onChange={e => setResetCode(e.target.value)} placeholder="রিসেট কোড দিন..." required />
          </div>
          <div className="form-group">
            <label><i className="bi bi-lock"></i> নতুন পাসওয়ার্ড</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="নতুন পাসওয়ার্ড দিন..." required />
          </div>
          <div className="form-group">
            <label><i className="bi bi-lock-fill"></i> পাসওয়ার্ড নিশ্চিত করুন</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="আবার পাসওয়ার্ড দিন..." required />
          </div>
          <button type="submit" className="reset-btn">
            <i className="bi bi-arrow-repeat"></i> পাসওয়ার্ড রিসেট করুন
          </button>
        </form>

        <div className="back-link">
          <a onClick={onBack} style={{ cursor: 'pointer' }}><i className="bi bi-arrow-left"></i> হোম পেজে ফিরে যান</a>
        </div>
      </div>
    </div>
  );
}

/* ===== ADMIN PANEL VIEW ===== */
function AdminPanelView({ onLogout, onViewCard, onDownloadCard }: {
  onLogout: () => void;
  onViewCard: (nid: string) => void;
  onDownloadCard: (nid: string) => void;
}) {
  const [allData, setAllData] = useState<NidCardData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [totalNid, setTotalNid] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [selectedNids, setSelectedNids] = useState<Set<string>>(new Set());
  const [showTimer, setShowTimer] = useState(false);
  const [previewData, setPreviewData] = useState<NidCardData | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ title: string; msg: string; onConfirm: () => void } | null>(null);
  const [toasts, setToasts] = useState<{ id: number; message: string; type: string }[]>([]);
  const perPage = 12;
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addToast = (message: string, type: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const loadData = useCallback(async (query?: string) => {
    try {
      const q = query ?? searchInput;
      const url = q ? `/api/nid?q=${encodeURIComponent(q)}` : '/api/nid?all=true';
      const res = await fetch(url);
      const result = await res.json();
      const cards = result.data || [];
      // Convert from DB format to original format
      const converted: NidCardData[] = cards.map((d: Record<string, unknown>) => ({
        name_bn: (d.nameBn as string) || (d.name_bn as string) || '',
        name_en: (d.nameEn as string) || (d.name_en as string) || '',
        nid: (d.nid as string) || '',
        pin: (d.pin as string) || '',
        father: (d.father as string) || '',
        mother: (d.mother as string) || '',
        birth: (d.birthPlace as string) || (d.birth as string) || '',
        dob: (d.dob as string) || '',
        blood: (d.blood as string) || '',
        address: (d.address as string) || '',
        gender: (d.gender as string) || 'male',
        issue_date: (d.issueDate as string) || (d.issue_date as string) || '',
        created_at: String(d.createdAt || d.created_at || ''),
        photo_base64: (d.photoBase64 as string) || (d.photo_base64 as string) || '',
        photo_type: (d.photoType as string) || (d.photo_type as string) || '',
        sign_base64: (d.signBase64 as string) || (d.sign_base64 as string) || '',
        sign_type: (d.signType as string) || (d.sign_type as string) || '',
      }));
      setAllData(converted);
      setTotalNid(result.total || converted.length);

      const today = new Date().toISOString().split('T')[0];
      const todayC = converted.filter((d: NidCardData) => String(d.created_at).startsWith(today)).length;
      setTodayCount(todayC);
    } catch {
      addToast('ডাটা লোড ত্রুটি', 'error');
    }
  }, [searchInput]);

  // Initial load
  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    setInitialized(true);
    loadData();
  }

  const debounceSearch = () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      loadData(searchInput);
    }, 300);
  };

  const deleteNid = (nid: string) => {
    setConfirmAction({
      title: 'NID ডিলিট করুন?',
      msg: `NID ${nid} এর সকল ডাটা মুছে যাবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।`,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/nid?nid=${encodeURIComponent(nid)}`, { method: 'DELETE' });
          const data = await res.json();
          addToast(data.message, data.success ? 'success' : 'error');
          loadData();
        } catch { addToast('ডিলিট ত্রুটি', 'error'); }
        setConfirmAction(null);
      }
    });
  };

  const deleteAll = () => {
    setConfirmAction({
      title: 'সব ডাটা ডিলিট করুন?',
      msg: 'সকল NID ডাটা চিরতরে মুছে যাবে! এটি পূর্বাবস্থায় ফেরানো যাবে না।',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/nid?all=true', { method: 'DELETE' });
          const data = await res.json();
          addToast(data.message, data.success ? 'success' : 'error');
          loadData();
        } catch { addToast('ডিলিট ত্রুটি', 'error'); }
        setConfirmAction(null);
      }
    });
  };

  const deleteSelected = () => {
    if (selectedNids.size === 0) { addToast('কোনো NID সিলেক্ট করা হয়নি', 'warning'); return; }
    setConfirmAction({
      title: `${selectedNids.size}টি NID ডিলিট করুন?`,
      msg: 'সিলেক্টেড সকল NID ডাটা চিরতরে মুছে যাবে।',
      onConfirm: async () => {
        try {
          const nidsStr = Array.from(selectedNids).join(',');
          const res = await fetch(`/api/nid?nids=${encodeURIComponent(nidsStr)}`, { method: 'DELETE' });
          const data = await res.json();
          addToast(data.message, data.success ? 'success' : 'error');
          setSelectedNids(new Set());
          loadData();
        } catch { addToast('ডিলিট ত্রুটি', 'error'); }
        setConfirmAction(null);
      }
    });
  };

  const showPreview = async (nid: string) => {
    setShowPreviewModal(true);
    setPreviewData(null);
    try {
      const res = await fetch('/api/nid?nid=' + encodeURIComponent(nid));
      const result = await res.json();
      if (result.found || result.success) {
        const d = result.data || result;
        setPreviewData({
          name_bn: d.name_bn || d.nameBn || '',
          name_en: d.name_en || d.nameEn || '',
          nid: d.nid || '',
          pin: d.pin || '',
          father: d.father || '',
          mother: d.mother || '',
          birth: d.birth || d.birthPlace || '',
          dob: d.dob || '',
          blood: d.blood || '',
          address: d.address || '',
          gender: d.gender || 'male',
          issue_date: d.issue_date || d.issueDate || '',
          created_at: String(d.created_at || d.createdAt || ''),
          photo_base64: d.photo_base64 || d.photoBase64 || '',
          photo_type: d.photo_type || d.photoType || '',
          sign_base64: d.sign_base64 || d.signBase64 || '',
          sign_type: d.sign_type || d.signType || '',
        });
      }
    } catch { /* ignore */ }
  };

  // Render cards
  const totalPages = Math.ceil(allData.length / perPage);
  const startIdx = (currentPage - 1) * perPage;
  const pageData = allData.slice(startIdx, startIdx + perPage);

  return (
    <div className="admin-panel-body">
      {/* Top Banner */}
      <div className="gov-banner">
        <div className="gov-banner-inner">
          <div className="gov-banner-left">
            <div className="gov-flag"></div>
            <div className="gov-banner-title">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার<small>People&apos;s Republic of Bangladesh</small></div>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="gov-header">
        <div className="gov-header-inner">
          <div className="gov-logo-area">
            <div className="gov-logo-icon"><img src="/assets/Images/bangladeshicon.png" alt="BD" /></div>
            <div className="gov-logo-text"><h1>Admin Panel</h1><p>জাতীয় পরিচয় পত্র ডাটা ম্যানেজমেন্ট</p></div>
          </div>
          <button onClick={onLogout} className="logout-btn"><i className="bi bi-box-arrow-right"></i> লগআউট</button>
        </div>
      </div>
      {/* Nav */}
      <div className="gov-nav">
        <div className="gov-nav-inner">
          <a onClick={onLogout} style={{ cursor: 'pointer' }}><i className="bi bi-house-door"></i> হোম</a>
          <a className="active"><i className="bi bi-shield-lock"></i> Admin</a>
        </div>
      </div>
      {/* Content */}
      <div className="content-container">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card"><div className="stat-icon green"><i className="bi bi-people"></i></div><div className="stat-info"><h3>{totalNid}</h3><p>মোট NID কার্ড</p></div></div>
          <div className="stat-card"><div className="stat-icon blue"><i className="bi bi-calendar-check"></i></div><div className="stat-info"><h3>{todayCount}</h3><p>আজকের তৈরি</p></div></div>
          <div className="stat-card"><div className="stat-icon gold"><i className="bi bi-clock-history"></i></div><div className="stat-info"><h3>নেই</h3><p>অটো ডিলিট টাইমার</p></div></div>
          <div className="stat-card"><div className="stat-icon red"><i className="bi bi-check2-square"></i></div><div className="stat-info"><h3>{selectedNids.size}</h3><p>সিলেক্টেড</p></div></div>
        </div>
        {/* Action Bar */}
        <div className="action-bar">
          <div className="action-bar-top">
            <div className="search-box">
              <i className="bi bi-search search-icon"></i>
              <input type="text" placeholder="নাম, NID, PIN দিয়ে খুঁজুন..." value={searchInput} onChange={e => { setSearchInput(e.target.value); debounceSearch(); }} />
            </div>
            <div className="action-btns">
              <button className="btn-action btn-info" onClick={() => setShowTimer(!showTimer)}><i className="bi bi-clock"></i> টাইমার</button>
              <button className="btn-action btn-success" onClick={() => loadData()}><i className="bi bi-arrow-clockwise"></i> রিফ্রেশ</button>
              <button className="btn-action btn-warning" onClick={deleteSelected}><i className="bi bi-trash2"></i> সিলেক্টেড ডিলিট</button>
              <button className="btn-action btn-danger" onClick={deleteAll}><i className="bi bi-trash"></i> সব ডিলিট</button>
            </div>
          </div>
          {showTimer && (
            <div className="timer-section">
              <h4><i className="bi bi-clock-fill"></i> অটো ডিলিট টাইমার (ডেমো)</h4>
              <p style={{ fontSize: 13, color: '#92400e' }}>টাইমার ফিচার ডাটাবেস সংস্করণে সরলীকৃত</p>
            </div>
          )}
        </div>
        {/* Data */}
        <div id="dataContainer">
          {pageData.length === 0 ? (
            <div className="no-data"><i className="bi bi-inbox"></i><h3>কোনো NID ডাটা পাওয়া যায়নি</h3><p style={{ color: '#adb5bd', fontSize: 13 }}>নতুন কার্ড তৈরি করুন অথবা অনুসন্দান করুন</p></div>
          ) : (
            <div className="cards-grid">
              {pageData.map(d => {
                const photoSrc = d.photo_base64 ? `data:${d.photo_type || 'image/png'};base64,${d.photo_base64}` : '';
                return (
                  <div className="nid-card" key={d.nid}>
                    <input type="checkbox" checked={selectedNids.has(d.nid)} onChange={e => {
                      const next = new Set(selectedNids);
                      e.target.checked ? next.add(d.nid) : next.delete(d.nid);
                      setSelectedNids(next);
                    }} style={{ position: 'absolute', top: 12, right: 12, width: 18, height: 18, cursor: 'pointer', accentColor: '#006a4e' }} />
                    <div className="nid-card-top">
                      <div className="nid-card-avatar">
                        {photoSrc ? <img src={photoSrc} alt="photo" /> : <span className="placeholder"><i className="bi bi-person"></i></span>}
                      </div>
                      <div className="nid-card-info">
                        <div className="nid-card-name">{d.name_bn}</div>
                        <div className="nid-card-sub">{d.name_en}</div>
                      </div>
                      <span className="nid-card-badge badge-blood">{d.blood || 'N/A'}</span>
                    </div>
                    <div className="nid-card-details">
                      <div className="nid-card-detail"><span className="label">NID: </span><span className="value" style={{ color: '#dc3545', fontFamily: 'monospace', fontSize: 11 }}>{d.nid}</span></div>
                      <div className="nid-card-detail"><span className="label">PIN: </span><span className="value">{d.pin}</span></div>
                      <div className="nid-card-detail"><span className="label">জন্ম: </span><span className="value">{d.dob}</span></div>
                      <div className="nid-card-detail"><span className="label">ঠিকানা: </span><span className="value" style={{ fontSize: 10, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.address}</span></div>
                    </div>
                    <div className="nid-card-actions">
                      <a className="action-view" onClick={() => showPreview(d.nid)} style={{ cursor: 'pointer' }}><i className="bi bi-eye"></i> দেখুন</a>
                      <a className="action-download" onClick={() => onDownloadCard(d.nid)} style={{ cursor: 'pointer' }}><i className="bi bi-download"></i> ডাউনলোড</a>
                      <button className="action-delete" onClick={() => deleteNid(d.nid)}><i className="bi bi-trash"></i> ডিলিট</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            {currentPage > 1 && <button className="page-btn" onClick={() => setCurrentPage(currentPage - 1)}><i className="bi bi-chevron-left"></i></button>}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              (p === currentPage || (p >= currentPage - 2 && p <= currentPage + 2) || p === 1 || p === totalPages) ? (
                <button key={p} className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
              ) : (p === currentPage - 3 || p === currentPage + 3) ? <span key={p} style={{ padding: '8px 4px', color: '#adb5bd' }}>...</span> : null
            ))}
            {currentPage < totalPages && <button className="page-btn" onClick={() => setCurrentPage(currentPage + 1)}><i className="bi bi-chevron-right"></i></button>}
          </div>
        )}
      </div>
      {/* Selected Bar */}
      <div className={`selected-bar ${selectedNids.size > 0 ? 'show' : ''}`}>
        <span><span className="count">{selectedNids.size}</span>টি সিলেক্টেড</span>
        <button className="btn-del" onClick={deleteSelected}><i className="bi bi-trash2"></i> ডিলিট</button>
        <button className="btn-cancel" onClick={() => setSelectedNids(new Set())}><i className="bi bi-x-lg"></i> বাতিল</button>
      </div>
      {/* Preview Modal */}
      <div className={`modal-overlay ${showPreviewModal ? 'show' : ''}`} onClick={e => { if (e.target === e.currentTarget) setShowPreviewModal(false); }}>
        <div className="modal-card">
          <div className="modal-header">
            <h3><i className="bi bi-person-badge"></i> NID কার্ড বিস্তারিত</h3>
            <button className="modal-close" onClick={() => setShowPreviewModal(false)}><i className="bi bi-x-lg"></i></button>
          </div>
          <div className="modal-body">
            {previewData ? (
              <>
                {previewData.photo_base64 && <div style={{ textAlign: 'center', marginBottom: 16 }}><img src={`data:${previewData.photo_type || 'image/png'};base64,${previewData.photo_base64}`} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '3px solid #e9ecef' }} alt="photo" /></div>}
                {[
                  ['নাম (বাংলা)', previewData.name_bn],
                  ['Name', previewData.name_en],
                  ['NID নম্বর', previewData.nid],
                  ['PIN', previewData.pin],
                  ['পিতা', previewData.father],
                  ['মাতা', previewData.mother],
                  ['জন্ম তারিখ', previewData.dob],
                  ['রক্তের গ্রুপ', previewData.blood],
                  ['ঠিকানা', previewData.address],
                  ['জন্মস্থান', previewData.birth],
                ].map(([label, value]) => (
                  <div className="modal-info-row" key={label}><span className="modal-info-label">{label}</span><span className="modal-info-value">{value}</span></div>
                ))}
              </>
            ) : <div style={{ textAlign: 'center', padding: 20, color: '#adb5bd' }}><i className="bi bi-arrow-repeat" style={{ fontSize: 24 }}></i><p>লোড হচ্ছে...</p></div>}
          </div>
          {previewData && (
            <div className="modal-footer">
              <button className="modal-btn modal-btn-primary" onClick={() => { setShowPreviewModal(false); onViewCard(previewData.nid); }}><i className="bi bi-eye"></i> পূর্ণ দেখুন</button>
              <button className="modal-btn" style={{ background: '#2563eb', color: '#fff' }} onClick={() => { setShowPreviewModal(false); onDownloadCard(previewData.nid); }}><i className="bi bi-download"></i> ডাউনলোড</button>
              <button className="modal-btn modal-btn-danger" onClick={() => { setShowPreviewModal(false); deleteNid(previewData.nid); }}><i className="bi bi-trash"></i> ডিলিট</button>
            </div>
          )}
        </div>
      </div>
      {/* Confirm Dialog */}
      <div className={`confirm-overlay ${confirmAction ? 'show' : ''}`} onClick={e => { if (e.target === e.currentTarget) setConfirmAction(null); }}>
        <div className="confirm-card">
          <div className="confirm-icon"><i className="bi bi-exclamation-triangle"></i></div>
          <h3>{confirmAction?.title}</h3>
          <p>{confirmAction?.msg}</p>
          <div className="confirm-btns">
            <button className="confirm-cancel" onClick={() => setConfirmAction(null)}>বাতিল</button>
            <button className="confirm-yes" onClick={confirmAction?.onConfirm}>হ্যাঁ, ডিলিট করুন</button>
          </div>
        </div>
      </div>
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <i className={`bi bi-${t.type === 'success' ? 'check-circle-fill' : t.type === 'error' ? 'x-circle-fill' : 'exclamation-triangle-fill'}`}></i> {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== DOWNLOADER VIEW ===== */
function DownloaderView({ nid, cardData, onBackToView }: {
  nid: string;
  cardData: NidCardData | null;
  onBackToView: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Generate barcode for downloader view
  useEffect(() => {
    if (!cardData) return;
    const timer = setTimeout(() => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const PDF417Lib = (window as any).PDF417;
        if (!PDF417Lib) return;

        const barcodeEl = document.getElementById('dl_barcode');
        if (!barcodeEl) return;

        const hub3_code = `<pin>${cardData.pin}</pin><name>${cardData.name_en}</name><DOB>${cardData.dob}/DOB><FP></FP><F>Right Index</F><TYPE>A</TYPE><V>2.0</V><ds>302c0214103fc01240542ed736c0b48858c1c03d80006215021416e73728de9618fedcd368c88d8f3a2e72096d</ds>`;
        PDF417Lib.init(hub3_code);
        const barcode = PDF417Lib.getBarcodeArray();
        const bw = 2, bh = 2;
        const canvas = document.createElement('canvas');
        canvas.width = bw * barcode.num_cols;
        canvas.height = bh * barcode.num_rows;
        barcodeEl.innerHTML = '';
        barcodeEl.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          let y = 0;
          for (let r = 0; r < barcode.num_rows; ++r) {
            let x = 0;
            for (let c = 0; c < barcode.num_cols; ++c) {
              if (barcode.bcode[r][c] === 1) { ctx.fillRect(x, y, bw, bh); }
              x += bw;
            }
            y += bh;
          }
        }

        // Bengali digit conversion for issue date
        const finalEnlishToBanglaNumber: Record<string, string> = { '0': '\u09E6', '1': '\u09E7', '2': '\u09E8', '3': '\u09E9', '4': '\u09EA', '5': '\u09EB', '6': '\u09EC', '7': '\u09ED', '8': '\u09EE', '9': '\u09EF' };
        const cardDateEl = document.getElementById('dl_card_date');
        if (cardDateEl && cardData.issue_date) {
          const banglaDate = cardData.issue_date.replace(/[0-9]/g, (d: string) => finalEnlishToBanglaNumber[d] || d);
          cardDateEl.textContent = banglaDate;
        }
      } catch (e) {
        console.error('Downloader barcode error:', e);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [cardData]);

  const downloadPDF = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2canvasLib = (window as any).html2canvas;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsPDFLib = (window as any).jspdf?.jsPDF;
    if (!html2canvasLib || !jsPDFLib) { alert('PDF লাইব্রেরি লোড হয়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।'); return; }

    setLoading(true);
    setLoadingText('PDF তৈরি হচ্ছে...');
    try {
      const cardContainer = document.querySelector('.card-container') as HTMLElement;
      if (!cardContainer) { alert('কার্ড পাওয়া যায়নি'); return; }

      const origShadow = cardContainer.style.boxShadow;
      const origRadius = cardContainer.style.borderRadius;
      cardContainer.style.boxShadow = 'none';
      cardContainer.style.borderRadius = '0';

      const canvas = await html2canvasLib(cardContainer, { scale: 4, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
      cardContainer.style.boxShadow = origShadow;
      cardContainer.style.borderRadius = origRadius;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDFLib('p', 'mm', 'a4');
      const pageW = 210, pageH = 297;
      const ratio = canvas.width / canvas.height;
      const pdfRatio = pageW / pageH;
      let drawW: number, drawH: number, x: number, y: number;
      if (ratio > pdfRatio) { drawW = pageW; drawH = pageW / ratio; x = 0; y = (pageH - drawH) / 2; }
      else { drawH = pageH; drawW = pageH * ratio; x = (pageW - drawW) / 2; y = 0; }
      pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);
      pdf.save(`NID-${nid}.pdf`);
    } catch (e) { console.error('PDF error:', e); alert('PDF তৈরিতে সমস্যা'); }
    setLoading(false);
  };

  const downloadPNG = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2canvasLib = (window as any).html2canvas;
    if (!html2canvasLib) { alert('html2canvas লোড হয়নি।'); return; }

    setLoading(true);
    setLoadingText('PNG তৈরি হচ্ছে...');
    try {
      const cardContainer = document.querySelector('.card-container') as HTMLElement;
      if (!cardContainer) { alert('কার্ড পাওয়া যায়নি'); return; }
      const origShadow = cardContainer.style.boxShadow;
      const origRadius = cardContainer.style.borderRadius;
      cardContainer.style.boxShadow = 'none';
      cardContainer.style.borderRadius = '0';
      const canvas = await html2canvasLib(cardContainer, { scale: 4, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false });
      cardContainer.style.boxShadow = origShadow;
      cardContainer.style.borderRadius = origRadius;
      const link = document.createElement('a');
      link.download = `NID-${nid}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { console.error('PNG error:', e); alert('PNG তৈরিতে সমস্যা'); }
    setLoading(false);
  };

  const printCard = () => { window.print(); };

  return (
    <div>
      {/* Download Bar */}
      <div className="download-bar no-print">
        <div className="bar-left">
          <div className="bar-icon"><i className="bi bi-download"></i></div>
          <div>
            <h2><span className="status-dot ready"></span>NID কার্ড ডাউনলোড</h2>
            <small>আপনার জাতীয় পরিচয় পত্র ডাউনলোড করুন</small>
          </div>
          <span className="bar-nid-badge">NID: {nid}</span>
        </div>
        <div className="bar-btns">
          <button onClick={downloadPDF} className="bar-btn btn-pdf"><i className="bi bi-file-earmark-pdf"></i> PDF</button>
          <button onClick={printCard} className="bar-btn btn-print"><i className="bi bi-printer"></i> প্রিন্ট</button>
          <button onClick={downloadPNG} className="bar-btn btn-png"><i className="bi bi-image"></i> PNG</button>
          <button onClick={onBackToView} className="bar-btn btn-back-bar"><i className="bi bi-eye"></i> ভিউ</button>
        </div>
      </div>

      {/* Card Container - reuse the same card structure */}
      <div style={{ marginTop: 60 }}>
        {cardData && (
          <div className="card-container">
            <main>
              <div>
                <main className="w-full overflow-hidden">
                  <div>
                    <div className="container w-full py-12 lg:flex lg:items-start" style={{ paddingTop: 0 }}>
                      <div className="w-full lg:pl-6">
                        <div className="flex items-center justify-center">
                          <div className="w-full">
                            <div className="flex items-start gap-x-2 bg-transparent mx-auto w-fit" style={{ marginTop: 120, gap: 8 }}>
                              {/* FRONT SIDE */}
                              <div id="nid_front" className="border-[1.999px] border-black" style={{ width: '85.6mm', minWidth: '85.6mm' }}>
                                <header className="px-1.5 flex items-start gap-x-2 justify-between relative">
                                  <img className="w-[38px] absolute top-1.5 left-[4.5px]" src="/assets/Images/bangladeshicon.png" alt="bangladeshicon" />
                                  <div className="w-full h-[60px] flex flex-col justify-center">
                                    <h3 style={{ fontSize: 20 }} className="text-center font-medium tracking-normal pl-11 bn leading-5"><span style={{ marginTop: 1, display: 'inline-block' }}>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span></h3>
                                    <p className="text-[#007700] text-right tracking-[-0rem] leading-3" style={{ fontSize: '11.46px', fontFamily: 'arial', marginBottom: '-0.02px' }}>Government of the People&apos;s Republic of Bangladesh</p>
                                    <p className="text-center font-medium pl-10 leading-4" style={{ paddingTop: 0 }}><span className="text-[#ff0002]" style={{ fontSize: 10, fontFamily: 'arial' }}>National ID Card</span><span className="ml-1" style={{ display: 'inline-block' }}><span style={{ fontSize: 13, fontFamily: 'arial' }}>/</span></span><span className="bn ml-1" style={{ fontSize: '13.33px' }}>জাতীয় পরিচয় পত্র</span></p>
                                  </div>
                                </header>
                                <div className="w-[101%] -ml-[0.5%] border-b-[1.9999px] border-black" style={{ width: '100%', marginLeft: 0 }}></div>
                                <div className="pt-[3.8px] pr-1 pl-[2px] bg-center w-full flex justify-between gap-x-2 pb-5 relative">
                                  <div className="absolute inset-x-0 top-[2px] mx-auto z-10 flex items-start justify-center"><img style={{ background: 'transparent', width: 114, height: 114 }} className="ml-[20px] w-[125px] h-[116px" src="/assets/Images/flower-logo.png" alt="" /></div>
                                  <div className="relative z-50">
                                    <img style={{ marginTop: -2 }} className="w-[68.2px] h-[78px]" alt="photo" src={cardData.photo_base64 ? `data:${cardData.photo_type || 'image/png'};base64,${cardData.photo_base64}` : '/assets/Images/notfound.png'} />
                                    <div className="text-center text-xs flex items-start justify-center pt-[5px] w-[68.2px] mx-auto h-[38.5px] overflow-hidden" id="dl_card_signature">
                                      <img id="dl_sign" src={cardData.sign_base64 ? `data:${cardData.sign_type || 'image/png'};base64,${cardData.sign_base64}` : '/assets/Images/notfound.png'} alt="sign" />
                                    </div>
                                  </div>
                                  <div className="w-full relative z-50">
                                    <div style={{ height: 5 }}></div>
                                    <div className="flex flex-col gap-y-[10px]" style={{ marginTop: 1 }}>
                                      <div><p className="space-x-4 leading-3" style={{ paddingLeft: 1 }}><span className="bn" style={{ fontSize: '16.53px' }}>নাম:</span><span style={{ fontSize: '16.53px', paddingLeft: 3, WebkitTextStroke: '0.4px black' }}>{cardData.name_bn}</span></p></div>
                                      <div style={{ marginTop: 1 }}><p className="space-x-2 leading-3" style={{ marginBottom: '-1.4px', marginTop: '1.4px', paddingLeft: 1 }}><span style={{ fontSize: 11 }}>Name:</span><span style={{ fontSize: '12.73px', paddingLeft: 1 }}>{cardData.name_en}</span></p></div>
                                      <div style={{ marginTop: 1 }}><p className="bn space-x-3 leading-3" style={{ paddingLeft: 1 }}><span style={{ fontSize: 14 }}>পিতা: </span><span style={{ fontSize: 14, transform: 'scaleX(0.724)' }}>{cardData.father}</span></p></div>
                                      <div style={{ marginTop: 1 }}><p className="bn space-x-3 leading-3" style={{ marginTop: '-2.5px', paddingLeft: 1 }}><span style={{ fontSize: 14 }}>মাতা: </span><span style={{ fontSize: 14, transform: 'scaleX(0.724)' }}>{cardData.mother}</span></p></div>
                                      <div className="leading-4" style={{ fontSize: 12, marginTop: '-1.2px' }}><p style={{ marginTop: -2 }}><span>Date of Birth: </span><span className="text-[#ff0000]" style={{ marginLeft: -1 }}>{cardData.dob}</span></p></div>
                                      <div className="-mt-0.5 leading-4" style={{ fontSize: 12, marginTop: -5 }}><p style={{ marginTop: -3 }}><span>ID NO: </span><span className="text-[#ff0000] font-bold">{cardData.nid}</span></p></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* BACK SIDE */}
                              <div id="nid_back" className="border-[1.999px] border-[#000]" style={{ width: '85.6mm', minWidth: '85.6mm' }}>
                                <header style={{ height: 32, display: 'flex', alignItems: 'center', padding: '0 8px', letterSpacing: '0.05px', textAlign: 'left' }}>
                                  <p className="bn" style={{ lineHeight: '13px', fontSize: '11.33px', letterSpacing: '0.05px', margin: 0 }}>এই কার্ডটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সম্পত্তি। কার্ডটি ব্যবহারকারী ব্যতীত অন্য কোথাও পাওয়া গেলে নিকটস্থ পোস্ট অফিসে জমা দেবার জন্য অনুরোধ করা হলো।</p>
                                </header>
                                <div style={{ width: '100%', marginLeft: 0, borderBottom: '1.999px solid black' }}></div>
                                <div style={{ padding: '3px 4px', height: 66, position: 'relative', fontSize: 12 }}>
                                  <div className="back-address-row">
                                    <span className="back-address-label bn">ঠিকানা:</span>
                                    <span className="back-address-value bn" id="dl_card_address">{cardData.address}</span>
                                  </div>
                                  <div className="back-bottom-row" style={{ marginTop: 'auto', position: 'absolute', bottom: '1.08px', left: 0, right: 0 }}>
                                    <p className="bn back-info-line" style={{ marginBottom: 0, paddingLeft: 6, fontWeight: 500 }}>
                                      <span style={{ fontSize: '11.6px' }}>রক্তের গ্রুপ</span><span style={{ display: 'inline-block', width: 3 }}></span><span style={{ fontSize: 11, fontFamily: 'arial' }}>/</span><span style={{ display: 'inline-block', width: 3 }}></span><span style={{ fontSize: 9 }}>Blood Group:</span><b style={{ fontSize: '9.33px', marginBottom: -3, display: 'inline-block', color: '#ff0000', marginLeft: 4, marginRight: 10, fontWeight: 'bold' }}>{cardData.blood}</b><span style={{ fontSize: '10.66px' }}>জন্মস্থান:</span><span style={{ display: 'inline-block', width: 3 }}></span><span style={{ fontSize: '10.66px' }}>{cardData.birth}</span>
                                    </p>
                                    <div className="back-mududdron">
                                      <img src="/assets/Images/mududdron.png" alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
                                    </div>
                                  </div>
                                </div>
                                <div style={{ width: '100%', marginLeft: 0, borderBottom: '1.999px solid black' }}></div>
                                <div style={{ padding: '4px 8px 4px 4px' }}>
                                  <img style={{ width: 78, marginLeft: 18, marginBottom: 3, height: '27.3px', display: 'block' }} src="/assets/Images/adminsign.jpg" alt="admin signature" />
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -5 }}>
                                    <p className="bn" style={{ fontSize: 14, margin: 0 }}>প্রদানকারী কর্তৃপক্তের স্বাক্ষর</p>
                                    <span className="bn" style={{ fontSize: 12, paddingRight: 16, paddingTop: 1 }}>প্রদানের তারিখ:<span style={{ marginLeft: 10 }} id="dl_card_date">{cardData.issue_date}</span></span>
                                  </div>
                                  <div id="dl_barcode" style={{ width: '100%', height: 39, marginTop: '1.5px', marginLeft: -3 }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </main>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      <div className={`loading-overlay ${loading ? 'show' : ''}`}>
        <div className="loading-card">
          <div className="spinner"></div>
          <p>{loadingText}</p>
        </div>
      </div>
    </div>
  );
}
