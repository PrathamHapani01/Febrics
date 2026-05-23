import os

import psycopg
from psycopg.rows import dict_row

from backend.security import get_admin_password_plain, get_admin_username, hash_password

SEED_FABRICS = [
    {
        "slug": "ivory-brushed-linen",
        "name": "Ivory Brushed Linen",
        "material": "Linen",
        "color": "Ivory",
        "use_case": "Apparel",
        "price_inr": 1999,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/cat-linen-f832LvE8.jpg",
        "description": "Softly brushed European flax linen with a warm ivory tone. Breathable, durable, and naturally textured — perfect for relaxed apparel and elegant home accents.",
        "weight": "Medium",
        "sustainability": "Organic",
        "reviews_count": 248,
    },
    {
        "slug": "champagne-silk-charmeuse",
        "name": "Champagne Silk Charmeuse",
        "material": "Silk",
        "color": "Champagne",
        "use_case": "Apparel",
        "price_inr": 3999,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/cat-silk-BJp8dj0T.jpg",
        "description": "Lustrous silk charmeuse with a fluid drape and champagne sheen. Ideal for evening wear, blouses, and luxury linings.",
        "weight": "Light",
        "sustainability": "Eco-friendly",
        "reviews_count": 192,
    },
    {
        "slug": "cable-knit-merino",
        "name": "Cable Knit Merino",
        "material": "Wool",
        "color": "Taupe",
        "use_case": "Apparel",
        "price_inr": 2999,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/cat-wool-DdISQokk.jpg",
        "description": "Cozy merino wool with classic cable texture. Warm, soft, and perfect for sweaters and winter accessories.",
        "weight": "Heavy",
        "sustainability": "Natural",
        "reviews_count": 134,
    },
    {
        "slug": "sage-cotton-voile",
        "name": "Sage Cotton Voile",
        "material": "Cotton",
        "color": "Sage",
        "use_case": "Apparel",
        "price_inr": 1599,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/cat-synthetic-DbaEibcz.jpg",
        "description": "Sheer cotton voile in a soft sage green. Lightweight and airy for summer dresses and curtains.",
        "weight": "Light",
        "sustainability": "Organic",
        "reviews_count": 311,
    },
    {
        "slug": "organic-cotton-poplin",
        "name": "Organic Cotton Poplin",
        "material": "Cotton",
        "color": "Ivory",
        "use_case": "Apparel",
        "price_inr": 1849,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/cat-cotton-mljruhGk.jpg",
        "description": "Crisp organic cotton poplin with a smooth hand. Versatile for shirts, dresses, and quilting.",
        "weight": "Medium",
        "sustainability": "GOTS certified",
        "reviews_count": 207,
    },
    {
        "slug": "sand-washed-linen",
        "name": "Sand-Washed Linen",
        "material": "Linen",
        "color": "Sand",
        "use_case": "Apparel",
        "price_inr": 2299,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/coll-summer-DHcWFAnR.jpg",
        "description": "Pre-washed linen with a relaxed, lived-in feel. Sun-kissed sand tone for effortless summer style.",
        "weight": "Medium",
        "sustainability": "Eco-friendly",
        "reviews_count": 98,
    },
    {
        "slug": "cashmere-blend-throw",
        "name": "Cashmere Blend Throw",
        "material": "Wool",
        "color": "Charcoal",
        "use_case": "Upholstery",
        "price_inr": 5299,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/coll-winter-CS2j2F5r.jpg",
        "description": "Luxurious cashmere-wool blend with exceptional warmth. Perfect for throws, blankets, and cozy interiors.",
        "weight": "Heavy",
        "sustainability": "Natural",
        "reviews_count": 76,
    },
    {
        "slug": "noir-silk-twill",
        "name": "Noir Silk Twill",
        "material": "Silk",
        "color": "Charcoal",
        "use_case": "Apparel",
        "price_inr": 4299,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/coll-silk-BgEM3K8B.jpg",
        "description": "Rich silk twill in deep noir charcoal. Structured drape for tailored jackets and formal wear.",
        "weight": "Medium",
        "sustainability": "Eco-friendly",
        "reviews_count": 121,
    },
    {
        "slug": "garment-dyed-cotton",
        "name": "Garment-Dyed Cotton",
        "material": "Cotton",
        "color": "Taupe",
        "use_case": "Apparel",
        "price_inr": 1749,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/coll-cotton-BAh_OUdh.jpg",
        "description": "Soft garment-dyed cotton with subtle color variation. Relaxed texture for everyday essentials.",
        "weight": "Medium",
        "sustainability": "Organic",
        "reviews_count": 154,
    },
    {
        "slug": "recycled-tencel-blend",
        "name": "Recycled Tencel Blend",
        "material": "Synthetic",
        "color": "Sage",
        "use_case": "Apparel",
        "price_inr": 2149,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/cat-synthetic-DbaEibcz.jpg",
        "description": "Sustainable recycled Tencel blend with silky smooth hand. Breathable and eco-conscious.",
        "weight": "Light",
        "sustainability": "Recycled",
        "reviews_count": 89,
    },
    {
        "slug": "merino-jersey",
        "name": "Merino Jersey",
        "material": "Wool",
        "color": "Ivory",
        "use_case": "Apparel",
        "price_inr": 2649,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/cat-wool-DdISQokk.jpg",
        "description": "Fine merino jersey knit with stretch and softness. Ideal for base layers and comfortable knits.",
        "weight": "Light",
        "sustainability": "Natural",
        "reviews_count": 142,
    },
    {
        "slug": "heirloom-quilting-cotton",
        "name": "Heirloom Quilting Cotton",
        "material": "Cotton",
        "color": "Ivory",
        "use_case": "Quilting",
        "price_inr": 1499,
        "image_url": "https://ivory-weave-emporium.lovable.app/assets/cat-cotton-mljruhGk.jpg",
        "description": "Premium quilting cotton with tight weave and vibrant print hold. A maker favourite for heirloom quilts.",
        "weight": "Medium",
        "sustainability": "Organic",
        "reviews_count": 318,
    },
]


def get_database_url() -> str:
    url = os.environ.get("DATABASE_URL", "").strip()
    if not url:
        raise RuntimeError(
            "DATABASE_URL is not set. Copy backend/.env.example to backend/.env and set your PostgreSQL URL."
        )
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


def get_connection():
    return psycopg.connect(get_database_url(), row_factory=dict_row)


def init_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS admin_users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS fabrics (
            id SERIAL PRIMARY KEY,
            slug TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            material TEXT NOT NULL,
            color TEXT NOT NULL,
            use_case TEXT NOT NULL,
            price_inr DOUBLE PRECISION NOT NULL,
            image_url TEXT NOT NULL,
            description TEXT NOT NULL,
            weight TEXT NOT NULL,
            sustainability TEXT NOT NULL,
            reviews_count INTEGER DEFAULT 0
        )
        """
    )
    username = get_admin_username()
    password_hash = hash_password(get_admin_password_plain())
    cur.execute("SELECT id FROM admin_users WHERE username = %s", (username,))
    existing_admin = cur.fetchone()
    if existing_admin:
        cur.execute(
            "UPDATE admin_users SET password_hash = %s WHERE id = %s",
            (password_hash, existing_admin["id"]),
        )
    else:
        cur.execute(
            "INSERT INTO admin_users (username, password_hash) VALUES (%s, %s)",
            (username, password_hash),
        )

    cur.execute("SELECT COUNT(*) AS cnt FROM fabrics")
    count = cur.fetchone()["cnt"]
    if count == 0:
        for fabric in SEED_FABRICS:
            cur.execute(
                """
                INSERT INTO fabrics (
                    slug, name, material, color, use_case, price_inr,
                    image_url, description, weight, sustainability, reviews_count
                ) VALUES (
                    %(slug)s, %(name)s, %(material)s, %(color)s, %(use_case)s, %(price_inr)s,
                    %(image_url)s, %(description)s, %(weight)s, %(sustainability)s, %(reviews_count)s
                )
                """,
                fabric,
            )
    conn.commit()
    cur.close()
    conn.close()


def get_admin_by_username(username: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, username, password_hash FROM admin_users WHERE username = %s",
        (username,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row


def row_to_dict(row):
    return {
        "id": row["id"],
        "slug": row["slug"],
        "name": row["name"],
        "material": row["material"],
        "color": row["color"],
        "use_case": row["use_case"],
        "price_inr": row["price_inr"],
        "image_url": row["image_url"],
        "description": row["description"],
        "weight": row["weight"],
        "sustainability": row["sustainability"],
        "reviews_count": row["reviews_count"],
    }
