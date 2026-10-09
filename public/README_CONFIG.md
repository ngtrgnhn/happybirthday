# Hướng dẫn thay đổi nội dung web

## ⚠️ QUAN TRỌNG: Cách thay đổi nội dung

File cấu hình chính: **`public/config.json`**

### 📝 Các bước thay đổi:

1. **Mở file `public/config.json`** trong editor

2. **Thay đổi nội dung theo ý muốn** (xem cấu trúc bên dưới)

3. **Commit và push lên GitHub:**
```bash
git add public/config.json
git commit -m "Cập nhật nội dung"
git push
```

4. **Đợi Vercel rebuild** (1-2 phút)

5. **Mở lại website và hard refresh:**
   - **Windows:** `Ctrl + Shift + R` hoặc `Ctrl + F5`
   - **Mac:** `Cmd + Shift + R`
   - **Mobile:** Xóa cache browser hoặc mở tab ẩn danh

6. **Kiểm tra Console (F12)** để xem log:
   - ✅ "Config loaded successfully" = OK
   - ❌ "Failed to load config.json" = Lỗi

## 🔧 Nếu nội dung KHÔNG thay đổi:

### Cách 1: Hard Refresh (khuyên dùng)
- **Windows:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`
- **Mobile:** Mở tab ẩn danh

### Cách 2: Thêm `?reload=true` vào URL
```
https://your-site.vercel.app/?reload=true
```

### Cách 3: Xóa cache browser
1. Mở DevTools (F12)
2. Chuột phải vào nút Refresh
3. Chọn "Empty Cache and Hard Reload"

### Cách 4: Kiểm tra Console
1. Mở DevTools (F12)
2. Chuyển sang tab "Console"
3. Tìm log "✅ Config loaded successfully:"
4. Nếu thấy config cũ → browser đang cache
5. Nếu thấy config mới → code chưa update

### Cách 5: Kiểm tra Network tab
1. Mở DevTools (F12)
2. Chuyển sang tab "Network"
3. Refresh trang
4. Tìm file `config.json`
5. Kiểm tra "Response" tab để xem nội dung

## 📋 Cấu trúc config.json

### recipient (người nhận)
```json
{
  "name": "Tên hiển thị trên thư",
  "nickname": "biệt danh dùng trong text",
  "age": 18
}
```

### sender (người gửi)
```json
{
  "name": "Tên người gửi",
  "signature": "Chữ ký cuối thư"
}
```

### letter (nội dung thư)
```json
{
  "heading": "Gửi Hà My,",
  "body": "Nội dung chính của thư",
  "wish": "Lời chúc/điều ước (hiển thị nổi bật)",
  "ps": "Tái bút (có thể để trống)"
}
```

### memories (ảnh kỷ niệm - mảng 5 ảnh)
```json
[
  {
    "src": "https://example.com/photo1.jpg",
    "caption": "Chú thích ảnh 1"
  }
]
```

### gifts (hộp quà - mảng 3 quà)
```json
[
  {
    "title": "Tên quà 1",
    "message": "Nội dung khi mở quà"
  }
]
```

### banner (băng rôn khi thổi nến)
```json
{
  "text": "TUỔI MỚI RỰC RỠ NHÉ!",
  "sub": "thương cậu nhiều hơn hôm qua"
}
```

### cake (bánh kem)
```json
{
  "candles": 5,
  "flavor": "kem dâu",
  "topper": "HB"
}
```

### hints (gợi ý)
```json
{
  "approach": "Nhắm mắt, chắp tay...",
  "blowing": "Hít một hơi thật sâu...",
  "blown": "Điều ước đã bay lên...",
  "relight": "Ánh lửa nhỏ trở lại..."
}
```

## 💡 Ví dụ thay đổi nhanh

### Đổi tên người nhận:
```json
"recipient": {
  "name": "Minh Anh",
  "nickname": "bé",
  "age": 20
}
```

### Đổi lời chúc:
```json
"letter": {
  "wish": "Chúc cậu luôn vui vẻ và thành công!"
}
```

### Đổi ảnh kỷ niệm:
```json
"memories": [
  {
    "src": "https://example.com/photo1.jpg",
    "caption": "Kỷ niệm đầu tiên"
  }
]
```

## ⚠️ Lưu ý quan trọng

- ✅ **CHỈ** thay đổi file `public/config.json`
- ❌ **KHÔNG** thay đổi file `src/config.ts` (đây là file code)
- ✅ File `config.json` sẽ được tự động copy vào `dist/` khi build
- ✅ Vercel sẽ tự động rebuild khi push code
- ✅ Browser sẽ tự động fetch config mới (không cache)

## 🐛 Troubleshooting

### Nội dung không thay đổi sau khi push?
1. ✅ Kiểm tra Console (F12) xem có log "✅ Config loaded successfully" không
2. ✅ Hard refresh: `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac)
3. ✅ Kiểm tra Vercel dashboard xem build đã hoàn thành chưa
4. ✅ Đảm bảo đã commit đúng file `public/config.json`
5. ✅ Thêm `?reload=true` vào URL

### Ảnh không hiển thị?
- ✅ URL ảnh phải là link trực tiếp (không phải link trang web)
- ✅ URL phải bắt đầu bằng `https://`
- ✅ Kiểm tra ảnh có thể truy cập công khai không
- ✅ Thử mở URL ảnh trong tab mới

### Build lỗi?
- ✅ Kiểm tra JSON có đúng format không (dùng https://jsonlint.com)
- ✅ Đảm bảo không có dấu phẩy thừa
- ✅ Đảm bảo tất cả string đều có dấu ngoặc kép `""`
- ✅ Kiểm tra console để xem lỗi chi tiết

### Cache vẫn còn sau khi hard refresh?
- ✅ Mở DevTools (F12) → Application → Storage → Clear site data
- ✅ Hoặc mở tab ẩn danh (Incognito/Private)
- ✅ Hoặc xóa cache browser hoàn toàn

## Cấu trúc config.json

### recipient (người nhận)
- `name`: Tên hiển thị trên thư
- `nickname`: Biệt danh dùng trong text
- `age`: Số tuổi (hiển thị trên tem thư)

### sender (người gửi)
- `name`: Tên người gửi
- `signature`: Chữ ký cuối thư

### letter (nội dung thư)
- `heading`: Lời mở đầu (vd: "Gửi Hà My,")
- `body`: Nội dung chính
- `wish`: Lời chúc/điều ước (hiển thị nổi bật)
- `ps`: Tái bút (có thể để trống "")

### memories (ảnh kỷ niệm)
Mảng 5 ảnh, mỗi ảnh có:
- `src`: URL ảnh (phải là link trực tiếp)
- `caption`: Chú thích ảnh

### gifts (hộp quà)
Mảng 3 quà, mỗi quà có:
- `title`: Tên quà
- `message`: Nội dung khi mở quà

### banner (băng rôn khi thổi nến)
- `text`: Text chính trên băng rôn
- `sub`: Text phụ nhỏ hơn

### cake (bánh kem)
- `candles`: Số nến (3-7)
- `flavor`: Hương vị (chỉ để tham khảo)
- `topper`: Text trên đỉnh bánh (2 ký tự)

### hints (gợi ý)
- `approach`: Hint khi cô bé đang đi tới
- `blowing`: Hint khi đang thổi nến
- `blown`: Hint sau khi thổi nến
- `relight`: Hint khi thắp lại nến

## Ví dụ thay đổi nhanh

### Đổi tên người nhận:
```json
"recipient": {
  "name": "Minh Anh",
  "nickname": "bé",
  "age": 20
}
```

### Đổi lời chúc:
```json
"letter": {
  "wish": "Chúc cậu luôn vui vẻ và thành công!"
}
```

### Đổi ảnh kỷ niệm:
```json
"memories": [
  {
    "src": "https://example.com/photo1.jpg",
    "caption": "Kỷ niệm đầu tiên"
  }
]
```

## Troubleshooting

### Nội dung không thay đổi sau khi push?
1. Kiểm tra Console (F12) xem có log "Config loaded successfully" không
2. Hard refresh: Ctrl+Shift+R (Windows) hoặc Cmd+Shift+R (Mac)
3. Kiểm tra Vercel dashboard xem build đã hoàn thành chưa
4. Đảm bảo đã commit đúng file `public/config.json`

### Ảnh không hiển thị?
- Đảm bảo URL ảnh là link trực tiếp (không phải link trang web)
- URL phải bắt đầu bằng `https://`
- Kiểm tra ảnh có thể truy cập công khai không

### Build lỗi?
- Kiểm tra JSON có đúng format không (dùng https://jsonlint.com)
- Đảm bảo không có dấu phẩy thừa
- Đảm bảo tất cả string đều có dấu ngoặc kép ""
