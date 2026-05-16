import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getCardByNid } from '@/lib/store';
import { readFile } from 'fs/promises';
import path from 'path';

// Helper: escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface ImageAsset {
  data: Buffer | null;
}

async function loadImageAsset(relativePath: string): Promise<ImageAsset> {
  try {
    const filePath = path.join(process.cwd(), 'public', relativePath);
    const data = await readFile(filePath);
    return { data };
  } catch {
    return { data: null };
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nid = searchParams.get('nid');

    if (!nid) {
      return NextResponse.json(
        { success: false, message: 'NID parameter is required' },
        { status: 400 }
      );
    }

    const card = getCardByNid(nid);
    if (!card) {
      return NextResponse.json(
        { success: false, message: 'NID card not found' },
        { status: 404 }
      );
    }

    // Load static image assets
    const [bdIconAsset, adminSignAsset, mududdronAsset] = await Promise.all([
      loadImageAsset('/assets/Images/bangladeshicon.png'),
      loadImageAsset('/assets/Images/adminsign.jpg'),
      loadImageAsset('/assets/Images/mududdron.png'),
    ]);

    // Prepare user images
    const hasPhoto = !!(card.photoBase64);
    const hasSign = !!(card.signBase64);
    const hasBdIcon = bdIconAsset.data !== null;
    const hasAdminSign = adminSignAsset.data !== null;

    // Build relationship IDs
    let rIdCounter = 1;
    const rels: Array<{ id: string; target: string; type: string }> = [];

    // Always add styles relationship
    const stylesRId = `rId${rIdCounter++}`;
    rels.push({ id: stylesRId, target: 'styles.xml', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles' });

    const photoRId = hasPhoto ? `rId${rIdCounter++}` : null;
    if (photoRId) rels.push({ id: photoRId, target: 'media_photo.png', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' });

    const signRId = hasSign ? `rId${rIdCounter++}` : null;
    if (signRId) rels.push({ id: signRId, target: 'media_sign.png', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' });

    const bdIconRId = hasBdIcon ? `rId${rIdCounter++}` : null;
    if (bdIconRId) rels.push({ id: bdIconRId, target: 'media_bdicon.png', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' });

    const adminSignRId = hasAdminSign ? `rId${rIdCounter++}` : null;
    if (adminSignRId) rels.push({ id: adminSignRId, target: 'media_adminsign.jpg', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' });

    // ===== Build Content_Types.xml =====
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

    // ===== Build _rels/.rels =====
    const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    // ===== Build word/_rels/document.xml.rels =====
    // (will be rebuilt after all images including mududdron are added to rels)

    // ===== Build word/styles.xml =====
    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial"/>
        <w:sz w:val="20"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:styleId="CardTitle">
    <w:name w:val="CardTitle"/>
    <w:pPr><w:jc w:val="center"/></w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:color w:val="006A4E"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Label">
    <w:name w:val="Label"/>
    <w:rPr>
      <w:b/>
      <w:sz w:val="18"/>
      <w:color w:val="333333"/>
    </w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Value">
    <w:name w:val="Value"/>
    <w:rPr>
      <w:sz w:val="18"/>
      <w:color w:val="000000"/>
    </w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="NIDCardTable">
    <w:name w:val="NIDCardTable"/>
    <w:tblPr>
      <w:tblBorders>
        <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
      </w:tblBorders>
    </w:tblPr>
  </w:style>
</w:styles>`;

    // ===== Build word/document.xml =====
    // OOXML table dimensions: card is ~85.6mm x 53.98mm (credit card size)
    // In twips: 1mm ≈ 56.7 twips, so 85.6mm ≈ 4854 twips, 53.98mm ≈ 3061 twips

    const cardWidthTwips = 4854; // ~85.6mm
    const photoWidthTwips = 1100; // ~19.4mm
    const photoHeightTwips = 1260; // ~22.2mm
    const signWidthTwips = 1100;
    const signHeightTwips = 620;
    const bdIconWidthTwips = 700;
    const bdIconHeightTwips = 700;
    const adminSignWidthTwips = 1200;
    const adminSignHeightTwips = 400;
    const mududdronWidthTwips = 500;
    const mududdronHeightTwips = 250;

    // Helper to create an image run
    function imageRun(rId: string, cx: number, cy: number): string {
      // cx, cy in twips, need to convert to EMU (1 twip = 635 EMU)
      const cxEmu = cx * 635;
      const cyEmu = cy * 635;
      return `<w:r><w:rPr><w:noProof/></w:rPr><w:drawing>` +
        `<wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">` +
        `<wp:extent cx="${cxEmu}" cy="${cyEmu}"/>` +
        `<wp:docPr id="1" name="Image"/>` +
        `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">` +
        `<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
        `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">` +
        `<pic:nvPicPr><pic:cNvPr id="0" name="Image"/><pic:cNvPicPr/></pic:nvPicPr>` +
        `<pic:blipFill><a:blip r:embed="${rId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
        `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cxEmu}" cy="${cyEmu}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
        `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
    }

    // Helper for text run
    function textRun(text: string, bold = false, fontSize = 18, color = '000000', font = 'Arial'): string {
      return `<w:r><w:rPr>` +
        (bold ? `<w:b/>` : '') +
        `<w:sz w:val="${fontSize}"/><w:szCs w:val="${fontSize}"/>` +
        `<w:color w:val="${color}"/>` +
        `<w:rFonts w:ascii="${font}" w:hAnsi="${font}" w:cs="${font}"/>` +
        `</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
    }

    // Helper for Bengali text run
    function bnTextRun(text: string, bold = false, fontSize = 18, color = '000000'): string {
      return `<w:r><w:rPr>` +
        (bold ? `<w:b/>` : '') +
        `<w:sz w:val="${fontSize}"/><w:szCs w:val="${fontSize}"/>` +
        `<w:color w:val="${color}"/>` +
        `<w:rFonts w:ascii="Kalpurush" w:hAnsi="Kalpurush" w:cs="Kalpurush"/>` +
        `</w:rPr><w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r>`;
    }

    // Helper for paragraph
    function paragraph(runs: string, alignment: 'left' | 'center' | 'right' = 'left', spacingBefore = 0, spacingAfter = 0): string {
      return `<w:p><w:pPr>` +
        `<w:jc w:val="${alignment}"/>` +
        `<w:spacing w:before="${spacingBefore}" w:after="${spacingAfter}" w:line="240" w:lineRule="auto"/>` +
        `</w:pPr>${runs}</w:p>`;
    }

    // ===== FRONT CARD TABLE =====
    // Row 1: Header - BD Icon + Government text
    const frontHeaderCell1 = hasBdIcon
      ? `<w:tc><w:tcPr><w:tcW w:w="${bdIconWidthTwips}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>` +
        `<w:p><w:pPr><w:jc w:val="center"/></w:pPr>${imageRun(bdIconRId!, bdIconWidthTwips, bdIconHeightTwips)}</w:p></w:tc>`
      : `<w:tc><w:tcPr><w:tcW w:w="${bdIconWidthTwips}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>` +
        `<w:p><w:pPr><w:jc w:val="center"/></w:pPr></w:p></w:tc>`;

    const frontHeaderCell2 = `<w:tc><w:tcPr><w:tcW w:w="${cardWidthTwips - bdIconWidthTwips}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>` +
      paragraph(bnTextRun('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', true, 24, '000000'), 'center', 0, 0) +
      paragraph(textRun('Government of the People\'s Republic of Bangladesh', false, 16, '007700'), 'center', 0, 0) +
      paragraph(
        textRun('National ID Card', false, 14, 'FF0002') +
        textRun(' / ', false, 16, '000000') +
        bnTextRun('জাতীয় পরিচয় পত্র', false, 18, '000000'),
        'center', 0, 0
      ) +
      `</w:tc>`;

    const frontHeaderRow = `<w:tr>${frontHeaderCell1}${frontHeaderCell2}</w:tr>`;

    // Row 2: Photo+Signature | Data fields
    const photoContent = hasPhoto
      ? imageRun(photoRId!, photoWidthTwips, photoHeightTwips)
      : textRun('[Photo]', false, 16, '999999');

    const signContent = hasSign
      ? imageRun(signRId!, signWidthTwips, signHeightTwips)
      : textRun('[Signature]', false, 14, '999999');

    const dataWidthTwips = cardWidthTwips - photoWidthTwips - 200;

    const frontDataCell = `<w:tc><w:tcPr><w:tcW w:w="${dataWidthTwips}" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>` +
      paragraph(bnTextRun('নাম: ', true, 18, '000000') + bnTextRun(card.nameBn, false, 18, '000000'), 'left', 40, 0) +
      paragraph(textRun('Name: ', true, 16, '000000') + textRun(card.nameEn, false, 16, '000000'), 'left', 40, 0) +
      paragraph(bnTextRun('পিতা: ', true, 16, '000000') + bnTextRun(card.father, false, 16, '000000'), 'left', 40, 0) +
      paragraph(bnTextRun('মাতা: ', true, 16, '000000') + bnTextRun(card.mother, false, 16, '000000'), 'left', 40, 0) +
      paragraph(textRun('Date of Birth: ', true, 16, '000000') + textRun(card.dob, false, 16, 'FF0000'), 'left', 40, 0) +
      paragraph(textRun('ID NO: ', true, 16, '000000') + textRun(card.nid, true, 16, 'FF0000'), 'left', 40, 0) +
      `</w:tc>`;

    const frontPhotoCell = `<w:tc><w:tcPr><w:tcW w:w="${photoWidthTwips + 200}" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>` +
      paragraph(photoContent, 'center', 0, 0) +
      paragraph(signContent, 'center', 0, 0) +
      `</w:tc>`;

    const frontDataRow = `<w:tr>${frontPhotoCell}${frontDataCell}</w:tr>`;

    // ===== BACK CARD TABLE =====
    // Row 1: Property text
    const backPropertyRow = `<w:tc><w:tcPr><w:tcW w:w="${cardWidthTwips}" w:type="dxa"/></w:tcPr>` +
      paragraph(
        bnTextRun('এই কার্ডটি গণপ্রজাতন্ত্রী বাংলাদেশ সরকারের সম্পত্তি। কার্ডটি ব্যবহারকারী ব্যতীত অন্য কোথাও পাওয়া গেলে নিকটস্থ পোস্ট অফিসে বা নির্বাচন কমিশন অফিসে পাঠিয়ে দিন।', false, 14, '333333'),
        'left', 0, 0
      ) +
      `</w:tc>`;
    const backPropertyRowWrap = `<w:tr>${backPropertyRow}</w:tr>`;

    // Row 2: Address, Blood Group, Birth Place
    const addressWidth = Math.floor(cardWidthTwips * 0.5);
    const bloodWidth = Math.floor(cardWidthTwips * 0.25);
    const birthWidth = cardWidthTwips - addressWidth - bloodWidth;

    const backInfoRow = `<w:tr>` +
      `<w:tc><w:tcPr><w:tcW w:w="${addressWidth}" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>` +
      paragraph(bnTextRun('ঠিকানা: ', true, 16, '000000') + bnTextRun(card.address, false, 16, '000000'), 'left', 40, 0) +
      `</w:tc>` +
      `<w:tc><w:tcPr><w:tcW w:w="${bloodWidth}" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>` +
      paragraph(bnTextRun('রক্তের গ্রুপ: ', true, 16, '000000') + textRun(card.blood, true, 16, '000000'), 'left', 40, 0) +
      `</w:tc>` +
      `<w:tc><w:tcPr><w:tcW w:w="${birthWidth}" w:type="dxa"/><w:vAlign w:val="top"/></w:tcPr>` +
      paragraph(bnTextRun('জন্মস্থান: ', true, 16, '000000') + bnTextRun(card.birthPlace, false, 16, '000000'), 'left', 40, 0) +
      `</w:tc>` +
      `</w:tr>`;

    // Row 3: Admin signature + Issue date + Mududdron
    const adminSignCell = hasAdminSign
      ? `<w:tc><w:tcPr><w:tcW w:w="${adminSignWidthTwips}" w:type="dxa"/><w:vAlign w:val="bottom"/></w:tcPr>` +
        paragraph(imageRun(adminSignRId!, adminSignWidthTwips, adminSignHeightTwips), 'left', 0, 0) +
        paragraph(bnTextRun('প্রদানকারী কর্তৃপক্ষের স্বাক্ষর', false, 12, '666666'), 'left', 0, 0) +
        `</w:tc>`
      : `<w:tc><w:tcPr><w:tcW w:w="${adminSignWidthTwips}" w:type="dxa"/><w:vAlign w:val="bottom"/></w:tcPr>` +
        paragraph(bnTextRun('প্রদানকারী কর্তৃপক্ষের স্বাক্ষর', false, 12, '666666'), 'left', 0, 0) +
        `</w:tc>`;

    const issueDateCell = `<w:tc><w:tcPr><w:tcW w:w="${cardWidthTwips - adminSignWidthTwips - mududdronWidthTwips}" w:type="dxa"/><w:vAlign w:val="bottom"/></w:tcPr>` +
      paragraph(bnTextRun('প্রদানের তারিখ: ', true, 14, '000000') + bnTextRun(card.issueDate, false, 14, '000000'), 'right', 0, 0) +
      `</w:tc>`;

    const mududdronCell = mududdronAsset.data
      ? `<w:tc><w:tcPr><w:tcW w:w="${mududdronWidthTwips}" w:type="dxa"/><w:vAlign w:val="bottom"/></w:tcPr>` +
        paragraph(imageRun('rIdMududdron', mududdronWidthTwips, mududdronHeightTwips), 'right', 0, 0) +
        `</w:tc>`
      : `<w:tc><w:tcPr><w:tcW w:w="${mududdronWidthTwips}" w:type="dxa"/></w:tcPr>` +
        `<w:p></w:p></w:tc>`;

    const backSignRow = `<w:tr>${adminSignCell}${issueDateCell}${mududdronCell}</w:tr>`;

    // Add mududdron to rels if present
    if (mududdronAsset.data) {
      rels.push({ id: 'rIdMududdron', target: 'media_mududdron.png', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' });
      // Rebuild docRelsXml with mududdron
    }

    // Rebuild document.xml.rels with all relationships (including mududdron)
    const finalDocRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${rels.map(r => `  <Relationship Id="${r.id}" Type="${r.type}" Target="${r.target}"/>`).join('\n')}
</Relationships>`;

    // ===== Assemble document.xml =====
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    <!-- Front Card Title -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="200" w:after="100"/>
      </w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/><w:color w:val="006A4E"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr>
      <w:t>Front Side / সামনের দিক</w:t></w:r>
    </w:p>

    <!-- Front Card Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="${cardWidthTwips}" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="40" w:type="dxa"/>
          <w:left w:w="80" w:type="dxa"/>
          <w:bottom w:w="40" w:type="dxa"/>
          <w:right w:w="80" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      ${frontHeaderRow}
      ${frontDataRow}
    </w:tbl>

    <!-- Spacer -->
    <w:p><w:pPr><w:spacing w:before="400" w:after="100"/></w:pPr></w:p>

    <!-- Back Card Title -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:before="200" w:after="100"/>
      </w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/><w:color w:val="006A4E"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr>
      <w:t>Back Side / পেছনের দিক</w:t></w:r>
    </w:p>

    <!-- Back Card Table -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="${cardWidthTwips}" w:type="dxa"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
        <w:tblCellMar>
          <w:top w:w="40" w:type="dxa"/>
          <w:left w:w="80" w:type="dxa"/>
          <w:bottom w:w="40" w:type="dxa"/>
          <w:right w:w="80" w:type="dxa"/>
        </w:tblCellMar>
      </w:tblPr>
      ${backPropertyRowWrap}
      ${backInfoRow}
      ${backSignRow}
    </w:tbl>

    <!-- Footer info -->
    <w:p><w:pPr><w:spacing w:before="400"/></w:pPr></w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:sz w:val="16"/><w:szCs w:val="16"/><w:color w:val="999999"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/></w:rPr>
      <w:t>NID Card generated by NID Card System | Election Commission Bangladesh</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

    // ===== Create DOCX with JSZip =====
    const zip = new JSZip();

    // Add XML files
    zip.file('[Content_Types].xml', contentTypesXml);
    zip.file('_rels/.rels', rootRelsXml);
    zip.file('word/document.xml', documentXml);
    zip.file('word/styles.xml', stylesXml);
    zip.file('word/_rels/document.xml.rels', finalDocRelsXml);

    // Add user images
    if (hasPhoto && card.photoBase64) {
      const photoBuffer = Buffer.from(card.photoBase64, 'base64');
      zip.file('word/media_photo.png', photoBuffer);
    }

    if (hasSign && card.signBase64) {
      const signBuffer = Buffer.from(card.signBase64, 'base64');
      zip.file('word/media_sign.png', signBuffer);
    }

    // Add static images
    if (hasBdIcon && bdIconAsset.data) {
      zip.file('word/media_bdicon.png', bdIconAsset.data);
    }

    if (hasAdminSign && adminSignAsset.data) {
      zip.file('word/media_adminsign.jpg', adminSignAsset.data);
    }

    if (mududdronAsset.data) {
      zip.file('word/media_mududdron.png', mududdronAsset.data);
    }

    // Generate the DOCX file (ZIP)
    const docxBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    // Return the DOCX as a downloadable response
    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="NID-${escapeXml(nid)}.docx"`,
        'Content-Length': docxBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('DOCX generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate DOCX file' },
      { status: 500 }
    );
  }
}
