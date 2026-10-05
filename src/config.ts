export interface GiftItem {
  title: string;
  message: string;
}
export interface MemoryItem {
  src: string;
  caption: string;
}

export interface PartyConfig {
  recipient: { name: string; nickname: string; age: number };
  sender: { name: string; signature: string };
  event: { kicker: string; title: string; date: string; place: string; time: string };
  letter: { heading: string; body: string; wish: string; ps: string };
  banner: { text: string; sub: string };
  cake: { candles: number; flavor: string; topper: string };
  memories: MemoryItem[];
  gifts: GiftItem[];
  hints: { approach: string; blowing: string; blown: string; relight: string };
}

export const DEFAULT_CONFIG: PartyConfig = {
  recipient: { name: "Hà My", nickname: "cậu", age: 18 },
  sender: { name: "Tớ", signature: "— Tớ, người luôn đứng về phía cậu" },
  event: {
    kicker: "Lá thư chúc mừng sinh nhật",
    title: "Gửi cậu của hôm nay",
    date: "20 . 06",
    place: "Căn phòng nhỏ màu hồng",
    time: "19:30 tối nay",
  },
  letter: {
    heading: "Gửi Hà My,",
    body: "Hôm nay là ngày của cậu. Tớ đã định viết thật dài, nhưng rồi nhận ra có những điều chỉ cần nói gọn trong một câu. Cảm ơn cậu vì một năm qua đã luôn ở đó — dịu dàng, kiên nhẫn và ấm áp theo cách không ai thay thế được.",
    wish: "Điều ước duy nhất tớ gửi vào ngọn nến: mong tuổi mới của cậu luôn rạng rỡ như chính cậu của hôm nay — phần còn lại của thế giới, cứ để tụi tớ lo.",
    ps: "Tái bút: cuộn xuống chút nữa nhé, tớ giấu vài thứ nhỏ xinh ở dưới đó.",
  },
  banner: { text: "TUỔI MỚI RỰC RỠ NHÉ!", sub: "thương cậu nhiều hơn hôm qua, ít hơn ngày mai" },
  cake: { candles: 5, flavor: "kem dâu", topper: "HB" },
  memories: [
    {
      src: "https://image.qwenlm.ai/generated-images/02b6a9fa-351a-4328-a3c9-d2d4fbed0265/_result.png",
      caption: "Chuyến xe đạp chiều hôm ấy",
    },
    {
      src: "https://image.qwenlm.ai/generated-images/0572e97c-358d-4190-a204-fdcd8700d6db/_result.png",
      caption: "Ngọn nến đầu tiên",
    },
    {
      src: "https://image.qwenlm.ai/generated-images/1b0ef83e-b1e1-4a32-acfd-321a80deb884/_result.png",
      caption: "Bữa picnic mùa xuân",
    },
    {
      src: "https://image.qwenlm.ai/generated-images/471a3b70-8ec9-444a-bde4-c408999e08f4/_result.png",
      caption: "Góc quán quen của tụi mình",
    },
    {
      src: "https://image.qwenlm.ai/generated-images/907e0e58-0ead-47d0-92b3-740f5c51f2ce/_result.png",
      caption: "Đêm pháo hoa rực rỡ",
    },
  ],
  gifts: [
    {
      title: "Phiếu trà sữa",
      message: "Một chầu trà sữa không giới hạn — tớ mời, cậu uống, hết thì mình gọi thêm.",
    },
    {
      title: "Vé xem phim",
      message: "Một vé xem phim kèm bỏng ngô cỡ lớn, có giá trị vào bất kỳ ngày nào cậu muốn.",
    },
    {
      title: "Cái ôm năm tuổi mới",
      message: "Một cái ôm thật chặt, dùng được bất cứ lúc nào trong năm — kể cả ngày trời mưa.",
    },
  ],
  hints: {
    approach: "Nhắm mắt, chắp tay — một điều ước đang thành hình...",
    blowing: "Hít một hơi thật sâu... và thổi!",
    blown: "Điều ước đã bay lên cùng làn khói",
    relight: "Ánh lửa nhỏ trở lại, bữa tiệc tiếp tục",
  },
};

/** Deep-merge so a partial config.json never breaks the app. */
function merge(base: PartyConfig, over: unknown): PartyConfig {
  const o = (over ?? {}) as Record<string, any>;
  const out: any = {};
  
  // First, copy all keys from config.json (override completely if present)
  for (const key of Object.keys(o)) {
    out[key] = o[key];
  }
  
  // Then fill in missing keys from base
  for (const key of Object.keys(base) as (keyof PartyConfig)[]) {
    if (!(key in out)) {
      out[key] = (base as any)[key];
    } else if (typeof out[key] === "object" && out[key] !== null && !Array.isArray(out[key])) {
      // Deep merge for objects
      const baseObj = (base as any)[key];
      if (baseObj && typeof baseObj === "object") {
        for (const subKey of Object.keys(baseObj)) {
          if (!(subKey in out[key])) {
            out[key][subKey] = baseObj[subKey];
          }
        }
      }
    }
  }
  
  return out as PartyConfig;
}

export async function loadConfig(): Promise<PartyConfig> {
  try {
    // Unregister service workers to prevent caching
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    
    // Add timestamp to bypass cache completely
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    console.log("Loading config.json with timestamp:", timestamp);
    
    const res = await fetch(`./config.json?t=${timestamp}&r=${random}`, { 
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
    
    if (!res.ok) throw new Error(`config missing: ${res.status}`);
    
    const json = await res.json();
    console.log("✅ Config loaded successfully:", json);
    
    const merged = merge(DEFAULT_CONFIG, json);
    console.log("✅ Merged config:", merged);
    
    return merged;
  } catch (error) {
    console.warn("❌ Failed to load config.json, using default config:", error);
    return DEFAULT_CONFIG;
  }
}
