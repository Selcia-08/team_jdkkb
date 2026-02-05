import cv2
import numpy as np
import requests
import time

# --- CONFIGURATION ---
URL = "http://10.124.211.137/capture"  # <--- REPLACE WITH YOUR ESP32 IP
THRESHOLD = 0.65                   # Accuracy (0.5 to 0.9). Higher = stricter.
COOLDOWN_TIME = 2                  # Seconds to wait before counting same object again

# --- LOAD AND PREPARE TEMPLATES ---
def load_and_prep(path):
    img = cv2.imread(path, 0)
    if img is None:
        print(f"Error: Could not find {path}")
        return None
    # Ensure template isn't too huge (common with phone photos)
    height, width = img.shape
    if width > 200:
        scale = 200 / width
        img = cv2.resize(img, (0,0), fx=scale, fy=scale)
    return img

template_a = load_and_prep('objectA.png')
template_b = load_and_prep('objectB.png')

# Counters and State
count_a = 0
count_b = 0
last_seen_a = 0
last_seen_b = 0

def find_match(frame_gray, template):
    """Searches for the template at multiple scales for better detection"""
    found = None
    t_h, t_w = template.shape[:2]

    # Check the image at 5 different sizes (50% to 150% of original)
    for scale in np.linspace(0.5, 1.5, 5):
        resized = cv2.resize(frame_gray, (0,0), fx=scale, fy=scale)
        if resized.shape[0] < t_h or resized.shape[1] < t_w:
            continue
            
        res = cv2.matchTemplate(resized, template, cv2.TM_CCOEFF_NORMED)
        _, max_val, _, max_loc = cv2.minMaxLoc(res)
        
        if found is None or max_val > found[0]:
            found = (max_val, max_loc, scale)

    return found # Returns (max_val, max_loc, scale)

print("Starting ESP32-CAM Tracker... Press 'q' to exit.")

while True:
    try:
        # 1. Fetch Image
        img_resp = requests.get(URL, timeout=5)
        img_np = np.array(bytearray(img_resp.content), dtype=np.uint8)
        frame = cv2.imdecode(img_np, -1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        current_time = time.time()

        # 2. Check for Object A
        match_a = find_match(gray, template_a)
        if match_a and match_a[0] > THRESHOLD:
            if current_time - last_seen_a > COOLDOWN_TIME:
                count_a += 1
                last_seen_a = current_time
                print(f"Detected Object A! Total: {count_a}")
            # Draw box
            h, w = template_a.shape
            cv2.rectangle(frame, match_a[1], (match_a[1][0] + w, match_a[1][1] + h), (0, 255, 0), 2)

        # 3. Check for Object B
        match_b = find_match(gray, template_b)
        if match_b and match_b[0] > THRESHOLD:
            if current_time - last_seen_b > COOLDOWN_TIME:
                count_b += 1
                last_seen_b = current_time
                print(f"Detected Object B! Total: {count_b}")
            # Draw box
            h, w = template_b.shape
            cv2.rectangle(frame, match_b[1], (match_b[1][0] + w, match_b[1][1] + h), (255, 0, 0), 2)

        # 4. UI Overlay
        cv2.putText(frame, f"A Count: {count_a}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"B Count: {count_b}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        
        cv2.imshow("ESP32-CAM Smart Counter", frame)

    except Exception as e:
        print(f"Connection error: {e}")
        time.sleep(2)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cv2.destroyAllWindows()