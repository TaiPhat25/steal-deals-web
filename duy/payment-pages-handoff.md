# Payment Pages Handoff

Các trang/luồng FE đã thêm cho VNPAY.

## Routes chính

- `/newcheckout`
  - Checkout hiện ưu tiên VNPAY.
  - 1 store: tạo order xong redirect sang `/checkout/payment-processing?orderId=...`.
  - Nhiều store: tạo nhiều order xong redirect sang `/orders` để user thanh toán từng order.

- `/checkout/payment-processing?orderId=...`
  - Poll `GET /api/transactions/order/{orderId}` từ Payment API.
  - Khi transaction có `checkoutUrl` và còn hạn thì tự redirect sang VNPAY.
  - Chờ tối đa 120 giây, có progress/loading và link qua order detail.

- `/orders`
  - Danh sách order thật từ Order API.
  - Load thêm transaction từ Payment API.
  - User có thể bấm `Pay now` nếu order có VNPAY link còn usable.
  - Header/mobile menu đã có `My Orders` để user vào chủ động.

- `/orders/[id]`
  - Trang detail order.
  - Hiển thị payment status, amount, gateway ref, VNPAY transaction no, countdown.
  - Có dòng `Payment link: Open VNPAY checkout` khi `checkoutUrl` tồn tại.
  - Có nút refresh để lấy lại trạng thái mới nhất.

- `/payment/vnpay-return`
  - Trang user quay về sau khi rời VNPAY.
  - Verify query bằng Payment API `/api/vnpay/return`.
  - Sau đó load order + transaction để hiển thị success/failed/pending.

## Files chính

- `lib/api/payment.ts`
- `components/payment/PaymentProcessingMain.tsx`
- `components/payment/VnPayReturnMain.tsx`
- `components/payment/payment-view-utils.ts`
- `components/orders/OrderHistoryMain.tsx`
- `components/orders/OrderDetailMain.tsx`

## Lưu ý backend/local

- FE gọi thẳng Payment API qua `NEXT_PUBLIC_PAYMENT_API_URL`.
- Payment service cần bật CORS cho `http://localhost:3000`.
- Nếu chạy Docker, sau khi sửa BE phải rebuild image:

```powershell
docker compose build --no-cache payment-api
docker compose up -d --force-recreate payment-api
```

## Điểm kỹ thuật đáng nhớ

- `expiresAt` từ .NET có thể thiếu hậu tố `Z`; FE đã normalize như UTC để countdown không bị `Expired` sai.
- IPN vẫn là source of truth. Return page chỉ verify/hiển thị trạng thái cho browser.
- Hiện tại business logic là 1 order = 1 transaction URL, nên nhiều store phải thanh toán từng order.
