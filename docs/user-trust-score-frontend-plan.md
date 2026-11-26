# Trust Score — Kế hoạch frontend MVP

Cập nhật: 2026-11-25. Backend đã implement và kiểm thử Docker. Frontend MVP đã implement theo các mục bên dưới. Theo yêu cầu hiện tại, chỉ thay đổi FE để khớp API; không thêm/sửa file test hoặc chạy tiếp test, lint, build. Người dùng kiểm tra giao diện trước khi deploy.

## 1. Phạm vi và hiện trạng

Tận dụng các trang hiện có, không thêm route mới. Ba phần chính: điểm trên profile, thông báo checkout và seller đánh dấu NoShow; đồng bộ trạng thái ở các trang đơn hàng liên quan.

| Trang | Hiện tại | Cần thêm/sửa |
| --- | --- | --- |
| `/profile` | Đã gọi profile API và có ô Trust score | Hiển thị `x/100`, xử lý thiếu dữ liệu |
| `/newcheckout` | Checkout Redis cart/VNPAY đang dùng | Hiển thị lỗi policy; xử lý tạo đơn nhiều store thành công một phần |
| `/checkout` | Checkout legacy/direct vẫn truy cập được | Cùng xử lý lỗi và thành công một phần; giữ thiết kế hiện có |
| `/seller/orders` | Danh sách, lọc trạng thái và link Manage | Thêm NoShow vào filter/badge, hiển thị deadline để kiểm kê |
| `/seller/orders/details?id=...` | Có pickup code/deadline, nút Confirm/Cancel trực tiếp | Thay thao tác cũ bằng command NoShow có xác nhận |
| `/seller` | Có nút Confirm cho Pending | Bỏ Confirm thủ công, dẫn đến chi tiết để quản lý |
| `/orders`, `/orders/[id]` | Đã đọc Order/Payment API | Hiển thị NoShow đúng, chỉnh điều kiện review và thông báo trạng thái |

Business giữ nguyên: khởi tạo 100, thanh toán +2, NoShow -15, biên 0–100. Nhóm Limited tối đa một Pending toàn user; dưới 50 có cooldown 24h sau NoShow đủ điều kiện. Backend quyết định toàn bộ policy.

Không thêm Completed, xác nhận pickup, quản lý/lịch sử điểm hoặc UI admin. Khách nhận hàng bằng pickup code; Confirmed nghĩa là đã thanh toán. Hủy thanh toán giữ flow VNPAY; không dùng API Cancelled trực tiếp.

## 2. Bước 1 — Đồng bộ API và kiểu dữ liệu

File: `lib/api/client.ts`, `lib/api/dashboard-types.ts`, `lib/api/order.ts`, `components/seller/SellerDemoProvider.tsx`.

- [x] Parser đọc được cả `application/json` và `application/problem+json`, giữ nguyên cơ chế refresh token hiện có.
- [x] Dùng `ApiClientError.status/details` để đọc ProblemDetails: `detail`, `reasonCode`, `score`, `restrictedUntilUtc`, `maxPendingOrders`. Đây là field trực tiếp, không có wrapper `data`.
- [x] Bổ sung `canMarkNoShow: boolean`, `noShowIneligibleReason: string | null` vào OrderResponse; thêm NoShow vào danh sách status/type của seller. Thiếu metadata thì không cho thao tác.
- [x] Thêm `markOrderNoShow(accessToken, orderId)` gọi `POST /api/order/orders/{id}/no-show`, body trống, trả OrderResponse.
- [x] Cập nhật fixture/demo tương ứng nếu type yêu cầu; NoShow trên dữ liệu thật chỉ thành công sau response API, không giả lập thành công khi backend lỗi.

Không cần API đọc điểm mới hoặc gọi purchase-eligibility trước checkout. Các API tạo order đã tự kiểm tra quyền mua.

## 3. Bước 2 — Profile

File: `components/profile/ProfileMain.tsx`, `ProfileAccountSections.tsx`; type sẵn có trong `lib/api/store-types.ts`.

- [x] Tận dụng card hiện có, hiển thị `Điểm tín nhiệm: 85/100`; phần counters không bắt buộc.
- [x] Khi userTrustScore null, hiển thị chưa có dữ liệu hoặc ẩn card, không tự gán điểm thưởng.
- [x] Tiếp tục lấy profile khi vào trang; không tự cộng/trừ tại FE, không thêm polling/realtime.

Đạt khi: tải lại profile sau consumer xử lý payment/NoShow hiển thị đúng điểm backend.

## 4. Bước 3 — Checkout

File: `components/checkout/NewCheckoutMain.tsx`, `CheckoutMain.tsx`; tái sử dụng API client và cart provider hiện có.

| Response | Hiển thị |
| --- | --- |
| 403 / TrustScorePurchaseSuspended | `detail`, điểm và thời gian đặt lại nếu backend trả; format UTC sang giờ hiển thị của app |
| 409 / PendingOrderLimitReached | `detail`, link xem đơn Pending để tiếp tục thanh toán |
| 503 / DependencyUnavailable | Lỗi hệ thống và cho thử lại, không hiển thị như user bị phạt |
| 401 hoặc lỗi khác | Theo xử lý session/validation hiện có |

- [x] Khóa nút submit khi gửi; không tự chặn bằng điểm cache hoặc tự tính ngưỡng/cooldown.
- [x] Thay cách `Promise.all` hiện tại bằng thu kết quả theo store (ví dụ allSettled), vì có thể một đơn thành công và đơn khác bị quota từ chối.
- [x] Giữ ID/link thanh toán của đơn đã tạo; hiển thị lỗi của store thất bại. Không báo toàn bộ thất bại hoặc gửi lại những store đã thành công.
- [x] Redis cart: refresh sau khi có kết quả, giữ cart store thất bại. Legacy cart: chỉ bỏ các dòng thuộc store đã tạo đơn thành công; không clear toàn bộ khi thành công một phần.
- [x] Giữ điều hướng hiện có khi thành công hoàn toàn. Nếu thành công một phần, ở lại trang hiển thị đơn đã tạo và link tiếp tục thanh toán; không tạo page mới.
- [x] Không tự retry request tạo đơn khi timeout/mất mạng chưa rõ kết quả; cho user kiểm tra `/orders` trước khi đặt lại.

Ví dụ user Limited chọn hai store: một order thành công, store kia trả 409; FE giữ đơn đầu để thanh toán và giữ cart của store còn lại.

## 5. Bước 4 — Seller NoShow

File: `app/(seller)/seller/orders/page.tsx`, `orders/details/page.tsx`, `app/(seller)/seller/page.tsx`; dùng `SellerDemoProvider`, `DashboardDialog`, `DashboardButton`, badge/toast sẵn có.

- [x] Bỏ nút Confirm/Cancel trực tiếp hiện đang có trên seller dashboard/chi tiết. Confirmed chỉ đến từ payment event; không gọi PATCH để đặt Confirmed/NoShow/Cancelled.
- [x] Danh sách thêm NoShow vào filter/badge; bổ sung pickup code/deadline vào thông tin kiểm kê, dùng lịch sử sẵn có để xem đơn qua ngày.
- [x] Đặt nút “Đánh dấu không đến nhận” ở trang chi tiết khi `canMarkNoShow=true`; không cần lặp nút trên mọi màn hình.
- [x] Khi không đủ điều kiện, có thể hiển thị `noShowIneligibleReason`. Không tự suy luận chỉ bằng status hoặc đồng hồ FE; reload để lấy eligibility mới khi cần.
- [x] Modal xác nhận seller đã kiểm kê và khách chưa nhận hàng; bản MVP không cần ô nhập reason.
- [x] Submit NoShow qua API riêng, khóa nút khi gửi; 200 thì dùng OrderResponse cập nhật provider và trang chi tiết/danh sách, đóng modal và báo thành công.
- [x] 403/409/503 hiển thị lỗi thực; 409 reload order để cập nhật trạng thái/eligibility. Demo/fallback không được thực hiện hoặc báo thành công một thao tác NoShow thật.

Seller chỉ thao tác order, không xem/sửa điểm buyer. Quá deadline chỉ cho phép thao tác, không chứng minh khách chưa nhận hàng. NoShow không tự refund/restock; điểm xử lý bất đồng bộ.

## 6. Bước 5 — Đồng bộ buyer order/payment

File: `components/orders/OrderHistoryMain.tsx`, `OrderDetailMain.tsx`, `app/(store)/globals.css`; rà `components/payment/VnPayReturnMain.tsx` nếu dùng cùng logic trạng thái.

- [x] Thêm badge/copy NoShow nhất quán; filter buyer đang lấy status từ dữ liệu thì chỉ cần label phù hợp.
- [x] Sửa điều kiện review đang cho Pending/Completed thành Confirmed; NoShow không được mở nút review.
- [x] Payment Success + Order NoShow vẫn là đã thanh toán nhưng không đến nhận; không hiển thị “đang chờ xác nhận” chỉ vì status khác Confirmed.
- [x] Giữ pickup code cho flow nhận hàng; không thêm nút Completed/đã nhận hàng hoặc thao tác cập nhật điểm từ return URL.

## 7. Bàn giao

- Đã đồng bộ API/types, profile, checkout, seller NoShow và trạng thái đơn buyer.
- Checkout giữ đơn thành công khi một phần bị lỗi; không gửi lại store đã tạo đơn, giữ cart thất bại và không dùng voucher hai lần khi retry.
- Seller bỏ Confirm/Cancel thủ công; NoShow lấy eligibility mới từ backend và chỉ cập nhật sau response API thành công.
- Đã xóa các file test mới thêm theo yêu cầu; file test cũ giữ nguyên. Không chạy tiếp test/lint/build trong lượt hoàn thiện này.
- Cập nhật handoff storefront/dashboard; không đổi backend hoặc deploy server.

Người dùng kiểm tra dần trên các trang trong bảng: profile `x/100`, checkout bị hạn chế, tạo đơn nhiều store, seller đánh NoShow và buyer thấy trạng thái tương ứng.

Deploy sau khi duyệt FE: kiểm tra đúng API base URL, migration Identity/Order trên server và `TrustScoreConsumer__Enabled=true`.
