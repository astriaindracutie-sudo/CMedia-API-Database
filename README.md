# CMedia API

This is a RESTful API for managing customer and staff data.

---

# CMedia API

Ini adalah API RESTful untuk mengelola data pelanggan dan staf.

## 🚀 Getting Started / Memulai

Follow these steps to set up and run the API on your local server.

Ikuti langkah-langkah ini untuk menyiapkan dan menjalankan API di server lokal Anda.

### Prerequisites / Prasyarat

- Node.js (LTS version recommended)
- MySQL or MariaDB database server

### Step 1: Clone the Repository / Langkah 1: Kloning Repositori

Clone this repository to your local machine.

Kloning repositori ini ke komputer lokal Anda.

```bash
git clone [YOUR_REPOSITORY_URL]
cd cmedia-api
```

### Step 2: Install Dependencies / Langkah 2: Instal Dependensi

Install the required Node.js packages.

Instal paket Node.js yang diperlukan.

```bash
npm install
```

### Step 3: Configure the Database / Langkah 3: Konfigurasi Basis Data

1.  Open the `database.sql` file located in the project's root directory.

2.  Connect to your MySQL/MariaDB server and run the commands in this file to create the `cmedia_db` database and its tables.

3.  Buka file `database.sql` yang terletak di direktori utama proyek.

4.  Hubungkan ke server MySQL/MariaDB Anda dan jalankan perintah di file ini untuk membuat basis data `cmedia_db` dan tabel-tabelnya.

### Step 4: Configure Environment Variables / Langkah 4: Konfigurasi Variabel Lingkungan

1.  Rename the `.env.example` file to `.env`.

2.  Open the `.env` file and update the credentials to match your database configuration.

3.  Set a secure random string for the `JWT_SECRET`.

4.  Ganti nama file `.env.example` menjadi `.env`.

5.  Buka file `.env` dan perbarui kredensial agar sesuai dengan konfigurasi basis data Anda.

6.  Atur string acak yang aman untuk `JWT_SECRET`.

<!-- end list -->

```
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_DATABASE=cmedia_db
JWT_SECRET=a_very_secure_random_string_of_your_choice
```

### Step 5: Run the Server / Langkah 5: Jalankan Server

Start the Node.js server. The connection pool will be automatically configured, and the server will start on port 3000.

Jalankan server Node.js. Kumpulan koneksi akan dikonfigurasi secara otomatis, dan server akan berjalan di port 3000.

```bash
node index.js
```

### Step 6: Test the API / Langkah 6: Uji API

Use `curl` or a tool like Postman to test the following endpoints.

Gunakan `curl` atau alat seperti Postman untuk menguji titik akhir berikut.

#### **Health Check**

- `GET /`
- **Expected Response:** `{"message":"Database connection successful!"}`

#### **Create a Customer / Buat Pelanggan**

- `POST /customers`
- **Body:** `{"fullName": "John Doe", "email": "john.doe@example.com", "password": "secure_password"}`
- **Expected Response:** `{"message":"Customer created successfully", "customerId": 1}`

#### **Log In and Get a JWT / Masuk dan Dapatkan JWT**

- `POST /login`
- **Body:** `{"email": "john.doe@example.com", "password": "secure_password"}`
- **Expected Response:** `{"message":"Login successful", "token": "your_jwt_token_here"}`

#### **Access a Protected Route / Akses Rute Terlindungi**

- `GET /customers/profile`
- **Header:** `Authorization: Bearer [YOUR_JWT_TOKEN]`
- **Expected Response:** `{"profile": ...}`

---
