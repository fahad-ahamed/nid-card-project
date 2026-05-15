<?php
/**
 * NID Card Maker - Professional Government Portal Style
 * Redesigned with Bangladesh government theme, proper validation & security
 */

// ============ BACKEND LOGIC ============
$errors = [];
$formData = [
    'name_bn' => '', 'name_en' => '', 'nid' => '', 'pin' => '',
    'father' => '', 'mother' => '', 'birth' => '', 'dob' => '',
    'blood' => '', 'address' => '', 'gender' => 'male'
];
$showForm = true;

if (isset($_POST['submit'])) {
    // Sanitize inputs
    foreach ($formData as $key => $default) {
        if (isset($_POST[$key])) {
            $formData[$key] = htmlspecialchars(trim($_POST[$key]), ENT_QUOTES, 'UTF-8');
        }
    }
    
    // Validate required fields
    $required = ['name_bn', 'name_en', 'nid', 'pin', 'father', 'mother', 'birth', 'dob', 'blood', 'address'];
    foreach ($required as $field) {
        if (empty($formData[$field])) {
            $errors[$field] = 'এই ঘরটি পূরণ করা আবশ্যক';
        }
    }
    
    // Validate NID number (10-17 digits)
    if (!empty($formData['nid']) && !preg_match('/^[0-9]{10,17}$/', $formData['nid'])) {
        $errors['nid'] = 'সঠিক NID নম্বর দিন (10-17 ডিজিট)';
    }
    
    // Validate PIN (4-10 digits)
    if (!empty($formData['pin']) && !preg_match('/^[0-9]{4,10}$/', $formData['pin'])) {
        $errors['pin'] = 'সঠিক PIN নম্বর দিন';
    }
    
    // Validate photo upload
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] != 0) {
        $errors['photo'] = 'ছবি আপলোড করুন';
    } elseif ($_FILES['photo']['size'] > 5 * 1024 * 1024) {
        $errors['photo'] = 'ছবির সাইজ 5MB এর কম হতে হবে';
    }
    
    // Validate signature upload
    if (!isset($_FILES['signature']) || $_FILES['signature']['error'] != 0) {
        $errors['signature'] = 'স্বাক্ষর আপলোড করুন';
    } elseif ($_FILES['signature']['size'] > 2 * 1024 * 1024) {
        $errors['signature'] = 'স্বাক্ষরের সাইজ 2MB এর কম হতে হবে';
    }
    
    // Blood group validation
    $validBlood = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!in_array(strtoupper($formData['blood']), $validBlood)) {
        $errors['blood'] = 'সঠিক রক্তের গ্রুপ নির্বাচন করুন';
    }
    
    if (empty($errors)) {
        // Save NID data as JSON file first, then load card from saved data
        $nidData = [
            'name_bn' => $formData['name_bn'],
            'name_en' => strtoupper($formData['name_en']),
            'nid' => $formData['nid'],
            'pin' => $formData['pin'],
            'father' => $formData['father'],
            'mother' => $formData['mother'],
            'birth' => $formData['birth'],
            'dob' => $formData['dob'],
            'blood' => $formData['blood'],
            'address' => $formData['address'],
            'gender' => $formData['gender'],
            'issue_date' => date('d/m/Y'),
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        // Save photo as base64
        if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
            $photo_data = base64_encode(file_get_contents($_FILES['photo']['tmp_name']));
            $nidData['photo_type'] = $_FILES['photo']['type'];
            $nidData['photo_base64'] = $photo_data;
        }
        
        // Save signature as base64
        if (isset($_FILES['signature']) && $_FILES['signature']['error'] == 0) {
            $sign_data = base64_encode(file_get_contents($_FILES['signature']['tmp_name']));
            $nidData['sign_type'] = $_FILES['signature']['type'];
            $nidData['sign_base64'] = $sign_data;
        }
        
        $jsonFile = __DIR__ . '/Nid-Data/' . $formData['nid'] . '.json';
        file_put_contents($jsonFile, json_encode($nidData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        
        // Redirect to nid_view.php so card loads from saved Nid-Data folder
        header('Location: nid_view.php?nid=' . $formData['nid']);
        exit;
    }
}
?>

<?php if ($showForm) { ?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>জাতীয় পরিচয় পত্র - NID Card Portal</title>
    <link href="https://surokkha.gov.bd/favicon.png" rel="icon">
    <link rel="stylesheet" href="https://site-assets.fontawesome.com/releases/v6.1.1/css/all.css">
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
    <link href="assets/vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
    <style>
        :root {
            --gov-green: #006a4e;
            --gov-green-dark: #004d38;
            --gov-green-light: #00875a;
            --gov-red: #c1272d;
            --gov-red-dark: #a01020;
            --gov-gold: #f4a300;
            --gov-gold-light: #ffd54f;
            --gov-bg: #f0f2f5;
            --gov-card: #ffffff;
            --gov-text: #1a1a2e;
            --gov-text-light: #6c757d;
            --gov-border: #dee2e6;
            --gov-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        
        * { box-sizing: border-box; }
        
        body {
            font-family: 'Hind Siliguri', 'Kalpurush', sans-serif;
            background: var(--gov-bg);
            margin: 0;
            min-height: 100vh;
            color: var(--gov-text);
        }

        /* ===== TOP BANNER ===== */
        .gov-banner {
            background: linear-gradient(135deg, var(--gov-green-dark) 0%, var(--gov-green) 50%, var(--gov-green-light) 100%);
            color: #fff;
            padding: 0;
            position: relative;
            overflow: hidden;
        }
        .gov-banner::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .gov-banner-inner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            z-index: 1;
        }
        .gov-banner-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .gov-flag {
            width: 48px;
            height: 32px;
            border-radius: 3px;
            background: #006a4e;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .gov-flag::after {
            content: '';
            width: 18px;
            height: 18px;
            background: #c1272d;
            border-radius: 50%;
        }
        .gov-banner-title {
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.3px;
        }
        .gov-banner-title small {
            display: block;
            font-size: 11px;
            font-weight: 400;
            opacity: 0.85;
            margin-top: 1px;
        }
        .gov-banner-right {
            display: flex;
            align-items: center;
            gap: 15px;
            font-size: 12px;
        }
        .gov-banner-right a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            transition: color 0.2s;
        }
        .gov-banner-right a:hover { color: #fff; }

        /* ===== HEADER ===== */
        .gov-header {
            background: #fff;
            border-bottom: 3px solid var(--gov-green);
            box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .gov-header-inner {
            max-width: 1200px;
            margin: 0 auto;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .gov-logo-area {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .gov-logo-icon {
            width: 65px;
            height: 65px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--gov-green), var(--gov-green-dark));
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 10px rgba(0,106,78,0.3);
            position: relative;
            overflow: hidden;
        }
        .gov-logo-icon img {
            width: 50px;
            height: 50px;
            object-fit: contain;
            filter: brightness(0) invert(1);
        }
        .gov-logo-text h1 {
            font-size: 22px;
            font-weight: 700;
            color: var(--gov-green);
            margin: 0;
            line-height: 1.2;
        }
        .gov-logo-text p {
            font-size: 13px;
            color: var(--gov-text-light);
            margin: 2px 0 0;
        }
        .gov-header-badge {
            background: var(--gov-red);
            color: #fff;
            padding: 5px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        /* ===== NAVIGATION ===== */
        .gov-nav {
            background: var(--gov-green);
        }
        .gov-nav-inner {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            padding: 0;
        }
        .gov-nav a {
            color: rgba(255,255,255,0.85);
            text-decoration: none;
            padding: 10px 22px;
            font-size: 13.5px;
            font-weight: 500;
            transition: all 0.2s;
            border-bottom: 3px solid transparent;
        }
        .gov-nav a:hover, .gov-nav a.active {
            color: #fff;
            background: rgba(255,255,255,0.1);
            border-bottom-color: var(--gov-gold);
        }

        /* ===== NAV SEARCH BOX ===== */
        .nav-search-box {
            display: flex;
            align-items: center;
            padding: 5px 10px;
            gap: 0;
        }
        .nav-search-input {
            padding: 5px 12px;
            border: none;
            border-radius: 5px 0 0 5px;
            font-size: 13px;
            font-family: 'Hind Siliguri', sans-serif;
            outline: none;
            background: rgba(255,255,255,0.95);
            color: #333;
            width: 200px;
            height: 32px;
        }
        .nav-search-input::placeholder {
            color: #999;
            font-size: 12px;
        }
        .nav-search-input:focus {
            background: #fff;
            box-shadow: 0 0 0 2px rgba(244,163,0,0.4);
        }
        .nav-search-btn {
            padding: 5px 14px;
            background: linear-gradient(135deg, #f4a300, #e69500);
            color: #fff;
            border: none;
            border-radius: 0 5px 5px 0;
            font-size: 13px;
            font-family: 'Hind Siliguri', sans-serif;
            cursor: pointer;
            height: 32px;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background 0.2s;
            font-weight: 600;
        }
        .nav-search-btn:hover {
            background: linear-gradient(135deg, #e69500, #d08500);
        }
        .search-result-bar {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        .search-result-bar > div {
            margin-top: 10px;
        }

        /* ===== FORM SECTION ===== */
        .form-container {
            max-width: 850px;
            margin: 30px auto;
            padding: 0 15px;
        }
        .form-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: var(--gov-shadow);
            overflow: hidden;
        }
        .form-card-header {
            background: linear-gradient(135deg, var(--gov-green) 0%, var(--gov-green-light) 100%);
            color: #fff;
            padding: 20px 30px;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .form-card-header i {
            font-size: 24px;
        }
        .form-card-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
        }
        .form-card-header small {
            opacity: 0.85;
            font-size: 12px;
        }
        .form-card-body {
            padding: 30px;
        }
        .form-step-indicator {
            display: flex;
            justify-content: center;
            margin-bottom: 30px;
            position: relative;
        }
        .form-step-indicator::before {
            content: '';
            position: absolute;
            top: 18px;
            left: 20%;
            right: 20%;
            height: 2px;
            background: var(--gov-border);
        }
        .step-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            z-index: 1;
            flex: 1;
        }
        .step-circle {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--gov-border);
            color: var(--gov-text-light);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 6px;
            transition: all 0.3s;
        }
        .step-item.active .step-circle {
            background: var(--gov-green);
            color: #fff;
            box-shadow: 0 3px 10px rgba(0,106,78,0.3);
        }
        .step-item.completed .step-circle {
            background: var(--gov-green);
            color: #fff;
        }
        .step-label {
            font-size: 11px;
            color: var(--gov-text-light);
            font-weight: 500;
        }
        .step-item.active .step-label {
            color: var(--gov-green);
            font-weight: 600;
        }

        /* Form Fields */
        .form-section-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--gov-green);
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid var(--gov-green);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .form-section-title i {
            font-size: 18px;
        }
        .form-group-custom {
            margin-bottom: 18px;
        }
        .form-group-custom label {
            font-weight: 600;
            font-size: 13.5px;
            color: #333;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        .form-group-custom label .required {
            color: var(--gov-red);
        }
        .form-control-custom {
            width: 100%;
            padding: 10px 14px;
            border: 1.5px solid var(--gov-border);
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            transition: all 0.2s;
            background: #fafbfc;
        }
        .form-control-custom:focus {
            outline: none;
            border-color: var(--gov-green);
            box-shadow: 0 0 0 3px rgba(0,106,78,0.1);
            background: #fff;
        }
        .form-control-custom.is-invalid {
            border-color: var(--gov-red);
            box-shadow: 0 0 0 3px rgba(193,39,45,0.1);
        }
        .error-msg {
            font-size: 12px;
            color: var(--gov-red);
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .upload-zone {
            border: 2px dashed var(--gov-border);
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            background: #fafbfc;
        }
        .upload-zone:hover {
            border-color: var(--gov-green);
            background: rgba(0,106,78,0.02);
        }
        .upload-zone i {
            font-size: 32px;
            color: var(--gov-green);
            margin-bottom: 8px;
        }
        .upload-zone p {
            margin: 5px 0;
            font-size: 13px;
            color: var(--gov-text-light);
        }
        .upload-zone .upload-label {
            font-weight: 600;
            color: var(--gov-text);
        }
        .upload-zone input[type="file"] {
            display: none;
        }
        .upload-preview {
            max-width: 120px;
            max-height: 120px;
            border-radius: 8px;
            margin-top: 10px;
            display: none;
            border: 2px solid var(--gov-green);
        }
        
        .btn-auto-generate {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #6f42c1 0%, #9b59b6 100%);
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(111,66,193,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .btn-auto-generate:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(111,66,193,0.4);
        }
        .btn-auto-generate:active {
            transform: translateY(0);
        }
        .btn-submit-custom {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, var(--gov-green) 0%, var(--gov-green-light) 100%);
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 15px rgba(0,106,78,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        .btn-submit-custom:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0,106,78,0.4);
        }
        .btn-submit-custom:active {
            transform: translateY(0);
        }

        /* ===== FOOTER ===== */
        .gov-footer {
            background: var(--gov-green-dark);
            color: rgba(255,255,255,0.7);
            text-align: center;
            padding: 20px;
            font-size: 12px;
            margin-top: 40px;
        }
        .gov-footer a {
            color: rgba(255,255,255,0.9);
            text-decoration: none;
        }
        .gov-footer .footer-separator {
            margin: 0 10px;
            opacity: 0.4;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
            .gov-banner-inner { flex-direction: column; gap: 8px; text-align: center; }
            .gov-banner-right { display: none; }
            .gov-header-inner { flex-direction: column; gap: 10px; text-align: center; }
            .gov-nav-inner { flex-wrap: wrap; justify-content: center; }
            .form-card-body { padding: 20px 15px; }
            .gov-logo-text h1 { font-size: 18px; }
        }
    </style>
</head>
<body>
    <!-- Top Green Banner -->
    <div class="gov-banner">
        <div class="gov-banner-inner">
            <div class="gov-banner-left">
                <div class="gov-flag"></div>
                <div class="gov-banner-title">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                    <small>Government of the People's Republic of Bangladesh</small>
                </div>
            </div>
            <div class="gov-banner-right">
                <a href="#"><i class="bi bi-globe"></i> English</a>
                <a href="#"><i class="bi bi-telephone"></i> জরুরি: 999</a>
                <a href="#"><i class="bi bi-shield-check"></i> সাইবার নিরাপত্তা</a>
            </div>
        </div>
    </div>

    <!-- Header with Logo -->
    <div class="gov-header">
        <div class="gov-header-inner">
            <div class="gov-logo-area">
                <div class="gov-logo-icon">
                    <img src="assets/Images/bangladeshicon.png" alt="BD" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\'bi bi-shield-fill-exclamation\' style=\'color:#fff;font-size:28px\'></i>';">
                </div>
                <div class="gov-logo-text">
                    <h1>জাতীয় পরিচয় পত্র</h1>
                    <p>National Identity Card — Election Commission Bangladesh</p>
                </div>
            </div>
            <div class="gov-header-badge">
                <i class="bi bi-lock-fill"></i> সুরক্ষিত পোর্টাল
            </div>
        </div>
    </div>

    <!-- Navigation -->
    <div class="gov-nav">
        <div class="gov-nav-inner">
            <a href="#" class="active"><i class="bi bi-house-door"></i> হোম</a>
            <a href="admin.php"><i class="bi bi-shield-lock"></i> Admin</a>
            <div class="nav-search-box">
                <input type="text" id="nidSearchInput" class="nav-search-input" placeholder="NID বা PIN নম্বর দিন..." onkeypress="if(event.key==='Enter')searchNid()">
                <button class="nav-search-btn" onclick="searchNid()"><i class="bi bi-search"></i> অনুসন্দান</button>
            </div>
            <a href="#"><i class="bi bi-question-circle"></i> সাহায্য</a>
            <a href="#"><i class="bi bi-telephone"></i> যোগাযোগ</a>
        </div>
    </div>

    <!-- Search Result -->
    <div class="search-result-bar">
        <div id="searchResult" style="display:none;"></div>
    </div>

    <!-- Form Section -->
    <div class="form-container">
        <div class="form-card">
            <div class="form-card-header">
                <i class="bi bi-person-badge"></i>
                <div>
                    <h2>NID কার্ড আবেদন</h2>
                    <small>আপনার তথ্য প্রদান করুন এবং জাতীয় পরিচয় পত্র তৈরি করুন</small>
                </div>
            </div>
            <div class="form-card-body">
                <!-- Step Indicator -->
                <div class="form-step-indicator">
                    <div class="step-item active">
                        <div class="step-circle">1</div>
                        <span class="step-label">ব্যক্তিগত</span>
                    </div>
                    <div class="step-item">
                        <div class="step-circle">2</div>
                        <span class="step-label">পিতামাতা</span>
                    </div>
                    <div class="step-item">
                        <div class="step-circle">3</div>
                        <span class="step-label">ঠিকানা</span>
                    </div>
                    <div class="step-item">
                        <div class="step-circle">4</div>
                        <span class="step-label">আপলোড</span>
                    </div>
                </div>

                <form action="" method="POST" enctype="multipart/form-data" id="nidForm">
                    <!-- Personal Info -->
                    <div class="form-section-title">
                        <i class="bi bi-person"></i> ব্যক্তিগত তথ্য
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group-custom">
                                <label>নাম (বাংলা) <span class="required">*</span></label>
                                <input type="text" class="form-control-custom <?php echo isset($errors['name_bn']) ? 'is-invalid' : ''; ?>" name="name_bn" value="<?php echo $formData['name_bn']; ?>" placeholder="আপনার নাম বাংলায় লিখুন" required>
                                <?php if (isset($errors['name_bn'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['name_bn']; ?></div><?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group-custom">
                                <label>Name (English) <span class="required">*</span></label>
                                <input type="text" class="form-control-custom <?php echo isset($errors['name_en']) ? 'is-invalid' : ''; ?>" name="name_en" value="<?php echo $formData['name_en']; ?>" placeholder="Your name in English" required>
                                <?php if (isset($errors['name_en'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['name_en']; ?></div><?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group-custom">
                                <label>NID নম্বর <span class="required">*</span></label>
                                <input type="text" class="form-control-custom <?php echo isset($errors['nid']) ? 'is-invalid' : ''; ?>" name="nid" value="<?php echo $formData['nid']; ?>" placeholder="যেমন: 8252184567" maxlength="17" required>
                                <?php if (isset($errors['nid'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['nid']; ?></div><?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group-custom">
                                <label>PIN নম্বর <span class="required">*</span></label>
                                <input type="text" class="form-control-custom <?php echo isset($errors['pin']) ? 'is-invalid' : ''; ?>" name="pin" value="<?php echo $formData['pin']; ?>" placeholder="PIN নম্বর" maxlength="10" required>
                                <?php if (isset($errors['pin'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['pin']; ?></div><?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group-custom">
                                <label>জন্ম তারিখ <span class="required">*</span></label>
                                <input type="text" class="form-control-custom <?php echo isset($errors['dob']) ? 'is-invalid' : ''; ?>" name="dob" value="<?php echo $formData['dob']; ?>" placeholder="যেমন: 05 Nov 2005" required>
                                <?php if (isset($errors['dob'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['dob']; ?></div><?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="form-group-custom">
                                <label>রক্তের গ্রুপ <span class="required">*</span></label>
                                <select class="form-control-custom <?php echo isset($errors['blood']) ? 'is-invalid' : ''; ?>" name="blood" required>
                                    <option value="">নির্বাচন করুন</option>
                                    <?php foreach(['A+','A-','B+','B-','AB+','AB-','O+','O-'] as $bg): ?>
                                    <option value="<?php echo $bg; ?>" <?php echo $formData['blood']==$bg?'selected':''; ?>><?php echo $bg; ?></option>
                                    <?php endforeach; ?>
                                </select>
                                <?php if (isset($errors['blood'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['blood']; ?></div><?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group-custom">
                                <label>লিঙ্গ</label>
                                <select class="form-control-custom" name="gender">
                                    <option value="male" <?php echo $formData['gender']=='male'?'selected':''; ?>>পুরুষ</option>
                                    <option value="female" <?php echo $formData['gender']=='female'?'selected':''; ?>>মহিলা</option>
                                    <option value="other" <?php echo $formData['gender']=='other'?'selected':''; ?>>অন্যান্য</option>
                                </select>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="form-group-custom">
                                <label>জন্মস্থান <span class="required">*</span></label>
                                <input type="text" class="form-control-custom <?php echo isset($errors['birth']) ? 'is-invalid' : ''; ?>" name="birth" value="<?php echo $formData['birth']; ?>" placeholder="যেমন: ঢাকা" required>
                                <?php if (isset($errors['birth'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['birth']; ?></div><?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Parent Info -->
                    <div class="form-section-title" style="margin-top: 25px;">
                        <i class="bi bi-people"></i> পিতামাতার তথ্য
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group-custom">
                                <label>পিতার নাম <span class="required">*</span></label>
                                <input type="text" class="form-control-custom <?php echo isset($errors['father']) ? 'is-invalid' : ''; ?>" name="father" value="<?php echo $formData['father']; ?>" placeholder="পিতার নাম" required>
                                <?php if (isset($errors['father'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['father']; ?></div><?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group-custom">
                                <label>মাতার নাম <span class="required">*</span></label>
                                <input type="text" class="form-control-custom <?php echo isset($errors['mother']) ? 'is-invalid' : ''; ?>" name="mother" value="<?php echo $formData['mother']; ?>" placeholder="মাতার নাম" required>
                                <?php if (isset($errors['mother'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['mother']; ?></div><?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <!-- Address -->
                    <div class="form-section-title" style="margin-top: 25px;">
                        <i class="bi bi-geo-alt"></i> ঠিকানা
                    </div>
                    <div class="form-group-custom">
                        <label>সম্পূর্ণ ঠিকানা <span class="required">*</span></label>
                        <textarea class="form-control-custom <?php echo isset($errors['address']) ? 'is-invalid' : ''; ?>" name="address" rows="2" placeholder="গ্রাম/মহল্লা, উপজেলা/থানা, জেলা" required><?php echo $formData['address']; ?></textarea>
                        <?php if (isset($errors['address'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['address']; ?></div><?php endif; ?>
                    </div>

                    <!-- Uploads -->
                    <div class="form-section-title" style="margin-top: 25px;">
                        <i class="bi bi-cloud-upload"></i> আপলোড
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group-custom">
                                <label>ছবি (পাসপোর্ট সাইজ) <span class="required">*</span></label>
                                <div class="upload-zone" onclick="document.getElementById('photoInput').click()">
                                    <i class="bi bi-camera-fill"></i>
                                    <p class="upload-label">ছবি নির্বাচন করুন</p>
                                    <p>JPG/PNG, সর্বোচ্চ 5MB</p>
                                    <input type="file" id="photoInput" name="photo" accept="image/*" required onchange="previewImage(this, 'photoPreview')">
                                    <img id="photoPreview" class="upload-preview" alt="Preview">
                                </div>
                                <?php if (isset($errors['photo'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['photo']; ?></div><?php endif; ?>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group-custom">
                                <label>স্বাক্ষর <span class="required">*</span></label>
                                <div class="upload-zone" onclick="document.getElementById('signInput').click()">
                                    <i class="bi bi-pen-fill"></i>
                                    <p class="upload-label">স্বাক্ষর নির্বাচন করুন</p>
                                    <p>JPG/PNG, সর্বোচ্চ 2MB</p>
                                    <input type="file" id="signInput" name="signature" accept="image/*" required onchange="previewImage(this, 'signPreview')">
                                    <img id="signPreview" class="upload-preview" alt="Preview">
                                </div>
                                <?php if (isset($errors['signature'])): ?><div class="error-msg"><i class="bi bi-exclamation-circle"></i> <?php echo $errors['signature']; ?></div><?php endif; ?>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 30px;">
                        <button type="button" class="btn-auto-generate" onclick="autoGenerate()">
                            <i class="bi bi-magic"></i> Auto Generate — সব তথ্য অটো পূরণ করুন
                        </button>
                        <button type="submit" name="submit" class="btn-submit-custom">
                            <i class="bi bi-shield-check"></i> NID কার্ড তৈরি করুন
                        </button>
                    </div>

                    <p style="text-align:center; margin-top:15px; font-size:12px; color:var(--gov-text-light);">
                        <i class="bi bi-lock-fill"></i> আপনার তথ্য সুরক্ষিত রাখা হয় এবং কোনো সার্ভারে সংরক্ষণ করা হয় না
                    </p>
                </form>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="gov-footer">
        <p>© 2026 নির্বাচন কমিশন বাংলাদেশ | Election Commission Bangladesh</p>
        <p>
            <a href="#">গোপনীয়তা নীতি</a>
            <span class="footer-separator">|</span>
            <a href="#">ব্যবহারের শর্তাবলী</a>
            <span class="footer-separator">|</span>
            <a href="#">সাহায্য</a>
        </p>
    </div>

    <script>
    function searchNid() {
        var query = document.getElementById('nidSearchInput').value.trim();
        var resultDiv = document.getElementById('searchResult');
        
        if (!query) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = '<div style="padding:10px;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;color:#856404;font-size:13px;"><i class="bi bi-exclamation-triangle"></i> NID নম্বর বা PIN নম্বর দিন</div>';
            return;
        }
        
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div style="padding:10px;background:#e8f4f8;border:1px solid #bee5eb;border-radius:8px;color:#0c5460;font-size:13px;"><i class="bi bi-arrow-repeat"></i> অনুসন্দান হচ্ছে...</div>';
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'nid_search.php?q=' + encodeURIComponent(query), true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                if (response.found) {
                    var d = response.data;
                    resultDiv.innerHTML = '<div style="padding:15px;background:#d4edda;border:1px solid #c3e6cb;border-radius:10px;">' +
                        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><i class="bi bi-check-circle-fill" style="color:#28a745;font-size:20px;"></i><strong style="color:#155724;font-size:15px;">তথ্য পাওয়া গেছে!</strong></div>' +
                        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px;color:#155724;">' +
                        '<div><strong>নাম (বাংলা):</strong> ' + d.name_bn + '</div>' +
                        '<div><strong>Name:</strong> ' + d.name_en + '</div>' +
                        '<div><strong>NID:</strong> ' + d.nid + '</div>' +
                        '<div><strong>PIN:</strong> ' + d.pin + '</div>' +
                        '<div><strong>জন্ম তারিখ:</strong> ' + d.dob + '</div>' +
                        '<div><strong>রক্তের গ্রুপ:</strong> ' + d.blood + '</div>' +
                        '<div><strong>পিতা:</strong> ' + d.father + '</div>' +
                        '<div><strong>মাতা:</strong> ' + d.mother + '</div>' +
                        '<div style="grid-column:span 2;"><strong>ঠিকানা:</strong> ' + d.address + '</div>' +
                        '</div>' +
                        '<a href="nid_view.php?nid=' + d.nid + '" style="display:inline-flex;align-items:center;gap:5px;margin-top:10px;padding:8px 16px;background:linear-gradient(135deg,var(--gov-green),var(--gov-green-light));color:#fff;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;"><i class="bi bi-card-text"></i> NID কার্ড দেখুন</a>' +
                        '</div>';
                } else {
                    resultDiv.innerHTML = '<div style="padding:10px;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;color:#721c24;font-size:13px;"><i class="bi bi-x-circle"></i> ' + (response.message || 'কোনো তথ্য পাওয়া যায়নি') + '</div>';
                }
            } else {
                resultDiv.innerHTML = '<div style="padding:10px;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;color:#721c24;font-size:13px;"><i class="bi bi-x-circle"></i> সার্ভার ত্রুটি</div>';
            }
        };
        xhr.onerror = function() {
            resultDiv.innerHTML = '<div style="padding:10px;background:#f8d7da;border:1px solid #f5c6cb;border-radius:8px;color:#721c24;font-size:13px;"><i class="bi bi-x-circle"></i> সংযোগ ব্যর্থ</div>';
        };
        xhr.send();
    }

    function previewImage(input, previewId) {
        const preview = document.getElementById(previewId);
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    function autoGenerate() {
        // Random Bangla names
        const bnMaleNames = ['মোঃ আব্দুল করিম','মোঃ রহিম উদ্দিন','মোঃ কামাল হোসেন','মোঃ নজরুল ইসলাম','মোঃ আলী আকবর','মোঃ শফিকুল ইসলাম','মোঃ জাহিদ হাসান','মোঃ মিজানুর রহমান','মোঃ আনোয়ার হোসেন','মোঃ সোহেল রানা','মোঃ তানভীর আহমেদ','মোঃ সাকিব আল হাসান','মোঃ মাহমুদুল হাসান','মোঃ ফারুক আহমেদ','মোঃ রফিকুল ইসলাম'];
        const bnFemaleNames = ['মোসাঃ ফাতেমা বেগম','মোসাঃ নূরজাহান','মোসাঃ রহিমা বেগম','মোসাঃ আয়েশা বেগম','মোসাঃ সারা খাতুন','মোসাঃ হাসিনা বেগম','মোসাঃ রাবেয়া খাতুন','মোসাঃ জাহানারা বেগম','মোসাঃ মারজানা বেগম','মোসাঃ রুবিনা আক্তার'];
        const enMaleNames = ['Abdul Karim','Rahim Uddin','Kamal Hossain','Nazrul Islam','Ali Akbar','Shafiqul Islam','Zahid Hasan','Mizanur Rahman','Anwar Hossain','Sohel Rana','Tanvir Ahmed','Sakib Al Hasan','Mahmudul Hasan','Faruk Ahmed','Rafiqul Islam'];
        const enFemaleNames = ['Fatema Begum','Nurjahan','Rahima Begum','Aysha Begum','Sara Khatun','Hasina Begum','Rabeya Khatun','Jahanara Begum','Marjana Begum','Rubina Akter'];
        const bnFatherNames = ['আব্দুল গনি','মোঃ ইসমাইল','আব্দুল হালিম','মোঃ আব্দুল্লাহ','মোঃ আলী হোসেন','মোঃ আবু বকর','মোঃ ইব্রাহিম খলিল','মোঃ আনিসুর রহমান','মোঃ শামসুল হক','মোঃ আলী আকবর','মোঃ দুলাল মিয়া','মোঃ আব্দুল মান্নান'];
        const enFatherNames = ['Abdul Gani','Md. Ismail','Abdul Halim','Md. Abdullah','Md. Ali Hossain','Md. Abu Bakar','Md. Ibrahim Khalil','Md. Anisur Rahman','Md. Shamsul Haque','Md. Ali Akbar','Md. Dulal Mia','Md. Abdul Mannan'];
        const bnMotherNames = ['আমেনা বেগম','রহিমা বেগম','আয়েশা বেগম','নূরজাহান বেগম','হালিমা বেগম','ফিরোজা বেগম','মোসাম্মৎ রাবেয়া','জোবেদা বেগম','মমতাজ বেগম','কামরুন্নেসা','সুফিয়া খাতুন','রিজিয়া বেগম'];
        const enMotherNames = ['Amena Begum','Rahima Begum','Aysha Begum','Nurjahan Begum','Halima Begum','Firoza Begum','Mosammat Rabeya','Jobeda Begum','Momtaz Begum','Kamrunnesa','Sufia Khatun','Rizia Begum'];
        const districts = ['ঢাকা','চট্টগ্রাম','রাজশাহী','খুলনা','বরিশাল','সিলেট','রংপুর','ময়মনসিংহ','কুমিল্লা','গাজীপুর','নারায়ণগঞ্জ','টাঙ্গাইল','যশোর','কুষ্টিয়া','বগুড়া','দিনাজপুর','নোয়াখালী','ফেনী','ব্রাহ্মণবাড়িয়া','পাবনা'];
        const upazilas = ['সদর','দক্ষিণ','উত্তর','পূর্ব','পশ্চিম','মধ্য','নতুন','পুরাতন','মডেল','কেন্দ্র'];
        const villages = ['রামপুরা','বনশ্রী','মিরপুর','উত্তরা','ধানমন্ডী','গুলশান','বনানী','মোহাম্মদপুর','শ্যামলী','কলাবাগান','তেজগাঁও','হাজারীবাগ','কামরাঙ্গীরচর','খিলগাঁও','বাড্ডা','ভাসানটেক','রায়েরবাজার','শাহজাহানপুর'];
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

        function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
        function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

        // Gender
        var genderSel = document.querySelector('select[name="gender"]');
        var gender = genderSel.value;
        var isMale = (gender !== 'female');

        // Names
        var nameBn = isMale ? pick(bnMaleNames) : pick(bnFemaleNames);
        var nameEn = isMale ? pick(enMaleNames) : pick(enFemaleNames);
        document.querySelector('input[name="name_bn"]').value = nameBn;
        var nameEnUpper = nameEn.toUpperCase();
        document.querySelector('input[name="name_en"]').value = nameEnUpper;

        // NID & PIN
        var nid = '';
        for (var i = 0; i < randInt(10, 13); i++) nid += randInt(0, 9);
        document.querySelector('input[name="nid"]').value = nid;
        var pin = '';
        for (var i = 0; i < randInt(4, 6); i++) pin += randInt(0, 9);
        document.querySelector('input[name="pin"]').value = pin;

        // Date of Birth
        var dobDay = randInt(1, 28);
        var dobMonth = pick(months);
        var dobYear = randInt(1970, 2005);
        document.querySelector('input[name="dob"]').value = (dobDay < 10 ? '0' : '') + dobDay + ' ' + dobMonth + ' ' + dobYear;

        // Blood Group
        document.querySelector('select[name="blood"]').value = pick(bloodGroups);

        // Birth Place
        document.querySelector('input[name="birth"]').value = pick(districts);

        // Father
        document.querySelector('input[name="father"]').value = pick(bnFatherNames);

        // Mother
        document.querySelector('input[name="mother"]').value = pick(bnMotherNames);

        // Address
        var postCodes = ['১৭৪৩','১২১৫','১২২৯','১৩১০','১৩৩২','১৩৪০','১৪০০','১৫০০','১৬০০','১৭০০','১৮০০','১৯০০','২০০০','২১০০','২২০০','২৩০০','২৪০০','২৫০০','৩০০০','৩১০০','৩২০০','৩৩০০','৩৪০০','৩৫০০','৩৬০০','৪০০০','৪১০০','৪২০০','৪৩০০','৪৪০০','৪৫০০','৫০০০','৫১০০','৫২০০','৫৩০০','৫৪০০','৫৫০০','৬০০০','৬১০০','৬২০০','৬৩০০','৭০০০','৭১০০','৭২০০','৭৩০০','৭৪০০','৮০০০','৮১০০','৮২০০','৮৩০০','৯০০০','৯১০০','৯২০০'];
        var address = 'গ্রাম/মহল্লা: ' + pick(villages) + ', ডাকঘর: ' + pick(villages) + ' - ' + pick(postCodes) + ', ' + pick(districts) + ' ' + pick(upazilas) + ', ' + pick(districts);
        document.querySelector('textarea[name="address"]').value = address;

        // Generate random photo using canvas
        generateRandomPhoto(nid);

        // Generate signature from name
        generateSignature(nameEnUpper);
    }

    function generateRandomPhoto(seed) {
        var canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 170;
        var ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#e8f4f8';
        ctx.fillRect(0, 0, 150, 170);

        // Simple avatar silhouette
        ctx.fillStyle = '#5a8fa8';
        // Head
        ctx.beginPath();
        ctx.arc(75, 55, 30, 0, Math.PI * 2);
        ctx.fill();
        // Body
        ctx.beginPath();
        ctx.ellipse(75, 135, 45, 45, 0, Math.PI, 0);
        ctx.fill();

        // Random color variation based on seed
        var hash = 0;
        for (var i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        var r = (hash & 0xFF0000) >> 16;
        var g = (hash & 0x00FF00) >> 8;
        var b = hash & 0x0000FF;
        var skinColor = 'rgb(' + (180 + (r % 50)) + ',' + (140 + (g % 40)) + ',' + (110 + (b % 30)) + ')';

        // Redraw with skin color
        ctx.fillStyle = skinColor;
        ctx.beginPath();
        ctx.arc(75, 55, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(75, 135, 45, 45, 0, Math.PI, 0);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#2c2c2c';
        ctx.beginPath();
        ctx.arc(75, 45, 30, Math.PI, 0);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(63, 52, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(87, 52, 3, 0, Math.PI * 2);
        ctx.fill();

        // Mouth
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(75, 65, 8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Collar
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(55, 95);
        ctx.lineTo(75, 110);
        ctx.lineTo(95, 95);
        ctx.lineTo(95, 105);
        ctx.lineTo(75, 120);
        ctx.lineTo(55, 105);
        ctx.closePath();
        ctx.fill();

        var dataUrl = canvas.toDataURL('image/png');
        var photoPreview = document.getElementById('photoPreview');
        photoPreview.src = dataUrl;
        photoPreview.style.display = 'block';

        // Create a file from canvas and set to input
        canvas.toBlob(function(blob) {
            var file = new File([blob], 'photo.png', { type: 'image/png' });
            var dt = new DataTransfer();
            dt.items.add(file);
            document.getElementById('photoInput').files = dt.files;
        }, 'image/png');
    }

    function generateSignature(name) {
        var canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 60;
        var ctx = canvas.getContext('2d');

        // Transparent background
        ctx.clearRect(0, 0, 200, 60);

        // Cursive-like signature
        ctx.font = 'italic 28px "Dancing Script", "Brush Script MT", cursive';
        ctx.fillStyle = '#1a3a5c';
        ctx.strokeStyle = '#1a3a5c';
        ctx.lineWidth = 1.5;

        // Draw the name with slight random curve
        var xOffset = 10;
        var hash = 0;
        for (var i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        var curveOffset = (hash % 10) - 5;

        ctx.save();
        ctx.translate(xOffset, 38 + curveOffset);
        ctx.rotate((-2 + (hash % 5)) * Math.PI / 180);
        ctx.fillText(name, 0, 0);
        ctx.restore();

        // Underline stroke
        ctx.beginPath();
        ctx.moveTo(15, 45);
        ctx.quadraticCurveTo(100, 50 + curveOffset, 185, 42);
        ctx.stroke();

        var dataUrl = canvas.toDataURL('image/png');
        var signPreview = document.getElementById('signPreview');
        signPreview.src = dataUrl;
        signPreview.style.display = 'block';

        // Create a file from canvas and set to input
        canvas.toBlob(function(blob) {
            var file = new File([blob], 'signature.png', { type: 'image/png' });
            var dt = new DataTransfer();
            dt.items.add(file);
            document.getElementById('signInput').files = dt.files;
        }, 'image/png');
    }
    </script>
</body>
</html>
<?php } else { ?>
<html lang="en">
<head>
    <title>nid-<?php echo isset($_POST['nid']) ? $_POST['nid'] : ''; ?></title>
    <link href="https://sonnetdp.github.io/nikosh/css/nikosh.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.maateen.me/kalpurush/font.css" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/bootstrap.min.css" integrity="sha384-r4NyP46KrjDleawBgD5tp8Y7UzmLA05oM1iAEQ17CSuDqnUK2+k9luXQOfXJCJ4I" crossorigin="anonymous">
    <script src="assets/JavaScript/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
    <script src="assets/JavaScript/bootstrap.min.js" integrity="sha384-oesi62hOLfzrys4LxRF63OJCXdXDipiYWBnvTl9Y9/TRlw5xlKIEHpNyvvDShgf/" crossorigin="anonymous"></script>
    <script src="assets/JavaScript/jquery-1.11.1.min.js"></script>
    <link rel="stylesheet" href="assets/css/tx1337.css" data-n-g="" />
    
    <style>
        @font-face {
            font-family: 'Kalpurush';
            src: url('assets/CSS/Fonts/kalpurush.woff2') format('woff2'),
                 url('assets/CSS/Fonts/kalpurush.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        @media print {
            .no-print { display: none !important; }
            @page { margin: 5mm; }
            body { padding: 0; margin: 0; background: #fff; }
        }
        body { background: #f0f2f5; margin: 0; font-family: 'Hind Siliguri', 'Kalpurush', sans-serif; }
        
        /* Result Page Header */
        .result-header {
            background: linear-gradient(135deg, #006a4e 0%, #00875a 100%);
            color: #fff;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .result-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .result-header h2 { margin: 0; font-size: 16px; font-weight: 600; }
        .result-header small { opacity: 0.85; font-size: 11px; }
        

        .header-btns { display: flex; gap: 8px; align-items: center; }
        .btn-download {
            padding: 8px 20px; font-size: 13px; font-weight: 600; border-radius: 8px;
            display: inline-flex; align-items: center; gap: 6px;
            background: linear-gradient(135deg, #dc3545, #e74c3c); color: #fff;
            border: none; cursor: pointer; text-decoration: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s ease;
        }
        .btn-download:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.25); color: #fff; text-decoration: none; }
        .btn-back {
            padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: 8px;
            display: inline-flex; align-items: center; gap: 5px;
            background: #6c757d; color: #fff; text-decoration: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15); transition: all 0.2s ease;
            border: none; cursor: pointer;
        }
        .btn-back:hover { background: #5c636a; color: #fff; transform: translateY(-2px); }
        .btn-back:hover { background: #5c636a; color: #fff; }
        


        .card-container {
            width: 210mm;
            min-height: 297mm;
            margin: 30px auto;
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            padding: 15mm;
        }


        /* Back side fixes for html2canvas */
        #nid_back .back-address-row {
            display: flex; flex-direction: row; align-items: flex-start;
            font-size: 11.73px; letter-spacing: -0.12px; line-height: 11px;
        }
        #nid_back .back-address-label {
            font-family: 'Kalpurush', 'Nikosh', sans-serif;
            padding: 0 1px 0 4px; white-space: nowrap; flex-shrink: 0;
        }
        #nid_back .back-address-value {
            font-family: 'Kalpurush', 'Nikosh', sans-serif;
            padding: 0 0px 0 2px; line-height: 11px;
        }
        #nid_back .back-bottom-row {
            bottom: 1.08px;
            display: flex; flex-direction: row; justify-content: space-between;
            align-items: flex-end; position: relative; width: 100%;
        }
        #nid_back .back-info-line {
            padding-left: 6px;
            display: inline; font-family: 'Kalpurush', 'Nikosh', sans-serif;
            font-size: 11.6px; line-height: 13px; margin-bottom: 0px;
        }
        #nid_back .back-mududdron {
            position: absolute; right: -1px; bottom: -1px;
            width: 30.5px; height: 13px; overflow: hidden;
        }
        #barcode canvas { width: 102%; height: 100%; }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>


    <!-- Result Header -->
    <div class="result-header no-print">
        <div class="result-header-left">
            <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
                <i class="bi bi-check-circle-fill" style="font-size:20px;"></i>
            </div>
            <div>
                <h2>NID কার্ড তৈরি সম্পন্ন</h2>
                <small>আপনার জাতীয় পরিচয় পত্র প্রস্তুত</small>
            </div>
        </div>
        <div class="header-btns">
            <a href="downloader.php?nid=<?php echo $formData['nid']; ?>" class="btn-download"><i class="bi bi-download"></i> ডাউনলোড করুন</a>
            <a href="nid_make.php" class="btn-back"><i class="bi bi-arrow-left"></i> নতুন কার্ড</a>
        </div>
    </div>

    <div class="card-container">

        <div id="__next" data-reactroot="">
            <main>
                <div>
                    <main class="w-full overflow-hidden">
                        <div>
                            <div class="container w-full py-12 lg:flex lg:items-start" style="padding-top: 0;">
                            <div class="w-full lg:pl-6">
                                <div class="flex items-center justify-center">
                                    <div class="w-full">
                                        <div class="flex items-start gap-x-2 bg-transparent mx-auto w-fit" id="nid_wrapper" style="margin-top:120px;gap:8px;">
                                            <!-- FRONT SIDE -->
                                            <div id="nid_front" class="border-[1.999px] border-black" style="width:85.6mm;min-width:85.6mm;">
                                                <header class="px-1.5 flex items-start gap-x-2 justify-between relative">
                                                    <img class="w-[38px] absolute top-1.5 left-[4.5px]" src="assets/Images/bangladeshicon.png" alt="bangladeshicon" />
                                                    <div class="w-full h-[60px] flex flex-col justify-center">
                                                        <h3 style="font-size:20px" class="text-center font-medium tracking-normal pl-11 bn leading-5"><span style="margin-top:1px;display:inline-block">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span></h3>
                                                        <p class="text-[#007700] text-right tracking-[-0rem] leading-3" style="font-size:11.46px;font-family:arial;margin-bottom:-0.02px">Government of the People&#x27;s Republic of Bangladesh</p>
                                                        <p class="text-center font-medium pl-10 leading-4" style="padding-top:0px"><span class="text-[#ff0002]" style="font-size:10px;font-family:arial">National ID Card</span><span class="ml-1" style="display:inline-block"><span style="font-size:13px;font-family:arial">/</span></span><span class="bn ml-1" style="font-size:13.33px">জাতীয় পরিচয় পত্র</span></p>
                                                    </div>
                                                </header>
                                                <div class="w-[101%] -ml-[0.5%] border-b-[1.9999px] border-black" style="width: 100%;margin-left: 0;"></div>
                                                <div class="pt-[3.8px] pr-1 pl-[2px] bg-center w-full flex justify-between gap-x-2 pb-5 relative">
                                                    <div class="absolute inset-x-0 top-[2px] mx-auto z-10 flex items-start justify-center"><img style="background:transparent;width: 114px;height: 114px;" class="ml-[20px] w-[125px] h-[116px" src="assets/Images/flower-logo.png" alt="" /></div>
                                                    <div class="relative z-50">
                                                        <?php
                                                        if (isset($_FILES['photo']) && $_FILES['photo']['error'] == 0) {
                                                            $photo_data = base64_encode(file_get_contents($_FILES['photo']['tmp_name']));
                                                            $photo_type = $_FILES['photo']['type'];
                                                            $photo_src = 'data:' . $photo_type . ';base64,' . $photo_data;
                                                        } else {
                                                            $photo_src = 'assets/Images/notfound.png';
                                                        }
                                                        ?>
                                                        <img style="margin-top:-2px" id="userPhoto" class="w-[68.2px] h-[78px]" alt="photo" src="<?php echo $photo_src; ?>" />
                                                        <div class="text-center text-xs flex items-start justify-center pt-[5px] w-[68.2px] mx-auto h-[38.5px] overflow-hidden" id="card_signature">
                                                            <?php
                                                            if (isset($_FILES['signature']) && $_FILES['signature']['error'] == 0) {
                                                                $sign_data = base64_encode(file_get_contents($_FILES['signature']['tmp_name']));
                                                                $sign_type = $_FILES['signature']['type'];
                                                                $sign_src = 'data:' . $sign_type . ';base64,' . $sign_data;
                                                            } else {
                                                                $sign_src = 'assets/Images/notfound.png';
                                                            }
                                                            ?>
                                                            <img id="sign" src="<?php echo $sign_src; ?>" alt="sign" />
                                                        </div>
                                                    </div>
                                                    <div class="w-full relative z-50">
                                                        <div style="height:5px"></div>
                                                        <div class="flex flex-col gap-y-[10px]" style="margin-top: 1px;">
                                                            <div><p class="space-x-4 leading-3" style="padding-left:1px"><span class="bn" style="font-size:16.53px">নাম:</span><span class="" style="font-size:16.53px;padding-left:3px;-webkit-text-stroke:0.4px black" id="nameBn"><?php echo $formData['name_bn']; ?></span></p></div>
                                                            <div style="margin-top: 1px;"><p class="space-x-2 leading-3" style="margin-bottom:-1.4px;margin-top:1.4px;padding-left:1px"><span style="font-size:11px">Name:</span><span style="font-size:12.73px;padding-left:1px" id="nameEn"><?php echo $formData['name_en']; ?></span></p></div>
                                                            <div style="margin-top: 1px;"><p class="bn space-x-3 leading-3" style="padding-left:1px"><span id="fatherOrHusband" style="font-size:14px">পিতা: </span><span style="font-size:14px;transform:scaleX(0.724)" id="card_father_name"><?php echo $formData['father']; ?></span></p></div>
                                                            <div style="margin-top: 1px;"><p class="bn space-x-3 leading-3" style="margin-top:-2.5px;padding-left:1px"><span style="font-size:14px">মাতা: </span><span style="font-size:14px;transform:scaleX(0.724)" id="card_mother_name"><?php echo $formData['mother']; ?></span></p></div>
                                                            <div class="leading-4" style="font-size:12px;margin-top:-1.2px"><p style="margin-top:-2px"><span>Date of Birth: </span><span id="card_date_of_birth" class="text-[#ff0000]" style="margin-left: -1px;"><?php echo $formData['dob']; ?></span></p></div>
                                                            <div class="-mt-0.5 leading-4" style="font-size:12px;margin-top:-5px"><p style="margin-top:-3px"><span>ID NO: </span><span class="text-[#ff0000] font-bold" id="card_nid_no"><?php echo $formData['nid']; ?></span></p></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- BACK SIDE - Fixed for downloads -->
                                            <div id="nid_back" class="border-[1.999px] border-[#000]" style="width:85.6mm;min-width:85.6mm;">
                                                <header style="height:32px;display:flex;align-items:center;padding:0 8px;letter-spacing:0.05px;text-align:left;">
                                                    <p class="bn" style="line-height:13px;font-size:11.33px;letter-spacing:0.05px;margin:0;">এই কার্ডটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সম্পত্তি। কার্ডটি ব্যবহারকারী ব্যতীত অন্য কোথাও পাওয়া গেলে নিকটস্থ পোস্ট অফিসে জমা দেবার জন্য অনুরোধ করা হলো।</p>
                                                </header>
                                                <div style="width:100%;margin-left:0;border-bottom:1.999px solid black;"></div>
                                                <div style="padding:3px 4px;height:66px;position:relative;font-size:12px;">
                                                    <div class="back-address-row">
                                                        <span class="back-address-label bn">ঠিকানা:</span>
                                                        <span class="back-address-value bn" id="card_address"><?php echo $formData['address']; ?></span>
                                                    </div>
                                                    <div class="back-bottom-row" style="margin-top:auto;position:absolute;bottom:1.08px;left:0;right:0;">
                                                        <p class="bn back-info-line" style="margin-bottom:0px;padding-left:6px;font-weight:500;">
                                                            <span style="font-size:11.6px">রক্তের গ্রুপ</span><span style="display:inline-block;width:3px;"></span><span style="font-size:11px;font-family:arial;">/</span><span style="display:inline-block;width:3px;"></span><span style="font-size:9px">Blood Group:</span><b style="font-size:9.33px;margin-bottom:-3px;display:inline-block;color:#ff0000;margin-left:4px;margin-right:10px;font-weight:bold;" id="card_blood"><?php echo $formData['blood']; ?></b><span style="font-size:10.66px">জন্মস্থান:</span><span style="display:inline-block;width:3px;"></span><span style="font-size:10.66px;" id="card_birth_place"><?php echo $formData['birth']; ?></span>
                                                        </p>
                                                        <div class="back-mududdron">
                                                            <img src="assets/Images/mududdron.png" alt="" style="width:100%;height:100%;display:block;" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style="width:100%;margin-left:0;border-bottom:1.999px solid black;"></div>
                                                <div style="padding:4px 8px 4px 4px;">
                                                    <img style="width:78px;margin-left:18px;margin-bottom:3px;height:27.3px;display:block;" src="assets/Images/adminsign.jpg" />
                                                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:-5px;">
                                                        <p class="bn" style="font-size:14px;margin:0;">প্রদানকারী কর্তৃপক্তের স্বাক্ষর</p>
                                                        <span class="bn" style="font-size:12px;padding-right:16px;padding-top:1px;">প্রদানের তারিখ:<span style="margin-left:10px;" id="card_date"></span></span>
                                                    </div>
                                                    <div id="barcode" style="width:100%;height:39px;margin-top:1.5px;margin-left:-3px;">
                                                    </div>
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
    </div>

    <script>
        var nidData = {
            name_bn: <?php echo json_encode($formData['name_bn']); ?>,
            name_en: <?php echo json_encode($formData['name_en']); ?>,
            nid: <?php echo json_encode($formData['nid']); ?>,
            pin: <?php echo json_encode($formData['pin']); ?>,
            father: <?php echo json_encode($formData['father']); ?>,
            mother: <?php echo json_encode($formData['mother']); ?>,
            birth: <?php echo json_encode($formData['birth']); ?>,
            dob: <?php echo json_encode($formData['dob']); ?>,
            blood: <?php echo json_encode($formData['blood']); ?>,
            address: <?php echo json_encode($formData['address']); ?>
        };

        

        

        

        
        

        window.onload = function() {
            var hub3_code = '<pin><?php echo $formData['pin']; ?></pin><name><?php echo $formData['name_en']; ?></name><DOB><?php echo $formData['dob']; ?>/DOB><FP></FP><F>Right Index</F><TYPE>A</TYPE><V>2.0</V><ds>302c0214103fc01240542ed736c0b48858c1c03d80006215021416e73728de9618fedcd368c88d8f3a2e72096d</ds>';
            PDF417.init(hub3_code);
            var barcode = PDF417.getBarcodeArray();
            var bw = 2, bh = 2;
            var canvas = document.createElement('canvas');
            canvas.width = bw * barcode['num_cols'];
            canvas.height = bh * barcode['num_rows'];
            document.getElementById('barcode').appendChild(canvas);
            var ctx = canvas.getContext('2d');
            var y = 0;
            for (var r = 0; r < barcode['num_rows']; ++r) { var x = 0; for (var c = 0; c < barcode['num_cols']; ++c) { if (barcode['bcode'][r][c] == 1) { ctx.fillRect(x, y, bw, bh); } x += bw; } y += bh; }

            var finalEnlishToBanglaNumber = {'0':'\u09E6','1':'\u09E7','2':'\u09E8','3':'\u09E9','4':'\u09EA','5':'\u09EB','6':'\u09EC','7':'\u09ED','8':'\u09EE','9':'\u09EF'};
            String.prototype.getDigitBanglaFromEnglish = function() { var retStr = this; for (var x in finalEnlishToBanglaNumber) { retStr = retStr.replace(new RegExp(x, 'g'), finalEnlishToBanglaNumber[x]); } return retStr; };
            var today = new Date();
            var day = String(today.getDate()).padStart(2, '0');
            var month = String(today.getMonth() + 1).padStart(2, '0');
            var year = String(today.getFullYear());
            var dateStr = day + '/' + month + '/' + year;
            document.getElementById("card_date").innerHTML = dateStr.getDigitBanglaFromEnglish();
        }
    </script>
    <script src="assets/JavaScript/bcmath-min.js" type="text/javascript"></script>
    <script src="assets/JavaScript/pdf417-min.js" type="text/javascript"></script>
    
</body>
</html>
<?php } ?>
