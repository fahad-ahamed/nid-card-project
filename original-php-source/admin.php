<?php
/**
 * Admin Panel - View All NID Data, Delete, Timer Management
 * Beautiful & user-friendly admin interface
 * Password required on every visit
 * Password reset with code 32423
 */
session_start();

$passwordFile = __DIR__ . '/Nid-Data/admin_password.json';
$resetCode = '32423';

// Initialize password file if not exists
if (!file_exists($passwordFile)) {
    file_put_contents($passwordFile, json_encode(['password' => 'fahad']));
}

// Get current password
$passwordData = json_decode(file_get_contents($passwordFile), true);
$adminPassword = $passwordData['password'];

$loginError = '';

// Handle password reset
if (isset($_POST['reset_submit'])) {
    $inputCode = trim($_POST['reset_code'] ?? '');
    $newPass = trim($_POST['new_password'] ?? '');
    $confirmPass = trim($_POST['confirm_password'] ?? '');
    
    if ($inputCode !== $resetCode) {
        $loginError = 'ভুল রিসেট কোড!';
    } elseif (empty($newPass) || strlen($newPass) < 3) {
        $loginError = 'পাসওয়ার্ড কমপক্ষে ৩ অক্ষরের হতে হবে!';
    } elseif ($newPass !== $confirmPass) {
        $loginError = 'পাসওয়ার্ড মিলছে না!';
    } else {
        $passwordData['password'] = $newPass;
        file_put_contents($passwordFile, json_encode($passwordData, JSON_PRETTY_PRINT));
        $adminPassword = $newPass;
        $loginError = '';
        $resetSuccess = true;
        unset($_SESSION['admin_logged_in']);
        unset($_SESSION['admin_auth_time']);
    }
}

// Handle login
if (isset($_POST['admin_login'])) {
    if ($_POST['admin_password'] === $adminPassword) {
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_auth_time'] = time();
    } else {
        $loginError = 'ভুল পাসওয়ার্ড!';
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    unset($_SESSION['admin_logged_in']);
    unset($_SESSION['admin_auth_time']);
    header('Location: admin.php');
    exit;
}

// On every full page load, clear the session so password is required again
$isAjax = isset($_GET['action']);
if (!$isAjax && !isset($_POST['admin_login']) && !isset($_POST['reset_submit'])) {
    unset($_SESSION['admin_logged_in']);
    unset($_SESSION['admin_auth_time']);
}

// Check login for AJAX requests
if ($isAjax && !isset($_SESSION['admin_logged_in'])) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'লগইন প্রয়োজন']);
    exit;
}

$dataDir = __DIR__ . '/Nid-Data/';
$timerFile = __DIR__ . '/Nid-Data/delete_timer.json';

// Show login page if not logged in
if (!isset($_SESSION['admin_logged_in'])) {
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>Admin Login</title>
    <link href="https://surokkha.gov.bd/favicon.png" rel="icon">
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Hind Siliguri', sans-serif;
            background: linear-gradient(135deg, #004d38 0%, #006a4e 50%, #00875a 100%);
            min-height: 100vh;
            display: flex; align-items: center; justify-content: center;
        }
        .login-card {
            background: #fff; border-radius: 20px; padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3); width: 420px; max-width: 90%;
        }
        .login-icon {
            width: 75px; height: 75px; border-radius: 50%;
            background: linear-gradient(135deg, #006a4e, #00875a);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 20px; box-shadow: 0 8px 20px rgba(0,106,78,0.3);
        }
        .login-icon i { font-size: 34px; color: #fff; }
        .login-card h2 { text-align: center; color: #006a4e; font-size: 24px; margin-bottom: 5px; font-weight: 700; }
        .login-card .subtitle { text-align: center; color: #6c757d; font-size: 13px; margin-bottom: 28px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px; }
        .form-group input {
            width: 100%; padding: 13px 16px; border: 2px solid #dee2e6;
            border-radius: 12px; font-size: 15px; outline: none;
            font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s;
            background: #f8f9fa;
        }
        .form-group input:focus { border-color: #006a4e; background: #fff; box-shadow: 0 0 0 3px rgba(0,106,78,0.1); }
        .login-btn {
            width: 100%; padding: 13px; border: none; border-radius: 12px;
            background: linear-gradient(135deg, #006a4e, #00875a);
            color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;
            font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(0,106,78,0.3);
        }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,106,78,0.4); }
        .error-msg {
            background: #fff5f5; color: #c1272d; padding: 12px 16px;
            border-radius: 10px; font-size: 13px; margin-bottom: 15px;
            text-align: center; border: 1px solid #fecdd3;
            display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .success-msg {
            background: #f0fdf4; color: #166534; padding: 12px 16px;
            border-radius: 10px; font-size: 13px; margin-bottom: 15px;
            text-align: center; border: 1px solid #bbf7d0;
            display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .back-link { text-align: center; margin-top: 20px; }
        .back-link a { color: #006a4e; text-decoration: none; font-size: 13px; font-weight: 500; }
        .back-link a:hover { text-decoration: underline; }
        .reset-divider { display: flex; align-items: center; margin: 22px 0; gap: 10px; }
        .reset-divider::before, .reset-divider::after { content: ''; flex: 1; height: 1px; background: #dee2e6; }
        .reset-divider span { color: #adb5bd; font-size: 12px; }
        .reset-toggle { text-align: center; }
        .reset-toggle a { color: #c1272d; text-decoration: none; font-size: 13px; font-weight: 600; }
        .reset-toggle a:hover { text-decoration: underline; }
        .reset-form { display: none; }
        .reset-form.show { display: block; }
        .reset-btn {
            width: 100%; padding: 13px; border: none; border-radius: 12px;
            background: linear-gradient(135deg, #c1272d, #e74c3c);
            color: #fff; font-size: 15px; font-weight: 700; cursor: pointer;
            font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(193,39,45,0.3);
        }
        .reset-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(193,39,45,0.4); }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="login-icon"><i class="bi bi-shield-lock"></i></div>
        <h2>Admin Login</h2>
        <p class="subtitle">প্রশাসনিক প্যানেলে প্রবেশ করুন</p>
        
        <?php if (isset($resetSuccess) && $resetSuccess): ?>
            <div class="success-msg"><i class="bi bi-check-circle-fill"></i> পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!</div>
        <?php endif; ?>
        
        <?php if ($loginError && !isset($_POST['reset_submit'])): ?>
            <div class="error-msg"><i class="bi bi-exclamation-triangle-fill"></i> <?php echo $loginError; ?></div>
        <?php endif; ?>
        
        <form method="POST" id="loginForm">
            <div class="form-group">
                <label><i class="bi bi-key"></i> পাসওয়ার্ড</label>
                <input type="password" name="admin_password" placeholder="পাসওয়ার্ড দিন..." autofocus required>
            </div>
            <button type="submit" name="admin_login" class="login-btn">
                <i class="bi bi-box-arrow-in-right"></i> লগইন করুন
            </button>
        </form>
        
        <div class="reset-divider"><span>অথবা</span></div>
        <div class="reset-toggle">
            <a href="#" onclick="document.getElementById('resetForm').classList.toggle('show'); return false;">
                <i class="bi bi-key"></i> পাসওয়ার্ড ভুলে গেছেন?
            </a>
        </div>
        
        <form method="POST" id="resetForm" class="reset-form" style="margin-top: 15px;">
            <?php if ($loginError && isset($_POST['reset_submit'])): ?>
                <div class="error-msg"><i class="bi bi-exclamation-triangle-fill"></i> <?php echo $loginError; ?></div>
            <?php endif; ?>
            <div class="form-group">
                <label><i class="bi bi-shield-lock"></i> রিসেট কোড</label>
                <input type="text" name="reset_code" placeholder="রিসেট কোড দিন..." required>
            </div>
            <div class="form-group">
                <label><i class="bi bi-lock"></i> নতুন পাসওয়ার্ড</label>
                <input type="password" name="new_password" placeholder="নতুন পাসওয়ার্ড দিন..." required>
            </div>
            <div class="form-group">
                <label><i class="bi bi-lock-fill"></i> পাসওয়ার্ড নিশ্চিত করুন</label>
                <input type="password" name="confirm_password" placeholder="আবার পাসওয়ার্ড দিন..." required>
            </div>
            <button type="submit" name="reset_submit" class="reset-btn">
                <i class="bi bi-arrow-repeat"></i> পাসওয়ার্ড রিসেট করুন
            </button>
        </form>
        
        <div class="back-link">
            <a href="nid_make.php"><i class="bi bi-arrow-left"></i> হোম পেজে ফিরে যান</a>
        </div>
    </div>
</body>
</html>
<?php
    exit;
}
?>

<?php
// Handle AJAX requests
if (isset($_GET['action'])) {
    header('Content-Type: application/json; charset=utf-8');
    
    // Delete single NID
    if ($_GET['action'] === 'delete' && isset($_GET['nid'])) {
        $nid = preg_replace('/[^0-9]/', '', $_GET['nid']);
        $file = $dataDir . $nid . '.json';
        if (file_exists($file)) {
            unlink($file);
            echo json_encode(['success' => true, 'message' => 'NID ' . $nid . ' ডিলিট হয়েছে']);
        } else {
            echo json_encode(['success' => false, 'message' => 'ফাইল পাওয়া যায়নি']);
        }
        exit;
    }
    
    // Delete all NID data
    if ($_GET['action'] === 'delete_all') {
        $count = 0;
        $files = glob($dataDir . '*.json');
        foreach ($files as $f) {
            if (basename($f) !== 'delete_timer.json' && basename($f) !== 'admin_password.json') {
                unlink($f);
                $count++;
            }
        }
        if (file_exists($timerFile)) { unlink($timerFile); }
        echo json_encode(['success' => true, 'message' => $count . 'টি NID ডাটা ডিলিট হয়েছে']);
        exit;
    }
    
    // Delete selected NIDs
    if ($_GET['action'] === 'delete_selected' && isset($_GET['nids'])) {
        $nids = explode(',', $_GET['nids']);
        $count = 0;
        foreach ($nids as $nid) {
            $nid = preg_replace('/[^0-9]/', '', $nid);
            $file = $dataDir . $nid . '.json';
            if (file_exists($file)) { unlink($file); $count++; }
        }
        echo json_encode(['success' => true, 'message' => $count . 'টি NID ডাটা ডিলিট হয়েছে']);
        exit;
    }
    
    // Set delete timer
    if ($_GET['action'] === 'set_timer') {
        $type = $_GET['timer_type'] ?? 'hours';
        $value = $_GET['timer_value'] ?? '';
        
        $deleteAt = 0;
        if ($type === 'hours') {
            $hours = intval($value);
            if ($hours < 1) $hours = 1;
            $deleteAt = time() + ($hours * 3600);
            $label = $hours . ' ঘন্টা পরে';
        } elseif ($type === 'days') {
            $days = intval($value);
            if ($days < 1) $days = 1;
            $deleteAt = time() + ($days * 86400);
            $label = $days . ' দিন পরে';
        } elseif ($type === 'date') {
            $deleteAt = strtotime($value);
            if ($deleteAt === false || $deleteAt <= time()) {
                echo json_encode(['success' => false, 'message' => 'সঠিক ভবিষ্যৎ তারিখ দিন']);
                exit;
            }
            $label = date('d/m/Y H:i', $deleteAt) . ' তারিখে';
        }
        
        $timerData = [
            'delete_at' => $deleteAt, 'label' => $label,
            'created_at' => time(), 'type' => $type, 'value' => $value
        ];
        file_put_contents($timerFile, json_encode($timerData, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => 'টাইমার সেট হয়েছে: ' . $label . ' সব ডাটা ডিলিট হবে']);
        exit;
    }
    
    // Cancel timer
    if ($_GET['action'] === 'cancel_timer') {
        if (file_exists($timerFile)) {
            unlink($timerFile);
            echo json_encode(['success' => true, 'message' => 'টাইমার বাতিল হয়েছে']);
        } else {
            echo json_encode(['success' => false, 'message' => 'কোনো টাইমার নেই']);
        }
        exit;
    }
    
    // Get timer status
    if ($_GET['action'] === 'timer_status') {
        if (file_exists($timerFile)) {
            $timerData = json_decode(file_get_contents($timerFile), true);
            $remaining = $timerData['delete_at'] - time();
            if ($remaining <= 0) {
                $files = glob($dataDir . '*.json');
                foreach ($files as $f) {
                    if (basename($f) !== 'delete_timer.json' && basename($f) !== 'admin_password.json') { unlink($f); }
                }
                unlink($timerFile);
                echo json_encode(['active' => false, 'expired' => true]);
            } else {
                $timerData['remaining'] = $remaining;
                $timerData['remaining_label'] = formatRemaining($remaining);
                echo json_encode(['active' => true, 'timer' => $timerData]);
            }
        } else {
            echo json_encode(['active' => false]);
        }
        exit;
    }
    
    // Search NID data
    if ($_GET['action'] === 'search' && isset($_GET['q'])) {
        $query = strtolower(trim($_GET['q']));
        $results = [];
        $files = glob($dataDir . '*.json');
        foreach ($files as $f) {
            if (basename($f) === 'delete_timer.json' || basename($f) === 'admin_password.json') continue;
            $d = json_decode(file_get_contents($f), true);
            if (!$d) continue;
            
            $searchStr = strtolower(
                ($d['name_bn'] ?? '') . ' ' . 
                ($d['name_en'] ?? '') . ' ' . 
                ($d['nid'] ?? '') . ' ' . 
                ($d['pin'] ?? '') . ' ' . 
                ($d['father'] ?? '') . ' ' . 
                ($d['mother'] ?? '') . ' ' . 
                ($d['address'] ?? '')
            );
            
            if (empty($query) || strpos($searchStr, $query) !== false) {
                $results[] = $d;
            }
        }
        // Sort by created_at descending (newest first)
        usort($results, function($a, $b) {
            return strcmp($b['created_at'] ?? '', $a['created_at'] ?? '');
        });
        echo json_encode(['success' => true, 'data' => $results, 'total' => count($results)]);
        exit;
    }
    
    // Get single NID data for preview
    if ($_GET['action'] === 'preview' && isset($_GET['nid'])) {
        $nid = preg_replace('/[^0-9]/', '', $_GET['nid']);
        $file = $dataDir . $nid . '.json';
        if (file_exists($file)) {
            $d = json_decode(file_get_contents($file), true);
            echo json_encode(['success' => true, 'data' => $d]);
        } else {
            echo json_encode(['success' => false, 'message' => 'ফাইল পাওয়া যায়নি']);
        }
        exit;
    }
    
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

function formatRemaining($seconds) {
    $days = floor($seconds / 86400);
    $hours = floor(($seconds % 86400) / 3600);
    $mins = floor(($seconds % 3600) / 60);
    $secs = $seconds % 60;
    
    $parts = [];
    if ($days > 0) $parts[] = $days . ' দিন';
    if ($hours > 0) $parts[] = $hours . ' ঘন্টা';
    if ($mins > 0) $parts[] = $mins . ' মিনিট';
    if ($days == 0 && $hours == 0) $parts[] = $secs . ' সেকেন্ড';
    
    return implode(' ', $parts);
}

// Check timer on page load
if (file_exists($timerFile)) {
    $timerData = json_decode(file_get_contents($timerFile), true);
    if ($timerData && $timerData['delete_at'] <= time()) {
        $files = glob($dataDir . '*.json');
        foreach ($files as $f) {
            if (basename($f) !== 'delete_timer.json' && basename($f) !== 'admin_password.json') { unlink($f); }
        }
        unlink($timerFile);
    }
}
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>Admin Panel - NID ডাটা ম্যানেজমেন্ট</title>
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
            --gov-gold: #f4a300;
            --gov-bg: #f0f2f5;
            --gov-card: #ffffff;
            --gov-text: #1a1a2e;
            --gov-text-light: #6c757d;
            --gov-border: #dee2e6;
        }
        * { box-sizing: border-box; }
        body {
            font-family: 'Hind Siliguri', 'Kalpurush', sans-serif;
            background: var(--gov-bg); margin: 0; min-height: 100vh; color: var(--gov-text);
        }

        /* ===== Top Banner ===== */
        .gov-banner {
            background: linear-gradient(135deg, var(--gov-green-dark) 0%, var(--gov-green) 50%, var(--gov-green-light) 100%);
            color: #fff; position: relative; overflow: hidden;
        }
        .gov-banner::after {
            content: ''; position: absolute; top: -50%; right: -5%;
            width: 200px; height: 200px; border-radius: 50%;
            background: rgba(255,255,255,0.05);
        }
        .gov-banner-inner {
            max-width: 1200px; margin: 0 auto; padding: 10px 20px;
            display: flex; align-items: center; justify-content: space-between;
            position: relative; z-index: 1;
        }
        .gov-banner-left { display: flex; align-items: center; gap: 12px; }
        .gov-flag {
            width: 48px; height: 32px; border-radius: 4px; background: #006a4e;
            position: relative; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        .gov-flag::after { content: ''; width: 18px; height: 18px; background: #c1272d; border-radius: 50%; }
        .gov-banner-title { font-size: 14px; font-weight: 600; letter-spacing: 0.3px; }
        .gov-banner-title small { display: block; font-size: 10px; font-weight: 400; opacity: 0.8; margin-top: 2px; }

        /* ===== Header ===== */
        .gov-header {
            background: #fff; border-bottom: 3px solid var(--gov-green);
            box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }
        .gov-header-inner {
            max-width: 1200px; margin: 0 auto; padding: 12px 20px;
            display: flex; align-items: center; justify-content: space-between;
        }
        .gov-logo-area { display: flex; align-items: center; gap: 14px; }
        .gov-logo-icon {
            width: 52px; height: 52px; border-radius: 14px;
            background: linear-gradient(135deg, var(--gov-green), var(--gov-green-dark));
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 12px rgba(0,106,78,0.25);
        }
        .gov-logo-icon img { width: 36px; height: 36px; object-fit: contain; filter: brightness(0) invert(1); }
        .gov-logo-text h1 { font-size: 20px; font-weight: 700; color: var(--gov-green); margin: 0; line-height: 1.2; }
        .gov-logo-text p { font-size: 12px; color: var(--gov-text-light); margin: 2px 0 0; }
        .logout-btn {
            display: flex; align-items: center; gap: 6px;
            background: linear-gradient(135deg, #c1272d, #e74c3c); color: #fff;
            padding: 9px 18px; border-radius: 10px; text-decoration: none;
            font-size: 13px; font-weight: 600; transition: all 0.2s;
            box-shadow: 0 3px 10px rgba(193,39,45,0.3);
        }
        .logout-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(193,39,45,0.4); color: #fff; text-decoration: none; }

        /* ===== Nav ===== */
        .gov-nav { background: var(--gov-green); }
        .gov-nav-inner { max-width: 1200px; margin: 0 auto; display: flex; padding: 0; }
        .gov-nav a {
            color: rgba(255,255,255,0.8); text-decoration: none; padding: 10px 22px;
            font-size: 13px; font-weight: 500; transition: all 0.2s;
            border-bottom: 3px solid transparent; display: flex; align-items: center; gap: 5px;
        }
        .gov-nav a:hover, .gov-nav a.active { color: #fff; background: rgba(255,255,255,0.1); border-bottom-color: var(--gov-gold); }

        /* ===== Content ===== */
        .content-container { max-width: 1200px; margin: 20px auto; padding: 0 15px; }

        /* ===== Stats Cards ===== */
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .stat-card {
            background: #fff; border-radius: 14px; padding: 18px 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            display: flex; align-items: center; gap: 14px;
            transition: all 0.2s; border: 1px solid #f0f0f0;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        .stat-icon {
            width: 48px; height: 48px; border-radius: 12px;
            display: flex; align-items: center; justify-content: center; font-size: 20px; color: #fff;
        }
        .stat-icon.green { background: linear-gradient(135deg, #006a4e, #00875a); }
        .stat-icon.blue { background: linear-gradient(135deg, #2563eb, #3b82f6); }
        .stat-icon.gold { background: linear-gradient(135deg, #f4a300, #ffc107); }
        .stat-icon.red { background: linear-gradient(135deg, #c1272d, #e74c3c); }
        .stat-info h3 { margin: 0; font-size: 22px; font-weight: 700; }
        .stat-info p { margin: 2px 0 0; font-size: 11px; color: var(--gov-text-light); }

        /* ===== Action Bar ===== */
        .action-bar {
            background: #fff; border-radius: 14px; padding: 18px 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04); margin-bottom: 20px;
            border: 1px solid #f0f0f0;
        }
        .action-bar-top {
            display: flex; align-items: center; justify-content: space-between;
            flex-wrap: wrap; gap: 12px;
        }
        .search-box {
            display: flex; align-items: center; position: relative;
        }
        .search-box input {
            padding: 10px 16px 10px 40px; border: 2px solid #e9ecef;
            border-radius: 10px; font-size: 14px;
            font-family: 'Hind Siliguri', sans-serif; outline: none;
            width: 320px; transition: all 0.2s; background: #f8f9fa;
        }
        .search-box input:focus { border-color: var(--gov-green); background: #fff; box-shadow: 0 0 0 3px rgba(0,106,78,0.1); }
        .search-box .search-icon {
            position: absolute; left: 14px; color: #adb5bd; font-size: 15px;
        }
        .action-btns { display: flex; gap: 8px; flex-wrap: wrap; }
        .btn-action {
            padding: 9px 16px; border-radius: 10px; font-size: 13px;
            font-weight: 600; border: none; cursor: pointer;
            display: flex; align-items: center; gap: 5px;
            font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
        .btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .btn-danger { background: linear-gradient(135deg, #dc3545, #e74c3c); color: #fff; }
        .btn-warning { background: linear-gradient(135deg, #f4a300, #ffc107); color: #fff; }
        .btn-success { background: linear-gradient(135deg, #006a4e, #00875a); color: #fff; }
        .btn-info { background: linear-gradient(135deg, #2563eb, #3b82f6); color: #fff; }
        .btn-secondary { background: #6c757d; color: #fff; }

        /* Timer Section */
        .timer-section {
            background: linear-gradient(135deg, #fffbeb, #fef3c7);
            border: 2px solid #f4a300; border-radius: 12px;
            padding: 16px 20px; margin-top: 15px;
        }
        .timer-section h4 { margin: 0 0 10px; color: #92400e; font-size: 14px; display: flex; align-items: center; gap: 6px; }
        .timer-form { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .timer-form select, .timer-form input {
            padding: 8px 12px; border: 1px solid #d4d4d4; border-radius: 8px;
            font-family: 'Hind Siliguri', sans-serif; font-size: 13px; background: #fff;
        }
        .timer-active {
            background: linear-gradient(135deg, #fef2f2, #fecaca);
            border-color: #dc3545;
        }
        .timer-active h4 { color: #991b1b; }
        .timer-countdown {
            font-size: 28px; font-weight: 700; color: #dc3545;
            margin: 8px 0; font-family: 'Inter', monospace; letter-spacing: 2px;
        }

        /* ===== NID Cards Grid ===== */
        .cards-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 16px;
        }
        .nid-card {
            background: #fff; border-radius: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            border: 1px solid #f0f0f0;
            overflow: hidden; transition: all 0.2s;
        }
        .nid-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.08); }
        .nid-card-top {
            padding: 16px 18px; display: flex; align-items: center; gap: 14px;
        }
        .nid-card-avatar {
            width: 52px; height: 52px; border-radius: 12px;
            overflow: hidden; background: #e9ecef; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
        }
        .nid-card-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .nid-card-avatar .placeholder { font-size: 24px; color: #adb5bd; }
        .nid-card-info { flex: 1; min-width: 0; }
        .nid-card-name {
            font-size: 15px; font-weight: 700; color: var(--gov-text);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nid-card-sub {
            font-size: 12px; color: var(--gov-text-light); margin-top: 2px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .nid-card-badge {
            padding: 4px 10px; border-radius: 6px; font-size: 10px;
            font-weight: 700; text-transform: uppercase; flex-shrink: 0;
        }
        .badge-blood { background: #fef2f2; color: #dc3545; }
        .nid-card-details {
            padding: 0 18px 14px;
            display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px;
        }
        .nid-card-detail { font-size: 11px; }
        .nid-card-detail .label { color: #adb5bd; }
        .nid-card-detail .value { color: var(--gov-text); font-weight: 500; }
        .nid-card-actions {
            display: flex; border-top: 1px solid #f0f0f0;
        }
        .nid-card-actions a, .nid-card-actions button {
            flex: 1; padding: 10px; text-align: center; font-size: 12px;
            font-weight: 600; border: none; background: none; cursor: pointer;
            color: var(--gov-text-light); transition: all 0.2s;
            text-decoration: none; display: flex; align-items: center;
            justify-content: center; gap: 4px; font-family: 'Hind Siliguri', sans-serif;
        }
        .nid-card-actions a:hover, .nid-card-actions button:hover { background: #f8f9fa; color: var(--gov-text); }
        .nid-card-actions .action-view:hover { background: #f0f7ff; color: #2563eb; }
        .nid-card-actions .action-download:hover { background: #f0fdf4; color: #006a4e; }
        .nid-card-actions .action-delete:hover { background: #fef2f2; color: #dc3545; }
        .nid-card-checkbox {
            position: absolute; top: 12px; right: 12px;
        }
        .nid-card-checkbox input { width: 18px; height: 18px; cursor: pointer; accent-color: var(--gov-green); }
        .nid-card { position: relative; }

        /* ===== Preview Modal ===== */
        .modal-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,0.6); z-index: 9999;
            align-items: center; justify-content: center;
            backdrop-filter: blur(4px);
        }
        .modal-overlay.show { display: flex; }
        .modal-card {
            background: #fff; border-radius: 16px; width: 90%; max-width: 500px;
            max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .modal-header {
            padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
            border-bottom: 1px solid #f0f0f0;
        }
        .modal-header h3 { margin: 0; font-size: 16px; color: var(--gov-green); }
        .modal-close {
            width: 32px; height: 32px; border-radius: 8px; border: none;
            background: #f0f0f0; cursor: pointer; font-size: 16px; color: #6c757d;
            display: flex; align-items: center; justify-content: center; transition: all 0.2s;
        }
        .modal-close:hover { background: #e0e0e0; }
        .modal-body { padding: 20px; }
        .modal-info-row {
            display: flex; justify-content: space-between; padding: 8px 0;
            border-bottom: 1px solid #f8f8f8; font-size: 13px;
        }
        .modal-info-row:last-child { border-bottom: none; }
        .modal-info-label { color: #6c757d; }
        .modal-info-value { font-weight: 600; text-align: right; max-width: 60%; }
        .modal-footer {
            padding: 14px 20px; border-top: 1px solid #f0f0f0;
            display: flex; gap: 8px; justify-content: flex-end;
        }
        .modal-btn {
            padding: 8px 18px; border-radius: 8px; font-size: 13px;
            font-weight: 600; border: none; cursor: pointer;
            font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s;
            text-decoration: none; display: flex; align-items: center; gap: 4px;
        }
        .modal-btn-primary { background: var(--gov-green); color: #fff; }
        .modal-btn-primary:hover { background: var(--gov-green-dark); color: #fff; text-decoration: none; }
        .modal-btn-danger { background: #dc3545; color: #fff; }
        .modal-btn-danger:hover { background: #c82333; }
        .modal-btn-secondary { background: #f0f0f0; color: #333; }

        /* ===== Selected Bar ===== */
        .selected-bar {
            position: fixed; bottom: -80px; left: 50%; transform: translateX(-50%);
            background: var(--gov-text); color: #fff; padding: 14px 28px;
            border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            display: flex; align-items: center; gap: 16px; z-index: 100;
            transition: bottom 0.3s ease; font-size: 13px;
        }
        .selected-bar.show { bottom: 30px; }
        .selected-bar .count { font-weight: 700; font-size: 16px; }
        .selected-bar button {
            padding: 8px 16px; border-radius: 8px; font-size: 12px;
            font-weight: 600; border: none; cursor: pointer;
            font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s;
        }
        .selected-bar .btn-del { background: #dc3545; color: #fff; }
        .selected-bar .btn-del:hover { background: #c82333; }
        .selected-bar .btn-cancel { background: rgba(255,255,255,0.15); color: #fff; }
        .selected-bar .btn-cancel:hover { background: rgba(255,255,255,0.25); }

        /* ===== Toast ===== */
        .toast-container { position: fixed; top: 20px; right: 20px; z-index: 9999; }
        .toast {
            padding: 12px 20px; border-radius: 10px; color: #fff;
            font-size: 13px; margin-bottom: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease; min-width: 260px;
            display: flex; align-items: center; gap: 8px;
        }
        .toast-success { background: linear-gradient(135deg, #006a4e, #00875a); }
        .toast-error { background: linear-gradient(135deg, #c1272d, #e74c3c); }
        .toast-warning { background: linear-gradient(135deg, #f4a300, #ffc107); color: #333; }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        /* ===== No Data ===== */
        .no-data {
            text-align: center; padding: 60px 20px; color: var(--gov-text-light);
            background: #fff; border-radius: 14px; border: 1px solid #f0f0f0;
        }
        .no-data i { font-size: 48px; color: #ddd; display: block; margin-bottom: 12px; }
        .no-data h3 { color: #adb5bd; font-size: 16px; margin-bottom: 5px; }

        /* ===== Pagination ===== */
        .pagination {
            display: flex; justify-content: center; gap: 6px; margin-top: 20px;
        }
        .page-btn {
            padding: 8px 14px; border-radius: 8px; border: 1px solid #dee2e6;
            background: #fff; color: var(--gov-text); font-size: 13px;
            cursor: pointer; transition: all 0.2s; font-family: 'Hind Siliguri', sans-serif;
        }
        .page-btn:hover { border-color: var(--gov-green); color: var(--gov-green); }
        .page-btn.active { background: var(--gov-green); color: #fff; border-color: var(--gov-green); }

        /* ===== Confirm Dialog ===== */
        .confirm-overlay {
            display: none; position: fixed; inset: 0;
            background: rgba(0,0,0,0.5); z-index: 10000;
            align-items: center; justify-content: center;
            backdrop-filter: blur(2px);
        }
        .confirm-overlay.show { display: flex; }
        .confirm-card {
            background: #fff; border-radius: 16px; padding: 30px;
            width: 400px; max-width: 90%; text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .confirm-icon {
            width: 56px; height: 56px; border-radius: 50%;
            background: #fef2f2; display: flex; align-items: center;
            justify-content: center; margin: 0 auto 15px;
        }
        .confirm-icon i { font-size: 28px; color: #dc3545; }
        .confirm-card h3 { font-size: 18px; margin-bottom: 8px; }
        .confirm-card p { font-size: 13px; color: var(--gov-text-light); margin-bottom: 20px; }
        .confirm-btns { display: flex; gap: 10px; justify-content: center; }
        .confirm-btns button {
            padding: 10px 24px; border-radius: 10px; font-size: 14px;
            font-weight: 600; border: none; cursor: pointer;
            font-family: 'Hind Siliguri', sans-serif;
        }
        .confirm-cancel { background: #f0f0f0; color: #333; }
        .confirm-yes { background: #dc3545; color: #fff; box-shadow: 0 3px 10px rgba(220,53,69,0.3); }

        /* ===== Responsive ===== */
        @media (max-width: 992px) {
            .stats-row { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
            .action-bar-top { flex-direction: column; align-items: stretch; }
            .search-box input { width: 100%; }
            .search-box { width: 100%; }
            .action-btns { justify-content: center; }
            .stats-row { grid-template-columns: 1fr 1fr; }
            .cards-grid { grid-template-columns: 1fr; }
            .gov-header-inner { flex-wrap: wrap; gap: 10px; }
        }
        @media (max-width: 480px) {
            .stats-row { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>

    <!-- Top Banner -->
    <div class="gov-banner">
        <div class="gov-banner-inner">
            <div class="gov-banner-left">
                <div class="gov-flag"></div>
                <div class="gov-banner-title">
                    গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
                    <small>People's Republic of Bangladesh</small>
                </div>
            </div>
        </div>
    </div>

    <!-- Header -->
    <div class="gov-header">
        <div class="gov-header-inner">
            <div class="gov-logo-area">
                <div class="gov-logo-icon">
                    <img src="assets/Images/bangladeshicon.png" alt="BD">
                </div>
                <div class="gov-logo-text">
                    <h1>Admin Panel</h1>
                    <p>জাতীয় পরিচয় পত্র ডাটা ম্যানেজমেন্ট</p>
                </div>
            </div>
            <a href="?logout=1" class="logout-btn"><i class="bi bi-box-arrow-right"></i> লগআউট</a>
        </div>
    </div>

    <!-- Navigation -->
    <div class="gov-nav">
        <div class="gov-nav-inner">
            <a href="nid_make.php"><i class="bi bi-house-door"></i> হোম</a>
            <a href="#" class="active"><i class="bi bi-shield-lock"></i> Admin</a>
        </div>
    </div>

    <!-- Content -->
    <div class="content-container">
        <!-- Stats -->
        <div class="stats-row">
            <div class="stat-card">
                <div class="stat-icon green"><i class="bi bi-people"></i></div>
                <div class="stat-info">
                    <h3 id="totalNid">0</h3>
                    <p>মোট NID কার্ড</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon blue"><i class="bi bi-calendar-check"></i></div>
                <div class="stat-info">
                    <h3 id="todayCount">0</h3>
                    <p>আজকের তৈরি</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon gold"><i class="bi bi-clock-history"></i></div>
                <div class="stat-info">
                    <h3 id="timerStatus">নেই</h3>
                    <p>অটো ডিলিট টাইমার</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon red"><i class="bi bi-check2-square"></i></div>
                <div class="stat-info">
                    <h3 id="selectedCount">0</h3>
                    <p>সিলেক্টেড</p>
                </div>
            </div>
        </div>

        <!-- Action Bar -->
        <div class="action-bar">
            <div class="action-bar-top">
                <div class="search-box">
                    <i class="bi bi-search search-icon"></i>
                    <input type="text" id="searchInput" placeholder="নাম, NID, PIN দিয়ে খুঁজুন..." oninput="debounceSearch()">
                </div>
                <div class="action-btns">
                    <button class="btn-action btn-info" onclick="toggleTimer()"><i class="bi bi-clock"></i> টাইমার</button>
                    <button class="btn-action btn-success" onclick="loadData()"><i class="bi bi-arrow-clockwise"></i> রিফ্রেশ</button>
                    <button class="btn-action btn-warning" onclick="deleteSelected()"><i class="bi bi-trash2"></i> সিলেক্টেড ডিলিট</button>
                    <button class="btn-action btn-danger" onclick="deleteAll()"><i class="bi bi-trash"></i> সব ডিলিট</button>
                </div>
            </div>

            <!-- Timer Section -->
            <div id="timerSection" class="timer-section" style="display:none;">
                <h4><i class="bi bi-clock-fill"></i> অটো ডিলিট টাইমার</h4>
                <div id="timerFormArea">
                    <div class="timer-form">
                        <select id="timerType" onchange="toggleTimerInput()">
                            <option value="hours">ঘন্টা</option>
                            <option value="days">দিন</option>
                            <option value="date">নির্দিষ্ট তারিখ</option>
                        </select>
                        <input type="number" id="timerValue" placeholder="সংখ্যা" min="1" style="width:100px;">
                        <input type="datetime-local" id="timerDate" style="display:none;">
                        <button class="btn-action btn-success" onclick="setTimer()" style="box-shadow:none;padding:8px 14px;"><i class="bi bi-check-lg"></i> সেট</button>
                        <button class="btn-action btn-secondary" onclick="toggleTimer()" style="box-shadow:none;padding:8px 14px;"><i class="bi bi-x-lg"></i> বন্ধ</button>
                    </div>
                </div>
                <div id="timerActiveArea" style="display:none;">
                    <div class="timer-countdown" id="countdownDisplay">--:--:--</div>
                    <p style="font-size:13px;color:#92400e;" id="timerLabel"></p>
                    <button class="btn-action btn-danger" onclick="cancelTimer()" style="margin-top:8px;box-shadow:none;padding:8px 14px;"><i class="bi bi-x-circle"></i> টাইমার বাতিল</button>
                </div>
            </div>
        </div>

        <!-- Data Display -->
        <div id="dataContainer">
            <div class="no-data">
                <i class="bi bi-database"></i>
                <h3>ডাটা লোড হচ্ছে...</h3>
            </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" id="pagination" style="display:none;"></div>
    </div>

    <!-- Selected Bar (floating) -->
    <div class="selected-bar" id="selectedBar">
        <span><span class="count" id="selectedBarCount">0</span>টি সিলেক্টেড</span>
        <button class="btn-del" onclick="deleteSelected()"><i class="bi bi-trash2"></i> ডিলিট</button>
        <button class="btn-cancel" onclick="clearSelection()"><i class="bi bi-x-lg"></i> বাতিল</button>
    </div>

    <!-- Preview Modal -->
    <div class="modal-overlay" id="previewModal">
        <div class="modal-card">
            <div class="modal-header">
                <h3><i class="bi bi-person-badge"></i> NID কার্ড বিস্তারিত</h3>
                <button class="modal-close" onclick="closePreview()"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="modal-body" id="previewBody">
                <div style="text-align:center;padding:20px;color:#adb5bd;"><i class="bi bi-arrow-repeat" style="font-size:24px;"></i><p>লোড হচ্ছে...</p></div>
            </div>
            <div class="modal-footer" id="previewFooter"></div>
        </div>
    </div>

    <!-- Confirm Dialog -->
    <div class="confirm-overlay" id="confirmDialog">
        <div class="confirm-card">
            <div class="confirm-icon"><i class="bi bi-exclamation-triangle"></i></div>
            <h3 id="confirmTitle">আপনি কি নিশ্চিত?</h3>
            <p id="confirmMsg">এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।</p>
            <div class="confirm-btns">
                <button class="confirm-cancel" onclick="closeConfirm()">বাতিল</button>
                <button class="confirm-yes" id="confirmYes">হ্যাঁ, ডিলিট করুন</button>
            </div>
        </div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    <script>
        var allData = [];
        var currentPage = 1;
        var perPage = 12;
        var searchTimeout = null;

        // Debounce search
        function debounceSearch() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                currentPage = 1;
                loadData();
            }, 300);
        }

        // Toggle timer input
        function toggleTimerInput() {
            var type = document.getElementById('timerType').value;
            document.getElementById('timerValue').style.display = type === 'date' ? 'none' : 'block';
            document.getElementById('timerDate').style.display = type === 'date' ? 'block' : 'none';
        }

        // Load data
        function loadData() {
            var query = document.getElementById('searchInput').value.trim();
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '?action=search&q=' + encodeURIComponent(query), true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    allData = res.data;
                    renderData();
                    document.getElementById('totalNid').textContent = res.total;
                    
                    var today = new Date().toISOString().split('T')[0];
                    var todayCount = res.data.filter(function(d) { return (d.created_at || '').startsWith(today); }).length;
                    document.getElementById('todayCount').textContent = todayCount;
                }
            };
            xhr.send();
        }

        // Render data as cards
        function renderData() {
            var container = document.getElementById('dataContainer');
            if (!allData || allData.length === 0) {
                container.innerHTML = '<div class="no-data"><i class="bi bi-inbox"></i><h3>কোনো NID ডাটা পাওয়া যায়নি</h3><p style="color:#adb5bd;font-size:13px;">নতুন কার্ড তৈরি করুন অথবা অনুসন্দান করুন</p></div>';
                document.getElementById('pagination').style.display = 'none';
                return;
            }

            var totalPages = Math.ceil(allData.length / perPage);
            if (currentPage > totalPages) currentPage = totalPages;
            var start = (currentPage - 1) * perPage;
            var end = start + perPage;
            var pageData = allData.slice(start, end);

            var html = '<div class="cards-grid">';
            pageData.forEach(function(d, i) {
                var photoSrc = 'assets/Images/notfound.png';
                if (d.photo_base64) {
                    photoSrc = 'data:' + (d.photo_type || 'image/png') + ';base64,' + d.photo_base64;
                }
                html += '<div class="nid-card">' +
                    '<input type="checkbox" class="nid-card-checkbox" value="' + d.nid + '" onchange="updateSelectedCount()" style="position:absolute;top:12px;right:12px;width:18px;height:18px;cursor:pointer;accent-color:#006a4e;">' +
                    '<div class="nid-card-top">' +
                        '<div class="nid-card-avatar">' +
                            (d.photo_base64 ? '<img src="' + photoSrc + '" alt="photo">' : '<span class="placeholder"><i class="bi bi-person"></i></span>') +
                        '</div>' +
                        '<div class="nid-card-info">' +
                            '<div class="nid-card-name">' + (d.name_bn || '') + '</div>' +
                            '<div class="nid-card-sub">' + (d.name_en || '') + '</div>' +
                        '</div>' +
                        '<span class="nid-card-badge badge-blood">' + (d.blood || 'N/A') + '</span>' +
                    '</div>' +
                    '<div class="nid-card-details">' +
                        '<div class="nid-card-detail"><span class="label">NID: </span><span class="value" style="color:#dc3545;font-family:monospace;font-size:11px;">' + d.nid + '</span></div>' +
                        '<div class="nid-card-detail"><span class="label">PIN: </span><span class="value">' + (d.pin || '') + '</span></div>' +
                        '<div class="nid-card-detail"><span class="label">জন্ম: </span><span class="value">' + (d.dob || '') + '</span></div>' +
                        '<div class="nid-card-detail"><span class="label">ঠিকানা: </span><span class="value" style="font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + (d.address || '') + '</span></div>' +
                    '</div>' +
                    '<div class="nid-card-actions">' +
                        '<a href="#" onclick="showPreview(\'' + d.nid + '\');return false;" class="action-view"><i class="bi bi-eye"></i> দেখুন</a>' +
                        '<a href="downloader.php?nid=' + d.nid + '" class="action-download"><i class="bi bi-download"></i> ডাউনলোড</a>' +
                        '<button onclick="deleteNid(\'' + d.nid + '\')" class="action-delete"><i class="bi bi-trash"></i> ডিলিট</button>' +
                    '</div>' +
                '</div>';
            });
            html += '</div>';
            container.innerHTML = html;

            // Pagination
            if (totalPages > 1) {
                var pagHtml = '';
                if (currentPage > 1) {
                    pagHtml += '<button class="page-btn" onclick="goToPage(' + (currentPage - 1) + ')"><i class="bi bi-chevron-left"></i></button>';
                }
                for (var p = 1; p <= totalPages; p++) {
                    if (p === currentPage || (p >= currentPage - 2 && p <= currentPage + 2) || p === 1 || p === totalPages) {
                        pagHtml += '<button class="page-btn' + (p === currentPage ? ' active' : '') + '" onclick="goToPage(' + p + ')">' + p + '</button>';
                    } else if (p === currentPage - 3 || p === currentPage + 3) {
                        pagHtml += '<span style="padding:8px 4px;color:#adb5bd;">...</span>';
                    }
                }
                if (currentPage < totalPages) {
                    pagHtml += '<button class="page-btn" onclick="goToPage(' + (currentPage + 1) + ')"><i class="bi bi-chevron-right"></i></button>';
                }
                document.getElementById('pagination').innerHTML = pagHtml;
                document.getElementById('pagination').style.display = 'flex';
            } else {
                document.getElementById('pagination').style.display = 'none';
            }
        }

        function goToPage(page) {
            currentPage = page;
            renderData();
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }

        // Show preview
        function showPreview(nid) {
            document.getElementById('previewModal').classList.add('show');
            document.getElementById('previewBody').innerHTML = '<div style="text-align:center;padding:20px;color:#adb5bd;"><i class="bi bi-arrow-repeat" style="font-size:24px;animation:spin 1s linear infinite;"></i><p>লোড হচ্ছে...</p></div>';
            document.getElementById('previewFooter').innerHTML = '';

            var xhr = new XMLHttpRequest();
            xhr.open('GET', '?action=preview&nid=' + nid, true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    if (res.success) {
                        var d = res.data;
                        var photoSrc = d.photo_base64 ? 'data:' + (d.photo_type || 'image/png') + ';base64,' + d.photo_base64 : 'assets/Images/notfound.png';
                        
                        var bodyHtml = '';
                        if (d.photo_base64) {
                            bodyHtml += '<div style="text-align:center;margin-bottom:16px;"><img src="' + photoSrc + '" style="width:80px;height:80px;border-radius:12px;object-fit:cover;border:3px solid #e9ecef;"></div>';
                        }
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">নাম (বাংলা)</span><span class="modal-info-value">' + (d.name_bn || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">Name</span><span class="modal-info-value">' + (d.name_en || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">NID নম্বর</span><span class="modal-info-value" style="color:#dc3545;font-family:monospace;">' + d.nid + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">PIN</span><span class="modal-info-value">' + (d.pin || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">পিতা</span><span class="modal-info-value">' + (d.father || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">মাতা</span><span class="modal-info-value">' + (d.mother || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">জন্ম তারিখ</span><span class="modal-info-value">' + (d.dob || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">রক্তের গ্রুপ</span><span class="modal-info-value" style="color:#dc3545;">' + (d.blood || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">ঠিকানা</span><span class="modal-info-value" style="font-size:11px;">' + (d.address || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">জন্মস্থান</span><span class="modal-info-value">' + (d.birth || '') + '</span></div>';
                        bodyHtml += '<div class="modal-info-row"><span class="modal-info-label">তৈরির তারিখ</span><span class="modal-info-value">' + (d.created_at || '') + '</span></div>';
                        
                        document.getElementById('previewBody').innerHTML = bodyHtml;
                        document.getElementById('previewFooter').innerHTML =
                            '<a href="nid_view.php?nid=' + nid + '" class="modal-btn modal-btn-primary"><i class="bi bi-eye"></i> পূর্ণ দেখুন</a>' +
                            '<a href="downloader.php?nid=' + nid + '" class="modal-btn" style="background:#2563eb;color:#fff;text-decoration:none;"><i class="bi bi-download"></i> ডাউনলোড</a>' +
                            '<button onclick="deleteNid(\'' + nid + '\');closePreview();" class="modal-btn modal-btn-danger"><i class="bi bi-trash"></i> ডিলিট</button>';
                    } else {
                        document.getElementById('previewBody').innerHTML = '<p style="color:#dc3545;text-align:center;">ডাটা লোড করা যায়নি</p>';
                    }
                }
            };
            xhr.send();
        }

        function closePreview() {
            document.getElementById('previewModal').classList.remove('show');
        }

        // Delete single NID with confirm
        function deleteNid(nid) {
            showConfirm(
                'NID ডিলিট করুন?',
                'NID ' + nid + ' এর সকল ডাটা মুছে যাবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।',
                function() {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', '?action=delete&nid=' + nid, true);
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            var res = JSON.parse(xhr.responseText);
                            showToast(res.message, res.success ? 'success' : 'error');
                            loadData();
                        }
                    };
                    xhr.send();
                }
            );
        }

        // Delete all
        function deleteAll() {
            showConfirm(
                'সব ডাটা ডিলিট করুন?',
                'সকল NID ডাটা চিরতরে মুছে যাবে! এটি পূর্বাবস্থায় ফেরানো যাবে না।',
                function() {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', '?action=delete_all', true);
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            var res = JSON.parse(xhr.responseText);
                            showToast(res.message, res.success ? 'success' : 'error');
                            loadData();
                            checkTimer();
                        }
                    };
                    xhr.send();
                }
            );
        }

        // Delete selected
        function deleteSelected() {
            var checkboxes = document.querySelectorAll('.nid-card-checkbox:checked');
            if (checkboxes.length === 0) {
                showToast('কোনো NID সিলেক্ট করা হয়নি', 'warning');
                return;
            }
            var nids = Array.from(checkboxes).map(function(cb) { return cb.value; });
            showConfirm(
                nids.length + 'টি NID ডিলিট করুন?',
                'সিলেক্টেড সকল NID ডাটা চিরতরে মুছে যাবে।',
                function() {
                    var nidsStr = nids.join(',');
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', '?action=delete_selected&nids=' + encodeURIComponent(nidsStr), true);
                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            var res = JSON.parse(xhr.responseText);
                            showToast(res.message, res.success ? 'success' : 'error');
                            loadData();
                            updateSelectedCount();
                        }
                    };
                    xhr.send();
                }
            );
        }

        // Update selected count
        function updateSelectedCount() {
            var count = document.querySelectorAll('.nid-card-checkbox:checked').length;
            document.getElementById('selectedCount').textContent = count;
            document.getElementById('selectedBarCount').textContent = count;
            var bar = document.getElementById('selectedBar');
            if (count > 0) { bar.classList.add('show'); } else { bar.classList.remove('show'); }
        }

        // Clear selection
        function clearSelection() {
            document.querySelectorAll('.nid-card-checkbox').forEach(function(cb) { cb.checked = false; });
            updateSelectedCount();
        }

        // Confirm dialog
        function showConfirm(title, msg, onConfirm) {
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMsg').textContent = msg;
            document.getElementById('confirmDialog').classList.add('show');
            document.getElementById('confirmYes').onclick = function() {
                closeConfirm();
                onConfirm();
            };
        }
        function closeConfirm() {
            document.getElementById('confirmDialog').classList.remove('show');
        }

        // Toggle timer section
        function toggleTimer() {
            var section = document.getElementById('timerSection');
            section.style.display = section.style.display === 'none' ? 'block' : 'none';
        }

        // Set timer
        function setTimer() {
            var type = document.getElementById('timerType').value;
            var value;
            if (type === 'date') {
                value = document.getElementById('timerDate').value;
                if (!value) { showToast('তারিখ সিলেক্ট করুন', 'warning'); return; }
            } else {
                value = document.getElementById('timerValue').value;
                if (!value || value < 1) { showToast('সঠিক সংখ্যা দিন', 'warning'); return; }
            }
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '?action=set_timer&timer_type=' + type + '&timer_value=' + encodeURIComponent(value), true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    showToast(res.message, res.success ? 'success' : 'error');
                    if (res.success) checkTimer();
                }
            };
            xhr.send();
        }

        // Cancel timer
        function cancelTimer() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '?action=cancel_timer', true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    showToast(res.message, res.success ? 'success' : 'warning');
                    checkTimer();
                }
            };
            xhr.send();
        }

        // Check timer
        function checkTimer() {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '?action=timer_status', true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    var res = JSON.parse(xhr.responseText);
                    if (res.active && res.timer) {
                        document.getElementById('timerSection').classList.add('timer-active');
                        document.getElementById('timerFormArea').style.display = 'none';
                        document.getElementById('timerActiveArea').style.display = 'block';
                        document.getElementById('timerLabel').textContent = res.timer.label + ' সব ডাটা ডিলিট হবে';
                        document.getElementById('timerStatus').textContent = res.timer.remaining_label;
                        startCountdown(res.timer.remaining);
                    } else {
                        document.getElementById('timerSection').classList.remove('timer-active');
                        document.getElementById('timerFormArea').style.display = 'block';
                        document.getElementById('timerActiveArea').style.display = 'none';
                        document.getElementById('timerStatus').textContent = 'নেই';
                        document.getElementById('countdownDisplay').textContent = '--:--:--';
                        if (res.expired) {
                            showToast('টাইমার শেষ! সব ডাটা ডিলিট হয়েছে', 'warning');
                            loadData();
                        }
                    }
                }
            };
            xhr.send();
        }

        // Countdown
        var countdownInterval = null;
        function startCountdown(seconds) {
            if (countdownInterval) clearInterval(countdownInterval);
            var remaining = seconds;
            function updateDisplay() {
                if (remaining <= 0) {
                    clearInterval(countdownInterval);
                    document.getElementById('countdownDisplay').textContent = 'শেষ!';
                    checkTimer();
                    loadData();
                    return;
                }
                var d = Math.floor(remaining / 86400);
                var h = Math.floor((remaining % 86400) / 3600);
                var m = Math.floor((remaining % 3600) / 60);
                var s = remaining % 60;
                var display = '';
                if (d > 0) display += d + 'দিন ';
                display += String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
                document.getElementById('countdownDisplay').textContent = display;
                remaining--;
            }
            updateDisplay();
            countdownInterval = setInterval(updateDisplay, 1000);
        }

        // Toast
        function showToast(message, type) {
            var container = document.getElementById('toastContainer');
            var toast = document.createElement('div');
            toast.className = 'toast toast-' + type;
            var icon = type === 'success' ? 'check-circle-fill' : type === 'error' ? 'x-circle-fill' : 'exclamation-triangle-fill';
            toast.innerHTML = '<i class="bi bi-' + icon + '"></i> ' + message;
            container.appendChild(toast);
            setTimeout(function() { toast.remove(); }, 4000);
        }

        // Close modal on overlay click
        document.getElementById('previewModal').addEventListener('click', function(e) {
            if (e.target === this) closePreview();
        });
        document.getElementById('confirmDialog').addEventListener('click', function(e) {
            if (e.target === this) closeConfirm();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closePreview();
                closeConfirm();
            }
        });

        // Initial load
        loadData();
        checkTimer();
        setInterval(checkTimer, 30000);
    </script>
</body>
</html>
