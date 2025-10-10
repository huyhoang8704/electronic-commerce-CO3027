import pandas as pd

# Đọc dữ liệu gốc
df = pd.read_csv("survey_for_smartpls_clean.csv", sep=";", encoding="utf-8")

# Lấy ngẫu nhiên 200 mẫu (hoặc 250 nếu bạn muốn giới hạn tối đa)
df_sample = df.sample(n=200, random_state=42)

# Xuất lại
df_sample.to_csv("survey_for_smartpls_200.csv", sep=";", index=False, encoding="utf-8")
