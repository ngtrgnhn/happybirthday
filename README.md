# Happy Birthday 3D — Mắt Hồng

Trang chúc mừng sinh nhật 3D: phong bì → lá thư → căn phòng tiệc tròn (cửa sổ vòm, rèm, đèn dây, dây cờ, bóng bay, bàn tiệc, bánh kem 3 tầng) → cô bé cầu nguyện, thổi nến, giơ biểu ngữ điều ước → thư, ảnh kỷ niệm, hộp quà.

Stack: Vite 6 · React 18 · TypeScript · three 0.160 · @react-three/fiber 8 · zustand · Tailwind v4.

## Chạy

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # ra thư mục dist/
npm run typecheck
```

## Nội dung: chỉ sửa `public/config.json`

Mọi chữ/ảnh/số đều đọc từ file đó — **sửa xong web tự đổi, không cần tải lại trang** (dev: tức thì; đã deploy: trong ≤ 5 s). Chi tiết từng khoá, `{placeholder}`, ví dụ: [`public/README_CONFIG.md`](public/README_CONFIG.md).

## Cách chơi

1. Nhấn phong bì → thư bay ra → **nhấn trái tim (con dấu sáp) ở góc dưới bên phải bức thư** để vào tiệc.
2. **Nhấn vào bánh kem** → cô bé bước tới cầu nguyện → **nhấn lần nữa** để thổi nến → **nhấn** để thắp lại.
3. Nhấn bóng bay để làm nổ. Cuộn xuống để đọc thư, xem ảnh, mở quà.

## Đồ hoạ 3D

- Đèn một nguồn đổ bóng mềm, môi trường phản chiếu "studio hồng" cho bóng bay/topper/sứ, bloom cho lửa nến + đèn dây + kim tuyến, phòng tự tối lại ấm khi nến tắt.
- Ba mức chất lượng `high / medium / low`: tự nhận theo thiết bị, tự hạ mức nếu dưới ~27 fps. Ghim bằng `?q=high|medium|low` hoặc `scene.quality` trong config.
- Hoạt cảnh mở màn: đồ vật lần lượt nảy vào phòng, camera bay vào; hộp quà rơi bật nảy; bóng bay bung đàn hồi.
- Tôn trọng `prefers-reduced-motion`.

`?debug` thêm vào URL: hiện lỗi JSON của config, log, và `window.__party` / `window.__quality` để thử nhanh (ví dụ `__party.setState({ phase: "party" })`).

## Cấu trúc

```
public/config.json       nội dung (file duy nhất cần sửa)
src/config.ts            schema + mặc định + chuẩn hoá config
src/useLiveConfig.ts     tải/đồng bộ config.json khi đang chạy
src/store.ts             máy trạng thái: loading → intro → party → approach → blowing → blown → relight
src/scene/               toàn bộ cảnh 3D
  Experience.tsx           ghép cảnh      Room.tsx       phòng tròn, cửa sổ, rèm, đèn dây
  Table.tsx                bàn, quà, đồ ăn Cake.tsx       bánh, nến, topper
  Character.tsx            cô bé          Balloons.tsx   bóng bay + số tuổi
  Garland.tsx              dây cờ chữ     Particles.tsx  confetti, kim tuyến, tim
  Lights.tsx / Env.tsx     ánh sáng       Effects.tsx    bloom + bộ giữ khung hình
  CameraRig.tsx            camera         quality.ts     3 mức chất lượng
src/ui/                  phong bì, thư, HUD, các phần cuộn
```

Chi tiết kỹ thuật cần nhớ: canvas dùng `eventSource` = phần tử gốc DOM để bấm xuyên lớp cuộn (bấm bánh kem/bóng bay); `flat` (không tone mapping) giữ đúng bảng màu pastel; bloom chỉ lấy vùng sáng > 1.85 nên chỉ ánh lửa/đèn/kim tuyến phát sáng.
