-- ============================================================
-- DailyFit Database Schema
-- Jalankan: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS dailyfit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dailyfit;

CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(191) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exercises (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  name         VARCHAR(100) NOT NULL,
  category     VARCHAR(50)  NOT NULL DEFAULT 'strength',
  muscle_group VARCHAR(100) DEFAULT '',
  sets         INT NOT NULL DEFAULT 3,
  reps         INT NOT NULL DEFAULT 10,
  notes        TEXT DEFAULT '',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plans (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255) DEFAULT '',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plan_exercises (
  plan_id     INT NOT NULL,
  exercise_id INT NOT NULL,
  sort_order  INT DEFAULT 0,
  PRIMARY KEY (plan_id, exercise_id),
  FOREIGN KEY (plan_id)     REFERENCES plans(id)     ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  exercise_id INT DEFAULT NULL,
  date        DATE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  sets        INT NOT NULL DEFAULT 3,
  reps        INT NOT NULL DEFAULT 10,
  category    VARCHAR(50)  DEFAULT '',
  is_done     TINYINT(1)   NOT NULL DEFAULT 0,
  done_at     DATETIME     DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
);
