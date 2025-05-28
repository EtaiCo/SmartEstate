import json

def score_apartment(ad, preferences):
    score = 0

    # Match: house_type
    if preferences.house_type == ad.property_type or (
        preferences.house_type == "private_house" and ad.property_type == "house"
    ):
        score += 15
    print(f"House Type Match: {preferences.house_type}, {ad.property_type}, Score: {score}")

    # Match: budget
    if preferences.budget_min is not None and preferences.budget_max is not None:
        if preferences.budget_min <= ad.price <= preferences.budget_max:
            score += 20
    print(f"Budget Match: {preferences.budget_min} - {preferences.budget_max}, Price: {ad.price}, Score: {score}")

    # Match: rooms
    if preferences.rooms and float(preferences.rooms) == float(ad.rooms):
        score += 10
    print(f"Rooms Match: {preferences.rooms}, Ad Rooms: {ad.rooms}, Score: {score}")

    # Parse features from JSON string
    try:
            requested_features = json.loads(preferences.features) if preferences.features else []
    except json.JSONDecodeError:
            requested_features = []

    feature_to_ad_field = {
            "parking": "has_parking",
            "elevator": "has_elevator",
            "balcony": "has_balcony",
            "garden": "has_garden",
            "pets_allowed": "pets_allowed",
            "accessibility": "accessibility"
        }

    for feature in requested_features:
        ad_field = feature_to_ad_field.get(feature)
        if ad_field:
            if getattr(ad, ad_field, False):
                score += 5
            else:
                score -= 2 
        print(f"Feature Match: {feature}, Ad Field: {ad_field}, Score: {score}")
    print(f"Final Score: {score}")
    return score


def calculate_star_rating(raw_score, max_score=70):
    normalized = min(max(raw_score, 0) / max_score, 1.0)
    return round(normalized * 5, 1)
