<?php
/**
 * NID Card Downloader - PDF, DOCX, PNG, Print
 * ============================================
 * PDF:  html2canvas of nid_view.php card-container → jsPDF A4 (exact visual match)
 * PNG:  html2canvas of nid_view.php card-container → PNG (full A4 page)
 * Print: iframe.print() of nid_view.php
 * DOCX: A4 page with card layout, all images from server + JSON data
 *
 * No manual card HTML - everything from nid_view.php or JSON data
 */
$nid = isset($_GET['nid']) ? trim($_GET['nid']) : '';
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

if (empty($nid)) { header('Location: nid_make.php'); exit; }

$jsonFile = __DIR__ . '/Nid-Data/' . $nid . '.json';
if (!file_exists($jsonFile)) { header('Location: nid_make.php'); exit; }

$data = json_decode(file_get_contents($jsonFile), true);
if (!$data) { header('Location: nid_make.php'); exit; }

// Handle DOCX (server-side)
if ($action === 'docx') { generateDOCX($data, $nid); exit; }

// Default: show download page (PDF/PNG/Print are client-side)
showDownloadPage($data, $nid);


/* ======================================================================
   DOCX - A4 page with full NID card layout, all images, all data
   ====================================================================== */
function generateDOCX($data, $nid) {
    $tempDir = sys_get_temp_dir() . '/nid_docx_' . time() . '_' . rand(1000, 9999);
    mkdir($tempDir, 0755, true);
    $wordDir = $tempDir . '/word';
    mkdir($wordDir, 0755, true);

    // Save user images from JSON
    $photoBase64 = $data['photo_base64'] ?? '';
    $signBase64 = $data['sign_base64'] ?? '';
    $hasPhoto = !empty($photoBase64);
    $hasSign = !empty($signBase64);
    $photoRelId = ''; $signRelId = ''; $bdIconRelId = ''; $adminSignRelId = ''; $mududdronRelId = '';

    if ($hasPhoto) {
        file_put_contents($wordDir . '/media_photo.png', base64_decode($photoBase64));
    }
    if ($hasSign) {
        file_put_contents($wordDir . '/media_sign.png', base64_decode($signBase64));
    }

    // Copy server images
    $assetsDir = __DIR__ . '/assets/Images/';
    $hasBdIcon = file_exists($assetsDir . 'bangladeshicon.png');
    $hasAdminSign = file_exists($assetsDir . 'adminsign.jpg');
    $hasMududdron = file_exists($assetsDir . 'mududdron.png');

    if ($hasBdIcon)     copy($assetsDir . 'bangladeshicon.png', $wordDir . '/media_bdicon.png');
    if ($hasAdminSign)  copy($assetsDir . 'adminsign.jpg', $wordDir . '/media_adminsign.jpg');
    if ($hasMududdron)  copy($assetsDir . 'mududdron.png', $wordDir . '/media_mududdron.png');

    // [Content_Types].xml
    file_put_contents($tempDir . '/[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>');

    // _rels/.rels
    mkdir($tempDir . '/_rels', 0755, true);
    file_put_contents($tempDir . '/_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>');

    // word/_rels/document.xml.rels
    mkdir($wordDir . '/_rels', 0755, true);
    $docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>';

    $imgRid = 1;
    if ($hasPhoto)     { $imgRid++; $photoRelId     = 'rId' . $imgRid; $docRels .= "\n  <Relationship Id=\"{$photoRelId}\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"media_photo.png\"/>"; }
    if ($hasSign)      { $imgRid++; $signRelId      = 'rId' . $imgRid; $docRels .= "\n  <Relationship Id=\"{$signRelId}\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"media_sign.png\"/>"; }
    if ($hasBdIcon)    { $imgRid++; $bdIconRelId    = 'rId' . $imgRid; $docRels .= "\n  <Relationship Id=\"{$bdIconRelId}\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"media_bdicon.png\"/>"; }
    if ($hasAdminSign) { $imgRid++; $adminSignRelId = 'rId' . $imgRid; $docRels .= "\n  <Relationship Id=\"{$adminSignRelId}\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"media_adminsign.jpg\"/>"; }
    if ($hasMududdron) { $imgRid++; $mududdronRelId = 'rId' . $imgRid; $docRels .= "\n  <Relationship Id=\"{$mududdronRelId}\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/image\" Target=\"media_mududdron.png\"/>"; }

    $docRels .= "\n</Relationships>";
    file_put_contents($wordDir . '/_rels/document.xml.rels', $docRels);

    // word/styles.xml
    file_put_contents($wordDir . '/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="GovtTitle"><w:name w:val="GovtTitle"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="000000"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="GovtEn"><w:name w:val="GovtEn"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="20"/></w:pPr><w:rPr><w:sz w:val="18"/><w:color w:val="007700"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="CardTitle"><w:name w:val="CardTitle"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="60"/></w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="FieldLabel"><w:name w:val="FieldLabel"/><w:pPr><w:spacing w:after="10"/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="333333"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="FieldValue"><w:name w:val="FieldValue"/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:sz w:val="22"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="PropertyText"><w:name w:val="PropertyText"/><w:pPr><w:spacing w:after="40"/></w:pPr><w:rPr><w:sz w:val="16"/><w:color w:val="333333"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="BackField"><w:name w:val="BackField"/><w:pPr><w:spacing w:after="60"/></w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:style>
</w:styles>');

    // ---- Build document.xml ----
    // Helper: create inline image XML (namespaces hardcoded)
    $docxImg = function($relId, $cx, $cy, $id, $name) {
        return '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:noProof/></w:rPr>'
            . '<w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">'
            . '<wp:extent cx="' . $cx . '" cy="' . $cy . '"/>'
            . '<wp:docPr id="' . $id . '" name="' . $name . '"/>'
            . '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
            . '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="' . $id . '" name="' . $name . '"/><pic:cNvPicPr/></pic:nvPicPr>'
            . '<pic:blipFill><a:blip r:embed="' . $relId . '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
            . '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' . $cx . '" cy="' . $cy . '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>'
            . '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
    };

    // ========== FRONT SIDE CARD ==========
    // Header row: BD icon + Government text
    $headerContent = '';
    if ($hasBdIcon) {
        $headerContent .= '<w:tc><w:tcPr><w:tcW w:w="1200" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>';
        $headerContent .= $docxImg($bdIconRelId, '685800', '685800', '10', 'BDIcon');
        $headerContent .= '</w:tc>';
    }
    $headerContent .= '<w:tc><w:tcPr><w:tcW w:w="' . ($hasBdIcon ? '7800' : '9000') . '" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>';
    $headerContent .= '<w:p><w:pPr><w:pStyle w:val="GovtTitle"/></w:pPr><w:r><w:t>&#x0997;&#x09A3;&#x09AA;&#x09CD;&#x09B0;&#x099C;&#x09BE;&#x09A4;&#x09A8;&#x09CD;&#x09A4;&#x09CD;&#x09B0;&#x09C0; &#x09AC;&#x09BE;&#x0982;&#x09B2;&#x09BE;&#x09A6;&#x09C7;&#x09B6; &#x09B8;&#x09B0;&#x0995;&#x09BE;&#x09B0;</w:t></w:r></w:p>';
    $headerContent .= '<w:p><w:pPr><w:pStyle w:val="GovtEn"/></w:pPr><w:r><w:t>Government of the People\'s Republic of Bangladesh</w:t></w:r></w:p>';
    $headerContent .= '<w:p><w:pPr><w:pStyle w:val="CardTitle"/></w:pPr>';
    $headerContent .= '<w:r><w:rPr><w:color w:val="FF0000"/><w:sz w:val="18"/></w:rPr><w:t>National ID Card</w:t></w:r>';
    $headerContent .= '<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t> / </w:t></w:r>';
    $headerContent .= '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>&#x099C;&#x09BE;&#x09A4;&#x09C0;&#x09AF;&#x09BC; &#x09AA;&#x09B0;&#x09BF;&#x099A;&#x09AF;&#x09BC; &#x09AA;&#x09A4;&#x09CD;&#x09B0;</w:t></w:r>';
    $headerContent .= '</w:p></w:tc>';

    // Content row: Photo+Sign (left) + Data (right)
    $photoCell = '<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>';
    if ($hasPhoto) {
        $photoCell .= $docxImg($photoRelId, '1280160', '1463040', '1', 'Photo');
    }
    if ($hasSign) {
        $photoCell .= $docxImg($signRelId, '1280160', '457200', '2', 'Signature');
        $photoCell .= '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val="14"/><w:color w:val="666666"/></w:rPr><w:t>&#x09B8;&#x09CD;&#x09AC;&#x09BE;&#x0995;&#x09CD;&#x09B7;&#x09B0;</w:t></w:r></w:p>';
    }
    $photoCell .= '</w:tc>';

    // Data cell with ALL fields
    $dataCell = '<w:tc><w:tcPr><w:tcW w:w="6600" w:type="dxa"/></w:tcPr>';
    $frontFields = [
        ['label' => '&#x09A8;&#x09BE;&#x09AE;', 'value' => $data['name_bn'] ?? '', 'key' => 'name_bn'],
        ['label' => 'Name', 'value' => $data['name_en'] ?? '', 'key' => 'name_en'],
        ['label' => '&#x09AA;&#x09BF;&#x09A4;&#x09BE;', 'value' => $data['father'] ?? '', 'key' => 'father'],
        ['label' => '&#x09AE;&#x09BE;&#x09A4;&#x09BE;', 'value' => $data['mother'] ?? '', 'key' => 'mother'],
        ['label' => 'Date of Birth', 'value' => $data['dob'] ?? '', 'key' => 'dob'],
        ['label' => 'ID NO', 'value' => $data['nid'] ?? '', 'key' => 'nid'],
    ];
    foreach ($frontFields as $f) {
        if ($f['value'] === '') continue;
        $val = htmlspecialchars($f['value']);
        $valRpr = '<w:rPr><w:sz w:val="22"/></w:rPr>';
        if ($f['key'] === 'nid') $valRpr = '<w:rPr><w:b/><w:color w:val="FF0000"/><w:sz w:val="24"/></w:rPr>';
        if ($f['key'] === 'dob') $valRpr = '<w:rPr><w:color w:val="FF0000"/><w:sz w:val="22"/></w:rPr>';
        $dataCell .= '<w:p><w:pPr><w:pStyle w:val="FieldLabel"/></w:pPr><w:r><w:t>' . $f['label'] . ':</w:t></w:r></w:p>';
        $dataCell .= '<w:p><w:pPr><w:pStyle w:val="FieldValue"/></w:pPr><w:r>' . $valRpr . '<w:t>' . $val . '</w:t></w:r></w:p>';
    }
    $dataCell .= '</w:tc>';

    // ========== BACK SIDE CARD ==========
    $backRow1 = '<w:tc><w:tcPr><w:tcW w:w="9000" w:type="dxa"/></w:tcPr>';
    $backRow1 .= '<w:p><w:pPr><w:pStyle w:val="PropertyText"/></w:pPr><w:r><w:t>&#x098F;&#x0987; &#x0995;&#x09BE;&#x09B0;&#x09CD;&#x09A1;&#x099F;&#x09BF; &#x0997;&#x09A3;&#x09AA;&#x09CD;&#x09B0;&#x099C;&#x09BE;&#x09A4;&#x09A8;&#x09CD;&#x09A4;&#x09CD;&#x09B0;&#x09C0; &#x09AC;&#x09BE;&#x0982;&#x09B2;&#x09BE;&#x09A6;&#x09C7;&#x09B6; &#x09B8;&#x09B0;&#x0995;&#x09BE;&#x09B0;&#x09C7;&#x09B0; &#x09B8;&#x09AE;&#x09CD;&#x09AA;&#x09A4;&#x09CD;&#x09A4;&#x09BF;&#x0964; &#x0995;&#x09BE;&#x09B0;&#x09CD;&#x09A1;&#x099F;&#x09BF; &#x09AC;&#x09CD;&#x09AF;&#x09AC;&#x09B9;&#x09BE;&#x09B0;&#x0995;&#x09BE;&#x09B0;&#x09C0; &#x09AC;&#x09CD;&#x09AF;&#x09A4;&#x09C0;&#x09A4; &#x0985;&#x09A8;&#x09CD;&#x09AF; &#x0995;&#x09CB;&#x09A5;&#x09BE;&#x0993; &#x09AA;&#x09BE;&#x0993;&#x09AF;&#x09BC;&#x09BE; &#x0997;&#x09C7;&#x09B2;&#x09C7; &#x09A8;&#x09BF;&#x0995;&#x099F;&#x09B8;&#x09CD;&#x09A5; &#x09AA;&#x09CB;&#x09B8;&#x09CD;&#x099F; &#x0985;&#x09AB;&#x09BF;&#x09B8;&#x09C7; &#x099C;&#x09AE;&#x09BE; &#x09A6;&#x09C7;&#x09AC;&#x09BE;&#x09B0; &#x099C;&#x09A8;&#x09CD;&#x09AF; &#x0985;&#x09A8;&#x09C1;&#x09B0;&#x09CB;&#x09A7; &#x0995;&#x09B0;&#x09BE; &#x09B9;&#x09B2;&#x09CB;&#x0964;</w:t></w:r></w:p></w:tc>';

    $backRow2 = '<w:tc><w:tcPr><w:tcW w:w="9000" w:type="dxa"/></w:tcPr>';
    $backRow2 .= '<w:p><w:pPr><w:pStyle w:val="BackField"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>&#x09A0;&#x09BF;&#x0995;&#x09BE;&#x09A8;&#x09BE;: </w:t></w:r><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>' . htmlspecialchars($data['address'] ?? '') . '</w:t></w:r></w:p>';
    $backRow2 .= '<w:p><w:pPr><w:pStyle w:val="BackField"/></w:pPr>';
    $backRow2 .= '<w:r><w:rPr><w:b/><w:sz w:val="20"/></w:rPr><w:t>&#x09B0;&#x0995;&#x09CD;&#x09A4;&#x09C7;&#x09B0; &#x0997;&#x09CD;&#x09B0;&#x09C1;&#x09AA;/Blood Group: </w:t></w:r>';
    $backRow2 .= '<w:r><w:rPr><w:b/><w:color w:val="FF0000"/><w:sz w:val="20"/></w:rPr><w:t>' . htmlspecialchars($data['blood'] ?? '') . '</w:t></w:r>';
    $backRow2 .= '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>    &#x099C;&#x09A8;&#x09CD;&#x09AE;&#x09B8;&#x09CD;&#x09A5;&#x09BE;&#x09A8;: </w:t></w:r>';
    $backRow2 .= '<w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>' . htmlspecialchars($data['birth'] ?? '') . '</w:t></w:r></w:p></w:tc>';

    $backRow3 = '<w:tc><w:tcPr><w:tcW w:w="9000" w:type="dxa"/></w:tcPr>';
    if ($hasAdminSign) {
        $backRow3 .= '<w:p><w:pPr><w:jc w:val="left"/></w:pPr>' . substr($docxImg($adminSignRelId, '1280160', '457200', '3', 'AdminSign'), strlen('<w:p><w:pPr><w:jc w:val="center"/></w:pPr>')) . '</w:p>';
    }
    $backRow3 .= '<w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>&#x09AA;&#x09CD;&#x09B0;&#x09A6;&#x09BE;&#x09A8;&#x0995;&#x09BE;&#x09B0;&#x09C0; &#x0995;&#x09B0;&#x09CD;&#x09A4;&#x09C3;&#x09AA;&#x0995;&#x09CD;&#x09A4;&#x09C7;&#x09B0; &#x09B8;&#x09CD;&#x09AC;&#x09BE;&#x0995;&#x09CD;&#x09B7;&#x09B0;</w:t></w:r></w:p>';
    $backRow3 .= '<w:p><w:pPr><w:spacing w:after="40"/></w:pPr><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>&#x09AA;&#x09CD;&#x09B0;&#x09A6;&#x09BE;&#x09A8;&#x09C7;&#x09B0; &#x09A4;&#x09BE;&#x09B0;&#x09BF;&#x0996;: </w:t></w:r><w:r><w:rPr><w:sz w:val="20"/></w:rPr><w:t>' . htmlspecialchars($data['issue_date'] ?? '') . '</w:t></w:r></w:p>';
    $backRow3 .= '<w:p><w:pPr><w:spacing w:after="20"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="18"/><w:color w:val="333333"/></w:rPr><w:t>NID: ' . htmlspecialchars($data['nid'] ?? '') . '</w:t></w:r></w:p>';
    if ($hasMududdron) {
        $backRow3 .= '<w:p><w:pPr><w:jc w:val="right"/></w:pPr>' . substr($docxImg($mududdronRelId, '381000', '182880', '4', 'Mududdron'), strlen('<w:p><w:pPr><w:jc w:val="center"/></w:pPr>')) . '</w:p>';
    }
    $backRow3 .= '</w:tc>';

    // Extra fields
    $extraXml = '';
    $extraFields = ['pin' => 'PIN', 'gender' => 'Gender', 'created_at' => '&#x09A4;&#x09C8;&#x09B0;&#x09BF; &#x09A4;&#x09BE;&#x09B0;&#x09BF;&#x0996; (Created At)'];
    $knownKeys = ['name_bn','name_en','nid','pin','father','mother','dob','blood','address','birth','gender','issue_date','created_at','photo_base64','photo_type','sign_base64','sign_type'];
    foreach ($extraFields as $key => $label) {
        if (isset($data[$key]) && $data[$key] !== '') {
            $extraXml .= '<w:p><w:pPr><w:pStyle w:val="FieldLabel"/></w:pPr><w:r><w:t>' . $label . ':</w:t></w:r></w:p>';
            $extraXml .= '<w:p><w:pPr><w:pStyle w:val="FieldValue"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>' . htmlspecialchars($data[$key]) . '</w:t></w:r></w:p>';
        }
    }
    foreach ($data as $key => $val) {
        if (!in_array($key, $knownKeys) && !is_array($val) && $val !== '') {
            $extraXml .= '<w:p><w:pPr><w:pStyle w:val="FieldLabel"/></w:pPr><w:r><w:t>' . ucfirst(str_replace('_', ' ', $key)) . ':</w:t></w:r></w:p>';
            $extraXml .= '<w:p><w:pPr><w:pStyle w:val="FieldValue"/></w:pPr><w:r><w:rPr><w:sz w:val="22"/></w:rPr><w:t>' . htmlspecialchars($val) . '</w:t></w:r></w:p>';
        }
    }

    // Card border style
    $cardBorder = '<w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="999999"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="999999"/>';

    // Assemble full document
    $document = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>' . $cardBorder . '</w:tblBorders></w:tblPr>
      <w:tr><w:tcPr><w:gridSpan w:val="' . ($hasBdIcon ? '2' : '1') . '"/></w:tcPr>' . $headerContent . '</w:tr>
      <w:tr>' . $photoCell . $dataCell . '</w:tr>
    </w:tbl>
    <w:p><w:pPr><w:spacing w:after="200"/></w:pPr></w:p>
    <w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>' . $cardBorder . '</w:tblBorders></w:tblPr>
      <w:tr>' . $backRow1 . '</w:tr>
      <w:tr>' . $backRow2 . '</w:tr>
      <w:tr>' . $backRow3 . '</w:tr>
    </w:tbl>
    <w:p><w:pPr><w:spacing w:before="200"/></w:pPr></w:p>
    ' . $extraXml . '
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="850" w:right="850" w:bottom="850" w:left="850"/>
    </w:sectPr>
  </w:body>
</w:document>';

    file_put_contents($wordDir . '/document.xml', $document);

    // Create ZIP (DOCX)
    $docxFile = sys_get_temp_dir() . '/NID-' . $nid . '.docx';
    $zip = new ZipArchive();
    $zip->open($docxFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    addDirToZip($zip, $tempDir, strlen($tempDir) + 1);
    $zip->close();
    deleteDir($tempDir);

    header('Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    header('Content-Disposition: attachment; filename="NID-' . $nid . '.docx"');
    header('Content-Length: ' . filesize($docxFile));
    header('Cache-Control: no-cache, must-revalidate');
    readfile($docxFile);
    unlink($docxFile);
    exit;
}


/* ======================================================================
   Helpers
   ====================================================================== */
function addDirToZip($zip, $dir, $baseLen) {
    $handle = opendir($dir);
    while (($file = readdir($handle)) !== false) {
        if ($file == '.' || $file == '..') continue;
        $path = $dir . '/' . $file;
        $localPath = substr($path, $baseLen);
        if (is_dir($path)) { $zip->addEmptyDir($localPath); addDirToZip($zip, $path, $baseLen); }
        else { $zip->addFile($path, $localPath); }
    }
    closedir($handle);
}

function deleteDir($dir) {
    if (!is_dir($dir)) return;
    $files = array_diff(scandir($dir), ['.', '..']);
    foreach ($files as $file) { $path = $dir . '/' . $file; is_dir($path) ? deleteDir($path) : unlink($path); }
    rmdir($dir);
}


/* ======================================================================
   DOWNLOAD PAGE
   PDF & PNG: html2canvas of nid_view.php card-container (exact rendering)
   Print: iframe.print()
   ====================================================================== */
function showDownloadPage($data, $nid) {
?>
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="utf-8">
    <meta content="width=device-width, initial-scale=1.0" name="viewport">
    <title>NID কার্ড ডাউনলোড - <?php echo $nid; ?></title>
    <link href="https://surokkha.gov.bd/favicon.png" rel="icon">
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="assets/vendor/bootstrap-icons/bootstrap-icons.css" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Hind Siliguri', sans-serif; background: #f0f2f5; min-height: 100vh; }

        .download-bar {
            background: linear-gradient(135deg, #004d38 0%, #006a4e 50%, #00875a 100%);
            color: #fff; padding: 10px 20px;
            display: flex; align-items: center; justify-content: space-between;
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2); flex-wrap: wrap; gap: 10px;
        }
        .bar-left { display: flex; align-items: center; gap: 12px; }
        .bar-icon { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .bar-left h2 { font-size: 16px; font-weight: 700; }
        .bar-left small { display: block; font-size: 10px; opacity: 0.8; }
        .bar-nid-badge { background: rgba(255,255,255,0.15); padding: 4px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; font-family: monospace; }
        .bar-btns { display: flex; gap: 6px; flex-wrap: wrap; }
        .bar-btn {
            padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; cursor: pointer;
            display: flex; align-items: center; gap: 5px; font-family: 'Hind Siliguri', sans-serif; transition: all 0.2s;
            color: #fff; text-decoration: none;
        }
        .bar-btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
        .bar-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; }
        .btn-pdf { background: linear-gradient(135deg, #dc3545, #e74c3c); }
        .btn-print { background: linear-gradient(135deg, #198754, #20c997); }
        .btn-docx { background: linear-gradient(135deg, #2563eb, #3b82f6); }
        .btn-png { background: linear-gradient(135deg, #9333ea, #a855f7); }
        .btn-back { background: rgba(255,255,255,0.15); }

        .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }
        .status-dot.loading { background: #ffc107; animation: pulse 1s infinite; }
        .status-dot.ready { background: #28a745; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        .iframe-container { margin-top: 60px; width: 100%; height: calc(100vh - 60px); overflow: hidden; }
        .iframe-container iframe { width: 100%; height: 100%; border: none; }

        .loading-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; align-items: center; justify-content: center; }
        .loading-overlay.show { display: flex; }
        .loading-card { background: #fff; border-radius: 16px; padding: 30px 40px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .loading-card .spinner { width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top-color: #006a4e; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 15px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-card p { font-size: 14px; color: #333; font-weight: 500; }

        @media print { .download-bar { display: none !important; } .iframe-container { margin-top: 0; height: 100vh; } }
        @media (max-width: 768px) {
            .download-bar { padding: 8px 12px; } .bar-btn { padding: 6px 10px; font-size: 11px; }
            .bar-left h2 { font-size: 13px; } .bar-nid-badge { display: none; }
            .iframe-container { margin-top: 55px; height: calc(100vh - 55px); }
        }
    </style>
</head>
<body>

    <div class="download-bar no-print">
        <div class="bar-left">
            <div class="bar-icon"><i class="bi bi-download"></i></div>
            <div>
                <h2><span class="status-dot loading" id="statusDot"></span>NID কার্ড ডাউনলোড</h2>
                <small>আপনার জাতীয় পরিচয় পত্র ডাউনলোড করুন</small>
            </div>
            <span class="bar-nid-badge">NID: <?php echo $nid; ?></span>
        </div>
        <div class="bar-btns">
            <button onclick="downloadPDF()" class="bar-btn btn-pdf" id="btnPdf" disabled><i class="bi bi-file-earmark-pdf"></i> PDF</button>
            <button onclick="printCard()" class="bar-btn btn-print"><i class="bi bi-printer"></i> প্রিন্ট</button>
            <a href="downloader.php?action=docx&nid=<?php echo $nid; ?>" class="bar-btn btn-docx"><i class="bi bi-file-earmark-word"></i> DOCX</a>
            <button onclick="downloadPNG()" class="bar-btn btn-png" id="btnPng" disabled><i class="bi bi-image"></i> PNG</button>
            <a href="nid_view.php?nid=<?php echo $nid; ?>" class="bar-btn btn-back"><i class="bi bi-eye"></i> ভিউ</a>
        </div>
    </div>

    <div class="iframe-container">
        <iframe id="nidFrame" src="nid_view.php?nid=<?php echo $nid; ?>" onload="onIframeLoad()"></iframe>
    </div>

    <div class="loading-overlay" id="loadingOverlay">
        <div class="loading-card">
            <div class="spinner"></div>
            <p id="loadingText">ডাউনলোড হচ্ছে...</p>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script>
        var iframeReady = false;

        function onIframeLoad() {
            try {
                var iframeDoc = document.getElementById('nidFrame').contentDocument;
                if (iframeDoc.fonts && iframeDoc.fonts.ready) {
                    iframeDoc.fonts.ready.then(function() { markReady(); });
                } else {
                    setTimeout(markReady, 2500);
                }
            } catch(e) {
                setTimeout(markReady, 2500);
            }
        }

        function markReady() {
            iframeReady = true;
            var dot = document.getElementById('statusDot');
            dot.classList.remove('loading');
            dot.classList.add('ready');
            document.getElementById('btnPdf').disabled = false;
            document.getElementById('btnPng').disabled = false;
        }

        function showLoading(t) { document.getElementById('loadingText').textContent = t; document.getElementById('loadingOverlay').classList.add('show'); }
        function hideLoading() { document.getElementById('loadingOverlay').classList.remove('show'); }

        /* Get card-container (full A4 page) from iframe */
        function getCardContainer() {
            try {
                var iframe = document.getElementById('nidFrame');
                var doc = iframe.contentDocument || iframe.contentWindow.document;
                return doc.querySelector('.card-container');
            } catch(e) { return null; }
        }

        /* Capture card-container via html2canvas */
        function captureCard(callback) {
            var card = getCardContainer();
            if (!card) { alert('কার্ড পাওয়া যায়নি। কিছুক্ষণ পর আবার চেষ্টা করুন।'); return; }

            // Temporarily clean up styles for capture
            var origShadow = card.style.boxShadow;
            var origRadius = card.style.borderRadius;
            card.style.boxShadow = 'none';
            card.style.borderRadius = '0';

            html2canvas(card, {
                scale: 4,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            }).then(function(canvas) {
                card.style.boxShadow = origShadow;
                card.style.borderRadius = origRadius;
                callback(canvas);
            }).catch(function(err) {
                card.style.boxShadow = origShadow;
                card.style.borderRadius = origRadius;
                console.error('Capture error:', err);
                hideLoading();
                alert('ক্যাপচারে সমস্যা হয়েছে।');
            });
        }

        /* ========== PRINT ========== */
        function printCard() {
            var iframe = document.getElementById('nidFrame');
            try {
                var w = iframe.contentWindow || iframe.contentDocument.defaultView;
                w.focus(); w.print();
            } catch(e) { window.print(); }
        }

        /* ========== PNG - Full A4 page ========== */
        function downloadPNG() {
            if (!iframeReady) { alert('কার্ড লোড হচ্ছে, কিছুক্ষণ পর আবার চেষ্টা করুন।'); return; }
            showLoading('PNG তৈরি হচ্ছে (A4 সাইজ)...');
            captureCard(function(canvas) {
                var link = document.createElement('a');
                link.download = 'NID-<?php echo $nid; ?>.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
                hideLoading();
            });
        }

        /* ========== PDF - html2canvas → jsPDF A4 ========== */
        function downloadPDF() {
            if (!iframeReady) { alert('কার্ড লোড হচ্ছে, কিছুক্ষণ পর আবার চেষ্টা করুন।'); return; }
            showLoading('PDF তৈরি হচ্ছে (A4 সাইজ)...');
            captureCard(function(canvas) {
                var imgData = canvas.toDataURL('image/png');
                var pdf = new jspdf.jsPDF('p', 'mm', 'a4');

                var pageW = 210; // A4 width mm
                var pageH = 297; // A4 height mm

                // Calculate dimensions maintaining aspect ratio, fitting inside A4
                var imgW = canvas.width;
                var imgH = canvas.height;
                var ratio = imgW / imgH;
                var pdfRatio = pageW / pageH;

                var drawW, drawH, x, y;
                if (ratio > pdfRatio) {
                    // Image wider than A4 ratio - fit to width
                    drawW = pageW;
                    drawH = pageW / ratio;
                    x = 0;
                    y = (pageH - drawH) / 2;
                } else {
                    // Image taller than A4 ratio - fit to height
                    drawH = pageH;
                    drawW = pageH * ratio;
                    x = (pageW - drawW) / 2;
                    y = 0;
                }

                pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);
                pdf.save('NID-<?php echo $nid; ?>.pdf');
                hideLoading();
            });
        }
    </script>
</body>
</html>
<?php
}
