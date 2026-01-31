import { MENU_ITEMS } from "../constants";
import { DraftOrder, OrderItem } from "../types";

// Mapping từ khóa giọng nói sang ID món ăn
// Ưu tiên các từ khóa dài/cụ thể trước để tránh bắt nhầm
const KEYWORD_MAP: { keywords: string[]; id: string }[] = [
    // --- PIZZA ---
    { keywords: ["bò lớn", "pizza bò lớn"], id: "p7" },
    { keywords: ["bò nhỏ", "pizza bò nhỏ"], id: "p1" },
    { keywords: ["bò", "pizza bò"], id: "p7" }, // Mặc định bò -> size L

    { keywords: ["phô mai lớn", "pizza phô mai lớn"], id: "p8" },
    { keywords: ["phô mai nhỏ", "pizza phô mai nhỏ"], id: "p2" },
    { keywords: ["phô mai", "pizza phô mai"], id: "p8" },

    { keywords: ["gà teriyaki lớn", "gà te lớn"], id: "p9" },
    { keywords: ["gà teriyaki nhỏ", "gà te nhỏ"], id: "p3" },
    { keywords: ["gà teriyaki", "gà te"], id: "p9" },

    { keywords: ["hải sản đặc biệt"], id: "p23" },
    { keywords: ["hải sản"], id: "p10" },

    { keywords: ["xúc xích heo lớn"], id: "p11" },
    { keywords: ["xúc xích heo nhỏ"], id: "p4" },
    { keywords: ["xúc xích heo"], id: "p11" },

    { keywords: ["nấm rau củ"], id: "p12" },
    { keywords: ["xúc xích đức"], id: "p13" },

    { keywords: ["cá ngừ lớn"], id: "p14" },
    { keywords: ["cá ngừ nhỏ"], id: "p5" },
    { keywords: ["cá ngừ"], id: "p14" },

    { keywords: ["ba rọi xông khói lớn", "ba rọi lớn"], id: "p15" },
    { keywords: ["ba rọi xông khói nhỏ", "ba rọi nhỏ"], id: "p6" },
    { keywords: ["ba rọi xông khói", "ba rọi"], id: "p15" },

    { keywords: ["salami"], id: "p16" },
    { keywords: ["phô mai tươi"], id: "p17" },
    { keywords: ["meat lover", "yêu thịt"], id: "p18" },
    { keywords: ["tôm thanh cua"], id: "p19" },
    { keywords: ["khô gà", "lạp xưởng"], id: "p20" },
    { keywords: ["thập cẩm"], id: "p21" },
    { keywords: ["bò sốt cay"], id: "p22" },

    // --- NƯỚC ---
    { keywords: ["trà đào"], id: "d7" },
    { keywords: ["trà chanh"], id: "d6" },
    { keywords: ["trà sữa", "trà thái"], id: "d8" },
    { keywords: ["nước suối", "nước lọc", "lavie"], id: "d3" },
    { keywords: ["nước ngọt ly", "coca ly", "pepsi ly"], id: "d1" },
    { keywords: ["nước ngọt lon", "coca lon", "pepsi lon"], id: "d2" },
    { keywords: ["nước ngọt", "coca", "pepsi"], id: "d1" }, // Mặc định ly
    { keywords: ["bia", "beer", "local beer"], id: "d4" },
    { keywords: ["đá me"], id: "d5" },

    // --- MÓN NHẸ ---
    { keywords: ["khoai tây chiên lớn"], id: "s3" },
    { keywords: ["khoai tây chiên nhỏ"], id: "s2" },
    { keywords: ["khoai tây chiên"], id: "s2" },

    { keywords: ["gà lắc phô mai cay lớn"], id: "s7" },
    { keywords: ["gà lắc phô mai cay nhỏ"], id: "s6" },
    { keywords: ["gà lắc phô mai cay", "gà lắc"], id: "s6" },

    { keywords: ["gà rán chiên giòn lớn"], id: "s9" },
    { keywords: ["gà rán chiên giòn nhỏ"], id: "s8" },
    { keywords: ["gà rán"], id: "s8" },

    { keywords: ["tok lắc", "tokbokki"], id: "s4" },
    { keywords: ["bánh mì bơ tỏi"], id: "s5" },
    { keywords: ["gà sốt cay"], id: "s1" },
    { keywords: ["mì ý đút lò"], id: "s10" },
    { keywords: ["mì ý", "mì bò bằm"], id: "s11" },
    { keywords: ["salad cá ngừ"], id: "s12" },
    { keywords: ["salad dầu giấm"], id: "s13" },
    { keywords: ["bánh mì phô mai"], id: "s14" },
    { keywords: ["bắp phô mai"], id: "s15" },

    // --- COMBO ---
    { keywords: ["combo 1", "com bo 1"], id: "c1" },
    { keywords: ["combo 2", "com bo 2"], id: "c2" },
    { keywords: ["combo 3", "com bo 3"], id: "c3" },
    { keywords: ["combo 4", "com bo 4"], id: "c4" },
    { keywords: ["combo 5", "com bo 5"], id: "c5" },
    { keywords: ["combo 6", "com bo 6"], id: "c6" },
    { keywords: ["combo 7", "com bo 7"], id: "c7" },
    { keywords: ["combo 8", "com bo 8"], id: "c8" },
    { keywords: ["combo tiệc 1"], id: "c9" },
    { keywords: ["combo tiệc 2"], id: "c10" },
    { keywords: ["combo tiệc 3"], id: "c11" },
    { keywords: ["combo tiệc 4"], id: "c12" },
];

const QUANTITY_MAP: Record<string, number> = {
    "một": 1, "hai": 2, "ba": 3, "bốn": 4, "năm": 5,
    "sáu": 6, "bảy": 7, "tám": 8, "chín": 9, "mười": 10,
    "1": 1, "2": 2, "3": 3, "4": 4, "5": 5,
    "6": 6, "7": 7, "8": 8, "9": 9, "10": 10
};

export const parseVoiceCommandLocal = async (transcript: string) => {
    let processedText = transcript.toLowerCase();
    const items: OrderItem[] = [];

    // Tạo bản đồ tạm để cộng dồn số lượng nếu gọi trùng món
    const itemsMap: Record<string, number> = {};

    for (const entry of KEYWORD_MAP) {
        for (const keyword of entry.keywords) {
            // Tìm vị trí từ khóa trong chuỗi
            const idx = processedText.indexOf(keyword);
            if (idx !== -1) {
                // Nếu tìm thấy, cố gắng tìm số lượng ở phía trước
                // Lấy đoạn văn bản phía trước từ khóa
                const prefix = processedText.substring(Math.max(0, idx - 10), idx).trim(); // Lấy 10 ký tự trước đó

                let quantity = 1; // Mặc định

                // Tách các từ trong prefix để tìm số cuối cùng
                const words = prefix.split(" ");
                if (words.length > 0) {
                    const lastWord = words[words.length - 1]; // Từ ngay trước tên món
                    if (QUANTITY_MAP[lastWord]) {
                        quantity = QUANTITY_MAP[lastWord];
                    } else if (!isNaN(parseInt(lastWord))) {
                        quantity = parseInt(lastWord);
                    }
                }

                // Lưu vào map
                if (itemsMap[entry.id]) {
                    itemsMap[entry.id] += quantity;
                } else {
                    itemsMap[entry.id] = quantity;
                }

                // Xóa từ khóa đã tìm thấy khỏi chuỗi để tránh việc "bò lớn" bị match thêm "bò" lần nữa
                // Thay bằng khoảng trắng để giữ cấu trúc chuỗi
                processedText = processedText.replace(keyword, " ".repeat(keyword.length));
            }
        }
    }

    // Hydrate dữ liệu từ itemsMap
    Object.keys(itemsMap).forEach(id => {
        const originalItem = MENU_ITEMS.find(m => m.id === id);
        if (originalItem) {
            items.push({
                id: id,
                name: originalItem.name,
                price: originalItem.price,
                quantity: itemsMap[id]
            });
        }
    });

    // Giả lập độ trễ nhỏ để trải nghiệm người dùng tự nhiên hơn (như đang "suy nghĩ")
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
        table_number: "",
        items: items
    };
};
