-- Image Table --
CREATE TABLE
    IF NOT EXISTS image (
        ImageId INTEGER PRIMARY KEY AUTOINCREMENT,
        UserId VARCHAR NOT NULL,
        FileName TEXT NOT NULL,
        Extension VARCHAR(10) NOT NULL,
        FilePath TEXT NOT NULL,
        FileType VARCHAR(10) NOT NULL,
        FileSize INTEGER NOT NULL,
        UploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
    );