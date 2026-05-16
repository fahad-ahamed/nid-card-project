<?php
header('Content-Type: application/json; charset=utf-8');

$search = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($search)) {
    echo json_encode(['found' => false, 'message' => 'অনুসন্দান করুন']);
    exit;
}

$dataDir = __DIR__ . '/Nid-Data/';

if (!is_dir($dataDir)) {
    echo json_encode(['found' => false, 'message' => 'কোনো তথ্য পাওয়া যায়নি']);
    exit;
}

// Search by NID number (exact match with filename)
$nidFile = $dataDir . $search . '.json';
if (file_exists($nidFile)) {
    $data = json_decode(file_get_contents($nidFile), true);
    echo json_encode(['found' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

// Search by PIN - scan all files
$files = glob($dataDir . '*.json');
foreach ($files as $file) {
    $data = json_decode(file_get_contents($file), true);
    if (isset($data['pin']) && $data['pin'] === $search) {
        echo json_encode(['found' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

echo json_encode(['found' => false, 'message' => 'কোনো তথ্য পাওয়া যায়নি']);
