import json
import pandas as pd
import numpy as np
import os

# Load the JSON file
file_path = '/Users/grigoryfilimonov/Desktop/NIMS2/result.json'  # Change this if necessary
if not os.path.exists(file_path):
    raise FileNotFoundError(f"The file {file_path} was not found.")

try:
    with open(file_path, 'r') as f:
        data = json.load(f)
except json.JSONDecodeError as e:
    raise ValueError(f"Error decoding JSON: {e}")

# Extract relevant information from the JSON structure
coords = data.get("coords", {})
so2_values = data.get("data", [])

# Convert SO2 values to a NumPy array for easier indexing
so2_values = np.array(so2_values)

# Extract time, x, and y coordinates
time_data = coords['t']['data'] if 't' in coords else []
time_data = [pd.to_datetime(t) for t in time_data] if time_data else []
x_data = coords['x']['data'] if 'x' in coords else []
y_data = coords['y']['data'] if 'y' in coords else []

# Prepare a list to hold the records
records = []

# Check the shape of the SO2 data
shape = so2_values.shape
if len(shape) == 4:  # Ensure we have the expected dimensions
    for t_index in range(shape[0]):
        for y_index in range(shape[2]):
            for x_index in range(shape[3]):
                so2_value = so2_values[t_index, 0, y_index, x_index]
                if not np.isnan(so2_value):  # Check for NaN values
                    records.append({
                        "time": time_data[t_index] if len(time_data) > t_index else None,
                        "x": x_data[x_index] if len(x_data) > x_index else None,
                        "y": y_data[y_index] if len(y_data) > y_index else None,
                        "SO2": so2_value
                    })

# Create a DataFrame from the records
df = pd.DataFrame(records)

# Save the DataFrame to an Excel file
output_excel_path = "/Users/grigoryfilimonov/Desktop/NIMS2/processed_result_data.xlsx"
df.to_excel(output_excel_path, index=False, engine='openpyxl')  # Change the engine if necessary

print(f"Processed data saved to {output_excel_path}")
