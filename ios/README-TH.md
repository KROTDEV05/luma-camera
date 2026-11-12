# LUMA Camera — แอป iPhone แบบ Native

โปรเจกต์ SwiftUI + AVFoundation + Core Image สำหรับ iOS 16 ขึ้นไป ใช้กล้องและคลังภาพของ iPhone โดยตรง ทรัพยากรอยู่ในแอป ไม่โหลดเว็บไซต์ และไม่ใช้ WKWebView

## สถานะที่ตรงกับงานจริง

- มีซอร์สแอป, Xcode project, shared scheme, ไอคอน, คำขอสิทธิ์ และ workflow สร้าง IPA
- **ยังไม่ได้คอมไพล์ด้วย Xcode หรือทดสอบบน iPhone** เพราะเครื่องที่พัฒนาเป็น Windows และยังไม่ได้เชื่อม repository/บริการ macOS runner
- ไฟล์ ZIP ที่ส่งเป็นซอร์สโค้ด ไม่ใช่ IPA ที่ติดตั้งได้ทันที
- Workflow จะสร้าง `LumaCamera-unsigned.ipa` หลัง build ผ่าน ต้องเซ็นด้วย AltStore ก่อนเปิดบน iPhone
- ไม่ต้องส่ง Apple ID, รหัสผ่าน, certificate หรือรหัส 2FA ให้ผู้พัฒนาในแชต

## ฟังก์ชันในซอร์สเวอร์ชันนี้

- หน้ากล้องสีดำ ใช้มือเดียว ปุ่มชัตเตอร์ใหญ่ รองรับ safe area
- Preview แบบเรียลไทม์ผ่าน Core Image พร้อมประมวลผลรูปจาก AVCapturePhotoOutput
- ฟิล์มสร้างสรรค์ 42 สูตร และสูตรสีกล้อง 24 แบบ เลือกความเข้ม/เทียบต้นฉบับ
- ตัวอย่าง 3 ฉาก: บุคคล เมือง และธรรมชาติ ใช้ Core Image ชุดเดียวกับภาพถ่าย
- สลับกล้องหน้า/หลัง และเลือกเลนส์จริงที่ตรวจพบในอุปกรณ์
- แฟลชเมื่อฮาร์ดแวร์รองรับ ชดเชยแสง เส้นตาราง ตั้งเวลา 3/10 วินาที
- นำเข้ารูปด้วย PhotosPicker บันทึก JPEG ลงแอปก่อน แล้วขอสิทธิ์เพิ่มรูปใน Photos
- ดู/แชร์ภาพล่าสุด และเข้าถึงไฟล์เดิมผ่าน Files > On My iPhone > LUMA Camera > LumaPhotos
- หยุดกล้องและยกเลิกนับถอยหลังเมื่อแอปไปเบื้องหลัง

สูตรสีเป็นการตีความสร้างสรรค์ ไม่ใช่การวัดสีของฟิล์มหรือกล้องจริง ตัวประมวลผล native ใช้ Core Image ต่างจาก WebGL ของเว็บเดิม ผลลัพธ์จึงยังไม่เทียบเท่ากันทุกจุด เวอร์ชันนี้ยังไม่มีวิดีโอ, RAW/ProRAW, double exposure, UI คลังรูปย้อนหลัง, การคาลิเบรตสีรายอุปกรณ์ หรือการยืนยันคุณภาพเทียบ Dazz Cam ไม่ควรอ้างว่าเป็นเวอร์ชัน production ที่ผ่านการทดสอบแล้ว

## ใช้ Windows: สร้าง IPA บน GitHub Actions

1. สร้าง repository ในบัญชี GitHub ของคุณ แนะนำตั้ง Private เพื่อเก็บซอร์สส่วนตัว การใช้ runner ขึ้นอยู่กับโควตา/แพ็กเกจของบัญชี
2. อัปโหลด **เนื้อหาทั้งหมดของชุดซอร์ส** ให้มี `ios/` และ `.github/workflows/ios-ipa.yml` อยู่ที่ราก repository อย่าตกหล่นโฟลเดอร์ `.github`
3. ไปที่แท็บ Actions > Build LUMA iOS IPA > Run workflow
4. เมื่อ build สำเร็จ ดาวน์โหลด artifact `LumaCamera-IPA-for-AltStore` แล้วแตก ZIP เพื่อได้ `LumaCamera-unsigned.ipa`
5. หาก build ล้มเหลว ให้เก็บ log ของขั้นตอน Build native iPhone app เพื่อแก้ไขก่อน ยังไม่ถือว่าได้แอปที่ติดตั้งได้

Workflow ใช้ macOS runner + Xcode และไม่ต้องใส่ Apple ID หรือ signing secrets บน GitHub ใช้ `CODE_SIGNING_ALLOWED=NO` เพื่อให้เซ็นบนอุปกรณ์ของคุณภายหลัง ไม่มีขั้นตอนเผยแพร่ App Store หรือสร้าง public release

## ติดตั้งจาก Windows ไป iPhone

1. ทำตาม [คู่มือ AltStore Classic สำหรับ Windows](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows) เพื่อเตรียม AltServer, Apple components และติดตั้ง AltStore Classic บน iPhone ใช้ลิงก์/ข้อกำหนดล่าสุดในคู่มือ
2. เชื่อม iPhone ด้วย USB และกด Trust หากระบบถาม ทำตามขั้นตอน Developer Mode/Trust ที่คู่มือระบุ
3. ส่งไฟล์ `LumaCamera-unsigned.ipa` ไปแอป Files บน iPhone
4. เปิด AltStore Classic > My Apps > + > เลือก IPA แล้วให้ AltStore เซ็นด้วยบัญชี Apple ของคุณ
5. เปิด LUMA Camera จากหน้าจอโฮม อนุญาตกล้อง และอนุญาตเพิ่มรูปลง Photos เมื่อใช้งาน

บัญชี Apple แบบฟรีมีข้อจำกัดอายุแอป 7 วันและจำนวนแอปที่เปิดใช้งาน ต้อง refresh ผ่าน AltServer ตาม [คู่มือ Getting Started](https://faq.altstore.io/altstore-classic/your-altstore) ไม่มีไฟล์แอป unsigned ที่กดจาก Safari แล้วติดตั้งถาวรได้ทันทีทั่วโลก

## หากเข้าถึง Mac ได้ภายหลัง

เปิด `ios/LumaCamera.xcodeproj` ใน Xcode เลือก Team ของคุณใน Signing & Capabilities ปรับ Bundle Identifier ให้ไม่ซ้ำ เชื่อม iPhone และกด Run ตาม [คู่มือ Apple](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)

สร้าง unsigned IPA บน Mac ได้ด้วย:

```sh
bash ios/scripts/build-ipa.sh
```

## ตรวจรับก่อนใช้งานจริง

1. Build Release ด้วย Xcode สำเร็จ แล้วติดตั้ง IPA ที่เซ็นแล้วบน iPhone
2. ทดสอบสิทธิ์กล้องทั้งอนุญาต/ปฏิเสธ, กลับจาก Settings, เบื้องหลัง/กลับเข้าแอป, สลับเลนส์/กล้อง
3. เทียบขอบภาพ preview กับภาพที่บันทึก ทดสอบโทนสี/B&W/ต้นฉบับ แสงน้อย และภาพบุคคล
4. ทดสอบตั้งเวลาแล้วล็อกจอ ไม่มีการถ่ายหลังแอปไปเบื้องหลัง
5. ทดสอบสิทธิ์ Photos ทั้งอนุญาต/ปฏิเสธ พื้นที่เต็ม HEIC import และ Share JPEG
6. ตรวจความร้อน หน่วยความจำ และความลื่นบน iPhone รุ่นต่ำสุดที่รองรับ (preview ตั้งเป้า 15 fps เพื่อลดภาระ)

คำสั่ง `node ios/scripts/validate-project.mjs` ตรวจเพียงโครงสร้างและทรัพยากร ไม่ใช่การคอมไพล์ Swift หรือการทดสอบกล้อง
