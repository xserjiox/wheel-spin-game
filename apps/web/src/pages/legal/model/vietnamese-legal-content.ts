import type { LegalDocument } from "./legal-content";

const googleLinks = [
  {
    label: "Cách Google sử dụng dữ liệu từ các trang web đối tác",
    href: "https://policies.google.com/technologies/partner-sites",
  },
  {
    label: "Chính sách quyền riêng tư của Google",
    href: "https://policies.google.com/privacy",
  },
  {
    label: "Điều khoản xử lý dữ liệu của Google Ads",
    href: "https://business.safety.google/adsprocessorterms/",
  },
];

export const vietnameseLegalDocuments = {
  privacy: {
    eyebrow: "PHÁP LÝ",
    title: "Chính sách quyền riêng tư",
    summary:
      "Chính sách này giải thích cách GatherWheel xử lý dữ liệu cá nhân, bao gồm dữ liệu Google Analytics tùy chọn.",
    effectiveDateLabel: "Ngày có hiệu lực",
    controllerTitle: "1. Bên kiểm soát dữ liệu và thông tin liên hệ",
    contactLabel: "Liên hệ về quyền riêng tư",
    controllerFallback:
      "Đơn vị vận hành dịch vụ là bên kiểm soát dữ liệu. Đơn vị vận hành chính thức phải công bố tên pháp lý và thông tin liên hệ về quyền riêng tư tại đây trước khi ra mắt.",
    sections: [
      {
        title: "2. Dữ liệu chúng tôi xử lý",
        items: [
          "Dữ liệu phòng do bạn cung cấp: tên hiển thị, tên phòng, các lựa chọn trên vòng quay, đề xuất, mật khẩu tùy chọn, quyền hạn, dấu thời gian và kết quả quay chung. Mật khẩu chỉ được lưu dưới dạng mã băm một chiều Argon2.",
          "Dữ liệu phiên và bảo mật: mã thông báo phiên phòng ngẫu nhiên (cơ sở dữ liệu chỉ lưu mã băm của nó), bản ghi IP tạm thời trong bộ nhớ dùng để hạn chế các lần tham gia thất bại và nhật ký HTTP vận hành mà nhà cung cấp dịch vụ lưu trữ có thể tạo.",
          "Dữ liệu trên thiết bị: ngôn ngữ, lối tắt phòng đã lưu, mẫu vòng quay và bản ghi đồng ý phân tích của bạn.",
          "Google Fonts nhận địa chỉ IP và siêu dữ liệu HTTP thông thường khi trình duyệt của bạn yêu cầu phông chữ giao diện.",
        ],
      },
      {
        title: "3. Google Analytics tùy chọn",
        items: [
          "Google Analytics 4 không được tải và không nhận yêu cầu phân tích nào cho đến khi bạn chủ động cho phép phân tích. Việc từ chối phân tích không hạn chế dịch vụ.",
          "Sau khi có sự đồng ý, chúng tôi gửi lượt xem trang đã chuẩn hóa và các sự kiện sản phẩm room_create, room_join_start, room_join, room_join_failed, spin_start, share_room, share_room_failed, preset_select, template_select, template_save, elimination_enable và round_reset. Sự kiện tham gia có thể bao gồm các tham số phân loại cố định entry_type, has_password và reason; sự kiện chia sẻ có thể bao gồm role và method. Các tham số này không chứa nội dung do người dùng cung cấp. URL phòng được thay bằng /r/:room; chuỗi truy vấn, mã phòng, tên, mật khẩu và nội dung vòng quay không được gửi.",
          "Google có thể xử lý thông tin thiết bị/trình duyệt, vị trí gần đúng suy ra từ kết nối, địa chỉ IP trong quá trình truyền, thông tin nguồn giới thiệu, dấu thời gian và mã định danh phân tích bên thứ nhất được lưu trong cookie _ga.",
          "Lưu trữ quảng cáo, dữ liệu người dùng quảng cáo, cá nhân hóa quảng cáo, Google Signals, User-ID và quảng cáo được cá nhân hóa đều bị tắt trong cấu hình thẻ của chúng tôi.",
        ],
      },
      {
        title: "4. Mục đích và cơ sở pháp lý",
        items: [
          "Cung cấp, đồng bộ và quản lý các phòng bạn yêu cầu — thực hiện hợp đồng hoặc các bước trước hợp đồng (Điều 6(1)(b) GDPR).",
          "Ngăn chặn lạm dụng, duy trì độ tin cậy của dịch vụ và cung cấp giao diện nhất quán, bao gồm phông chữ — lợi ích hợp pháp của chúng tôi (Điều 6(1)(f)), được cân nhắc với quyền của người dùng.",
          "Đo lường tổng lượt truy cập và việc sử dụng tính năng để cải thiện GatherWheel — sự đồng ý của bạn (Điều 6(1)(a) và các quy tắc ePrivacy khi áp dụng). Bạn có thể rút lại sự đồng ý bất cứ lúc nào.",
        ],
      },
      {
        title: "5. Bên nhận dữ liệu và chuyển dữ liệu quốc tế",
        items: [
          "Những người trong cùng phòng thấy tên hiển thị, nội dung phòng và kết quả chung. Đề xuất hiển thị không kèm tên tác giả, nhưng bản ghi trên máy chủ vẫn liên kết với người tham gia đã gửi.",
          "Railway xử lý dữ liệu ứng dụng, cơ sở dữ liệu và dữ liệu vận hành với vai trò nhà cung cấp dịch vụ lưu trữ theo cấu hình tài khoản vận hành chính thức.",
          "Google nhận yêu cầu phông chữ và, chỉ sau khi có sự đồng ý phân tích, dữ liệu GA4 với vai trò nhà cung cấp phân tích của chúng tôi. Pháp nhân Google ký hợp đồng có liên quan và các bên xử lý phụ có thể xử lý dữ liệu bên ngoài Khu vực Kinh tế châu Âu (EEA).",
          "Khi dữ liệu rời EEA, các biện pháp bảo vệ có thể bao gồm quyết định công nhận mức độ bảo vệ đầy đủ, Khung bảo vệ dữ liệu EU–Hoa Kỳ khi áp dụng và các Điều khoản hợp đồng tiêu chuẩn của Ủy ban châu Âu. Bạn có thể yêu cầu chúng tôi cung cấp thông tin về các biện pháp bảo vệ có liên quan.",
        ],
        links: googleLinks,
      },
      {
        title: "6. Thời gian lưu giữ",
        items: [
          "Phòng và các bản ghi cơ sở dữ liệu liên quan hết hạn sau bảy ngày không hoạt động và được xóa trong quy trình dọn dẹp hằng giờ; chủ phòng có thể xóa phòng sớm hơn. Cookie phiên phòng hết hạn sau bảy ngày.",
          "Bản ghi tham gia thất bại chỉ tồn tại trong bộ nhớ máy chủ. Nhật ký lưu trữ và bản sao lưu tuân theo thời gian lưu giữ đã cấu hình của nhà cung cấp vận hành chính thức.",
          "Lối tắt phòng đã lưu, ngôn ngữ và mẫu vẫn nằm trên thiết bị cho đến khi bị xóa. Bản ghi đồng ý hết hạn sau 180 ngày, sau đó chúng tôi sẽ hỏi lại.",
          "Cookie phân tích được cấu hình để tồn tại không quá 180 ngày và không được gia hạn khi bạn truy cập lại. Khi bạn rút lại sự đồng ý, trình duyệt được yêu cầu xóa cookie _ga của GatherWheel.",
          "Dữ liệu cấp người dùng và sự kiện của GA4 dự kiến được lưu trong hai tháng. Theo điều khoản của mình, Google có thể lưu báo cáo tổng hợp hoặc dữ liệu cần giữ vì lý do bảo mật hay pháp lý lâu hơn.",
        ],
      },
      {
        title: "7. Lựa chọn và quyền của bạn",
        paragraphs: [
          "Dùng “Cài đặt cookie” trên bất kỳ trang nào để từ chối, cho phép hoặc rút lại sự đồng ý phân tích dễ dàng như khi bạn đồng ý. Việc rút lại không ảnh hưởng đến hoạt động xử lý đã diễn ra trước đó.",
          "Theo phạm vi áp dụng của GDPR, bạn có thể yêu cầu truy cập, chỉnh sửa, xóa, hạn chế xử lý hoặc chuyển dữ liệu; phản đối việc xử lý dựa trên lợi ích hợp pháp; và rút lại sự đồng ý. Hãy liên hệ với chúng tôi qua thông tin ở trên. Bạn có thể khiếu nại với cơ quan giám sát nơi bạn sinh sống, làm việc hoặc cho rằng vi phạm đã xảy ra.",
          "Cài đặt phòng cho phép người tham gia hiện tại tải xuống hoặc xóa dữ liệu gắn với danh tính trong phòng đó; chủ phòng có thể xóa phòng. Với yêu cầu về dữ liệu phân tích, hãy liên hệ với chúng tôi vì bản xuất dữ liệu của ứng dụng không chứa dữ liệu Google Analytics.",
        ],
      },
      {
        title: "8. Dữ liệu bắt buộc, bảo mật và quyết định tự động",
        paragraphs: [
          "Tên hiển thị và nội dung phòng cần cho tính năng đã chọn là dữ liệu bắt buộc để cung cấp tính năng đó; mật khẩu, lối tắt đã lưu, mẫu và sự đồng ý phân tích là tùy chọn. Chúng tôi sử dụng mã thông báo truy cập, mã băm, giới hạn tần suất, cookie có hạn chế truy cập và lưu trữ có thời hạn, nhưng không dịch vụ trực tuyến nào hoàn toàn không có rủi ro.",
          "GatherWheel không đưa ra quyết định tạo ra tác động pháp lý hoặc tác động đáng kể tương tự. Kết quả ngẫu nhiên chỉ được tạo khi người tham gia có quyền bắt đầu lượt quay. Chúng tôi không bán dữ liệu cá nhân hoặc sử dụng dữ liệu đó cho quảng cáo hay lập hồ sơ.",
        ],
      },
      {
        title: "9. Thay đổi",
        paragraphs: [
          "Chúng tôi sẽ cập nhật thông báo này và ngày có hiệu lực khi hoạt động xử lý có thay đổi đáng kể, đồng thời xin lại sự đồng ý khi cần.",
        ],
      },
    ],
  },
  cookies: {
    eyebrow: "PHÁP LÝ",
    title: "Chính sách cookie",
    summary:
      "Chính sách này liệt kê cookie và bộ nhớ trình duyệt của GatherWheel, bao gồm Google Analytics tùy chọn.",
    effectiveDateLabel: "Ngày có hiệu lực",
    controllerTitle: "1. Đơn vị vận hành bộ nhớ lưu trữ này",
    contactLabel: "Liên hệ về quyền riêng tư",
    controllerFallback:
      "Đơn vị vận hành chính thức phải công bố tên pháp lý và thông tin liên hệ về quyền riêng tư tại đây trước khi ra mắt.",
    sections: [
      {
        title: "2. Cookie cần thiết và bộ nhớ cục bộ",
        items: [
          "gatherwheel_session_<room-code> — mã thông báo truy cập phòng bảo mật, HttpOnly; hoàn toàn cần thiết; hết hạn sau bảy ngày.",
          "gatherwheel-locale — tùy chọn ngôn ngữ; localStorage; giữ lại cho đến khi được thay đổi hoặc xóa.",
          "gatherwheel-rooms và khóa cũ gatherwheel-host-rooms — lối tắt phòng được lưu theo yêu cầu của bạn; localStorage; cho đến khi bị xóa hoặc phòng hết hạn.",
          "gatherwheel-templates — mẫu vòng quay được lưu trên thiết bị này; localStorage; cho đến khi bị xóa.",
          "gatherwheel-consent-v1 — lựa chọn phân tích, thời điểm quyết định và ngày hết hạn; localStorage hoàn toàn cần thiết; 180 ngày.",
        ],
      },
      {
        title: "3. Cookie phân tích tùy chọn",
        items: [
          "_ga — phân biệt trình duyệt cho GA4; cookie bên thứ nhất; không quá 180 ngày.",
          "_ga_<container-id> — duy trì trạng thái phiên GA4; cookie bên thứ nhất; không quá 180 ngày.",
          "Thời hạn được cấu hình để không gia hạn khi bạn truy cập lại. Google Analytics không được tải và các cookie này không được đặt trước khi có sự đồng ý.",
        ],
      },
      {
        title: "4. Sự đồng ý và việc xóa",
        paragraphs: [
          "Biểu ngữ đầu tiên cung cấp hai lựa chọn Cho phép và Từ chối với mức độ dễ tiếp cận như nhau. “Quản lý tùy chọn” có công tắc phân tích riêng. Lựa chọn của bạn không chặn quyền truy cập.",
          "Dùng nút “Cài đặt cookie” luôn có sẵn để thay đổi hoặc rút lại sự đồng ý. Khi bạn rút lại, phân tích bị tắt và GatherWheel cố gắng xóa cookie _ga của mình. Công cụ của trình duyệt cũng có thể xóa cookie và localStorage, nhưng việc xóa bộ nhớ cần thiết có thể khiến bạn đăng xuất khỏi phòng hoặc mất tùy chọn đã lưu.",
        ],
      },
      {
        title: "5. Yêu cầu đến bên thứ ba",
        paragraphs: [
          "Yêu cầu Google Analytics chỉ được gửi sau khi có sự đồng ý. Yêu cầu Google Fonts hiện cần thiết để cung cấp phông chữ giao diện và có thể tiết lộ địa chỉ IP cùng siêu dữ liệu yêu cầu của bạn cho Google ngay cả khi bạn từ chối phân tích; chúng không thuộc phạm vi đồng ý GA.",
        ],
        links: googleLinks,
      },
    ],
  },
} satisfies { privacy: LegalDocument; cookies: LegalDocument };
