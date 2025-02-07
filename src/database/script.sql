CREATE DATABASE GenBank;
USE GenBank;

CREATE TABLE Users (
    cc CHAR(10) NOT NULL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number CHAR(10) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(150) NOT NULL,
    address_details TEXT,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

DELIMITER $$

-- Procedimiento almacenado para registrar un usuario
CREATE PROCEDURE sp_register_user (
    IN p_cc CHAR(10),
    IN p_first_name VARCHAR(255),
    IN p_last_name VARCHAR(255),
    IN p_birth_date DATE,
    IN p_email VARCHAR(255),
    IN p_phone_number CHAR(10),
    IN p_department VARCHAR(100),
    IN p_city VARCHAR(100),
    IN p_address VARCHAR(150),
    IN p_address_details TEXT,
    IN p_password VARCHAR(255),
    OUT p_message VARCHAR(255)
)
BEGIN
    -- Verificar que no exista la cédula
    IF EXISTS (SELECT 1 FROM users WHERE cc = p_cc) THEN
        SET p_message = 'La cédula ya existe.';
    
    ELSEIF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SET p_message = 'El correo electrónico ya está registrado.';
    
    ELSEIF EXISTS (SELECT 1 FROM users WHERE phone_number = p_phone_number) THEN
        SET p_message = 'El número de teléfono ya existe.';
    
    ELSE
        -- Insertar el nuevo usuario
        INSERT INTO users (
            cc, first_name, last_name, birth_date, email, phone_number, department, city, address, address_details, `password`
        ) VALUES (
            p_cc, p_first_name, p_last_name, p_birth_date, p_email, p_phone_number, p_department, p_city, p_address, p_address_details, p_password
        );

        SET p_message = 'Cuenta creada exitosamente.';
    END IF;

    SET @p_message = p_message;
END $$

DELIMITER ;