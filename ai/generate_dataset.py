import pandas as pd
import random

days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
times = ["Morning","Lunch","Evening"]

# ✅ FOOD ITEMS
# (Food_Item, Main_Category, Food_SubType, Veg_NonVeg, Price)

foods = [
    # Fresh Items
    ("Rice", "Fresh", "Meal", "Veg", 300),
    ("Parotta", "Fresh", "Meal", "NonVeg", 400),
    ("Samosa", "Fresh", "Snack", "Veg", 280),
    ("Veg_Rice", "Fresh", "Meal", "Veg", 420),
    ("Idly", "Fresh", "Meal", "Veg", 310),
    ("Chicken_Rice", "Fresh", "Meal", "NonVeg", 350),
    ("Tea", "Fresh", "Drink", "Veg", 50),
    ("Juice", "Fresh", "Drink", "Veg", 120),
    ("Ice_Cream", "Fresh", "Dessert", "Veg", 180),

    # Packed Items
    ("Biscuits", "Packed", "Snack", "Veg", 100),
    ("Chips", "Packed", "Snack", "Veg", 150),
    ("Chocolate", "Packed", "Dessert", "Veg", 200),
    ("SoftDrink", "Packed", "Drink", "Veg", 180),
    ("Cake_Piece", "Packed", "Dessert", "Veg", 220)
]

weather = ["Sunny","Cloudy","Rainy"]

rows = []

for i in range(3000):

    day = random.choice(days)
    time = random.choice(times)
    food = random.choice(foods)

    prev_sales = random.randint(5,30)

    demand = int(prev_sales * random.uniform(0.9,1.2))

    rows.append({
        "Day": day,
        "Time": time,
        "Food_Item": food[0],
        "Food_Category": food[1],      # Fresh / Packed
        "Food_SubType": food[2],       # Meal / Snack / Drink / Dessert
        "Food_Type": food[3],          # Veg / NonVeg
        "Weather": random.choice(weather),
        "Price": food[4],
        "Previous_Sales": prev_sales,
        "Is_Friday": 1 if day == "Friday" else 0,
        "Is_Weekend": 1 if day in ["Saturday", "Sunday"] else 0,
        "Is_Special_Day": random.choice([0,0,0,1]),
        "Demand": demand
    })

df = pd.DataFrame(rows)

df.to_csv("dataset.csv", index=False)

print("Dataset generated with", len(df), "rows (Fresh + Packed)")