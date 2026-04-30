# ==============================
# train_model.py
# ==============================

import pandas as pd
import pickle
import matplotlib.pyplot as plt
import pymongo
import os
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error

print("Loading dataset...")

def normalize_time(value):
    try:
        t = datetime.strptime(value, "%I:%M %p")
        hour = t.hour

        if hour < 11:
            return "Breakfast"
        elif hour < 15:
            return "Lunch"
        elif hour < 18:
            return "Evening"
        else:
            return "Dinner"

    except:
        return value

current_dir = os.path.dirname(__file__)
data = pd.read_csv(os.path.join(current_dir, "dataset.csv"))

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["smart_canteen"]

menu_collection = db["menus"]
order_collection = db["Order"]

print("Fetching menu data...")

menu_rows = []

for item in menu_collection.find():

    menu_rows.append({
        "Day": item.get("Day", "Monday"),
        "Time": normalize_time(item.get("Time", "Lunch")),
        "Food_Item": item["Food_Item"],

        "Food_Category": item.get("Food_Category", "Fresh"),
        "Food_Type": item.get("Food_Type", "Veg"),
        "Food_SubType": item.get("Food_SubType", "Meal"),

        "Weather": item.get("Weather", "Sunny"),
        "Price": item["Price"],
        "Previous_Sales": item.get("Previous_Sales", 10),

        "Is_Friday": item.get("Is_Friday", 0),
        "Is_Weekend": item.get("Is_Weekend", 0),
        "Is_Special_Day": item.get("Is_Special_Day", 0),

        "Demand": item.get("Previous_Sales", 10)
    })

menu_df = pd.DataFrame(menu_rows)

print("Fetching order data...")

order_rows = []

for order in order_collection.find():

    order_rows.append({
        "Day": order.get("Day", "Monday"),
        "Time": normalize_time(order.get("Time", "Lunch")),
        "Food_Item": order.get("Food_Item", "Unknown"),

        "Food_Category": order.get("Food_Category", "Fresh"),
        "Food_Type": order.get("Food_Type", "Veg"),
        "Food_SubType": order.get("Food_SubType", "Meal"),

        "Weather": order.get("Weather", "Sunny"),
        "Price": order.get("Price", 0),
        "Previous_Sales": order.get("Previous_Sales", 0),

        "Is_Friday": order.get("Is_Friday", 0),
        "Is_Weekend": order.get("Is_Weekend", 0),
        "Is_Special_Day": order.get("Is_Special_Day", 0),

        "Demand": order.get("quantity", 1)
    })

order_df = pd.DataFrame(order_rows)

# Merge all data
data = pd.concat([data, menu_df, order_df], ignore_index=True)

data = data.dropna()
data["Time"] = data["Time"].apply(normalize_time)

encoders = {}

categorical_columns = [
    "Day",
    "Time",
    "Food_Item",
    "Food_Category",
    "Food_Type",
    "Food_SubType",
    "Weather"
]

for col in categorical_columns:
    le = LabelEncoder()
    data[col] = le.fit_transform(data[col])
    encoders[col] = le

# IMPORTANT: FIXED COLUMN ORDER
X = data[[
    "Day",
    "Time",
    "Food_Item",
    "Food_Category",
    "Food_Type",
    "Food_SubType",
    "Weather",
    "Price",
    "Previous_Sales",
    "Is_Friday",
    "Is_Weekend",
    "Is_Special_Day"
]]

y = data["Demand"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print("Training RandomForest...")

model = RandomForestRegressor(
    n_estimators=500,
    max_depth=20,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42
)

model.fit(X_train, y_train)

pred = model.predict(X_test)

print("\nSample Predictions:")

for i in range(min(10, len(y_test))):
    print("Actual:", y_test.iloc[i], " Predicted:", int(pred[i]))

accuracy = r2_score(y_test, pred)
mae = mean_absolute_error(y_test, pred)

print("\nModel Accuracy:", round(accuracy * 100, 2), "%")
print("Mean Absolute Error:", round(mae, 2))

plt.scatter(y_test, pred)
plt.xlabel("Actual Demand")
plt.ylabel("Predicted Demand")
plt.title("Actual vs Predicted Demand")
plt.show()

pickle.dump(model, open(os.path.join(current_dir, "model.pkl"), "wb"))
pickle.dump(encoders, open(os.path.join(current_dir, "encoders.pkl"), "wb"))

print("Model saved successfully")