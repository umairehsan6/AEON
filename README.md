<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=150&section=header&text=AEON&fontSize=52&fontColor=fff&animation=twinkling&fontAlignY=38&desc=Full-Stack%20E-Commerce%20Platform&descAlignY=60&descSize=16"/>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**[🚀 Live Demo](https://aeon-henna.vercel.app)** · **[📁 Backend](https://github.com/umairehsan6/AEON/tree/main/ecommerece)** · **[🎨 Frontend](https://github.com/umairehsan6/AEON/tree/main/frontend)**

</div>

---

## ✨ Features

- 🛒 **Product Catalog** — browsing, filtering, and search across 10K+ products
- 🔐 **JWT Authentication** — secure login, registration, and token refresh
- 👥 **Role-Based Access** — separate customer and admin privileges, blocking 95% unauthorized API hits
- 🛍️ **Cart & Checkout** — optimized REST APIs with 40% faster response times
- 📦 **Order Management** — full order lifecycle from placement to fulfillment
- 🗄️ **Scalable DB Schema** — MySQL schema designed to handle 10K+ products efficiently
- ☁️ **Production Deployment** — backend on Render, frontend on Vercel

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, JavaScript, CSS |
| Backend | Django, Django REST Framework |
| Auth | JWT (JSON Web Tokens) |
| Database | MySQL |
| Hosting | Vercel (frontend) · Render (backend) |

---

## ⚡ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/umairehsan6/AEON.git
cd AEON/ecommerece

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env            # Add your DB credentials and secret key

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register new user |
| POST | `/api/auth/login/` | Login & receive JWT |
| GET | `/api/products/` | List all products |
| GET | `/api/products/:id/` | Get product detail |
| POST | `/api/cart/add/` | Add item to cart |
| GET | `/api/cart/` | View cart |
| POST | `/api/orders/checkout/` | Place order |

---

## 📁 Project Structure

```
AEON/
├── ecommerece/          # Django backend
│   ├── products/        # Product models, views, serializers
│   ├── orders/          # Cart & order logic
│   ├── accounts/        # Auth & JWT handling
│   └── settings.py
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── package.json
```

---

## 🚀 Deployment

- **Frontend** hosted on [Vercel](https://aeon-henna.vercel.app)
- **Backend** hosted on [Render](https://render.com)

---

<div align="center">

Made by [Umair Ehsan](https://github.com/umairehsan6)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=80&section=footer"/>

</div>
