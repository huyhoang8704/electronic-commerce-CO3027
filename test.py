import pandas as pd

# Đọc file gốc
df = pd.read_csv("survey_for_smartpls.csv", encoding="utf-8", sep=None, engine="python")

# Xóa khoảng trắng ở tên cột (nếu có)
df.columns = df.columns.str.strip()

# Thay thế các dấu phẩy trong nội dung text để tránh lỗi khi export
df = df.applymap(lambda x: str(x).replace(",", " ") if isinstance(x, str) else x)

# Xuất lại file CSV chuẩn SmartPLS
df.to_csv("survey_for_smartpls_clean.csv", 
          index=False, 
          sep=";",         # dùng semicolon
          encoding="utf-8", 
          quoting=3)       # không dùng ngoặc kép

print("✅ Done! File sạch đã lưu thành: survey_for_smartpls_clean.csv")
