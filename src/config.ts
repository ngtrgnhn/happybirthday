export interface PartyConfig {
  recipient: { name: string; nickname: string; age: number };
  sender: { name: string; signature: string };
  event: { kicker: string; title: string; date: string; place: string; time: string };
  letter: { heading: string; body: string; wish: string };
  banner: { text: string; sub: string };
  cake: { candles: number; flavor: string; topper: string };
  hints: { approach: string; closeup: string; blown: string; relight: string };
}

export const DEFAULT_CONFIG: PartyConfig = {
  recipient: { name: "Hà My", nickname: "cậu", age: 18 },
  sender: { name: "Tớ", signature: "— Tớ, người luôn đứng về phía cậu" },
  event: {
    kicker: "Thiệp mời sinh nhật",
    title: "Tiệc sinh nhật của",
    date: "20 . 06",
    place: "Căn phòng nhỏ màu hồng",
    time: "19:30 tối nay",
  },
  letter: {
    heading: "Gửi Hà My,",
    body: "Hôm nay là ngày của cậu. Tớ đã định viết thật dài, nhưng rồi nhận ra có những điều chỉ cần nói gọn trong một câu. Cảm ơn cậu vì một năm qua đã luôn ở đó — dịu dàng, kiên nhẫn và ấm áp theo cách không ai thay thế được.",
    wish: "Điều ước duy nhất tớ gửi vào ngọn nến: mong tuổi mới của cậu luôn rạng rỡ như chính cậu của hôm nay — phần còn lại của thế giới, cứ để tụi tớ lo.",
  },
  banner: { text: "TUỔI MỚI RỰC RỠ NHÉ!", sub: "thương cậu nhiều hơn hôm qua, ít hơn ngày mai" },
  cake: { candles: 5, flavor: "kem dâu", topper: "HB" },
  hints: {
    approach: "Nhắm mắt, chắp tay — một điều ước đang thành hình...",
    closeup: "Hít một hơi thật sâu nào...",
    blown: "Điều ước đã bay lên cùng làn khói",
    relight: "Ánh lửa nhỏ trở lại, bữa tiệc tiếp tục",
  },
};

/** Deep-merge so a partial config.json never breaks the app. */
function merge(base: PartyConfig, over: unknown): PartyConfig {
  const o = (over ?? {}) as Record<string, any>;
  const out: any = {};
  for (const key of Object.keys(base) as (keyof PartyConfig)[]) {
    const bv = (base as any)[key];
    const ov = o[key];
    if (bv && typeof bv === "object" && !Array.isArray(bv)) {
      out[key] = { ...bv, ...(ov && typeof ov === "object" ? ov : {}) };
    } else {
      out[key] = ov !== undefined && ov !== null ? ov : bv;
    }
  }
  return out as PartyConfig;
}

export async function loadConfig(): Promise<PartyConfig> {
  try {
    const res = await fetch("config.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("config missing");
    const json = await res.json();
    return merge(DEFAULT_CONFIG, json);
  } catch {
    return DEFAULT_CONFIG;
  }
}
