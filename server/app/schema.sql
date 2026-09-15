-- 메디로드 DB 스키마 (MariaDB 10.x / MySQL 5.7+, utf8mb4)
-- install/index.php 가 실행한다. 모든 테이블은 IF NOT EXISTS 라 다시 실행해도 데이터는 지워지지 않는다.
-- 시각 컬럼은 PHP 에서 Asia/Seoul 기준 문자열로 넣는다.

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  role ENUM('member','admin') NOT NULL DEFAULT 'member',
  created_at DATETIME NOT NULL,
  last_login_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_resets_token (token_hash),
  KEY idx_resets_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_attempts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  ip VARCHAR(45) NOT NULL,
  email VARCHAR(191) NOT NULL DEFAULT '',
  attempted_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_attempts_ip (ip, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS listings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL,
  deal_type ENUM('임대','분양','매매') NOT NULL,
  category VARCHAR(30) NOT NULL,
  title VARCHAR(120) NOT NULL,
  region VARCHAR(60) NOT NULL,
  address VARCHAR(200) NOT NULL,
  deposit_manwon INT NULL,
  rent_manwon INT NULL,
  sale_price_manwon INT NULL,
  price_note VARCHAR(100) NOT NULL DEFAULT '',
  area_m2 DECIMAL(10,2) NOT NULL,
  floor_current VARCHAR(10) NOT NULL,
  floor_total INT NOT NULL,
  use_type VARCHAR(60) NOT NULL,
  approval_date DATE NOT NULL,
  direction VARCHAR(40) NOT NULL,
  parking INT NOT NULL DEFAULT 0,
  maintenance_manwon INT NOT NULL DEFAULT 0,
  move_in VARCHAR(60) NOT NULL,
  violation TINYINT(1) NOT NULL DEFAULT 0,
  features TEXT NULL,
  description TEXT NULL,
  images TEXT NULL,
  lat DECIMAL(10,7) NULL,
  lng DECIMAL(10,7) NULL,
  status ENUM('open','closed','hidden') NOT NULL DEFAULT 'open',
  closed_at DATETIME NULL,
  is_sample TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_listings_code (code),
  KEY idx_listings_status (status, deal_type),
  KEY idx_listings_sample (is_sample)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inquiries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(191) NOT NULL DEFAULT '',
  department VARCHAR(50) NOT NULL DEFAULT '',
  region VARCHAR(100) NOT NULL DEFAULT '',
  open_timing VARCHAR(30) NOT NULL DEFAULT '',
  budget VARCHAR(30) NOT NULL DEFAULT '',
  deposit VARCHAR(30) NOT NULL DEFAULT '',
  rent VARCHAR(30) NOT NULL DEFAULT '',
  facility_cost VARCHAR(30) NOT NULL DEFAULT '',
  area VARCHAR(30) NOT NULL DEFAULT '',
  facility VARCHAR(10) NOT NULL DEFAULT '',
  consult_type VARCHAR(30) NOT NULL DEFAULT '',
  message TEXT NULL,
  status ENUM('new','in_progress','done') NOT NULL DEFAULT 'new',
  memo TEXT NULL,
  ip VARCHAR(45) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_inquiries_status (status, created_at),
  KEY idx_inquiries_ip (ip, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  skey VARCHAR(64) NOT NULL,
  svalue TEXT NULL,
  PRIMARY KEY (skey)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
