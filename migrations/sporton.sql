CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email VARCHAR(255) UNIQUE NOT NULL,
	hashed_pass VARCHAR(255) NOT NULL,
	name VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	image_url VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	category_id UUID NOT NULL,
	name VARCHAR(255) NOT NULL,
	description TEXT NOT NULL,
	image_url VARCHAR(255) NOT NULL,
	stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
	price BIGINT NOT NULL CHECK (price >= 0),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS banks (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	bank_name VARCHAR(255) NOT NULL,
	account_name VARCHAR(255) NOT NULL,
	account_number VARCHAR(255) NOT NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'paid', 'rejected')),
    payment_proof VARCHAR(255),  -- Nullable, diupload belakangan
    total_payment BIGINT NOT NULL CHECK (total_payment >= 0),
    customer_name VARCHAR(255) NOT NULL,
    customer_contact VARCHAR(50) NOT NULL,
    customer_address TEXT NOT NULL,  -- Alamat bisa panjang
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    product_id UUID NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    price_at_purchase BIGINT NOT NULL,  -- Harga saat beli (bisa beda dari harga skrg)
    
    FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);