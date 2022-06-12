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
        FullName VARCHAR(200) NOT NULL,
        Email TEXT NOT NULL UNIQUE,
        PASSWORD TEXT NOT NULL,
        IsLoggedIn BOOLEAN NOT NULL DEFAULT 0,
        UserGroup VARCHAR(20) NOT NULL DEFAULT 'USER',
        IsDisabled BOOLEAN NOT NULL DEFAULT 1,
        VerificationToken TEXT NULL,
        LastPasswordResetDate DATETIME NULL DEFAULT (DATETIME('now', 'localtime')),
        VerificationStatus BOOLEAN NOT NULL DEFAULT 0,
        CreatedAt DATETIME DEFAULT (DATETIME('now', 'localtime')),
        UpdatedAt DATETIME NULL
    );

-- Creating `user_update_at_trigger` Trigger
CREATE TRIGGER
    IF NOT EXISTS users_updated_at_trigger AFTER
UPDATE
    ON users BEGIN
UPDATE users
SET UpdatedAt = (DATETIME('now', 'localtime'))
WHERE UserId = NEW.UserId;

END;

-- Old Password Table
-- Creating `old_passwords` Table
CREATE TABLE
    IF NOT EXISTS old_passwords (
        PasswordId INTEGER PRIMARY KEY AUTOINCREMENT,
        UserId INTEGER NOT NULL,
        ResetToken TEXT NULL,
        HashedPassword TEXT NOT NULL,
        ResetSuccess BOOLEAN NOT NULL DEFAULT 0,
        HasExpired BOOLEAN NOT NULL DEFAULT 0,
        CreatedAt DATETIME DEFAULT (DATETIME('now', 'localtime')),
        UpdatedAt DATETIME NULL,
        CONSTRAINT fk_user_password FOREIGN KEY (UserId) REFERENCES users (UserId)
        ON
        DELETE CASCADE
    );

-- Creating `password_update_at_trigger` Trigger
CREATE TRIGGER
    IF NOT EXISTS password_update_at_trigger AFTER
UPDATE
    ON PASSWORD BEGIN
UPDATE PASSWORD
SET UpdatedAt = (DATETIME('now', 'localtime'))
WHERE PasswordId = NEW.PasswordId;

END;

-- Images Table
-- Creating `images` Table
CREATE TABLE
    IF NOT EXISTS image (
        ImageId INTEGER PRIMARY KEY AUTOINCREMENT,
        UserId INTEGER NOT NULL,
        FileName TEXT NOT NULL,
        Extension VARCHAR(10) NOT NULL,
        FilePath TEXT NOT NULL,
        FileType VARCHAR(10) NOT NULL,
        FileSize INTEGER NOT NULL,
        UploadDate DATETIME DEFAULT (DATETIME('now', 'localtime')),
        CONSTRAINT fk_user_image FOREIGN KEY (UserId) REFERENCES users (UserId)
        ON
        DELETE CASCADE
    );