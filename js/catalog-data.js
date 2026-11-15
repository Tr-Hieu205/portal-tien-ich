/**
 * catalog-data.js — Danh mục các tiện ích thực tế trong D:\Tr_Hiuz\Tiện ích
 */

export const CATEGORIES = {
  all: { id: 'all', label: 'Tất Cả', icon: '✦' },
  extensions: { id: 'extensions', label: 'Tiện Ích Chrome', icon: '🧩' },
  network: { id: 'network', label: 'Hạ Tầng DNS', icon: '🛡️' }
};

export const CATALOG_ITEMS = [
  {
    id: 'cutetube',
    shortMenuName: '🌸 CuteTube (YouTube)',
    name: 'CuteTube Personalizer',
    vietnameseTitle: 'CuteTube — Giao Diện YouTube Dark Pastel',
    tagline: 'Biến YouTube thành không gian Dark Pastel dịu mắt kèm 3 thú cưng mini đồng hành kéo thả tự do.',
    category: 'extensions',
    folderPath: 'D:\\Tr_Hiuz\\Tiện ích\\Youtube',
    statusLabel: 'Hoạt Động Ngay (MV3)',
    badge: 'CHROME EXTENSION · MV3',
    iconSvg: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#282041"/><circle cx="50" cy="50" r="32" fill="#130f1e"/><path d="M35 40 C35 32 40 28 44 32 C48 36 46 42 42 42 Z" fill="#f48fb1"/><path d="M65 40 C65 32 60 28 56 32 C52 36 54 42 58 42 Z" fill="#f48fb1"/><circle cx="50" cy="54" r="20" fill="#f6eeff"/><circle cx="44" cy="52" r="2.8" fill="#130f1e"/><circle cx="56" cy="52" r="2.8" fill="#130f1e"/><path d="M48 57 C50 59 52 59 52 57" stroke="#f48fb1" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
    pills: [
      '🌸 4 Bảng Màu Dark Pastel',
      '🐱 3 Thú Cưng Mini',
      '♥ Thanh Tua Trái Tim',
      '⚡ Tự Bỏ Qua Ads'
    ],
    summary: 'Tiện ích mở rộng Chrome giúp đổi toàn bộ giao diện YouTube sang tông tối dịu mắt (Dark Pastel), bo tròn mềm mại, thanh tua video trái tim và có nhân vật mini nổi trực tiếp trên trang để đổi màu/chỉnh tốc độ phát nhanh.',
    features: [
      {
        title: '4 Bảng Màu Dark Pastel Dịu Mắt',
        desc: 'Tím Đêm Dịu Mắt (#130f1e), Hồng Dâu Trầm (#1c1118), Xanh Mint Đêm (#0e1b17), Đào Mocha Dịu (#1d130f).'
      },
      {
        title: '3 Nhân Vật Mini Kéo Thả Trên Trang',
        desc: 'Mèo Mochi (🐱), Thỏ Bông (🐰), Gấu Kem (🐻) nằm ở góc trang, bấm vào mở bảng chỉnh nhanh, tự ẩn khi xem Fullscreen.'
      },
      {
        title: 'Thanh Tua Video Gradient & Tim ♥',
        desc: 'Đổi thanh tiến trình video sang màu chuyển sắc pastel kèm nút kéo hình trái tim và hạt lấp lánh bay nhẹ.'
      },
      {
        title: 'Chế Độ Tập Trung & Chỉnh Tốc Độ Nhanh',
        desc: 'Nút ẩn danh sách video đề xuất gây xao nhãng và dải nút chỉnh tốc độ phát (0.75x – 2x) ngay trong bảng nhân vật.'
      }
    ],
    whatsAdded: [
      'Đổi logo YouTube góc trên bên trái thành logo "Premium" giống hệt tài khoản đã mua gói YouTube Premium.',
      'Sửa triệt để lỗi nền đen (#0f0f0f) ở khu vực Bình luận (Comments), hộp Danh sách phát (Playlist) bên phải và nút Đăng ký.',
      'Tích hợp thêm bộ tự động tua nhanh & bấm Bỏ qua quảng cáo video YouTube ngay trong CuteTube.',
      'Chuyển toàn bộ 4 bảng màu sang tông tối dịu mắt (Dark Pastel) và giảm độ sáng hạt lấp lánh nền.'
    ],
    fileTree: [
      'manifest.json — Khai báo tiện ích Chrome Manifest V3',
      'shared/defaults.js — Cấu hình 4 bảng màu Dark Pastel & SVG 3 nhân vật',
      'content/cute-themes.css — CSS biến đổi màu sắc & bo góc YouTube',
      'content/content.js — Widget nhân vật Shadow DOM & bảng điều khiển nổi',
      'popup/ (popup.html, popup.css, popup.js) — Menu khi bấm icon trên thanh Chrome',
      'icons/ (icon16.png, icon48.png, icon128.png) — Bộ biểu tượng tiện ích'
    ],
    steps: [
      { step: 1, text: 'Nhấp nút "🚀 Cài Nhanh (.bat 1-chạm)" để file tự mở Chrome Extensions và mở thư mục tiện ích' },
      { step: 2, text: 'Bật công tắc "Chế độ dành cho nhà phát triển" (Developer mode) ở góc trên bên phải Chrome' },
      { step: 3, text: 'Kéo thả thư mục Youtube vào giữa màn hình Chrome để cài đặt ngay' },
      { step: 4, text: 'Mở lại tab YouTube và nhấn F5 để tận hưởng giao diện pastel xinh xắn' }
    ],
    specs: {
      'Thư Mục Gốc': 'D:\\Tr_Hiuz\\Tiện ích\\Youtube',
      'Chuẩn Tiện Ích': 'Chrome Manifest V3 (v1.0.0)',
      'Gói Nén Dự Phòng': 'downloads/cutetube.zip (29 KB)',
      'Quyền Hạn': 'storage, activeTab'
    },
    actions: {
      primary: {
        label: '🚀 Cài Nhanh (.bat 1-chạm)',
        href: 'downloads/Cai_Dat_CuteTube.bat',
        isDownload: true
      },
      secondary: {
        label: '📦 Tải Gói .ZIP',
        href: 'downloads/cutetube.zip',
        isDownload: true
      }
    }
  },
  {
    id: 'adshield',
    shortMenuName: '🛡️ AdShield Pro (Chặn Ads)',
    name: 'AdShield Pro MV3',
    vietnameseTitle: 'AdShield Pro — Tiện Ích Chặn Quảng Cáo Nâng Cao',
    tagline: 'Chặn quảng cáo cấp trình duyệt: Ẩn phần tử thông minh (Cosmetic CSS), tiêm Scriptlet & quản lý Whitelist/Blacklist.',
    category: 'extensions',
    folderPath: 'D:\\Tr_Hiuz\\Tiện ích\\adblock-extension',
    statusLabel: 'Hoạt Động Ngay (MV3)',
    badge: 'ADBLOCK EXTENSION · MV3',
    iconSvg: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#182238"/><circle cx="50" cy="50" r="32" fill="#0d1424"/><path d="M50 25 L73 37 V53 C73 68 62 76 50 80 C38 76 27 68 27 53 V37 Z" fill="none" stroke="#6ee7b7" stroke-width="4"/><path d="M48 35 L38 52 H49 L46 67 L61 48 H50 Z" fill="#6ee7b7"/></svg>`,
    pills: [
      '🛡️ Chặn Quảng Cáo Gốc',
      '⚡ Tua Nhanh Ad YouTube',
      '📋 Quản Lý Whitelist',
      '🔄 Tự Động Cập Nhật'
    ],
    summary: 'Tiện ích chặn quảng cáo Chrome Manifest V3 tự động chặn domain quảng cáo qua DeclarativeNetRequest, thu gọn khung trống banner bằng Cosmetic CSS + MutationObserver, vô hiệu hóa script quảng cáo/anti-adblock và tự cập nhật danh sách lọc.',
    features: [
      {
        title: 'Thuật Toán Ẩn Phần Tử (Cosmetic Filtering)',
        desc: 'Tiêm CSS ẩn hơn 70 khung quảng cáo ngay tại document_start kết hợp MutationObserver quét phần tử chèn động trên trang SPA.'
      },
      {
        title: 'Scriptlet Injection & Chống Anti-Adblock',
        desc: 'Chạy trong world: "MAIN" để khóa đối tượng adsbygoogle, ga, gtag, fbq, chặn cửa sổ popup rác và giả lập canRunAds = true.'
      },
      {
        title: 'Dashboard Quản Lý Whitelist / Blacklist',
        desc: 'Trang Options 5 tab và Popup cho phép bật/tắt chặn trên từng tên miền, thêm domain ngoại lệ hoặc chặn tùy chỉnh.'
      },
      {
        title: 'Tự Động Cập Nhật Bộ Lọc Bên Thứ 3',
        desc: 'Tự động tải và biên dịch danh sách EasyList / Hosts từ URL định kỳ qua chrome.alarms sang luật DNR và CSS.'
      }
    ],
    whatsAdded: [
      'Bổ sung bộ lọc luồng quảng cáo video YouTube: xóa adPlacements/playerAds/adSlots từ ytInitialPlayerResponse và API /youtubei/v1/player.',
      'Thêm cơ chế tự động tua hết quảng cáo (16x + nhảy cuối video) và tự bấm nút "Bỏ qua >|" trong <200ms khi phát phát hiện .ad-showing.',
      'Sửa dứt điểm lỗi đỏ trên chrome://extensions bằng cách loại bỏ đường link offline in-house.txt.',
      'Tối giản gọn sạch thư mục adblock-extension (chỉ giữ các thư mục cốt lõi và manifest.json).'
    ],
    fileTree: [
      'manifest.json — Cấu hình Chrome Extension Manifest V3',
      'background/ (service-worker.js, dnr-manager.js, scripting-manager.js, updater.js, storage.js)',
      'content/ (cosmetic.js, cosmetic.css, scriptlets.js, anti-adblock.js, selectors.js)',
      'options/ (options.html, options.css, options.js) — Trang Dashboard quản lý Whitelist/Blacklist',
      'popup/ (popup.html, popup.css, popup.js) — Bảng bật/tắt nhanh trên thanh công cụ',
      'rules/seed-rules.json — 68 luật chặn mạng mặc định',
      'icons/ (icon16.png, icon48.png, icon128.png)'
    ],
    steps: [
      { step: 1, text: 'Nhấp nút "🚀 Cài Nhanh (.bat 1-chạm)" để file tự mở Chrome Extensions và mở thư mục tiện ích' },
      { step: 2, text: 'Bật "Chế độ dành cho nhà phát triển" (Developer mode) ở góc trên bên phải Chrome' },
      { step: 3, text: 'Kéo thả thư mục adblock-extension vào màn hình Chrome là xong' },
      { step: 4, text: 'Bấm vào icon AdShield Pro trên thanh Chrome để xem số quảng cáo đã chặn' }
    ],
    specs: {
      'Thư Mục Gốc': 'D:\\Tr_Hiuz\\Tiện ích\\adblock-extension',
      'Chuẩn Tiện Ích': 'Chrome Manifest V3 (v1.0.0)',
      'Gói Nén Dự Phòng': 'downloads/adshield.zip (48 KB)',
      'Quyền Hạn': 'declarativeNetRequest, storage, scripting, alarms'
    },
    actions: {
      primary: {
        label: '🚀 Cài Nhanh (.bat 1-chạm)',
        href: 'downloads/Cai_Dat_AdShield.bat',
        isDownload: true
      },
      secondary: {
        label: '📦 Tải Gói .ZIP',
        href: 'downloads/adshield.zip',
        isDownload: true
      }
    }
  },
  {
    id: 'dns-server',
    shortMenuName: '🌐 DNS Guardian (Máy Chủ DNS)',
    name: 'DNS Guardian Server',
    vietnameseTitle: 'DNS Guardian — Hệ Thống DNS Server Chặn Quảng Cáo Riêng',
    tagline: 'Máy chủ DNS UDP (RFC 1035) tự xây dựng từ A–Z kèm bộ nhớ đệm TTL, lọc EasyList Trie và giao diện thống kê.',
    category: 'network',
    folderPath: 'D:\\Tr_Hiuz\\Tiện ích\\dns-server',
    statusLabel: 'Máy Chủ Node.js',
    badge: 'RFC 1035 DNS SERVER',
    iconSvg: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#122b24"/><circle cx="50" cy="50" r="32" fill="#091915"/><path d="M50 26 C64 30 70 34 70 48 C70 63 58 73 50 76 C42 73 30 63 30 48 C30 34 36 30 50 26 Z" fill="none" stroke="#6ee7b7" stroke-width="4"/><circle cx="50" cy="51" r="9" fill="#6ee7b7"/></svg>`,
    pills: [
      '🌐 Backend UDP RFC 1035',
      '⚡ Bộ Nhớ Đệm TTL Cache',
      '🛡️ Lọc EasyList & Hosts',
      '📊 Web UI Thời Gian Thực'
    ],
    summary: 'Hệ thống máy chủ DNS chặn quảng cáo riêng (tương tự Pi-hole / AdGuard Home) được viết từ đầu bằng Node.js / TypeScript: giải mã gói tin nhị phân UDP, lưu cache giảm độ trễ dưới 1ms, chặn tên miền quảng cáo về 0.0.0.0 và kèm giao diện quản lý thống kê.',
    features: [
      {
        title: 'Backend Phân Giải & Chặn Quảng Cáo UDP',
        desc: 'Tự xử lý gói tin nhị phân RFC 1035 trên cổng UDP 53 (tự động chuyển sang 5353 nếu thiếu quyền Admin), trả về 0.0.0.0 cho domain quảng cáo.'
      },
      {
        title: 'Bộ Lọc Reverse Domain Trie (>8M/s)',
        desc: 'Đọc trực tiếp danh sách chuẩn EasyList (||domain^) và Hosts (0.0.0.0 domain), ưu tiên Whitelist (@@||) hơn Blacklist.'
      },
      {
        title: 'Bộ Nhớ Đệm Dynamic TTL Cache',
        desc: 'Lưu bản ghi đã phân giải vào RAM, tự đếm ngược TTL trực tiếp trên byte gói tin và bỏ qua bản ghi có TTL=0.'
      },
      {
        title: 'Giao Diện Web Quản Lý & Thống Kê',
        desc: 'Hiển thị trực quan tổng truy vấn, số lượng chặn, tỷ lệ % chặn, nhật ký thời gian thực (SSE) và thêm/xóa rule tùy chỉnh.'
      }
    ],
    whatsAdded: [
      'Tối ưu hóa tốc độ tra cứu ReverseTrie không cấp phát bộ nhớ trung gian và kiểm tra giới hạn tên miền 255 byte.',
      'Sửa tự động chuyển cổng dự phòng 53 -> 5353 đồng bộ với bộ nhớ đệm.',
      'Dọn sạch các thư mục test trung gian bên trong dns-server.'
    ],
    fileTree: [
      'src/dns/ (server.ts, packet.ts, cache.ts, forwarder.ts, sinkhole.ts) — Lõi DNS UDP & Cache',
      'src/filter/ (trie.ts, parser.ts, rule-manager.ts) — Bộ lọc EasyList & Hosts',
      'src/api/ (server.ts, routes.ts, telemetry.ts) — Backend thống kê & API',
      'dashboard/ (index.html, css/style.css, js/dashboard.js) — Giao diện quản lý thống kê',
      'rules/ (easylist.txt, hosts.txt) — Danh sách tên miền chặn mẫu'
    ],
    steps: [
      { step: 1, text: 'Mở PowerShell tại thư mục: cd "D:\\Tr_Hiuz\\Tiện ích\\dns-server"' },
      { step: 2, text: 'Chạy lệnh khởi động máy chủ: npm start' },
      { step: 3, text: 'Khi máy chủ đang chạy, có thể cấu hình DNS máy tính về 127.0.0.1 hoặc tải cấu hình .mobileconfig bên dưới' }
    ],
    specs: {
      'Thư Mục Gốc': 'D:\\Tr_Hiuz\\Tiện ích\\dns-server',
      'Ngôn Ngữ': 'Node.js / TypeScript (Zero external runtime deps)',
      'Cổng Mặc Định': 'UDP 53 (hoặc 5353) · Quản trị HTTP 3000',
      'Cấu Hình Di Động': 'downloads/adblock-dns.mobileconfig'
    },
    actions: {
      primary: {
        label: '📱 Tải Cấu Hình DNS (.mobileconfig)',
        href: 'downloads/adblock-dns.mobileconfig',
        isDownload: true
      }
    }
  },
  {
    id: 'facebook-toolkit',
    shortMenuName: '⚡ Facebook Toolkit Pro',
    name: 'Facebook Toolkit Pro MV3',
    vietnameseTitle: 'Facebook Toolkit Pro — Bộ Tiện Ích Tự Động Hóa & Bảo Mật Facebook',
    tagline: 'Lọc bạn bè không tương tác, dọn dẹp trang cá nhân, sao lưu album ảnh/video HD, chống Seen/Typing và hẹn giờ đăng bài.',
    category: 'extensions',
    folderPath: 'D:\\Tr_Hiuz\\Tiện ích\\facebook-toolkit',
    statusLabel: 'Hoạt Động Ngay (MV3)',
    badge: 'CHROME EXTENSION · MV3',
    iconSvg: `<svg viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#1877f2"/><circle cx="50" cy="50" r="32" fill="#ffffff"/><path d="M54 36 h-6 c-3.3 0 -6 2.7 -6 6 v6 h-5 v8 h5 v20 h8 v-20 h6 l1 -8 h-7 v-5 c0 -1.1 0.9 -2 2 -2 h5 z" fill="#1877f2"/></svg>`,
    pills: [
      '👥 Lọc Bạn Bè Kém Tương Tác',
      '🧹 Dọn Dẹp Post & Comment',
      '📥 Sao Lưu Album & Video HD',
      '🛡️ Khiên Avatar & Chống Seen/Typing'
    ],
    summary: 'Tiện ích mở rộng Chrome Manifest V3 đa năng hỗ trợ lọc bạn bè không tương tác, xóa dọn dẹp bài viết lịch sử, tải đồng loạt album ảnh dạng ZIP, tải video HD, bật khiên bảo vệ ảnh đại diện, chặn biên nhận đã xem Seen và chỉ báo Typing...',
    features: [
      { title: 'Quét & Lọc Bạn Bè Không Tương Tác', desc: 'Đánh giá điểm tương tác, lọc tài khoản ngưng hoạt động và hỗ trợ hủy kết bạn theo hàng đợi có giãn cách an toàn.' },
      { title: 'Dọn Dẹp Nội Dung Dòng Thời Gian', desc: 'Tìm kiếm bài viết, ảnh, bình luận theo từ khóa hoặc khoảng thời gian để ẩn hoặc xóa hàng loạt.' },
      { title: 'Tải Phương Tiện & Sao Lưu Dữ Liệu', desc: 'Tải toàn bộ ảnh album về file nén ZIP và trích xuất luồng video HD/SD progressive.' },
      { title: 'Bảo Mật & Chế Độ Ẩn Danh', desc: 'Bật khiên bảo vệ ảnh đại diện (Avatar Guard), chặn gửi tín hiệu Đã Xem (Seen) và Đang Nhập (Typing).' },
      { title: 'Chúc Sinh Nhật Qua Messenger (Theo Danh Sách Chọn)', desc: 'Tự động gửi tin nhắn Messenger riêng chúc mừng sinh nhật cho những người bạn được chọn trước (Whitelist), tuyệt đối không tự ý đăng lên tường.' }
    ],
    whatsAdded: [
      'Kiến trúc Chrome Extension Manifest V3 dạng ES Module hoàn toàn độc lập.',
      'Chúc sinh nhật riêng tư: Chỉ gửi tin nhắn Messenger cho bạn bè được chọn trong danh sách Whitelist, không đăng bài lên tường.',
      'Động cơ Token Bucket kết hợp Gaussian Jitter kiểm soát chặt chẽ tần suất thao tác.',
      'Tích hợp chế độ giả lập (Simulation Mode) phục vụ kiểm thử ngoại tuyến 100% an toàn.'
    ],
    fileTree: [
      'manifest.json — Cấu hình Chrome Extension Manifest V3',
      'background/ (service-worker.js, storage-manager.js, dnr-manager.js, alarms-manager.js, fb-api.js)',
      'content/ (content-isolated.js, content-main.js)',
      'popup/ (popup.html, popup.js)',
      'dashboard/ (index.html, dashboard.js)',
      'shared/ (action-runner.js, rate-limiter.js, circuit-breaker.js, constants.js, mock-fixtures.js)'
    ],
    steps: [
      { step: 1, text: 'Nhấp nút "🚀 Cài Nhanh (.bat 1-chạm)" để mở trang Extensions và thư mục tiện ích' },
      { step: 2, text: 'Bật "Chế độ dành cho nhà phát triển" (Developer mode) ở góc trên bên phải Chrome' },
      { step: 3, text: 'Kéo thả thư mục facebook-toolkit vào giữa màn hình Chrome' },
      { step: 4, text: 'Ghim biểu tượng tiện ích lên thanh công cụ để bắt đầu sử dụng' }
    ],
    specs: {
      'Thư Mục Gốc': 'D:\\Tr_Hiuz\\Tiện ích\\facebook-toolkit',
      'Chuẩn Tiện Ích': 'Chrome Manifest V3 (v1.0.0)',
      'Gói Nén Dự Phòng': 'downloads/facebook-toolkit.zip',
      'Quyền Hạn': 'storage, alarms, declarativeNetRequest, downloads'
    },
    actions: {
      primary: {
        label: '🚀 Cài Nhanh (.bat 1-chạm)',
        href: 'downloads/Cai_Dat_Facebook_Toolkit.bat',
        isDownload: true
      },
      secondary: {
        label: '📦 Tải Gói .ZIP',
        href: 'downloads/facebook-toolkit.zip',
        isDownload: true
      }
    }
  }
];

export function getCatalogItemById(id) {
  return CATALOG_ITEMS.find((item) => item.id === id) || null;
}
