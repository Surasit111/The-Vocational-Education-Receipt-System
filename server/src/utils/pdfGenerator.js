import PDFDocument from 'pdfkit'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FONT_REGULAR = path.join(__dirname, '../../fonts/THSarabunNew.ttf')
const FONT_BOLD = path.join(__dirname, '../../fonts/THSarabunNew Bold.ttf')

export const generateReceiptPDF = async (receiptData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      })

      const chunks = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      doc.registerFont('THSarabun', FONT_REGULAR)
      doc.registerFont('THSarabunBold', FONT_BOLD)

      generatePage1(doc, receiptData)
      doc.addPage()
      generatePage2(doc, receiptData)

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// ฟังก์ชันสร้างหน้า 1
function generatePage1(doc, data) {
  const { receipt, paymentEntries } = data
  
  // ประกาศค่าคงที่สำหรับหน้ากระดาษ
  const pageWidth = 595  // A4 width
  const leftMargin = 50
  const rightMargin = 50

  // หัวข้อ
  doc.font('THSarabunBold').fontSize(22)
  doc.text('มหาวิทยาลัยราชภัฏเลย', { align: 'center' })
  doc.text('รายงานการปฏิบัติงานของกรรมการเจ้าหน้าที่', { align: 'center' })
  doc.moveDown(1)

  // 🟢 ภาคเรียนและปีการศึกษา - บรรทัดเดียวกัน พร้อมกรอบ /
  const lineY = doc.y
  doc.font('THSarabunBold').fontSize(16)
  doc.text('ภาคเรียนที่ ', 50, lineY, { continued: true })
  doc.font('THSarabun')
  doc.text(`${receipt.semester}`, { continued: true })
  // เว้น 1 แท็บ (ประมาณ 40px)
  doc.text('                    ', { continued: true })
  doc.font('THSarabunBold')
  doc.text('ปีการศึกษา ', { continued: true })
  doc.font('THSarabun')
  doc.text(`${receipt.academic_year}`, { continued: false })
  
  // 🟢 วาดกรอบสี่เหลี่ยม / และ กศ.พ. ชิดขวาสุด
  const boxWidth = 30 // เพิ่มจาก 20 เป็น 30 (ยาวขึ้น)
  const boxHeight = 20  // เพิ่มจาก 20 เป็น 25 (ใหญ่ขึ้น)

  // กศ.พ. ชิดขวาสุด
  doc.font('THSarabun').fontSize(16)
  const gkpText = 'กศ.พ.'
  const gkpWidth = doc.widthOfString(gkpText)
  const gkpX = pageWidth - rightMargin - gkpWidth

  // สี่เหลี่ยมอยู่ซ้ายของ กศ.พ. และเว้นออกมามากขึ้น
  const spacing = 15  // เว้นระยะประมาณ 3-4 spacebar
  const boxX = gkpX - boxWidth - spacing
  const boxY = lineY  // อยู่ระนาบเดียวกับข้อความ

  doc.lineWidth(0.5)  // ⭐ เพิ่มบรรทัดนี้
  doc.rect(boxX, boxY, boxWidth, boxHeight).stroke()
  doc.fontSize(16)
  // "/" อยู่ตรงกลางกรอบ
  doc.font('THSarabun')
  doc.text('/', boxX, boxY, { width: boxWidth, align: 'center' })

  // กศ.พ. ไม่หนา ชิดขวาสุด
  doc.font('THSarabun').fontSize(16)
  doc.text(gkpText, gkpX, lineY)

  // ชื่อผู้ปฏิบัติงาน - บรรทัดเดียวกัน
  doc.font('THSarabunBold').fontSize(16)
  doc.text('ชื่อผู้ปฏิบัติงาน', 50, doc.y, { continued: true })
  doc.font('THSarabun')
  doc.text(`  ${receipt.name_type}${receipt.payer_name}`)
  
  // ✅ แก้ไข: ปฏิบัติงานในหน่วยงาน - ใช้ agency แทน location
  doc.font('THSarabunBold')
  doc.text('ปฏิบัติงานในหน่วยงาน', 50, doc.y, { continued: true })
  doc.font('THSarabun')
  doc.text(`  ${receipt.agency}`)
  
  doc.moveDown(1)

  // 🟡 ตาราง - padding บน-ล่างพอดีกับข้อความ
  const tableTop = doc.y
  const tableLeft = 50
  const colWidths = [100, 80, 70, 70, 90, 85]
  doc.lineWidth(0.6)  // ⭐ เพิ่มบรรทัดนี้ก่อนวาดตาราง
  // หัวตาราง
  doc.font('THSarabunBold').fontSize(14)
  let xPos = tableLeft
  const headers = ['วัน เดือน ปี', 'ลายมือชื่อ', 'เวลามา', 'เวลากลับ', 'จำนวนเงิน', 'หมายเหตุ']
  
  const headerHeight = 20  // 🟡 ความสูงพอดีกับข้อความ
  const cellPadding = 3    // 🟡 padding บน-ล่าง
  
  headers.forEach((header, i) => {
    doc.rect(xPos, tableTop, colWidths[i], headerHeight).stroke()
    // จัดกึ่งกลาง ทั้ง X และ Y
    const textY = tableTop + cellPadding
    doc.text(header, xPos, textY, { width: colWidths[i], align: 'center' })
    xPos += colWidths[i]  
  })

  // ข้อมูลในตาราง
  doc.font('THSarabun').fontSize(14)
  let yPos = tableTop + headerHeight
  let totalAmount = 0

  const rowHeight = 20  // 🟡 ความสูงพอดีกับข้อความ

  paymentEntries.forEach((entry) => {
    const thaiDate = formatThaiDate(entry.payment_date)
    const amount = parseFloat(entry.amount)
    totalAmount += amount

    xPos = tableLeft
    const rowData = [
      thaiDate,
      '',
      '08.00 น.',
      '16.30 น.',
      amount.toString(),
      ''
    ]

    rowData.forEach((text, i) => {
      doc.rect(xPos, yPos, colWidths[i], rowHeight).stroke()
      // 🟡 จัดกึ่งกลางทั้ง X และ Y พร้อม padding
      const textY = yPos + cellPadding
      doc.text(text, xPos, textY, { width: colWidths[i], align: 'center' })
      xPos += colWidths[i]
    })

    yPos += rowHeight
  })

  // แถวรวม - รวมคอลัมน์ 0-3 และจัดกึ่งกลาง
  const mergedWidth = colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3]
  doc.font('THSarabunBold').fontSize(14)
  
  // วาดกรอบรวม
  doc.rect(tableLeft, yPos, mergedWidth, rowHeight).stroke()
  const textY = yPos + cellPadding
  doc.text('รวม', tableLeft, textY, { width: mergedWidth, align: 'center' })
  
  // คอลัมน์จำนวนเงิน
  xPos = tableLeft + mergedWidth
  doc.rect(xPos, yPos, colWidths[4], rowHeight).stroke()
  doc.text(totalAmount.toString(), xPos, textY, { width: colWidths[4], align: 'center' })
  
  // คอลัมน์หมายเหตุ
  xPos += colWidths[4]
  doc.rect(xPos, yPos, colWidths[5], rowHeight).stroke()

  // 🔵 ข้อความรับรอง + ลายเซ็น - จัดให้ตรงกันทั้งหมดตามอันที่ยาวที่สุด
  doc.moveDown(2)
  doc.font('THSarabun').fontSize(16)
  
  // เตรียมข้อความทั้งหมด
  const certifyText1 = `ขอรับรองว่า ${receipt.name_type}${receipt.payer_name}`
  const certifyText2 = 'ได้ปฏิบัติหน้าที่ตามวันและเวลาดังรายงานจริง'
  const signText = 'ลงชื่อ ......................................................'
  const nameText = `(${receipt.supervisor})`
  const positionText = `ตำแหน่ง ${receipt.supervisor_position}`

  // วัดความกว้างของทั้งหมด 5 บรรทัด
  const width1 = doc.widthOfString(certifyText1)
  const width2 = doc.widthOfString(certifyText2)
  const signWidth = doc.widthOfString(signText)
  const nameWidth = doc.widthOfString(nameText)
  const positionWidth = doc.widthOfString(positionText)
  
  // หาความกว้างสูงสุด
  const maxWidth = Math.max(width1, width2, signWidth, nameWidth, positionWidth)

  // คำนวณตำแหน่ง X ที่จะเริ่มต้นเพื่อให้ข้อความยาวสุดชิดขวา
  const startX = pageWidth - rightMargin - maxWidth

  // แสดงข้อความรับรอง (จัดกึ่งกลางตาม maxWidth)
  doc.text(certifyText1, startX, doc.y, { 
    width: maxWidth, 
    align: 'center' 
  })
  doc.text(certifyText2, startX, doc.y, { 
    width: maxWidth, 
    align: 'center' 
  })
  doc.moveDown(2)

  // แสดงลายเซ็น (จัดกึ่งกลางตาม maxWidth)
  doc.text(signText, startX, doc.y, {
    width: maxWidth,
    align: 'center'
  })
  doc.moveDown(0.2)
  doc.text(nameText, startX, doc.y, {
    width: maxWidth,
    align: 'center'
  })
  doc.moveDown(0.2)
  doc.text(positionText, startX, doc.y, {
    width: maxWidth,
    align: 'center'
  })
}

// ฟังก์ชันสร้างหน้า 2
function generatePage2(doc, data) {
  const { receipt, paymentEntries } = data
  const totalAmount = paymentEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0)
  const amountInWords = numberToThaiText(totalAmount)
  
  const pageWidth = 595  // A4 width
  const rightMargin = 50

  // หัวข้อ
  doc.font('THSarabunBold').fontSize(22)
  doc.text('ใบสำคัญรับเงิน', { align: 'center' })
  doc.moveDown(0.5)
  
  // ⭐ มหาวิทยาลัย - ชิดขวา ไม่ตัวหนา
  doc.font('THSarabun').fontSize(16)
  doc.text('มหาวิทยาลัยราชภัฏเลย', { align: 'right' })
  
  // ⭐ วันที่ - ชิดขวา ไม่เว้นบรรทัด
  const today = new Date()
  const thaiDateNow = formatThaiDateFull(today)
  doc.text(`วันที่ ${thaiDateNow}`, { align: 'right' })
  doc.moveDown()

  // ⭐ ข้าพเจ้า - ตัวหนา
  doc.font('THSarabunBold')
  doc.text('ข้าพเจ้า', 50, doc.y, { continued: true })
  doc.font('THSarabun')
  doc.text(`  ${receipt.name_type}${receipt.payer_name}`)
  
  // ✅ แก้ไข: ตำแหน่ง และ สังกัดหน่วยงาน - อยู่บรรทัดเดียวกัน
  doc.font('THSarabunBold')
  doc.text('ตำแหน่ง', 50, doc.y, { continued: true })
  doc.font('THSarabun')
  doc.text(`  ${receipt.location}          `, { continued: true })
  doc.font('THSarabunBold')
  doc.text('สังกัดหน่วยงาน', { continued: true })
  doc.font('THSarabun')
  doc.text(`  ${receipt.agency}`)
  
  // ⭐ ข้อความยาว - ย่อหน้า 1 แท็บ แต่บรรทัดถัดไปไม่เยื้อง
  doc.moveDown(0.5)
  const longText = `มหาวิทยาลัยราชภัฏเลย จังหวัดเลย ได้รับเงินจากมหาวิทยาลัยราชภัฏเลย กระทรวงการอุดมศึกษา วิทยาศาสตร์ วิจัยและนวัตกรรม (อว.) รายการดังต่อไปนี้`

  const firstLineIndent = 80
  const nextLineIndent = 50

  const words = longText.split(' ')
  let currentLine = ''
  let lines = []
  let isFirstLine = true

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const indent = isFirstLine ? firstLineIndent : nextLineIndent
    const maxWidth = pageWidth - rightMargin - indent
    
    if (doc.widthOfString(testLine) > maxWidth && currentLine !== '') {
      lines.push({ text: currentLine, indent: indent })
      currentLine = word
      isFirstLine = false
    } else {
      currentLine = testLine
    }
  })

  if (currentLine) {
    const indent = isFirstLine ? firstLineIndent : nextLineIndent
    lines.push({ text: currentLine, indent: indent })
  }

  lines.forEach(line => {
    doc.text(line.text, line.indent, doc.y, {
      width: pageWidth - rightMargin - line.indent,
      align: 'left'
    })
  })

  doc.moveDown()

  // ตาราง
  doc.lineWidth(0.6)
  const tableTop = doc.y
  const tableLeft = 50
  const tableWidth = 495

  doc.font('THSarabunBold').fontSize(14)

  const headerHeight = 20
  const cellPadding = 3

  // ⭐ แถวที่ 1: รายการ (รวม 2 แถว) และ จำนวนเงิน
  // คอลัมน์รายการ - รวมแถว (rowspan 2)
  doc.rect(tableLeft, tableTop, tableWidth * 0.7, headerHeight * 2).stroke()
  doc.text('รายการ', tableLeft, tableTop + headerHeight / 2, { 
    width: tableWidth * 0.7, 
    align: 'center' 
  })

  // คอลัมน์จำนวนเงิน (แถวที่ 1)
  doc.rect(tableLeft + tableWidth * 0.7, tableTop, tableWidth * 0.3, headerHeight).stroke()
  doc.text('จำนวนเงิน', tableLeft + tableWidth * 0.7, tableTop + cellPadding, { 
    width: tableWidth * 0.3, 
    align: 'center' 
  })

  // ⭐ แถวที่ 2: บาท และ สตางค์
  const subHeaderTop = tableTop + headerHeight

  doc.rect(tableLeft + tableWidth * 0.7, subHeaderTop, tableWidth * 0.15, headerHeight).stroke()
  doc.text('บาท', tableLeft + tableWidth * 0.7, subHeaderTop + cellPadding, { 
    width: tableWidth * 0.15, 
    align: 'center' 
  })

  doc.rect(tableLeft + tableWidth * 0.85, subHeaderTop, tableWidth * 0.15, headerHeight).stroke()
  doc.text('สตางค์', tableLeft + tableWidth * 0.85, subHeaderTop + cellPadding, { 
    width: tableWidth * 0.15, 
    align: 'center' 
  })

  // แถวข้อมูล
  doc.font('THSarabun').fontSize(14)
  let yPos = subHeaderTop + headerHeight
  const description = `ค่าตอบแทนฝ่ายดำเนินการ กศพ.ประจำภาคเรียนที่ ${receipt.semester} ปีการศึกษา ${receipt.academic_year}`

  const dataRowHeight = 25

  // รายการ - จัดซ้าย
  doc.rect(tableLeft, yPos, tableWidth * 0.7, dataRowHeight).stroke()
  doc.text(description, tableLeft + 5, yPos + cellPadding, { 
    width: tableWidth * 0.7 - 10,
    align: 'left'
  })

  // บาท - จัดกึ่งกลาง
  doc.rect(tableLeft + tableWidth * 0.7, yPos, tableWidth * 0.15, dataRowHeight).stroke()
  doc.text(totalAmount.toString(), tableLeft + tableWidth * 0.7, yPos + cellPadding, { 
    width: tableWidth * 0.15, 
    align: 'center' 
  })

  // สตางค์ - จัดกึ่งกลาง
  doc.rect(tableLeft + tableWidth * 0.85, yPos, tableWidth * 0.15, dataRowHeight).stroke()
  doc.text('-', tableLeft + tableWidth * 0.85, yPos + cellPadding, { 
    width: tableWidth * 0.15, 
    align: 'center' 
  })

  // ⭐ แถวรวมเงิน
  yPos += dataRowHeight
  const sumRowHeight = 20

  doc.font('THSarabunBold')
  doc.rect(tableLeft, yPos, tableWidth * 0.7, sumRowHeight).stroke()
  doc.text('รวมเงิน', tableLeft, yPos + cellPadding, { 
    width: tableWidth * 0.7, 
    align: 'center' 
  })

  doc.rect(tableLeft + tableWidth * 0.7, yPos, tableWidth * 0.15, sumRowHeight).stroke()
  doc.text(totalAmount.toString(), tableLeft + tableWidth * 0.7, yPos + cellPadding, { 
    width: tableWidth * 0.15, 
    align: 'center' 
  })

  doc.rect(tableLeft + tableWidth * 0.85, yPos, tableWidth * 0.15, sumRowHeight).stroke()
  doc.text('-', tableLeft + tableWidth * 0.85, yPos + cellPadding, { 
    width: tableWidth * 0.15, 
    align: 'center' 
  })

  // ⭐ จำนวนเงินตัวอักษร
  doc.moveDown(1)
  doc.font('THSarabun').fontSize(16)
  doc.text(`จำนวนเงิน ${totalAmount} บาท (${amountInWords})`, 50, doc.y)
  doc.moveDown(2)

  // ⭐ ลายเซ็น - ชิดขวาจัดกึ่งกลาง
  const sign1Text = '(ลงชื่อ) ............................................... ผู้รับเงิน'
  const sign2Text = '(ลงชื่อ) ............................................... ผู้จ่ายเงิน'

  const sign1Width = doc.widthOfString(sign1Text)
  const sign2Width = doc.widthOfString(sign2Text)
  const maxSignWidth = Math.max(sign1Width, sign2Width)

  const signStartX = pageWidth - rightMargin - maxSignWidth

  doc.text(sign1Text, signStartX, doc.y, {
    width: maxSignWidth,
    align: 'center'
  })
  doc.moveDown()
  doc.text(sign2Text, signStartX, doc.y, {
    width: maxSignWidth,
    align: 'center'
  })
}

// ฟังก์ชันแปลงวันที่
function formatThaiDate(dateString) {
  const date = new Date(dateString)
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 
                  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear() + 543
  return `${day} ${month} ${year}`
}

function formatThaiDateFull(date) {
  const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear() + 543
  return `${day} เดือน ${month} พ.ศ. ${year}`
}

function numberToThaiText(number) {
  const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
  
  if (number === 0) return 'ศูนย์บาทถ้วน'
  
  const num = Math.floor(number)
  const numStr = num.toString().split('').reverse()
  let result = ''

  for (let i = 0; i < numStr.length; i++) {
    const digit = parseInt(numStr[i])
    if (digit === 0) continue

    if (i === 0) {
      result = ones[digit] + result
    } else if (i === 1) {
      if (digit === 1) {
        result = 'สิบ' + result
      } else if (digit === 2) {
        result = 'ยี่สิบ' + result
      } else {
        result = ones[digit] + 'สิบ' + result
      }
    } else if (i === 2) {
      result = ones[digit] + 'ร้อย' + result
    } else if (i === 3) {
      result = ones[digit] + 'พัน' + result
    } else if (i === 4) {
      result = ones[digit] + 'หมื่น' + result
    } else if (i === 5) {
      result = ones[digit] + 'แสน' + result
    }
  }

  return result + 'บาทถ้วน'
}