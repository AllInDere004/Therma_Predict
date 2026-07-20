from flask import Flask, request, jsonify
from flask_cors import CORS

import pandas as pd
import pickle
import os

app = Flask(__name__)

CORS(app)


# Base Directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load Dataset
df = pd.read_csv(
    os.path.join(BASE_DIR, "factory_sensor_simulator_2040.csv")
)

# Load Model
with open(
    os.path.join(BASE_DIR, "adaboost_failure_model.pkl"),
    "rb"
) as f:

    model = pickle.load(f)

with open(
    os.path.join(BASE_DIR, "machine_type_encoder.pkl"),
    "rb"
) as f:

    encoder = pickle.load(f)


# Home Route
@app.route("/")
def home():

    return jsonify({
        "message": "ThermaPredict Backend Running"
    })


# Machines Route
@app.route("/machines", methods=["GET"])
def get_machines():

    try:

        machines = (
            df.head(100)
            .fillna(0)
            .to_dict(orient="records")
        )

        return jsonify(machines)

    except Exception as e:

        return jsonify({
            "error": str(e)
        })

# Prediction Route
@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.json
        machine_type = encoder.transform(
            [data["Machine_Type"]]
        )[0]

        vibration_val = data.get(
            "Vibration_mms",
            data.get("Vibration_mm_s")
        )

        input_data = pd.DataFrame([{

            "Machine_Type": machine_type,

            "Installation_Year":
            data["Installation_Year"],

            "Operational_Hours":
            data["Operational_Hours"],

            "Temperature_C":
            data["Temperature_C"],

            "Vibration_mms":
            vibration_val,

            "Sound_dB":
            data["Sound_dB"],

            "Oil_Level_pct":
            data["Oil_Level_pct"],

            "Coolant_Level_pct":
            data["Coolant_Level_pct"],

            "Power_Consumption_kW":
            data["Power_Consumption_kW"],

            "Last_Maintenance_Days_Ago":
            data["Last_Maintenance_Days_Ago"],

            "Maintenance_History_Count":
            data["Maintenance_History_Count"],

            "Failure_History_Count":
            data["Failure_History_Count"],

            "AI_Supervision":
            data["AI_Supervision"],

            "Error_Codes_Last_30_Days":
            data["Error_Codes_Last_30_Days"],

            "AI_Override_Events":
            data["AI_Override_Events"]

        }])

        input_data = input_data[
            model.feature_names_in_.tolist()
        ]

        prediction = model.predict(input_data)[0]

        probability = model.predict_proba(
            input_data
        )[0][1]

        if probability < 0.30:

            status = "Normal"
            alert = "Low Risk"

        elif probability < 0.60:

            status = "Warning"
            alert = "Medium Risk"

        else:

            status = "Critical"
            alert = "High Risk"

        return jsonify({

            "prediction":
            int(prediction),

            "failure_probability":
            round(float(probability) * 100, 2),

            "status":
            status,

            "alert":
            alert

        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        })

if __name__ == "__main__":

    app.run(debug=True)