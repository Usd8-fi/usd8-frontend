# Pool bảo hiểm {#cover-pools}

Pool bảo hiểm là các vault công khai mà bất kỳ ai cũng có thể nạp và rút bất cứ lúc nào. Mỗi pool bảo hiểm

- nhận nạp một token cụ thể, ví dụ wstETH
- trả APY bằng USD8, lấy từ lợi suất ngân quỹ của USD8
- có quy mô giới hạn

<div class="example-box">
  Cảnh báo: tài sản trong pool bảo hiểm sẽ được dùng để chi trả bồi thường nếu bất kỳ token được bảo hiểm nào giảm giá từ 20% trở lên.
</div>


## Token được bảo hiểm {#insured-tokens}

Các token được bảo hiểm đều được đánh giá, lựa chọn kỹ lưỡng và điều chỉnh liên tục. USD8 công nhận các báo cáo kiểm toán bảo mật độc lập hoặc chứng nhận từ những nguồn sau.

- [OpenZeppelin](https://www.openzeppelin.com/) 
- [Trail of Bits](https://trailofbits.com/)
- [Consensys Diligence](https://diligence.security/)
- [Chứng nhận SEAL của Security Alliance](https://frameworks.securityalliance.dev/certs/overview/) 


## Rút tiền {#withdraw}

Rút tiền cần trải qua thời gian chờ 7 ngày, và bạn có thể gửi yêu cầu rút bất cứ lúc nào khi không có yêu cầu bồi thường nào đang diễn ra.

Nếu có yêu cầu bồi thường mới phát sinh trong thời gian này, quá trình rút sẽ tạm dừng cho đến khi sự cố được giải quyết, việc này có thể mất thêm 9-12 ngày trong giai đoạn beta (6-9 ngày sau beta) tính từ yêu cầu bồi thường đầu tiên. Trong suốt thời gian đó, toàn bộ tài sản đang chờ rút vẫn có thể bị dùng để chi trả bồi thường bảo hiểm.

Tài sản đang trong thời gian chờ rút không sinh lợi suất nhưng vẫn tiếp tục bảo hiểm cho các yêu cầu bồi thường. Sau khi hết thời gian chờ, bạn có thể rút tài sản bất cứ lúc nào; khi đó tài sản không còn bảo hiểm cho yêu cầu bồi thường nào và cũng không còn sinh lợi suất.


## Hạn mức chi trả bảo hiểm {#insurance-payout-limit}

Tổng số tiền chi trả từ pool bảo hiểm cho mỗi sự cố có một hạn mức, hiện được đặt ở 50%, nghĩa là khoản chi trả tối đa cho mỗi sự cố không vượt quá 50% quy mô hiện tại của pool bảo hiểm.
