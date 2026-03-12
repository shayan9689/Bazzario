"""Critical ecommerce API regression tests: auth, catalog, cart, orders, payments, account."""

import uuid

import pytest
import requests
from dotenv import load_dotenv

load_dotenv("/app/frontend/.env")


@pytest.fixture(scope="session")
def base_url(pytestconfig):
    import os

    url = os.environ.get("REACT_APP_BACKEND_URL")
    if not url:
        pytest.skip("REACT_APP_BACKEND_URL is not configured")
    return url.rstrip("/")


@pytest.fixture(scope="session")
def api_client():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="session")
def auth_context(api_client, base_url):
    unique_email = f"test_{uuid.uuid4().hex[:10]}@example.com"
    password = "TestPass123!"
    name = "TEST API User"

    signup_response = api_client.post(
        f"{base_url}/api/auth/signup",
        json={"name": name, "email": unique_email, "password": password},
        timeout=30,
    )
    assert signup_response.status_code == 200
    signup_data = signup_response.json()
    assert signup_data["user"]["email"] == unique_email
    assert isinstance(signup_data["access_token"], str)

    return {
        "email": unique_email,
        "password": password,
        "name": name,
        "token": signup_data["access_token"],
        "user_id": signup_data["user"]["id"],
    }


@pytest.fixture
def auth_headers(auth_context):
    return {"Authorization": f"Bearer {auth_context['token']}"}


@pytest.fixture
def clean_cart(api_client, base_url, auth_headers):
    api_client.delete(f"{base_url}/api/cart/clear", headers=auth_headers, timeout=30)
    yield
    api_client.delete(f"{base_url}/api/cart/clear", headers=auth_headers, timeout=30)


def test_health(api_client, base_url):
    response = api_client.get(f"{base_url}/api/health", timeout=30)
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_auth_login_and_me(api_client, base_url, auth_context):
    login_response = api_client.post(
        f"{base_url}/api/auth/login",
        json={"email": auth_context["email"], "password": auth_context["password"]},
        timeout=30,
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["user"]["email"] == auth_context["email"]

    me_response = api_client.get(
        f"{base_url}/api/auth/me",
        headers={"Authorization": f"Bearer {login_data['access_token']}"},
        timeout=30,
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["id"] == auth_context["user_id"]


def test_products_list_and_detail(api_client, base_url):
    products_response = api_client.get(f"{base_url}/api/products?page=1&page_size=20", timeout=30)
    assert products_response.status_code == 200
    products_data = products_response.json()
    assert products_data["total"] >= 1

    first_product = products_data["items"][0]
    detail_response = api_client.get(f"{base_url}/api/products/{first_product['id']}", timeout=30)
    assert detail_response.status_code == 200
    detail_data = detail_response.json()
    assert detail_data["id"] == first_product["id"]


def test_cart_add_update_remove_get(api_client, base_url, auth_headers, clean_cart):
    products_response = api_client.get(f"{base_url}/api/products?page=1&page_size=1", timeout=30)
    product = products_response.json()["items"][0]

    add_response = api_client.post(
        f"{base_url}/api/cart/items",
        headers=auth_headers,
        json={
            "product_id": product["id"],
            "quantity": 2,
            "size": product.get("sizes", ["US 9"])[0],
            "color": product.get("color_name", "Default"),
        },
        timeout=30,
    )
    assert add_response.status_code == 200
    add_data = add_response.json()
    assert add_data["item_count"] == 2

    item_id = add_data["items"][0]["item_id"]
    update_response = api_client.put(
        f"{base_url}/api/cart/items/{item_id}",
        headers=auth_headers,
        json={"quantity": 3},
        timeout=30,
    )
    assert update_response.status_code == 200
    update_data = update_response.json()
    assert update_data["items"][0]["quantity"] == 3

    get_response = api_client.get(f"{base_url}/api/cart", headers=auth_headers, timeout=30)
    assert get_response.status_code == 200
    get_data = get_response.json()
    assert get_data["items"][0]["quantity"] == 3

    remove_response = api_client.delete(f"{base_url}/api/cart/items/{item_id}", headers=auth_headers, timeout=30)
    assert remove_response.status_code == 200
    remove_data = remove_response.json()
    assert len(remove_data["items"]) == 0


def test_order_cod_create_and_list(api_client, base_url, auth_headers, clean_cart):
    product = api_client.get(f"{base_url}/api/products?page=1&page_size=1", timeout=30).json()["items"][0]
    api_client.post(
        f"{base_url}/api/cart/items",
        headers=auth_headers,
        json={
            "product_id": product["id"],
            "quantity": 1,
            "size": product.get("sizes", ["US 9"])[0],
            "color": product.get("color_name", "Default"),
        },
        timeout=30,
    )

    create_order_response = api_client.post(
        f"{base_url}/api/orders/checkout",
        headers=auth_headers,
        json={
            "shipping_address": {
                "first_name": "TEST",
                "last_name": "USER",
                "address_line1": "123 Test St",
                "apartment": "",
                "city": "LA",
                "state": "CA",
                "postal_code": "90001",
                "country": "USA",
                "phone": "+1 555 1000",
            },
            "payment_method": "cod",
            "shipping_method": "standard",
        },
        timeout=30,
    )
    assert create_order_response.status_code == 200
    order_data = create_order_response.json()
    assert order_data["payment_status"] == "paid"

    list_orders_response = api_client.get(f"{base_url}/api/orders", headers=auth_headers, timeout=30)
    assert list_orders_response.status_code == 200
    list_data = list_orders_response.json()
    assert any(order["order_id"] == order_data["order_id"] for order in list_data["orders"])

    get_order_response = api_client.get(
        f"{base_url}/api/orders/{order_data['order_id']}",
        headers=auth_headers,
        timeout=30,
    )
    assert get_order_response.status_code == 200
    assert get_order_response.json()["order_id"] == order_data["order_id"]


def test_stripe_checkout_session_and_status(api_client, base_url, auth_headers, clean_cart):
    product = api_client.get(f"{base_url}/api/products?page=1&page_size=1", timeout=30).json()["items"][0]
    api_client.post(
        f"{base_url}/api/cart/items",
        headers=auth_headers,
        json={
            "product_id": product["id"],
            "quantity": 1,
            "size": product.get("sizes", ["US 9"])[0],
            "color": product.get("color_name", "Default"),
        },
        timeout=30,
    )

    stripe_order_response = api_client.post(
        f"{base_url}/api/orders/checkout",
        headers=auth_headers,
        json={
            "shipping_address": {
                "first_name": "TEST",
                "last_name": "USER",
                "address_line1": "456 Stripe Ave",
                "apartment": "",
                "city": "SF",
                "state": "CA",
                "postal_code": "94105",
                "country": "USA",
                "phone": "+1 555 2000",
            },
            "payment_method": "stripe",
            "shipping_method": "express",
        },
        timeout=30,
    )
    assert stripe_order_response.status_code == 200
    order_data = stripe_order_response.json()
    assert order_data["payment_status"] == "pending"

    session_response = api_client.post(
        f"{base_url}/api/payments/checkout/session",
        headers=auth_headers,
        json={"order_id": order_data["order_id"], "origin_url": base_url},
        timeout=45,
    )
    assert session_response.status_code == 200
    session_data = session_response.json()
    assert session_data["order_id"] == order_data["order_id"]
    assert "http" in session_data["url"]

    status_response = api_client.get(
        f"{base_url}/api/payments/checkout/status/{session_data['session_id']}",
        headers=auth_headers,
        timeout=45,
    )
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["session_id"] == session_data["session_id"]


def test_account_settings_and_profile(api_client, base_url, auth_headers):
    settings_get_response = api_client.get(f"{base_url}/api/account/settings", headers=auth_headers, timeout=30)
    assert settings_get_response.status_code == 200
    current_settings = settings_get_response.json()
    assert "shipment_updates" in current_settings

    update_settings_response = api_client.put(
        f"{base_url}/api/account/settings",
        headers=auth_headers,
        json={"theme": "dark", "shipment_updates": False, "marketing_updates": False},
        timeout=30,
    )
    assert update_settings_response.status_code == 200
    updated_settings = update_settings_response.json()
    assert updated_settings["theme"] == "dark"

    update_profile_response = api_client.put(
        f"{base_url}/api/account/profile",
        headers=auth_headers,
        json={"name": "TEST API User Updated", "phone": "+1 555 3000"},
        timeout=30,
    )
    assert update_profile_response.status_code == 200
    profile_data = update_profile_response.json()
    assert profile_data["name"] == "TEST API User Updated"

    me_response = api_client.get(f"{base_url}/api/auth/me", headers=auth_headers, timeout=30)
    assert me_response.status_code == 200
    assert me_response.json()["name"] == "TEST API User Updated"
