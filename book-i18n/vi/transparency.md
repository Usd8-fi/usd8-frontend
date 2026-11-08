# Minh bạch {#transparency}

Dưới đây là các giả định về niềm tin và rủi ro liên quan đến giao thức USD8. Phần lớn đều phổ biến ở các giao thức DeFi, nhưng chúng tôi chọn công bố rõ ngay từ đầu cho người dùng.

## Admin & Timelock {#admin--timelock}
Quyền hạn của admin đã được thu hẹp tối đa ngay từ khâu thiết kế; hầu hết các thao tác quan trọng đều phải đi qua timelock, giúp người dùng có thêm thời gian phản ứng trước mọi thay đổi sắp tới.

Admin được phép thực hiện các thiết lập hệ thống như
- Đưa ngân quỹ USD8 vào các chiến lược đã được phê duyệt trước, nhưng không thể trực tiếp thêm chiến lược
- Quản lý việc tạm dừng, trọng số phân bổ doanh thu, phí giao thức và hạn mức nạp của pool bảo hiểm

Timelock quản lý các thiết lập hệ thống nhạy cảm
- Thêm/xóa admin hoặc thay thế timelock
- Cấu hình pool, token được bảo hiểm, cách tính điểm, oracle, mốc thời gian của sự cố/rút tiền, tiền cọc yêu cầu bồi thường và các bên ký TEE
- Quản lý các chiến lược của Treasury và việc phân phối doanh thu.
- Gọi endBetaMode để vĩnh viễn vô hiệu hóa khả năng nâng cấp và việc điều chỉnh quyết toán trong beta


## Trong giai đoạn beta {#during-beta}
Giai đoạn beta có thêm một vài cơ chế an toàn tạm thời, trao thêm quyền hạn cho admin và timelock.

- Admin hoặc Timelock có thể điều chỉnh settlement root, việc này cũng thêm thời hạn tranh chấp 3 ngày vào quy trình bồi thường

- Timelock có thể nâng cấp Registry, USD8, Treasury và DefiInsurance

Cả hai quyền này sẽ bị gỡ bỏ khi beta kết thúc.


## Bảo hiểm DeFi {#defi-insurance}
Bảo hiểm DeFi miễn phí cho mọi người dùng USD8/sUSD8, tuy nhiên khoản chi trả có thể khác nhau tùy theo điểm bảo hiểm của những người yêu cầu và hạn mức quy mô của pool bảo hiểm.

Chúng tôi thiết kế quy trình để người dùng được tự do chấp nhận hoặc từ chối khoản chi trả nếu nó không như kỳ vọng.


## Pool bảo hiểm {#cover-pool}
Pool bảo hiểm rủi ro hơn vì được dùng để chi trả bồi thường. Đội ngũ của chúng tôi thẩm định kỹ lưỡng từng token được bảo hiểm để giảm rủi ro hết mức có thể, xem [Các bạn giảm rủi ro cho LP của pool bảo hiểm bằng cách nào?](./faqs.md#how-do-you-reduce-the-cover-pool-lp-risk).

LP của pool bảo hiểm cần nhận thức rõ rủi ro này.


## TEE {#tees}
Hệ thống USD8 dùng TEE ở offchain để tính toán mức bảo hiểm, nghĩa là hệ thống hiện tại phụ thuộc vào máy chủ do chúng tôi vận hành. Tuy nhiên, chúng tôi đang lên kế hoạch chuyển sang mô hình không cần tin cậy (trustless) bằng mạng zk-coprocessor trong tương lai.


## Dịch vụ bên ngoài {#external-services}
USD8 dựa vào một số dịch vụ bên ngoài để vận hành, chẳng hạn như

- Oracle của Chainlink
- Nhà cung cấp RPC
- Nhà cung cấp máy chủ/TEE (tuy nhiên, chúng tôi đang lên kế hoạch chuyển sang mạng zk-coprocessor trustless trong tương lai)
- Các nguồn lợi suất DeFi như Aave, Morpho, v.v.

Bất kỳ sự cố nào với các dịch vụ này cũng có thể ảnh hưởng đến USD8.
