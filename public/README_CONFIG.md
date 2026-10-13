# Chỉnh nội dung — `public/config.json`

Toàn bộ chữ, số, ảnh trên web đều đọc từ **một file duy nhất: `public/config.json`**. Không cần sửa code.

## 1. Sửa xong là web tự đổi

| Tình huống | Điều xảy ra |
|---|---|
| Đang chạy `npm run dev` | Lưu file → trang đang mở đổi **ngay lập tức**, không F5 (Vite đẩy nội dung mới qua websocket; ngoài ra cứ 1,5 s trang tự kiểm tra lại). |
| Đã deploy (Vercel, GitHub Pages, host tĩnh…) | `config.json` được tải **lúc chạy** (không bị nhét cứng vào file JS). Trang đang mở hỏi lại file mỗi 5 s, khi quay lại tab và khi có mạng trở lại → thay file trên host (hoặc push rồi đợi deploy xong) là mọi người đang mở trang tự thấy nội dung mới. **Không cần hard refresh, không cần xoá cache.** |
| JSON sai cú pháp (thiếu dấu phẩy, ngoặc…) | Trang **giữ nguyên nội dung cũ**, không vỡ. Ở dev / `?debug` có dải báo lỗi phía trên. |
| Không tải được `config.json` | Dùng bản chụp lúc build; nếu không có thì dùng mặc định → không bao giờ ra trang trắng. |
| Thiếu một khoá | Tự dùng giá trị mặc định (xem `src/config.ts`). Sai kiểu (ví dụ `"age": "17"`) thì tự ép kiểu. |

Chỉ khi nội dung **thật sự đổi** thì trang mới vẽ lại; trạng thái đang xem (đã vào tiệc, đang thổi nến…) không bị reset.

Mở DevTools → Console, thấy `✅ config.json applied` (ở dev / `?debug`) là bản mới đã được áp dụng.

## 2. Các khoá

### `recipient` — người nhận
| Khoá | Ý nghĩa | Hiện ở đâu |
|---|---|---|
| `name` | tên đầy đủ | phong bì, thanh trên cùng, tiêu đề tab |
| `nickname` | cách gọi thân mật | các câu trong thư/phần quà (`{nickname}`) |
| `age` | tuổi (0–150) | tem thư, thanh trên cùng, **số bóng bay 3D bên phải bàn tiệc**, bảng tuổi trên bánh |

### `sender` — người gửi
`name` (hiện ở phong bì, chân trang), `signature` (chữ ký cuối thư).

### `event`
`kicker` (dòng nhỏ trên phong bì), `title`, `date` (ví dụ `"18 . 10"`), `time`, `place` (bỏ trống được — dấu phẩy thừa tự biến mất).

### `letter` — nội dung bức thư
`heading` (dòng chào), `body` (đoạn chính), `wish` (câu điều ước, được tô nổi bật), `ps` (tái bút, để `""` nếu không dùng).

### `banner` — biểu ngữ sau khi thổi nến
`text` (dòng lớn), `sub` (dòng nhỏ). Cô bé giơ biểu ngữ này lên; tự co lại cho vừa màn hình điện thoại.

### `cake` — bánh kem
| Khoá | Ý nghĩa |
|---|---|
| `candles` | số nến (1–12). Trên bánh hiển thị 3–7 nến. |
| `flavor` | vị bánh, hiện trong dòng gợi ý *chạm vào chiếc bánh **kem dâu** để lại gần* (và dùng được ở mọi chỗ qua `{flavor}`) |
| `topper` | **chữ trên cành trái tim cắm đỉnh bánh** (ví dụ `"HB"`, `"17"`, `"A♥T"`). Nên ≤ 4 ký tự; chữ dài hơn sẽ tự thu nhỏ. |

### `scene` — không gian 3D
| Khoá | Ý nghĩa |
|---|---|
| `garland` | chữ trên **dây cờ** treo giữa phòng, mỗi chữ một lá cờ (tối đa 26 ký tự, tự viết hoa, dấu cách = chỗ trống, hỗ trợ tiếng Việt có dấu). Mặc định `"HAPPY BIRTHDAY"`. |
| `quality` | `"auto"` (mặc định) \| `"high"` \| `"medium"` \| `"low"` — xem mục 4. |

### `memories` — ảnh kỷ niệm (mảng)
```json
{ "src": "https://…/anh.jpg", "caption": "Chú thích" }
```
`src` là link ảnh hoặc đường dẫn trong thư mục `public/` (ví dụ chép ảnh vào `public/photos/1.jpg` rồi ghi `"src": "photos/1.jpg"`). Phần tử thiếu `src` bị bỏ qua. Mảng rỗng → ẩn mục ảnh.

Cách xem ảnh: **điện thoại** vuốt ngang; **máy tính** kéo chuột (giữ chuột trái rồi kéo, thả ra ảnh tự trượt và dừng đúng giữa một tấm), **lăn con lăn** khi trỏ chuột đang ở trên dải ảnh (mỗi nấc lăn sang một tấm; lăn tới tấm đầu/cuối thì trang tự cuộn tiếp, không bị kẹt), bấm nút ‹ › hai bên, bấm chấm tròn bên dưới, hoặc phím ← → khi dải ảnh đang được chọn.

### `gifts` — hộp quà (mảng)
```json
{ "title": "Phiếu trà sữa", "message": "Nội dung hiện ra khi mở hộp" }
```
Người xem chọn 1 hộp, quà bên trong là ngẫu nhiên và chỉ mở được một lần.

### `hints` — dòng chữ dẫn đường trong lúc làm nghi thức
`approach` (cô bé đang tiến lại, chắp tay), `blowing` (thổi), `blown` (điều ước bay lên), `relight` (thắp lại nến).

### `ui` — mọi chữ còn lại của giao diện
Toàn bộ nhãn, nút, gợi ý, tiêu đề các phần (phong bì, thanh trên cùng, bức thư, ảnh, quà, chân trang, tiêu đề tab…) nằm ở đây, nên đổi ngôn ngữ/giọng văn chỉ cần sửa `config.json`. Khoá nào bỏ trống sẽ dùng mặc định trong `src/config.ts`.

Một số khoá hay dùng:

| Khoá | Mặc định / ý nghĩa |
|---|---|
| `enterHint` | dòng nhắc dưới bức thư: *chạm vào trái tim ở góc thư để vào tiệc* |
| `enterAria` | nhãn trợ năng của trái tim (`"Vào tiệc"`) |
| `tapCake` | *chạm vào chiếc bánh {flavor} để lại gần* |
| `tapToBlow` / `tapToRelight` | *nhấn vào bánh kem để thổi nến / thắp lại nến* |
| `steps` | 4 nhãn của thanh tiến trình: `["lại gần","cầu nguyện","thổi nến","điều ước"]` |
| `letterNote` | ghi chú cuối thư (hỗ trợ `**đậm**`) |
| `scrollHint` | nút vàng ở cuối màn hình tiệc: *Cuộn xuống đọc thư* (bấm vào là tự cuộn tới bức thư) |
| `memoriesSwipe` | dòng gợi ý xem ảnh trên điện thoại (vuốt ngang) |
| `memoriesDrag` | dòng gợi ý xem ảnh trên máy tính (kéo chuột / lăn con lăn) |
| `memoriesPrev` / `memoriesNext` / `memoriesGoto` | nhãn trợ năng của nút ‹ ›, và của các chấm tròn (`{n}` = số thứ tự ảnh) |
| `pageTitle` | tiêu đề tab trình duyệt |

## 3. Chèn tên, tuổi… vào chữ (`{placeholder}`)

Trong mọi chuỗi `ui.*` dùng được:

`{name}` `{nickname}` `{age}` `{sender}` `{date}` `{time}` `{place}` `{title}` `{flavor}` `{candles}`  
(riêng `giftBox` còn có `{n}` = số thứ tự hộp).

Ví dụ: `"hudGreeting": "Chúc mừng sinh nhật {name}"` → *Chúc mừng sinh nhật Đỗ Thị Anh Thư*.  
Đổi `recipient.name` thì mọi chỗ dùng `{name}` đổi theo.

Định dạng: `**chữ đậm**` chỉ được hiểu trong `ui.letterNote`; các chuỗi khác là chữ thường.

## 4. Chất lượng đồ hoạ & kiểm tra

Cảnh 3D có 3 mức. Mặc định `auto`: máy khoẻ → `high`, điện thoại/máy yếu → `medium`/`low`; nếu đang chạy mà dưới ~27 khung/giây thì **tự hạ một mức** (tối đa hai lần). Ghim cứng bằng `"scene": { "quality": "high" }` hoặc thêm `?q=high|medium|low` vào URL (URL thắng config).

| Mức | Nhận được |
|---|---|
| `high` | bóng đổ mềm, bloom (ánh nến, đèn dây, kim tuyến toả sáng), khử răng cưa MSAA ×4, nhiều confetti/kim tuyến, chi tiết cao |
| `medium` | bóng đổ + bloom nhẹ, MSAA ×2, ít hạt hơn |
| `low` | không bóng đổ/bloom, ít hạt nhất — mượt trên máy yếu |

Người dùng bật "giảm chuyển động" trong hệ điều hành thì camera đứng yên (không lắc/parallax) và bớt confetti.

Thêm `?debug` vào URL để: hiện dải báo lỗi JSON, in log `config.json applied`, và có `window.__party` (nhảy giai đoạn: `__party.setState({ phase: "party" })`) và `window.__quality`.

## 5. Ví dụ nhanh

Đổi tên + tuổi:
```json
"recipient": { "name": "Nguyễn Văn A", "nickname": "bạn", "age": 20 }
```

Dây cờ và chữ trên bánh:
```json
"scene": { "garland": "CHÚC MỪNG 20 TUỔI", "quality": "auto" },
"cake":  { "candles": 5, "flavor": "kem dâu", "topper": "20" }
```

Đổi lời trên biểu ngữ:
```json
"banner": { "text": "TUỔI MỚI RỰC RỠ NHÉ!", "sub": "mọi điều ước đều đã được nghe thấy" }
```

## 6. Cách chơi (để kiểm tra nhanh)

1. Nhấn phong bì → thư bay ra. **Nhấn vào trái tim (con dấu sáp) ở góc dưới bên phải bức thư** để vào tiệc.
2. Trong tiệc: **nhấn vào bánh kem** → cô bé bước tới và chắp tay cầu nguyện.
3. **Nhấn bánh kem lần nữa** → hít sâu, thổi nến, confetti, biểu ngữ điều ước hiện ra.
4. **Nhấn bánh kem** → cô bé thắp lại nến, tiệc tiếp tục.
5. Nhấn vào **bóng bay** → bóng nổ (rồi mọc lại). Cuộn xuống để đọc thư, xem ảnh, mở quà.
