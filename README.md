# 🌡️ ThermaPredict
### AI-Powered Predictive Maintenance & Industrial Machine Health Monitoring

**ThermaPredict** is a full-stack, machine-learning-powered predictive maintenance application designed to analyze industrial equipment conditions, estimate machine failure risk, and support data-driven maintenance decisions.

The platform combines an **AdaBoost classification model**, a **Flask REST API**, and a **React-based monitoring dashboard** to transform machine operating parameters into actionable insights.

## 🚀 Project Overview

Traditional reactive maintenance approaches often identify equipment problems only after a malfunction has occurred, potentially resulting in unplanned downtime, repair expenses, and operational disruption.

ThermaPredict explores a predictive maintenance approach by analyzing machine operating conditions and historical maintenance indicators to estimate potential failure risks.

**Project objectives:**
- Predict possible machine failures using machine learning.
- Analyze machine health using operational and sensor parameters.
- Categorize estimated failure risk into Normal, Warning, and Critical levels.
- Visualize machine conditions through interactive dashboards.
- Support preventive maintenance planning through data-driven insights.

## ✨ Key Features

### 🤖 Machine Learning-Based Failure Prediction
- AdaBoostClassifier trained for binary machine failure classification.
- Uses 15 operational and maintenance-related input features.
- Predicts failure class: `0` (No Failure) or `1` (Failure).
- Returns model-generated failure probability estimates.
- Categorizes risk using configurable decision thresholds.

### 📊 Interactive Monitoring Dashboard
- Machine performance visualization.
- Temperature and operational metric monitoring.
- Interactive charts and graphical representations.
- Machine health and maintenance-related information.
- User-friendly dashboard navigation.

### 🏭 Industrial Machine Monitoring
- Machine-specific operating parameters.
- Historical maintenance and failure indicators.
- Equipment condition analysis.
- Machine records retrieved through the backend API.

### 🧠 ThermaBot AI Assistant
The demonstrated user interface includes ThermaBot, a conversational assistant intended to help users interpret machine-related information and maintenance insights.

### 🔐 Application Interface
- Login and registration screens demonstrated in the application.
- Dashboard and machine monitoring navigation.
- Responsive, component-based frontend design.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite, Tailwind CSS |
| UI and Visualization | Lucide React, Recharts |
| Backend | Python, Flask, Flask-CORS |
| Machine Learning | Scikit-learn, AdaBoostClassifier |
| Data Processing | Pandas, NumPy |
| Model Serialization | Pickle |
| Development Tools | VS Code, Git, GitHub |
| Package Management | pip, npm |

## 🧠 Machine Learning Architecture

ThermaPredict uses a supervised machine learning classification approach to estimate equipment failure risk.

**Prediction workflow:**

```text
Industrial Machine Data
          |
          v
Data Preprocessing
          |
          v
Machine Type Encoding
          |
          v
15-Feature Input Vector
          |
          v
AdaBoost Classification Model
          |
          v
Failure Prediction + Probability
          |
          v
Risk Classification
          |
          v
Flask REST API
          |
          v
React Monitoring Dashboard
```

### Model Input Features

The trained model uses the following features:

| Feature | Description |
|---|---|
| Machine_Type | Encoded industrial machine category |
| Installation_Year | Equipment installation year |
| Operational_Hours | Total machine operating hours |
| Temperature_C | Machine temperature |
| Vibration_mms | Vibration measurement |
| Sound_dB | Machine sound level |
| Oil_Level_pct | Oil level percentage |
| Coolant_Level_pct | Coolant level percentage |
| Power_Consumption_kW | Power consumption |
| Last_Maintenance_Days_Ago | Days since last maintenance |
| Maintenance_History_Count | Number of historical maintenance events |
| Failure_History_Count | Previous failure count |
| AI_Supervision | AI supervision indicator |
| Error_Codes_Last_30_Days | Recent error code count |
| AI_Override_Events | AI override event count |

### Risk Classification

The backend categorizes predicted failure probability into three levels:

| Failure Probability | Status | Alert |
|---|---|---|
| Below 30% | Normal | Low Risk |
| 30% to below 60% | Warning | Medium Risk |
| 60% and above | Critical | High Risk |

These thresholds are application-defined risk categories, not independently validated industrial safety limits.

## 🏗️ Project Structure

```text
Therma_Predict/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── adaboost_failure_model.pkl
│   ├── machine_type_encoder.pkl
│   └── factory_sensor_simulator_2040.csv
│
├── frontend/
│   └── thermapredict/
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── package-lock.json
│       └── vite.config.js
│
├── README.md
└── TODO.md
```

*Simplified directory structure; generated files and additional configuration files are omitted.*

## ⚙️ Installation and Setup

### Prerequisites

Ensure the following are installed:

- Python and pip
- Node.js and npm
- Git
- Visual Studio Code or another code editor

### 1. Clone the Repository

```bash
git clone https://github.com/AllInDere004/Therma_Predict.git
cd Therma_Predict
```

### 2. Configure the Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe app.py
```

By default, the Flask development server runs at:

`http://127.0.0.1:5000`

### 3. Configure the Frontend

Open another terminal from the project root:

```bash
cd frontend/thermapredict
npm install
npm run dev
```

Open the local URL displayed by Vite, typically:

`http://localhost:5173`

The frontend and backend must be configured to communicate using the appropriate local API address.

## 🔌 Backend API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Backend status message |
| GET | `/machines` | Retrieve machine records |
| POST | `/predict` | Generate failure prediction |

### Example Prediction Response

The prediction API returns a response in the following format:

```json
{
  "prediction": 0,
  "failure_probability": 17.78,
  "status": "Normal",
  "alert": "Low Risk"
}
```

*Illustrative response format; actual values depend on the supplied input.*

## 📸 Application Screenshots

Screenshots of the application can be added here to demonstrate the user interface.

Recommended screenshots:

1. Authentication interface
2. Main dashboard
3. Machine monitoring page
4. Failure prediction results
5. ThermaBot assistant

Store screenshots in a `docs/screenshots/` directory and reference them using Markdown image links.

## 🎥 Project Demonstration

A walkthrough video can be added to showcase the application workflow, monitoring dashboard, prediction features, and ThermaBot interface.

**Demo video:** Coming soon

## 🧪 Local Verification

The following checks have been completed in the local development environment:

- Flask backend started successfully.
- Saved AdaBoostClassifier and LabelEncoder loaded.
- Model accepted a 15-feature input sample.
- Sample prediction returned class `0` with approximately 82.22% class probability.
- React production build completed successfully.
- npm audit reported zero vulnerabilities following dependency updates.

These checks demonstrate local functionality and dependency verification. They do not establish model accuracy, generalization performance, or production readiness.

## 🔮 Future Enhancements

- Live industrial sensor integration.
- Historical machine telemetry storage.
- Improved predictive maintenance analytics.
- Authentication and access-control hardening.
- Cloud deployment and monitoring.
- Model evaluation and performance benchmarking.
- Advanced maintenance recommendations.
- Automated alert notifications.

## 👨‍💻 Author

**Soumalya Dere**

Computer Science & Engineering Undergraduate  
Full-Stack Development | Machine Learning | Python | React.js

GitHub: [AllInDere004](https://github.com/AllInDere004)

## ⭐ Project Note

ThermaPredict is an academic and portfolio project exploring how machine learning and modern web technologies can support predictive maintenance workflows.

The application is intended for demonstration and research purposes and should not be used as the sole basis for safety-critical industrial maintenance decisions.

---

**ThermaPredict — Predicting Potential Failures, Supporting Smarter Maintenance.**