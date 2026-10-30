/*
 * PROJECT: LOW-COST IoT-BASED MULTI-PARAMETER MONITORING SYSTEM FOR MEDICAL COLD CHAINS
 * ESP32 + DHT11 + HC-SR04 Ultrasonic + Buzzer + Firebase Realtime Database
 * 
 * Target Firebase Project ID: coldchain-integrity-nonitor
 * Database URL: https://coldchain-integrity-nonitor-default-rtdb.asia-southeast1.firebasedatabase.app
 * Database Path: /coldchain/latest.json (via HTTP PUT)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <math.h>

// -------- WI-FI CREDENTIALS --------
// Replace with your local 2.4 GHz Wi-Fi credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// -------- FIREBASE CONFIGURATION --------
// Notice: Project ID contains NONITOR (not MONITOR)
const char* FIREBASE_HOST = "https://coldchain-integrity-nonitor-default-rtdb.asia-southeast1.firebasedatabase.app";
const char* FIREBASE_PATH = "/coldchain/latest.json";

// Full HTTPS PUT URL
const String FIREBASE_URL = String(FIREBASE_HOST) + String(FIREBASE_PATH);

// Optional Firebase Database Secret / Auth token (leave empty if rules permit public access)
// const char* FIREBASE_AUTH = ""; 

// -------- SENSOR PINS --------
#define DHTPIN 4
#define DHTTYPE DHT11
#define TRIG_PIN 5
#define ECHO_PIN 18
#define BUZZER_PIN 19

// -------- SAFETY THRESHOLDS --------
const float TEMP_MIN = 2.0;          // Minimum temperature: 2°C
const float TEMP_MAX = 8.0;          // Maximum temperature: 8°C
const float HUMIDITY_MAX = 50.0;     // Maximum humidity: 50%
const float LID_THRESHOLD_CM = 15.0; // Lid distance threshold: 15 cm

DHT dht(DHTPIN, DHTTYPE);

float temp = NAN;
float hum = NAN;
float distanceCm = -1.0;
String lidState = "unknown";

unsigned long lastSensorRead = 0;
const unsigned long SENSOR_INTERVAL = 3000; // 3 seconds interval

// -------- ULTRASONIC DISTANCE FUNCTION --------
float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  // Read echo pulse with 30ms timeout (~5m max range)
  unsigned long echoUs = pulseIn(ECHO_PIN, HIGH, 30000UL);

  if (echoUs == 0) return -1.0;

  return (echoUs * 0.0343) / 2.0;
}

// -------- WI-FI CONNECTION HELPER --------
void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(true);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Wi-Fi connected! ESP32 IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("Wi-Fi connection timed out. Will retry on next loop.");
  }
}

// -------- FIREBASE HTTP PUT UPLOAD --------
bool uploadToFirebase(float t, float h, float d, const String& lid) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[Firebase] Error: Wi-Fi not connected. Skipping upload.");
    connectWiFi();
    return false;
  }

  WiFiClientSecure client;
  // Firebase uses SSL (HTTPS). Insecure mode avoids hardcoding CA roots on ESP32.
  client.setInsecure();

  HTTPClient http;
  http.setTimeout(5000); // 5 seconds HTTP timeout

  if (!http.begin(client, FIREBASE_URL)) {
    Serial.println("[Firebase] Unable to initiate HTTPS connection.");
    return false;
  }

  http.addHeader("Content-Type", "application/json");

  // Build JSON payload.
  // Note: {".sv": "timestamp"} tells Firebase RTDB to generate server millisecond epoch timestamp.
  String payload = "{";
  payload += "\"temperature\":" + String(t, 1) + ",";
  payload += "\"humidity\":" + String(h, 1) + ",";
  payload += "\"distance\":" + String(d, 1) + ",";
  payload += "\"lid\":\"" + lid + "\",";
  payload += "\"timestamp\":{\".sv\":\"timestamp\"}";
  payload += "}";

  Serial.print("[Firebase PUT] Uploading to ");
  Serial.println(FIREBASE_URL);
  Serial.print("[Firebase PUT] Payload: ");
  Serial.println(payload);

  int httpCode = http.PUT(payload);

  if (httpCode > 0) {
    Serial.print("[Firebase PUT] Success response code: ");
    Serial.println(httpCode);

    if (httpCode == HTTP_CODE_OK) {
      String response = http.getString();
      Serial.print("[Firebase PUT] Response body: ");
      Serial.println(response);
    }
  } else {
    Serial.print("[Firebase PUT] Failed, HTTP error: ");
    Serial.println(http.errorToString(httpCode).c_str());
  }

  http.end();
  return (httpCode == HTTP_CODE_OK);
}

// -------- SETUP --------
void setup() {
  Serial.begin(115200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  digitalWrite(TRIG_PIN, LOW);
  digitalWrite(BUZZER_PIN, LOW);

  dht.begin();

  Serial.println();
  Serial.println("==================================================");
  Serial.println("  ESP32 Medical Cold-Chain IoT Telemetry Node");
  Serial.println("  Project: coldchain-integrity-nonitor");
  Serial.println("==================================================");

  // Connect to Wi-Fi
  connectWiFi();

  delay(1000);
}

// -------- MAIN LOOP --------
void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = currentMillis;

    temp = dht.readTemperature();
    hum = dht.readHumidity();
    distanceCm = readDistanceCm();

    if (!isnan(temp) && !isnan(hum)) {

      // Evaluate lid state
      if (distanceCm < 0) {
        lidState = "error";
      } else if (distanceCm <= LID_THRESHOLD_CM) {
        lidState = "close";
      } else {
        lidState = "open";
      }

      // Evaluate system compromise state
      bool tempBad = (temp < TEMP_MIN || temp > TEMP_MAX);
      bool humBad = (hum > HUMIDITY_MAX);
      bool lidBad = (lidState == "open" || lidState == "error");

      bool isCompromised = tempBad || humBad || lidBad;

      // Trigger local buzzer alarm
      digitalWrite(BUZZER_PIN, isCompromised ? HIGH : LOW);

      // Print telemetry log to Serial Monitor
      Serial.println("==========================================");

      Serial.print("Temperature: ");
      Serial.print(temp, 1);
      Serial.print(" C [");
      Serial.print(tempBad ? "COMPROMISED" : "OK");
      Serial.println("]");

      Serial.print("Humidity: ");
      Serial.print(hum, 1);
      Serial.print(" % [");
      Serial.print(humBad ? "COMPROMISED" : "OK");
      Serial.println("]");

      Serial.print("Distance: ");
      Serial.print(distanceCm, 1);
      Serial.println(" cm");

      Serial.print("Lid State: ");
      Serial.print(lidState);
      Serial.print(" [");
      Serial.print(lidBad ? "COMPROMISED" : "OK");
      Serial.println("]");

      Serial.print("Overall: ");
      Serial.println(
        isCompromised ? "ALERT - COMPROMISED!" : "SYSTEM OK"
      );

      Serial.println("==========================================");

      // Upload telemetry to Firebase Realtime Database
      uploadToFirebase(temp, hum, distanceCm, lidState);

      Serial.println();

    } else {
      Serial.println("Failed to read DHT11. Check sensor wiring.");
    }
  }
}
