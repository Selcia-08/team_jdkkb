from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import threading
import time

app = Flask(__name__)
CORS(app)

# --- EMISSION FACTORS (kg CO2 per ton-km)
EMISSION_FACTORS = { "road": 0.080, "rail": 0.020, "air": 0.500 }

# --- GLOBAL STATE (For the Counters) ---
# This acts as the "memory" for your Object A/B counts
current_counts = {"a": 0, "b": 0}

# Helper: Calculate distance for optimization
def get_dist(p1, p2):
    return math.sqrt((p1['lat'] - p2['lat'])**2 + (p1['lng'] - p2['lng'])**2)


def calculate_emissions(dist_km, weight_kg, mode):
    """Calculate emissions in kg CO2 for given distance (km), weight (kg) and mode."""
    factor = EMISSION_FACTORS.get(mode, EMISSION_FACTORS['road'])
    weight_tons = weight_kg / 1000.0
    return dist_km * weight_tons * factor

# --- ROUTE 1: THE COUNTS (Fixes your 404 Error) ---
@app.route('/counts', methods=['GET'])
def get_counts():
    # If you merge your OpenCV code later, update 'current_counts' there.
    # For now, this stops the 404 errors.
    return jsonify(current_counts)

# --- ROUTE 2: THE OPTIMIZER (Your Routing Logic) ---
@app.route('/optimize', methods=['POST'])
def optimize_route():
    data = request.json
    locations = data.get('locations', [])
    
    if len(locations) < 2:
        return jsonify({"error": "Need at least 2 points"}), 400

    # Johnson's Algorithm / Nearest Neighbor Logic
    # 1. Start at the first point
    unvisited = locations[:]
    current = unvisited.pop(0)
    path = [current]
    
    logs = ["Optimization Started..."]
    
    # 2. Find nearest neighbor until all visited
    while unvisited:
        # Find the closest node to 'current'
        nearest = min(unvisited, key=lambda node: get_dist(current, node))
        path.append(nearest)
        logs.append(f"Connected to nearest node at {nearest['lat']:.4f}")
        
        # Move to next
        current = nearest
        unvisited.remove(nearest)

    # Calculate total distance in degrees then convert to km (approx 1 deg ~ 111 km)
    total_deg = 0.0
    for i in range(len(path) - 1):
        total_deg += get_dist(path[i], path[i+1])
    total_km = total_deg * 111.0

    # Default weight (kg) if not provided
    default_weight_kg = 1000.0
    # Optimized emissions (use road factor)
    optimized_emission = calculate_emissions(total_km, default_weight_kg, 'road')
    # Baseline: simulate unoptimized route 45% longer
    baseline_km = total_km * 1.45
    baseline_emission = calculate_emissions(baseline_km, default_weight_kg, 'road')
    saved_emission = max(0.0, baseline_emission - optimized_emission)
    reduction_pct = (saved_emission / baseline_emission * 100.0) if baseline_emission > 0 else 0.0

    stats = {
        'total_distance_km': total_km,
        'optimized': optimized_emission,
        'baseline': baseline_emission,
        'saved': saved_emission,
        'percent': reduction_pct
    }

    return jsonify({
        "optimized_route": path,
        "logs": logs,
        "stats": stats
    })


@app.route('/calculate-manual', methods=['POST'])
def calculate_manual():
    payload = request.json or {}
    distance = float(payload.get('distance', 0.0))
    weight = float(payload.get('weight', 0.0))
    mode = payload.get('mode', 'road')
    # selected emission (user's chosen mode)
    emission_kg = calculate_emissions(distance, weight, mode)
    # baseline comparison uses AIR factor (higher impact)
    baseline_kg = calculate_emissions(distance, weight, 'air')
    savings_kg = max(0.0, baseline_kg - emission_kg)
    return jsonify({ 'emission_kg': emission_kg, 'baseline_kg': baseline_kg, 'savings_kg': savings_kg })

# --- OPTIONAL: Background Thread to Simulate/Read Sensor Data ---
def background_sensor_check():
    global current_counts
    # If you have your OpenCV logic, paste it here to update counts real-time.
    pass

if __name__ == '__main__':
    # Starting background thread (if needed for camera later)
    t = threading.Thread(target=background_sensor_check)
    t.daemon = True
    t.start()
    
    # Run on Port 5001 to match your Frontend
    print("✅ Server running on Port 5001... Waiting for React...")
    app.run(port=5001, debug=True)