import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Literal, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException, Query, Request, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

from emergentintegrations.payments.stripe.checkout import (
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    CheckoutStatusResponse,
    StripeCheckout,
)


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ["DB_NAME"]
jwt_secret_key = os.environ["JWT_SECRET_KEY"]
jwt_algorithm = os.environ["JWT_ALGORITHM"]
jwt_expire_minutes = int(os.environ["JWT_EXPIRE_MINUTES"])
stripe_api_key = os.environ["STRIPE_API_KEY"]

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

app = FastAPI(title="Bazzario Ecommerce API")
api_router = APIRouter(prefix="/api")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id() -> str:
    return str(uuid.uuid4())


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def create_access_token(user_id: str) -> str:
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=jwt_expire_minutes)
    payload = {"sub": user_id, "exp": expire_time}
    return jwt.encode(payload, jwt_secret_key, algorithm=jwt_algorithm)


def get_stripe_checkout(request: Request) -> StripeCheckout:
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    return StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)


class AuthUser(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str = ""
    created_at: str


class AuthWithTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser


class SignUpRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Product(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    price: float
    old_price: float
    rating: float
    reviews: int
    tag: str
    image: str
    color_name: str
    description: str
    stock: int
    sizes: List[str]


class ProductListResponse(BaseModel):
    items: List[Product]
    total: int
    page: int
    page_size: int


class CartItemRequest(BaseModel):
    product_id: str
    quantity: int = Field(default=1, ge=1)
    size: str = "US 9"
    color: str = "Default"


class CartItemUpdateRequest(BaseModel):
    quantity: int = Field(ge=1)


class CartItem(BaseModel):
    item_id: str
    product_id: str
    name: str
    image: str
    price: float
    old_price: float
    quantity: int
    size: str
    color: str
    line_total: float


class CartResponse(BaseModel):
    cart_id: str
    user_id: str
    items: List[CartItem]
    item_count: int
    subtotal: float
    tax: float
    total: float


class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    address_line1: str
    apartment: str = ""
    city: str
    state: str
    postal_code: str
    country: str
    phone: str


class CheckoutOrderRequest(BaseModel):
    shipping_address: ShippingAddress
    payment_method: Literal["stripe", "cod"] = "stripe"
    shipping_method: Literal["standard", "express"] = "standard"


class OrderItem(BaseModel):
    product_id: str
    name: str
    image: str
    quantity: int
    unit_price: float
    line_total: float


class Order(BaseModel):
    order_id: str
    user_id: str
    status: str
    payment_status: str
    payment_method: str
    subtotal: float
    tax: float
    shipping_fee: float
    discount: float
    total: float
    items: List[OrderItem]
    shipping_address: ShippingAddress
    created_at: str
    updated_at: str
    payment_session_id: Optional[str] = None


class OrderListResponse(BaseModel):
    orders: List[Order]


class CheckoutSessionCreateRequest(BaseModel):
    order_id: str
    origin_url: str


class CheckoutSessionCreateResponse(BaseModel):
    order_id: str
    session_id: str
    url: str


class CheckoutStatusPublicResponse(BaseModel):
    order_id: str
    session_id: str
    status: str
    payment_status: str
    amount_total: int
    currency: str


class UserSettings(BaseModel):
    theme: Literal["light", "dark"] = "light"
    shipment_updates: bool = True
    marketing_updates: bool = True


class UserSettingsUpdateRequest(BaseModel):
    theme: Optional[Literal["light", "dark"]] = None
    shipment_updates: Optional[bool] = None
    marketing_updates: Optional[bool] = None


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None


async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload = jwt.decode(token, jwt_secret_key, algorithms=[jwt_algorithm])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except JWTError as error:
        raise credentials_exception from error

    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise credentials_exception
    return user


def map_cart_response(cart_doc: Dict) -> CartResponse:
    items = cart_doc.get("items", [])
    subtotal = round(sum(float(item["price"]) * int(item["quantity"]) for item in items), 2)
    tax = round(subtotal * 0.08, 2)
    total = round(subtotal + tax, 2)
    item_count = sum(int(item["quantity"]) for item in items)
    mapped_items = [
        CartItem(
            item_id=item["item_id"],
            product_id=item["product_id"],
            name=item["name"],
            image=item["image"],
            price=float(item["price"]),
            old_price=float(item["old_price"]),
            quantity=int(item["quantity"]),
            size=item["size"],
            color=item["color"],
            line_total=round(float(item["price"]) * int(item["quantity"]), 2),
        )
        for item in items
    ]

    return CartResponse(
        cart_id=cart_doc["id"],
        user_id=cart_doc["user_id"],
        items=mapped_items,
        item_count=item_count,
        subtotal=subtotal,
        tax=tax,
        total=total,
    )


async def get_or_create_cart(user_id: str) -> Dict:
    cart = await db.carts.find_one({"user_id": user_id}, {"_id": 0})
    if cart:
        return cart

    created = {
        "id": new_id(),
        "user_id": user_id,
        "items": [],
        "updated_at": utc_now_iso(),
    }
    await db.carts.insert_one(created)
    return created


async def seed_products() -> None:
    existing = await db.products.count_documents({})
    if existing > 0:
        return

    now = utc_now_iso()
    initial_products = [
        {
            "id": "velocity-pro-runner",
            "name": "Velocity Pro Runner - Midnight Black",
            "brand": "Nike",
            "category": "Running",
            "price": 129.99,
            "old_price": 169.99,
            "rating": 4.8,
            "reviews": 324,
            "tag": "Best Seller",
            "image": "https://images.unsplash.com/photo-1559743345-60e0907c4853?auto=format&fit=crop&w=900&q=80",
            "color_name": "black",
            "description": "High-performance daily runner with responsive cushioning.",
            "stock": 40,
            "sizes": ["US 8", "US 9", "US 10", "US 11"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "technical-running",
            "name": "Technical Running - Cloud White",
            "brand": "Adidas",
            "category": "Running",
            "price": 159.5,
            "old_price": 189.0,
            "rating": 4.7,
            "reviews": 291,
            "tag": "View Arrival",
            "image": "https://images.unsplash.com/photo-1608384177866-0bca0d225435?auto=format&fit=crop&w=900&q=80",
            "color_name": "white",
            "description": "Technical knit upper and durable outsole for long runs.",
            "stock": 36,
            "sizes": ["US 8", "US 9", "US 10", "US 11"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "urban-canvas",
            "name": "Urban Canvas - Skyline Blue",
            "brand": "Puma",
            "category": "Lifestyle",
            "price": 65.0,
            "old_price": 89.0,
            "rating": 4.4,
            "reviews": 263,
            "tag": "Trending",
            "image": "https://images.unsplash.com/photo-1588416681455-3f2ba669371d?auto=format&fit=crop&w=900&q=80",
            "color_name": "blue",
            "description": "Streetwear canvas silhouette with lightweight comfort.",
            "stock": 52,
            "sizes": ["US 7", "US 8", "US 9", "US 10"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "all-weather-trail",
            "name": "All-Weather Trail - Earth Brown",
            "brand": "New Balance",
            "category": "Walking",
            "price": 145.0,
            "old_price": 199.0,
            "rating": 4.5,
            "reviews": 411,
            "tag": "Outdoor",
            "image": "https://images.unsplash.com/photo-1615743771721-e2ee843a41c0?auto=format&fit=crop&w=900&q=80",
            "color_name": "green",
            "description": "All-weather grip and support for mixed terrain.",
            "stock": 24,
            "sizes": ["US 8", "US 9", "US 10", "US 11"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "classic-court",
            "name": "Classic Court - Match Edition",
            "brand": "Reebok",
            "category": "Basketball",
            "price": 89.99,
            "old_price": 119.0,
            "rating": 4.2,
            "reviews": 178,
            "tag": "On Court",
            "image": "https://images.unsplash.com/photo-1625860191460-10a66c7384fb?auto=format&fit=crop&w=900&q=80",
            "color_name": "red",
            "description": "Court-inspired classic with cushioned sole unit.",
            "stock": 48,
            "sizes": ["US 7", "US 8", "US 9", "US 10"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "minimalist-white",
            "name": "Minimalist White - Everyday Fit",
            "brand": "ASICS",
            "category": "Training",
            "price": 110.0,
            "old_price": 149.0,
            "rating": 4.4,
            "reviews": 255,
            "tag": "Clean Drop",
            "image": "https://images.unsplash.com/photo-1608380272894-b3617f04b463?auto=format&fit=crop&w=900&q=80",
            "color_name": "white",
            "description": "Minimal profile sneaker designed for all-day wear.",
            "stock": 31,
            "sizes": ["US 7", "US 8", "US 9", "US 10"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "retro-suede",
            "name": "Retro Suede - Heritage Brown",
            "brand": "Nike",
            "category": "Lifestyle",
            "price": 95.0,
            "old_price": 129.0,
            "rating": 4.3,
            "reviews": 302,
            "tag": "Limited Edition",
            "image": "https://images.unsplash.com/photo-1620790458588-c6c4a0d68a84?auto=format&fit=crop&w=900&q=80",
            "color_name": "red",
            "description": "Retro-inspired suede upper with modern comfort.",
            "stock": 29,
            "sizes": ["US 8", "US 9", "US 10"],
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": "sport-performance",
            "name": "Sport Performance - Sprint Orange",
            "brand": "Puma",
            "category": "Running",
            "price": 180.0,
            "old_price": 225.0,
            "rating": 4.8,
            "reviews": 350,
            "tag": "Pro Pick",
            "image": "https://images.unsplash.com/photo-1746206673199-5b75dcec1018?auto=format&fit=crop&w=900&q=80",
            "color_name": "yellow",
            "description": "Pro-level performance runner for speed workouts.",
            "stock": 18,
            "sizes": ["US 8", "US 9", "US 10", "US 11"],
            "created_at": now,
            "updated_at": now,
        },
    ]
    await db.products.insert_many(initial_products)


@app.on_event("startup")
async def startup_tasks() -> None:
    await db.users.create_index("email", unique=True)
    await db.products.create_index("id", unique=True)
    await db.orders.create_index("order_id", unique=True)
    await db.payment_transactions.create_index("session_id", unique=True)
    await seed_products()


@api_router.get("/")
async def root() -> Dict[str, str]:
    return {"message": "Bazzario API is running"}


@api_router.get("/health")
async def health() -> Dict[str, str]:
    return {"status": "ok", "timestamp": utc_now_iso()}


@api_router.post("/auth/signup", response_model=AuthWithTokenResponse)
async def signup(payload: SignUpRequest) -> AuthWithTokenResponse:
    existing = await db.users.find_one({"email": payload.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user_doc = {
        "id": new_id(),
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "phone": "",
        "password_hash": hash_password(payload.password),
        "settings": UserSettings().model_dump(),
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso(),
    }
    await db.users.insert_one(user_doc)

    token = create_access_token(user_doc["id"])
    return AuthWithTokenResponse(
        access_token=token,
        user=AuthUser(
            id=user_doc["id"],
            name=user_doc["name"],
            email=user_doc["email"],
            phone=user_doc["phone"],
            created_at=user_doc["created_at"],
        ),
    )


@api_router.post("/auth/login", response_model=AuthWithTokenResponse)
async def login(payload: LoginRequest) -> AuthWithTokenResponse:
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user["id"])
    return AuthWithTokenResponse(
        access_token=token,
        user=AuthUser(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            phone=user.get("phone", ""),
            created_at=user["created_at"],
        ),
    )


@api_router.get("/auth/me", response_model=AuthUser)
async def me(current_user: Dict = Depends(get_current_user)) -> AuthUser:
    return AuthUser(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        phone=current_user.get("phone", ""),
        created_at=current_user["created_at"],
    )


@api_router.get("/products", response_model=ProductListResponse)
async def get_products(
    search: str = "",
    category: str = "",
    brand: str = "",
    min_price: float = 0,
    max_price: float = 999999,
    sort: str = Query(default="featured", pattern="^(featured|price-low|price-high|top-rated)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ProductListResponse:
    query: Dict = {"price": {"$gte": min_price, "$lte": max_price}}
    if category:
        query["category"] = category
    if brand:
        query["brand"] = brand
    if search:
        query["name"] = {"$regex": search, "$options": "i"}

    sort_map = {
        "featured": [("reviews", -1)],
        "price-low": [("price", 1)],
        "price-high": [("price", -1)],
        "top-rated": [("rating", -1)],
    }

    skip_count = (page - 1) * page_size
    items = await db.products.find(query, {"_id": 0}).sort(sort_map[sort]).skip(skip_count).limit(page_size).to_list(page_size)
    total = await db.products.count_documents(query)

    return ProductListResponse(
        items=[Product(**item) for item in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str) -> Product:
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)


@api_router.get("/cart", response_model=CartResponse)
async def get_cart(current_user: Dict = Depends(get_current_user)) -> CartResponse:
    cart_doc = await get_or_create_cart(current_user["id"])
    return map_cart_response(cart_doc)


@api_router.post("/cart/items", response_model=CartResponse)
async def add_cart_item(payload: CartItemRequest, current_user: Dict = Depends(get_current_user)) -> CartResponse:
    product = await db.products.find_one({"id": payload.product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cart_doc = await get_or_create_cart(current_user["id"])
    items = cart_doc.get("items", [])
    existing_index = next(
        (
            index
            for index, item in enumerate(items)
            if item["product_id"] == payload.product_id and item["size"] == payload.size and item["color"] == payload.color
        ),
        None,
    )

    if existing_index is not None:
        items[existing_index]["quantity"] += payload.quantity
    else:
        items.append(
            {
                "item_id": new_id(),
                "product_id": product["id"],
                "name": product["name"],
                "image": product["image"],
                "price": float(product["price"]),
                "old_price": float(product["old_price"]),
                "quantity": payload.quantity,
                "size": payload.size,
                "color": payload.color,
            }
        )

    await db.carts.update_one(
        {"id": cart_doc["id"]},
        {"$set": {"items": items, "updated_at": utc_now_iso()}},
    )
    updated_cart = await db.carts.find_one({"id": cart_doc["id"]}, {"_id": 0})
    return map_cart_response(updated_cart)


@api_router.put("/cart/items/{item_id}", response_model=CartResponse)
async def update_cart_item(item_id: str, payload: CartItemUpdateRequest, current_user: Dict = Depends(get_current_user)) -> CartResponse:
    cart_doc = await get_or_create_cart(current_user["id"])
    items = cart_doc.get("items", [])
    found = False

    for item in items:
        if item["item_id"] == item_id:
            item["quantity"] = payload.quantity
            found = True
            break

    if not found:
        raise HTTPException(status_code=404, detail="Cart item not found")

    await db.carts.update_one(
        {"id": cart_doc["id"]},
        {"$set": {"items": items, "updated_at": utc_now_iso()}},
    )
    updated_cart = await db.carts.find_one({"id": cart_doc["id"]}, {"_id": 0})
    return map_cart_response(updated_cart)


@api_router.delete("/cart/items/{item_id}", response_model=CartResponse)
async def remove_cart_item(item_id: str, current_user: Dict = Depends(get_current_user)) -> CartResponse:
    cart_doc = await get_or_create_cart(current_user["id"])
    filtered_items = [item for item in cart_doc.get("items", []) if item["item_id"] != item_id]

    await db.carts.update_one(
        {"id": cart_doc["id"]},
        {"$set": {"items": filtered_items, "updated_at": utc_now_iso()}},
    )
    updated_cart = await db.carts.find_one({"id": cart_doc["id"]}, {"_id": 0})
    return map_cart_response(updated_cart)


@api_router.delete("/cart/clear", response_model=CartResponse)
async def clear_cart(current_user: Dict = Depends(get_current_user)) -> CartResponse:
    cart_doc = await get_or_create_cart(current_user["id"])
    await db.carts.update_one(
        {"id": cart_doc["id"]},
        {"$set": {"items": [], "updated_at": utc_now_iso()}},
    )
    updated_cart = await db.carts.find_one({"id": cart_doc["id"]}, {"_id": 0})
    return map_cart_response(updated_cart)


@api_router.post("/orders/checkout", response_model=Order)
async def create_order(payload: CheckoutOrderRequest, current_user: Dict = Depends(get_current_user)) -> Order:
    cart_doc = await get_or_create_cart(current_user["id"])
    cart_response = map_cart_response(cart_doc)
    if len(cart_response.items) == 0:
        raise HTTPException(status_code=400, detail="Cart is empty")

    shipping_fee = 15 if payload.shipping_method == "express" else (0 if cart_response.subtotal >= 100 else 10)
    discount = 0
    total = round(cart_response.subtotal + cart_response.tax + shipping_fee - discount, 2)
    now = utc_now_iso()

    order_doc = {
        "order_id": f"BZ-{str(uuid.uuid4())[:8].upper()}",
        "user_id": current_user["id"],
        "status": "pending_payment" if payload.payment_method == "stripe" else "confirmed",
        "payment_status": "pending" if payload.payment_method == "stripe" else "paid",
        "payment_method": payload.payment_method,
        "subtotal": cart_response.subtotal,
        "tax": cart_response.tax,
        "shipping_fee": shipping_fee,
        "discount": discount,
        "total": total,
        "items": [
            {
                "product_id": item.product_id,
                "name": item.name,
                "image": item.image,
                "quantity": item.quantity,
                "unit_price": item.price,
                "line_total": item.line_total,
            }
            for item in cart_response.items
        ],
        "shipping_address": payload.shipping_address.model_dump(),
        "created_at": now,
        "updated_at": now,
        "payment_session_id": None,
    }
    await db.orders.insert_one(order_doc)

    if payload.payment_method == "cod":
        await db.carts.update_one({"id": cart_doc["id"]}, {"$set": {"items": [], "updated_at": utc_now_iso()}})

    return Order(**order_doc)


@api_router.get("/orders", response_model=OrderListResponse)
async def get_orders(current_user: Dict = Depends(get_current_user)) -> OrderListResponse:
    orders = await db.orders.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return OrderListResponse(orders=[Order(**order) for order in orders])


@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, current_user: Dict = Depends(get_current_user)) -> Order:
    order = await db.orders.find_one({"order_id": order_id, "user_id": current_user["id"]}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)


@api_router.post("/payments/checkout/session", response_model=CheckoutSessionCreateResponse)
async def create_checkout_session(
    payload: CheckoutSessionCreateRequest,
    request: Request,
    current_user: Dict = Depends(get_current_user),
) -> CheckoutSessionCreateResponse:
    order = await db.orders.find_one(
        {"order_id": payload.order_id, "user_id": current_user["id"]},
        {"_id": 0},
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["payment_method"] != "stripe":
        raise HTTPException(status_code=400, detail="Order is not using stripe payment")

    stripe_checkout = get_stripe_checkout(request)
    success_url = f"{payload.origin_url}/checkout?session_id={{CHECKOUT_SESSION_ID}}&order_id={order['order_id']}"
    cancel_url = f"{payload.origin_url}/checkout?order_id={order['order_id']}"
    metadata = {
        "order_id": order["order_id"],
        "user_id": current_user["id"],
        "email": current_user["email"],
    }

    checkout_request = CheckoutSessionRequest(
        amount=float(order["total"]),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata,
        payment_methods=["card"],
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_request)

    payment_doc = {
        "transaction_id": new_id(),
        "session_id": session.session_id,
        "order_id": order["order_id"],
        "user_id": current_user["id"],
        "email": current_user["email"],
        "amount": float(order["total"]),
        "currency": "usd",
        "metadata": metadata,
        "payment_id": "",
        "status": "open",
        "payment_status": "initiated",
        "created_at": utc_now_iso(),
        "updated_at": utc_now_iso(),
    }
    await db.payment_transactions.update_one(
        {"session_id": session.session_id},
        {"$set": payment_doc},
        upsert=True,
    )
    await db.orders.update_one(
        {"order_id": order["order_id"]},
        {"$set": {"payment_session_id": session.session_id, "updated_at": utc_now_iso()}},
    )

    return CheckoutSessionCreateResponse(
        order_id=order["order_id"],
        session_id=session.session_id,
        url=session.url,
    )


@api_router.get("/payments/checkout/status/{session_id}", response_model=CheckoutStatusPublicResponse)
async def get_checkout_status(
    session_id: str,
    request: Request,
    current_user: Dict = Depends(get_current_user),
) -> CheckoutStatusPublicResponse:
    stripe_checkout = get_stripe_checkout(request)
    status_response: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)
    payment_doc = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not payment_doc:
        raise HTTPException(status_code=404, detail="Payment transaction not found")
    if payment_doc["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Unauthorized session")

    update_values = {
        "status": status_response.status,
        "payment_status": status_response.payment_status,
        "updated_at": utc_now_iso(),
    }
    await db.payment_transactions.update_one({"session_id": session_id}, {"$set": update_values})

    if status_response.payment_status == "paid":
        order = await db.orders.find_one({"order_id": payment_doc["order_id"]}, {"_id": 0})
        if order and order["payment_status"] != "paid":
            await db.orders.update_one(
                {"order_id": payment_doc["order_id"]},
                {"$set": {"status": "confirmed", "payment_status": "paid", "updated_at": utc_now_iso()}},
            )
            await db.carts.update_one(
                {"user_id": current_user["id"]},
                {"$set": {"items": [], "updated_at": utc_now_iso()}},
            )

    if status_response.status in ["expired", "canceled"]:
        await db.orders.update_one(
            {"order_id": payment_doc["order_id"], "payment_status": {"$ne": "paid"}},
            {"$set": {"status": "cancelled", "updated_at": utc_now_iso()}},
        )

    return CheckoutStatusPublicResponse(
        order_id=payment_doc["order_id"],
        session_id=session_id,
        status=status_response.status,
        payment_status=status_response.payment_status,
        amount_total=status_response.amount_total,
        currency=status_response.currency,
    )


@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: Optional[str] = Header(default=None, alias="Stripe-Signature")) -> Dict:
    stripe_checkout = get_stripe_checkout(request)
    payload = await request.body()
    webhook_response = await stripe_checkout.handle_webhook(payload, stripe_signature)

    session_id = webhook_response.session_id
    if not session_id:
        return {"received": True}

    payment_doc = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not payment_doc:
        return {"received": True}

    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "status": webhook_response.event_type,
                "payment_status": webhook_response.payment_status,
                "updated_at": utc_now_iso(),
            }
        },
    )

    if webhook_response.payment_status == "paid":
        order = await db.orders.find_one({"order_id": payment_doc["order_id"]}, {"_id": 0})
        if order and order["payment_status"] != "paid":
            await db.orders.update_one(
                {"order_id": payment_doc["order_id"]},
                {"$set": {"status": "confirmed", "payment_status": "paid", "updated_at": utc_now_iso()}},
            )
            await db.carts.update_one(
                {"user_id": payment_doc["user_id"]},
                {"$set": {"items": [], "updated_at": utc_now_iso()}},
            )

    return {"received": True}


@api_router.get("/account/settings", response_model=UserSettings)
async def get_account_settings(current_user: Dict = Depends(get_current_user)) -> UserSettings:
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "settings": 1})
    return UserSettings(**user.get("settings", {}))


@api_router.put("/account/settings", response_model=UserSettings)
async def update_account_settings(payload: UserSettingsUpdateRequest, current_user: Dict = Depends(get_current_user)) -> UserSettings:
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "settings": 1})
    current_settings = UserSettings(**user.get("settings", {})).model_dump()

    if payload.theme is not None:
        current_settings["theme"] = payload.theme
    if payload.shipment_updates is not None:
        current_settings["shipment_updates"] = payload.shipment_updates
    if payload.marketing_updates is not None:
        current_settings["marketing_updates"] = payload.marketing_updates

    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"settings": current_settings, "updated_at": utc_now_iso()}},
    )
    return UserSettings(**current_settings)


@api_router.put("/account/profile", response_model=AuthUser)
async def update_profile(payload: ProfileUpdateRequest, current_user: Dict = Depends(get_current_user)) -> AuthUser:
    updates: Dict = {"updated_at": utc_now_iso()}
    if payload.name is not None:
        updates["name"] = payload.name.strip()
    if payload.phone is not None:
        updates["phone"] = payload.phone.strip()

    await db.users.update_one({"id": current_user["id"]}, {"$set": updates})
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password_hash": 0})
    return AuthUser(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        phone=user.get("phone", ""),
        created_at=user["created_at"],
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()