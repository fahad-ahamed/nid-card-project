<?php
/**
 * NID Card Viewer - View saved NID card by NID number
 */
$nid = isset($_GET['nid']) ? trim($_GET['nid']) : '';

if (empty($nid)) {
    header('Location: nid_make.php');
    exit;
}

$jsonFile = __DIR__ . '/Nid-Data/' . $nid . '.json';

if (!file_exists($jsonFile)) {
    header('Location: nid_make.php');
    exit;
}

$data = json_decode(file_get_contents($jsonFile), true);

if (!$data) {
    header('Location: nid_make.php');
    exit;
}

$formData = $data;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>nid-<?php echo $data['nid']; ?></title>
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
            <a href="downloader.php?nid=<?php echo $data['nid']; ?>" class="btn-download"><i class="bi bi-download"></i> ডাউনলোড করুন</a>
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
                                                        $photo_src = 'assets/Images/notfound.png';
                                                        if (!empty($data['photo_base64'])) {
                                                            $photo_src = 'data:' . $data['photo_type'] . ';base64,' . $data['photo_base64'];
                                                        }
                                                        ?>
                                                        <img style="margin-top:-2px" id="userPhoto" class="w-[68.2px] h-[78px]" alt="photo" src="<?php echo $photo_src; ?>" />
                                                        <div class="text-center text-xs flex items-start justify-center pt-[5px] w-[68.2px] mx-auto h-[38.5px] overflow-hidden" id="card_signature">
                                                            <?php
                                                            $sign_src = 'assets/Images/notfound.png';
                                                            if (!empty($data['sign_base64'])) {
                                                                $sign_src = 'data:' . $data['sign_type'] . ';base64,' . $data['sign_base64'];
                                                            }
                                                            ?>
                                                            <img id="sign" src="<?php echo $sign_src; ?>" alt="sign" />
                                                        </div>
                                                    </div>
                                                    <div class="w-full relative z-50">
                                                        <div style="height:5px"></div>
                                                        <div class="flex flex-col gap-y-[10px]" style="margin-top: 1px;">
                                                            <div><p class="space-x-4 leading-3" style="padding-left:1px"><span class="bn" style="font-size:16.53px">নাম:</span><span class="" style="font-size:16.53px;padding-left:3px;-webkit-text-stroke:0.4px black" id="nameBn"><?php echo $data['name_bn']; ?></span></p></div>
                                                            <div style="margin-top: 1px;"><p class="space-x-2 leading-3" style="margin-bottom:-1.4px;margin-top:1.4px;padding-left:1px"><span style="font-size:11px">Name:</span><span style="font-size:12.73px;padding-left:1px" id="nameEn"><?php echo $data['name_en']; ?></span></p></div>
                                                            <div style="margin-top: 1px;"><p class="bn space-x-3 leading-3" style="padding-left:1px"><span id="fatherOrHusband" style="font-size:14px">পিতা: </span><span style="font-size:14px;transform:scaleX(0.724)" id="card_father_name"><?php echo $data['father']; ?></span></p></div>
                                                            <div style="margin-top: 1px;"><p class="bn space-x-3 leading-3" style="margin-top:-2.5px;padding-left:1px"><span style="font-size:14px">মাতা: </span><span style="font-size:14px;transform:scaleX(0.724)" id="card_mother_name"><?php echo $data['mother']; ?></span></p></div>
                                                            <div class="leading-4" style="font-size:12px;margin-top:-1.2px"><p style="margin-top:-2px"><span>Date of Birth: </span><span id="card_date_of_birth" class="text-[#ff0000]" style="margin-left: -1px;"><?php echo $data['dob']; ?></span></p></div>
                                                            <div class="-mt-0.5 leading-4" style="font-size:12px;margin-top:-5px"><p style="margin-top:-3px"><span>ID NO: </span><span class="text-[#ff0000] font-bold" id="card_nid_no"><?php echo $data['nid']; ?></span></p></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- BACK SIDE -->
                                            <div id="nid_back" class="border-[1.999px] border-[#000]" style="width:85.6mm;min-width:85.6mm;">
                                                <header style="height:32px;display:flex;align-items:center;padding:0 8px;letter-spacing:0.05px;text-align:left;">
                                                    <p class="bn" style="line-height:13px;font-size:11.33px;letter-spacing:0.05px;margin:0;">এই কার্ডটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সম্পত্তি। কার্ডটি ব্যবহারকারী ব্যতীত অন্য কোথাও পাওয়া গেলে নিকটস্থ পোস্ট অফিসে জমা দেবার জন্য অনুরোধ করা হলো।</p>
                                                </header>
                                                <div style="width:100%;margin-left:0;border-bottom:1.999px solid black;"></div>
                                                <div style="padding:3px 4px;height:66px;position:relative;font-size:12px;">
                                                    <div class="back-address-row">
                                                        <span class="back-address-label bn">ঠিকানা:</span>
                                                        <span class="back-address-value bn" id="card_address"><?php echo $data['address']; ?></span>
                                                    </div>
                                                    <div class="back-bottom-row" style="margin-top:auto;position:absolute;bottom:1.08px;left:0;right:0;">
                                                        <p class="bn back-info-line" style="margin-bottom:0px;padding-left:6px;font-weight:500;">
                                                            <span style="font-size:11.6px">রক্তের গ্রুপ</span><span style="display:inline-block;width:3px;"></span><span style="font-size:11px;font-family:arial;">/</span><span style="display:inline-block;width:3px;"></span><span style="font-size:9px">Blood Group:</span><b style="font-size:9.33px;margin-bottom:-3px;display:inline-block;color:#ff0000;margin-left:4px;margin-right:10px;font-weight:bold;" id="card_blood"><?php echo $data['blood']; ?></b><span style="font-size:10.66px">জন্মস্থান:</span><span style="display:inline-block;width:3px;"></span><span style="font-size:10.66px;" id="card_birth_place"><?php echo $data['birth']; ?></span>
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
                                                        <span class="bn" style="font-size:12px;padding-right:16px;padding-top:1px;">প্রদানের তারিখ:<span style="margin-left:10px;" id="card_date"><?php echo isset($data['issue_date']) ? $data['issue_date'] : ''; ?></span></span>
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
        window.onload = function() {
            var hub3_code = '<pin><?php echo $data["pin"]; ?></pin><name><?php echo $data["name_en"]; ?></name><DOB><?php echo $data["dob"]; ?>/DOB><FP></FP><F>Right Index</F><TYPE>A</TYPE><V>2.0</V><ds>302c0214103fc01240542ed736c0b48858c1c03d80006215021416e73728de9618fedcd368c88d8f3a2e72096d</ds>';
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

            // Use saved issue_date instead of today's date (card created date should not change)
            var savedIssueDate = <?php echo json_encode(isset($data['issue_date']) ? $data['issue_date'] : ''); ?>;
            if (savedIssueDate) {
                var finalEnlishToBanglaNumber = {'0':'\u09E6','1':'\u09E7','2':'\u09E8','3':'\u09E9','4':'\u09EA','5':'\u09EB','6':'\u09EC','7':'\u09ED','8':'\u09EE','9':'\u09EF'};
                String.prototype.getDigitBanglaFromEnglish = function() { var retStr = this; for (var x in finalEnlishToBanglaNumber) { retStr = retStr.replace(new RegExp(x, 'g'), finalEnlishToBanglaNumber[x]); } return retStr; };
                document.getElementById("card_date").innerHTML = savedIssueDate.getDigitBanglaFromEnglish();
            }

            // Auto-print if print=1 parameter
            if (window.location.search.indexOf('print=1') !== -1) {
                setTimeout(function() { window.print(); }, 800);
            }
        }
    </script>
    <script src="assets/JavaScript/bcmath-min.js" type="text/javascript"></script>
    <script src="assets/JavaScript/pdf417-min.js" type="text/javascript"></script>
    
</body>
</html>