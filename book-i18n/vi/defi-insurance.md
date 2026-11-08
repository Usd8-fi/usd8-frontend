# Bảo hiểm DeFi {#defi-insurance}

- Người nắm giữ USD8 & sUSD8 nhận điểm bảo hiểm qua từng block
- Điểm bảo hiểm có thể dùng để yêu cầu bồi thường cho nhiều token DeFi được bảo hiểm, kể cả USD8 và sUSD8
- Càng nhiều điểm, khoản chi trả càng lớn: tối đa 80% giá trị, giới hạn bởi hạn mức của pool bảo hiểm
- Điểm không thể chuyển nhượng và không bao giờ hết hạn
- Tiền chi trả đến từ các [pool bảo hiểm](./cover-pools.md)

<div class="example-box">
<p>Ví dụ: giả sử Aave aUSDC là token được bảo hiểm với mức bảo hiểm tối đa 80%</p>
<ol>
<li>Tỷ giá aUSDC/USDC giảm từ 1 xuống 0.3</li>
<li>Người dùng có điểm bảo hiểm giao lại aUSDC của mình để nhận tài sản từ pool bảo hiểm, trị giá tối đa 0.8 USDC</li>
</ol>
</div>

## Quy trình bồi thường {#claim-process}

Quy trình bồi thường gồm 3 bước, kết hợp cả xử lý onchain và offchain (TEE), kéo dài khoảng 9-12 ngày trong giai đoạn beta và 6-9 ngày sau beta. Bạn cần chú ý để không bỏ lỡ bất kỳ hạn chót nào.


### 1 Gửi yêu cầu bồi thường {#1-file-a-claim}

Bất kỳ ai cũng có thể gửi yêu cầu bồi thường nếu
1. giá TWAP 24 giờ của một token được bảo hiểm đã giảm >20% giữa hai khung 24 giờ liền kề, trong vòng 1-6 ngày qua.
2. người yêu cầu có điểm bảo hiểm chưa sử dụng, được tích lũy ít nhất 7 ngày trước đợt giảm giá
3. người yêu cầu đã nắm giữ token được bảo hiểm tối thiểu 7 ngày trước đợt giảm giá

Ngoài ra, bạn cần đặt một khoản cọc 10 USD8, được hoàn lại toàn bộ nếu đáp ứng điều kiện 2 và 3. Bạn không cần khai báo thời điểm giá giảm: TEE của chúng tôi sẽ tự tìm ra đợt giảm và xác định chính xác block.


Quan trọng: thời hạn nhận yêu cầu bồi thường đóng lại 3 ngày sau yêu cầu hợp lệ đầu tiên, sau đó không thể gửi thêm yêu cầu nào cho token được bảo hiểm này.


### 2 Quyết toán yêu cầu bồi thường {#2-settle-claims}
Bất kỳ ai cũng có thể quyết toán bằng cách gửi bản chứng thực (attestation) từ TEE. TEE dùng thuật toán mã nguồn mở để tính điểm bảo hiểm và khoản chi trả của từng người yêu cầu. Kết quả hoàn toàn có thể kiểm chứng.

Khoản chi trả của mỗi người được tính dựa trên

1. điểm bảo hiểm của người yêu cầu so với tổng điểm của tất cả người yêu cầu
2. hạn mức của pool bảo hiểm
3. mức bảo hiểm tối đa của token được bảo hiểm

<div class="example-box">
<p>Ví dụ: có 2 người yêu cầu bồi thường, A có 100 điểm và B có 200 điểm, cả hai đều ký quỹ lượng token được bảo hiểm trị giá $500, với mức bảo hiểm tối đa 80%. Pool bảo hiểm hiện có tài sản trị giá $2250.</p>
<ol>
<li>Hạn mức pool bảo hiểm hiện được đặt ở 50%, nên tổng cộng có thể dùng $1125. 80% trong số đó là ngân sách chi trả bồi thường, tức $900. Điểm của A bằng một nửa điểm của B, nên A được nhận tối đa $300 và B tối đa $600</li>
<li>Cả A và B đều ký quỹ lượng token được bảo hiểm trị giá $500; với mức bảo hiểm tối đa 80%, khoản bồi thường cho tổn thất của họ bị giới hạn ở $400.</li>
<li>A nhận $300, B nhận $400</li>
</ol>
</div>

Thời hạn quyết toán mở tối đa 3 ngày; ngay khi được quyết toán, người dùng có thể hoàn tất nhận chi trả. Nếu không được quyết toán, người yêu cầu có thể rút lại token đã ký quỹ và không bị trừ điểm bảo hiểm nào.

Trong giai đoạn beta, admin có thêm 3 ngày sau khi quyết toán để kiểm tra và phản bác bằng một bản quyết toán mới do TEE ký. Đây là biện pháp an toàn nhằm bảo đảm không có lỗi quyết toán độc hại nào lọt qua.


### 3 Hoàn tất chi trả {#3-finalize-payouts}
Ở bước này, người yêu cầu có 3 ngày để chấp nhận khoản chi trả. Nếu chấp nhận, họ sẽ

1. mất số token được bảo hiểm đã ký quỹ và số điểm bảo hiểm đã dùng
2. nhận tài sản từ pool bảo hiểm với tổng giá trị USD bằng khoản chi trả được hưởng

Nếu không chấp nhận khoản chi trả, người yêu cầu có thể rút lại token đã ký quỹ và giữ nguyên điểm bảo hiểm.

Dù người yêu cầu có hoàn tất hay không, tiền cọc vẫn được hoàn lại miễn là đáp ứng các điều kiện về tiền cọc.

Quan trọng: thời hạn nhận chi trả là 3 ngày, sau đó mọi yêu cầu còn chờ đều bị coi là không chấp nhận, và người yêu cầu có thể rút lại token đã ký quỹ.

## TEE {#tee}
USD8 dùng một secure enclave của Amazon, chạy thuật toán mã nguồn mở ở offchain để tính toán và ký các khoản chi trả. Bất kỳ ai cũng có thể kích hoạt TEE và gửi kết quả lên onchain; hợp đồng sẽ xác minh chữ ký của TEE trước khi chấp nhận kết quả cuối cùng. Vì thuật toán là mã nguồn mở, bất kỳ ai cũng có thể công khai kiểm chứng kết quả.

Trong tương lai, chúng tôi dự định chuyển sang một mạng zk-coprocessor như [Brevis](https://brevis.network/) để vượt qua [bài kiểm tra walkaway](https://trustlessness.eth.limo/general/2025/11/11/the-trustless-manifesto.html).


## Booster {#boosters}
<img src="../assets/booster-600.webp" srcset="../assets/booster-600.webp 600w, ../assets/booster-1200.webp 1200w" sizes="(max-width: 700px) 100vw, 300px" width="300" height="289" loading="lazy" decoding="async" alt="Ảnh NFT Booster của USD8" /><br/><br/>
[Booster](https://etherscan.io/address/0x6f74ce39bb1d75c56e2fe5f349a6a5f51ce6f12d) là các NFT bạn có thể thêm vào khi gửi yêu cầu bồi thường, mỗi Booster giúp tăng thêm 1% tổng điểm bảo hiểm của bạn. Các Booster đủ điều kiện sẽ bị đốt khi bạn nhận chi trả; số còn lại được trả lại cho bạn. Bạn có thể cộng dồn nhiều Booster. Booster không được bán ra, chỉ được đúc để tặng cho những người dùng giai đoạn đầu đã giúp USD8 phát triển. Hãy theo dõi chúng tôi trên [X](https://x.com/usd8_fi) và [Telegram](https://t.me/+e84i2oYk1ao1MTk1).

Nhập một địa chỉ Ethereum để kiểm tra Booster

<div class="booster-check">
<input id="booster-address" type="text" placeholder="0x..." autocomplete="off" spellcheck="false">
<button id="booster-check-btn" type="button">Kiểm tra</button>
<div id="booster-result" class="booster-result"></div>
</div>
