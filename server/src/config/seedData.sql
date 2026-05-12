-- 1. Seed Categories
INSERT INTO categories (type, value, label) VALUES 
('income', 'tuition_fee', 'ค่าธรรมเนียมการศึกษา'),
('income', 'registration_fee', 'ค่าลงทะเบียน'),
('income', 'certificate_fee', 'ค่าใบรับรอง/ใบแจ้งผลการเรียน'),
('income', 'other', 'รายรับอื่นๆ')
ON CONFLICT DO NOTHING;

-- 2. Seed 45 Sample Receipts
-- เราจะใช้ DO block เพื่อรันลูปสร้างข้อมูลจำลอง
DO $$
DECLARE
    i INTEGER;
    v_name_types TEXT[] := ARRAY['นักศึกษา', 'บุคคลภายนอก', 'ข้าราชการ'];
    v_locations TEXT[] := ARRAY['อาคารเรียน 1', 'อาคาร 2 (กศ.พ.)', 'ศูนย์การศึกษาออนไลน์'];
    v_agencies TEXT[] := ARRAY['คณะครุศาสตร์', 'คณะมนุษยศาสตร์', 'คณะวิทยาการจัดการ', 'คณะเทคโนโลยีอุตสาหกรรม'];
    v_names TEXT[] := ARRAY['สมชาย ใจดี', 'สมหญิง รักเรียน', 'วิชัย มานะ', 'นารี มีสุข', 'มานะ อดทน', 'ปัญญา เก่งกล้า', 'สุดา ฟ้าใส', 'อาทิตย์ รุ่งเรือง'];
BEGIN
    FOR i IN 1..45 LOOP
        INSERT INTO receipts (
            receipt_number, 
            receipt_date, 
            academic_year, 
            semester, 
            name_type, 
            payer_name, 
            month, 
            location, 
            agency, 
            amount
        ) VALUES (
            'RCP-' || LPAD(i::text, 4, '0'), -- RCP-0001 ถึง RCP-0045
            CURRENT_DATE - (i || ' days')::interval, -- วันที่ย้อนหลังไปเรื่อยๆ
            '2567',
            (CASE WHEN i % 2 = 0 THEN 2 ELSE 1 END),
            v_name_types[1 + (i % 3)],
            v_names[1 + (i % 8)] || ' ' || i,
            1 + (i % 12),
            v_locations[1 + (i % 3)],
            v_agencies[1 + (i % 4)],
            (1500 + (i * 100))::DECIMAL
        );
    END LOOP;
END $$;
