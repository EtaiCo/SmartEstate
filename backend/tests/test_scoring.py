# 📁 backend/tests/test_ranking.py
import pytest
from utils.ranking import score_apartment, calculate_star_rating

class DummyAd:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

class DummyPrefs:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)

def test_score_and_star_rating():
    ad = DummyAd(
        property_type="house",
        price=100,
        rooms=3.0,
        has_parking=True,
        has_elevator=True,
        has_balcony=True,
        has_garden=True,
        pets_allowed=True,
        accessibility=False,
        description="Great house with parking and balcony"
    )

    preferences = DummyPrefs(
        house_type="private_house",
        budget_min=50,
        budget_max=100,
        rooms="3",
        features='["parking", "balcony", "elevator", "garden"]'
    )

    score = score_apartment(ad, preferences)
    stars = calculate_star_rating(score)

    assert score == 65
    assert stars == 4.6


def test_all_ads_have_star_rating_when_logged_in():
    # הכנת רשימת מודעות לדוגמה
    ads = [
        DummyAd(
            property_type="house",
            price=90,
            rooms=3.0,
            has_parking=True,
            has_elevator=False,
            has_balcony=False,
            has_garden=True,
            pets_allowed=True,
            accessibility=False,
            description=""
        ),
        DummyAd(
            property_type="apartment",
            price=80,
            rooms=2.0,
            has_parking=False,
            has_elevator=True,
            has_balcony=True,
            has_garden=False,
            pets_allowed=False,
            accessibility=True,
            description="Nice flat"
        )
    ]

    # העדפות משתמש מחובר
    user_prefs = DummyPrefs(
        house_type="house",
        budget_min=50,
        budget_max=100,
        rooms="3",
        features='["parking", "garden", "pets_allowed"]'
    )

    # דירוג כל דירה
    scored_ads = []
    for ad in ads:
        score = score_apartment(ad, user_prefs)
        stars = calculate_star_rating(score)
        ad.score = score
        ad.stars = stars
        scored_ads.append(ad)

    # בדיקה שכל מודעה קיבלה דירוג
    for ad in scored_ads:
        assert hasattr(ad, "stars")
        assert isinstance(ad.stars, float)
