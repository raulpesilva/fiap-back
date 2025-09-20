CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX idx_email ON users (email);
INSERT INTO users (email, password)
VALUES ('raul@gmail.com', 'test123');
SELECT *
FROM users;