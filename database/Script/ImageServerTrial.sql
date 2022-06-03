-- ######################################
-- ##  Database Schema of Image Server ##
-- ######################################
-- Scripted by : Dibesh Raj Subedi
-- Schema Version: 1.0.0
-- Created At: 06/03/2022
-- Updated At: 06/03/2022
-- ######################################
-- Users Table
-- Creating `users` Table
CREATE TABLE
    IF NOT EXISTS users (
        UserId INTEGER PRIMARY KEY AUTOINCREMENT,
        UserName VARCHAR(16) NOT NULL UNIQUE,
        FullName VARCHAR(200) NOT NULL UNIQUE,
        Email TEXT NOT NULL UNIQUE,
        PASSWORD TEXT NOT NULL,
        VerificationToken TEXT NULL,
        VerificationStatus BOOLEAN NOT NULL DEFAULT 0,
        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UpdatedAt DATETIME NULL
    );

-- Creating `user_update_at_trigger` Trigger
CREATE TRIGGER
    IF NOT EXISTS users_updated_at_trigger AFTER
UPDATE
    ON users BEGIN
UPDATE users
SET UpdatedAt = CURRENT_TIMESTAMP
WHERE UserId = NEW.UserId;

END;