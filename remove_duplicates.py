import pandas as pd

# Read the CSV with a different encoding
df = pd.read_csv("merged_videos(Raw).csv", encoding="latin1")

# Remove duplicates
df = df.drop_duplicates()

# Save cleaned file
df.to_csv("cleaned.csv", index=False)

print("Duplicates removed and file saved as 'cleaned.csv'")
