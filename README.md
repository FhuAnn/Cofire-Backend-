![UIT](https://img.shields.io/badge/from-UIT%20VNUHCM-blue?style=for-the-badge&link=https%3A%2F%2Fwww.uit.edu.vn%2F)

# COFIRE - VS CODE AI ASSISTANT EXTENSION (BACKEND)

## 📑 Table of Contents
* [Giới thiệu chung](#giới-thiệu-chung)
* [Các chức năng](#các-chức-năng)
* [Framework và công nghệ](#framework-và-công-nghệ)
* [Hướng dẫn chạy dự án](#hướng-dẫn-chạy-dự-án)

---

## 👨‍💻 Giới thiệu chung
**Tác giả:**  
- Hồ Phạm Phú An - 22520013 - [Github](https://github.com/FhuAnn)  
- Nguyễn Nguyên Ngọc Anh - 22520058 - [Github](https://github.com/AndreNguyen03)  

**Mô tả:**  
**Cofire Backend** là phần backend của extension Visual Studio Code tích hợp AI, hỗ trợ các tính năng như gợi ý code tự động, sinh code từ mô tả, giải thích code, và trò chuyện với AI. Backend này đảm nhận việc xử lý các yêu cầu từ frontend, kết nối với các mô hình AI qua API, và quản lý ngữ cảnh lập trình.  
Dự án hướng đến việc tối ưu hóa quy trình phát triển phần mềm, giảm thiểu lỗi cú pháp/logic, và nâng cao trải nghiệm lập trình thông qua sự hỗ trợ của AI.  

---

## ⚙️ Các chức năng
- **Xử lý yêu cầu từ Frontend:** Nhận và xử lý các yêu cầu như gợi ý code, giải thích code, hoặc chat với AI.  
- **Kết nối với AI Models:** Tích hợp với các API AI như GPT-3.5/GPT-4 (OpenAI), Claude (Anthropic), Gemini (Google), LLaMA (Meta).  
- **Quản lý ngữ cảnh:** Xử lý các file hoặc đoạn code được đính kèm từ frontend để cung cấp ngữ cảnh phù hợp cho AI.  
- **Chuyển đổi AI Model:** Cho phép chuyển đổi giữa các mô hình AI dựa trên yêu cầu người dùng.  
- **Kiểm tra kết nối AI:** Đảm bảo kết nối ổn định với các mô hình AI và thông báo lỗi nếu cần.  

---

## 🛠 Framework và công nghệ
- **Kiến trúc:** RESTful API  
- **Backend:** Node.js + ExpressJS  
- **Công nghệ chính:**  
  - API Integration: Kết nối với các mô hình AI qua REST API.  
  - Context Processing: Xử lý ngữ cảnh từ file/code để gửi prompt tối ưu đến AI.  
- **Công cụ & IDE:**  
  - Visual Studio Code, Postman (Test API)  
  - GitHub (Quản lý source code)  

---

## 🔧 Hướng dẫn chạy dự án
0. Clone hoặc tải về project này từ [https://github.com/FhuAnn/Cofire-Backend-/](https://github.com/FhuAnn/Cofire-Backend-/).  
1. Cài đặt các dependencies:  
   ```
   npm install
   ```  
2. Cấu hình biến môi trường:  
   - Tạo file `.env` và thêm các khóa API cho các mô hình AI (ví dụ: OpenAI, Google, Anthropic).  
   - Ví dụ nội dung file `.env`:  
     ```
     OPENAI_API_KEY=your_openai_api_key
     GOOGLE_API_KEY=your_google_api_key
     CLAUDE_API_KEY=your_claude_api_key
     ```  
3. Chạy backend:  
   ```
   npm start
   ```  
4. Đảm bảo backend chạy ở `http://localhost:3000` (hoặc cổng được cấu hình) để kết nối với frontend.  

<xaiArtifact artifact_id="6787dde6-4725-4c69-b32d-b6e880f99cb2" artifact_version_id="1882073a-042c-419f-a4e1-d00460220c6e" title="README.md" contentType="text/markdown">
