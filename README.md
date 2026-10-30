# COLDCHAIN INTEGRITY MONITOR

### Low-Cost IoT-Based Multi-Parameter Monitoring System for Medical Cold Chains

A production-ready, modern web monitoring application and ESP32 IoT node designed to monitor environmental and physical container integrity during the transport of temperature-sensitive medical pharmaceuticals (vaccines, insulin, biological samples).

---

## 1. System Architecture

```
+-------------------------------------------------------------------+
|                            HARDWARE                               |
|                                                                   |
|  [ DHT11 Sensor ]       ---> GPIO 4 (DATA)                        |
|  [ HC-SR04 Ultrasonic ] ---> GPIO 5 (TRIG), GPIO 18 (ECHO 3.3V)   |
|  [ Active Buzzer ]      <--- GPIO 19 (HIGH on COMPROMISED)        |
|                                                                   |
|                     [ ESP32 Microcontroller ]                     |
|                                 |                                 |
|                       HTTPS PUT (every ~3s)                       |
+---------------------------------|---------------------------------+
                                  v
+-------------------------------------------------------------------+
|               FIREBASE REALTIME DATABASE (RTDB)                   |
|                                                                   |
| Project ID: coldchain-integrity-nonitor                           |
| Endpoint:   /coldchain/latest.json                                |
| Timestamp:  {".sv": "timestamp"}                                  |
+-------------------------------------------------------------------+
                                  |
                        onValue() WebSocket
                                  v
+-------------------------------------------------------------------+
|                     REACT DASHBOARD WEBSITE                       |
|                                                                   |
| - Header: Live Indicator, Firebase Status, Clock, Audio Alarm     |
| - Overall Status Hero: SAFE / COMPROMISED with conditions check   |
| - 4 Telemetry Cards: Temperature, Humidity, Distance, Lid State   |
| - Recharts History: In-memory live session graphs                 |
| - Alerts & Incident Log: Real-time violation tracking             |
| - System Diagnostics: Hardware pinout & live raw JSON payload     |
+-------------------------------------------------------------------+
```

---

## 2. Hardware Pinout Reference

| Component | Sensor Pin | ESP32 GPIO | Operating Voltage | Function |
| :--- | :--- | :--- | :--- | :--- |
| **DHT11 Sensor** | DATA | **GPIO 4** | 3.3V / 5V | Temperature & Relative Humidity |
| **Ultrasonic HC-SR04** | TRIG | **GPIO 5** | 5V | 10µs Trigger pulse output |
| **Ultrasonic HC-SR04** | ECHO | **GPIO 18** | **3.3V Logic** *(via divider)* | Echo pulse width input |
| **Active Buzzer** | (+) / I/O | **GPIO 19** | 3.3V / 5V | Local audio alert (HIGH = alert) |

> **IMPORTANT**: Standard HC-SR04 sensors output a 5V echo pulse. Always step this down to 3.3V before feeding into ESP32 GPIO 18 using a 1kΩ / 2kΩ resistor voltage divider to protect the ESP32 input pin.

---

## 3. Prototype Safety Thresholds

The prototype evaluates the following conditions:

- **Temperature**: Safe between **2.0°C and 8.0°C** (WHO standard cold chain)
- **Relative Humidity**: Safe at or below **50.0% RH**
- **Lid Closure**: Safe at or below **15.0 cm** (indicating lid is closed)
- **Sensor Validity**: Distance reading must be valid (non-negative) and DHT11 must return valid numbers.

### Classification:
- **`SAFE`**: Temperature in [2°C, 8°C] **AND** Humidity ≤ 50% **AND** Lid ≤ 15 cm **AND** Sensor readings valid.
- **`COMPROMISED`**: Any condition breached or sensor error. Buzzer is triggered on GPIO 19.

*Note: This is a research prototype classification and not a validated medical-product safety assessment.*

---

## 4. Firebase Database Configuration

- **Firebase Project ID**: `coldchain-integrity-nonitor` *(spelled with NONITOR)*
- **Database URL**: `https://coldchain-integrity-nonitor-default-rtdb.asia-southeast1.firebasedatabase.app`
- **Database Path**: `/coldchain/latest`

### Payload Schema:
```json
{
  "temperature": 32.8,
  "humidity": 41.0,
  "distance": 34.8,
  "lid": "open",
  "timestamp": 1792743625467
}
```

### Security Rules:
```json
{
  "rules": {
    "coldchain": {
      "latest": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

---

## 5. Web Application Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Development Mode
```bash
npm install
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```
Visit `http://localhost:5173` in your browser.

---

## 6. ESP32 Arduino Sketch

The extended ESP32 sketch is located in [`esp32/coldchain_esp32_firebase.ino`](file:///C:/Users/shree/.gemini/antigravity/scratch/coldchain-monitor/esp32/coldchain_esp32_firebase.ino).

### Flashing Instructions:
1. Open Arduino IDE or PlatformIO.
2. Install the **DHT sensor library by Adafruit** and **Adafruit Unified Sensor**.
3. Select board: **ESP32 Dev Module**.
4. Open `coldchain_esp32_firebase.ino`.
5. Update your Wi-Fi credentials:
   ```cpp
   const char* WIFI_SSID     = "YOUR_WIFI_NAME";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   ```
6. Compile and upload to your ESP32 board.
7. Open Serial Monitor at **115200 baud** to view real-time telemetry and HTTP PUT responses.
