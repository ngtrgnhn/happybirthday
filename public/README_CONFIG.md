# Hướng dẫn thay đổi nội dung web

## Cách thay đổi nội dung

File cấu hình chính: `public/config.json`

### Các bước thay đổi:

1. **Mở file `public/config.json`**

2. **Thay đổi nội dung theo ý muốn:**

```json
{
  "recipient": {
    "name": "Tên người nhận",
    "nickname": "biệt danh",
    "age": 18
  },
  "sender": {
    "name": "Tên người gửi",
    "signature": "Chữ ký"
  },
  "letter": {
    "heading": "Lời mở đầu thư",
    "body": "Nội dung chính của thư",
    "wish": "Lời chúc/điều ước",
    "ps": "Tái bút"
  },
  "memories": [
    {
      "src": "URL_ảnh_1",
      "caption": "Chú thích ảnh 1"
    }
  ],
  "gifts": [
    {
      "title": "Tên quà 1",
      "message": "Nội dung quà 1"
    }
  ]
}
```

3. **Commit và push lên GitHub:**
```bash
git add public/config.json
git commit -m "Cập nhật nội dung"
git push
```

4. **Vercel sẽ tự động rebuild và deploy**

## Lưu ý quan trọng

- **KHÔNG** thay đổi file `src/config.ts` (đây là file code)
- **CHỈ** thay đổi file `public/config.json` (đây là file dữ liệu)
- Sau khi push, Vercel sẽ tự động rebuild trong 1-2 phút
- Mở Console (F12) để xem log: "Config loaded successfully"
- Nếu nội dung không thay đổi, thử Ctrl+Shift+R (hard refresh)

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
