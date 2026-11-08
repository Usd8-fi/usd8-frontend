<h1 id="faqs" class="faq-title">Câu hỏi thường gặp</h1>

## Vậy là tôi được bảo hiểm miễn phí khi dùng USD8 & sUSD8? {#so-i-get-free-insurance-from-usd8--susd8}

Đúng vậy, đó là lợi thế của USD8 so với các stablecoin khác. Bạn nhận điểm bảo hiểm qua từng block; nắm giữ USD8/sUSD8 càng nhiều và càng lâu, bạn càng nhận được nhiều điểm.

Tốc độ tích điểm mỗi loại một khác: hiện tại mỗi USD8 mang lại 1 điểm mỗi ngày, còn mỗi sUSD8 mang lại 0.1 điểm mỗi ngày.


## Tiền chi trả bảo hiểm đến từ đâu? {#where-does-the-insurance-payout-come-from}

Tiền chi trả đến từ các [pool bảo hiểm](./cover-pools.md), những vault token mở mà bất kỳ ai cũng có thể nạp vào. Hiện có hai pool: [một pool chứa wstETH và một pool chứa USD8](https://usd8.fi/#cover-pools).

Người nạp được thưởng APY cao, lấy từ lợi suất ngân quỹ của USD8. Tuy nhiên, nếu một token được bảo hiểm giảm hơn 20% so với tài sản cơ sở, tiền nạp của họ có thể được dùng để chi trả bồi thường, và mỗi sự cố có thể dùng tới 50% số dư của từng pool bảo hiểm. Rủi ro cao, lợi nhuận cao.


## Khi nào tôi có thể dùng điểm bảo hiểm để yêu cầu bồi thường? {#when-can-i-use-my-insurance-score-for-a-claim}

Điểm bảo hiểm trở nên khả dụng 7 ngày sau khi bạn tích lũy được, và chỉ điểm khả dụng mới có thể dùng để yêu cầu bồi thường.
  
## Trước đây tôi có USD8 nhưng giờ thì không, tôi có còn được bảo hiểm không? {#i-had-usd8-before-but-not-now-am-i-still-insured}

Có. Bạn hẳn đã tích lũy được một số điểm bảo hiểm, và số điểm này không hết hạn. Bạn có thể yêu cầu bồi thường miễn là điểm của bạn đã đủ 7 ngày.

## Tôi sẽ nhận được bao nhiêu? {#how-much-payout-do-i-get}

Điều đó phụ thuộc vào 1. điểm bảo hiểm của bạn so với những người cùng yêu cầu bồi thường vào thời điểm đó 2. hạn mức quy mô của pool bảo hiểm.

Càng nhiều điểm bảo hiểm, yêu cầu bồi thường của bạn càng có trọng số cao. Khoản chi trả tối đa là 80%, và bạn có thể nhận ít hơn nếu điểm thấp — tuy nhiên, bạn luôn có thể từ chối khoản chi trả cuối cùng nếu thấy quá thấp và giữ lại điểm bảo hiểm để dùng sau.



## Cần những gì để gửi yêu cầu bồi thường? {#whats-needed-when-filing-a-claim}

- token được bảo hiểm mà bạn yêu cầu bồi thường
- điểm bảo hiểm
- 10 USD8 tiền cọc, được hoàn lại sau khi xử lý yêu cầu nếu bạn đủ điều kiện
- Booster (không bắt buộc)




## Các bạn giảm rủi ro cho LP của pool bảo hiểm bằng cách nào? {#how-do-you-reduce-the-cover-pool-lp-risk}

Tài sản trong pool bảo hiểm có thể được dùng để chi trả bồi thường, khiến pool rủi ro hơn, và đó là lý do APY của pool cao hơn. Để giảm rủi ro cho pool bảo hiểm, đội ngũ của chúng tôi
- thẩm định độc lập từng giao thức trước khi cung cấp bảo hiểm
- xem xét các báo cáo kiểm toán của bên thứ ba cho từng giao thức
- điều chỉnh hoặc thu hồi bảo hiểm cho từng giao thức dựa trên việc giám sát liên tục

Chúng tôi không dự kiến yêu cầu bồi thường sẽ xảy ra thường xuyên, nhưng khả năng này luôn tồn tại.



## Giai đoạn beta có gì khác? {#whats-different-in-beta}
Giai đoạn beta có một vài cơ chế an toàn tạm thời mà chúng tôi dự định gỡ bỏ sau đó; trong beta, admin/Timelock có một số quyền hạn đặc biệt.
- Admin hoặc Timelock có thể phản bác bản quyết toán chi trả của một sự cố bằng cách gửi một settlement root mới. Điều này cũng thêm thời hạn tranh chấp 3 ngày vào quy trình bồi thường, và sẽ được bỏ đi sau beta.
- Timelock có thể nâng cấp Registry, USD8, Treasury và DefiInsurance; chúng tôi dự định loại bỏ khả năng nâng cấp sau beta.


## USD8 có token quản trị không? {#does-usd8-has-a-governance-token}
Hiện tại thì chưa.

## USD8 có những rủi ro gì? {#show-all-the-risk-involved-in-usd8}
Bạn có thể xem đầy đủ tại [Minh bạch](./transparency.md)

## USD8 kiếm tiền bằng cách nào? {#how-does-usd8-make-money}
USD8 có một số nguồn doanh thu:
- một phần lợi suất ngân quỹ của USD8
- 20% còn dư sau khi chi trả — vì người yêu cầu chỉ được bồi thường tối đa 80%, phần 20% còn lại là phí của USD8
- một phần tổn thất được thu hồi qua [Kinh tế Mũ trắng](white-hat-economy.md)


## Tôi có thể đóng góp cho USD8 như thế nào? {#how-can-i-contribute-to-usd8}

Chúng tôi hoan nghênh mọi đóng góp từ cộng đồng, từ thiết kế cơ chế, hợp tác, marketing đến nhiều lĩnh vực khác. Để chia sẻ đề xuất, góp ý hay ý tưởng, hãy [mở một issue trong repository usd8-core](https://github.com/Usd8-fi/usd8-core/issues) hoặc tham gia [nhóm Telegram](https://t.me/+e84i2oYk1ao1MTk1) của chúng tôi để trao đổi với đội ngũ. Người đóng góp có thể nhận được [Booster](defi-insurance.md#boosters).

  
  

## Ai đứng sau USD8? {#who-is-behind-usd8}

USD8 được xây dựng bởi [@codephobic](https://x.com/codephobic) — một nhà nghiên cứu bảo mật với hơn 7 năm kinh nghiệm kiểm toán các giao thức DeFi và L2 hàng đầu.
