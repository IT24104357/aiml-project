# ==============================
# predict.py
# ==============================

import pickle
import pandas as pd
import json
import sys
import os
from datetime import datetime

# ==============================
# NORMALIZE TIME
# ==============================
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


try:

    current_dir = os.path.dirname(__file__)

    model = pickle.load(open(os.path.join(current_dir, "model.pkl"), "rb"))
    encoders = pickle.load(open(os.path.join(current_dir, "encoders.pkl"), "rb"))

    orders = json.loads(sys.argv[1]) if len(sys.argv) > 1 else []

    df = pd.DataFrame(orders)

    if df.empty:
        print(json.dumps([]))
        sys.exit()

    foods = df["Food_Item"].unique()

    predictions = []

    for food in foods:

        sample = df[df["Food_Item"] == food].iloc[0]

        prev_sales = sample.get("Previous_Sales", 10)

        food_result = {}

        days = ["Monday", "Friday", "Sunday"]

        # ==============================
        # HANDLE UNKNOWN FOOD ITEM
        # ==============================
        if food in encoders["Food_Item"].classes_:
            food_encoded = encoders["Food_Item"].transform([food])[0]
        else:
            food_encoded = 0

        # ==============================
        # HANDLE TIME
        # ==============================
        time_value = normalize_time(sample.get("Time", "Lunch"))

        if time_value in encoders["Time"].classes_:
            time_encoded = encoders["Time"].transform([time_value])[0]
        else:
            time_encoded = 0

        # ==============================
        # SAFE ENCODER
        # ==============================
        def safe_encode(column, value):
            if column in encoders and value in encoders[column].classes_:
                return encoders[column].transform([value])[0]
            return 0

        # ==============================
        # PREDICT 3 DAYS
        # ==============================
        for i, day in enumerate(days):

            data = pd.DataFrame([{
                "Day": encoders["Day"].transform([day])[0],
                "Time": time_encoded,
                "Food_Item": food_encoded,

                "Food_Category": safe_encode(
                    "Food_Category",
                    sample.get("Food_Category", "Fresh")
                ),

                "Food_Type": safe_encode(
                    "Food_Type",
                    sample.get("Food_Type", "Veg")
                ),

                "Food_SubType": safe_encode(
                    "Food_SubType",
                    sample.get("Food_SubType", "Meal")
                ),

                "Weather": safe_encode(
                    "Weather",
                    sample.get("Weather", "Sunny")
                ),

                "Price": float(sample.get("Price", 0)),
                "Previous_Sales": int(prev_sales + i * 5),

                "Is_Friday": 1 if day == "Friday" else 0,
                "Is_Weekend": 1 if day in ["Saturday", "Sunday"] else 0,
                "Is_Special_Day": int(sample.get("Is_Special_Day", 0))
            }])

            # IMPORTANT: SAME ORDER AS TRAINING
            data = data[[
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

            pred = model.predict(data)[0]

            food_result[f"Day{i+1}"] = int(pred)

        predictions.append({
            "food": food,
            "category": sample.get("Food_Category", "Fresh"),
            "prediction": food_result
        })

    print(json.dumps(predictions))

except Exception as e:

    print("ERROR:", str(e), file=sys.stderr)
    print(json.dumps([]))