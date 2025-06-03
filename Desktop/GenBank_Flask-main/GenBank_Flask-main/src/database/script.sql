CREATE DATABASE GenBank;
USE GenBank;

CREATE TABLE users (
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone_number (phone_number)
);

CREATE TABLE accounts (
    account_number CHAR(16) UNIQUE,
    user CHAR(10) NOT NULL,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    expiration_date CHAR(5) NOT NULL,
    cvv CHAR(3) NOT NULL,
    account_type ENUM('Ahorros', 'Corriente') DEFAULT 'Ahorros',
    state ENUM('Activa', 'Inactiva') DEFAULT 'Activa',
    PRIMARY KEY (user, account_type),
    FOREIGN KEY (user) REFERENCES users(cc) ON DELETE CASCADE,
    INDEX idx_user (user)
);

CREATE TABLE transactions (
	id INT AUTO_INCREMENT PRIMARY KEY,
    from_account CHAR(16) NOT NULL,
    to_account CHAR(16) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATETIME NOT NULL,
    state ENUM('Pendiente', 'Exitoso', 'Fallido') DEFAULT 'Pendiente',
    FOREIGN KEY (from_account) REFERENCES accounts(account_number) ON DELETE SET NULL,
    FOREIGN KEY (to_account) REFERENCES accounts(account_number) ON DELETE SET NULL,
    INDEX idx_from_account (from_account),
    INDEX idx_to_account (to_account)
);

CREATE TABLE deposits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account CHAR(16) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date DATETIME NOT NULL,
    state ENUM('Exitoso', 'Fallido') NOT NULL,
    FOREIGN KEY (account) REFERENCES accounts(account_number) ON DELETE SET NULL,
    INDEX idx_account (account)
);	

CREATE TABLE reset_password_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_cc CHAR(10) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expiration DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_cc) REFERENCES users(cc) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_cc (user_cc)
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
    
    -- Verificar que no exista el correo electrónico
    ELSEIF EXISTS (SELECT 1 FROM users WHERE email = p_email) THEN
        SET p_message = 'El correo electrónico ya está registrado.';
    
    -- Verificar que no exista el número de teléfono
    ELSEIF EXISTS (SELECT 1 FROM users WHERE phone_number = p_phone_number) THEN
        SET p_message = 'El número de teléfono ya existe.';
    
    ELSE
        INSERT INTO users (
            cc, first_name, last_name, birth_date, email, phone_number, department, city, address, address_details, `password`
        ) VALUES (
            p_cc, p_first_name, p_last_name, p_birth_date, p_email, p_phone_number, p_department, p_city, p_address, p_address_details, p_password
        );

        SET p_message = 'Cuenta creada exitosamente.';
    END IF;

    SET @p_message = p_message;
END $$

-- Procedimiento almacenado para generar cuenta corriente
CREATE PROCEDURE sp_generate_account_current(
    IN p_cc CHAR(10),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE new_account_number CHAR(16);
    DECLARE new_cvv CHAR(3);
    DECLARE expiration_date CHAR(5);

    -- Verificar que el usuario exista
    IF NOT EXISTS (SELECT 1 FROM users WHERE cc = p_cc) THEN
        SET p_message = 'El usuario no existe.';
    ELSE
        -- Verificar si el usuario ya tiene una cuenta corriente
        IF EXISTS (SELECT 1 FROM accounts WHERE user = p_cc AND account_type = 'Corriente') THEN
            SET p_message = 'Ya tienes una cuenta corriente.';
        ELSE
            -- Generar el número de cuenta único (16 dígitos)
            CALL sp_generate_unique_account_number(new_account_number);

            -- Generar el CVV aleatorio (3 dígitos)
            SET new_cvv = LPAD(FLOOR(RAND() * 1000), 3, '0');

            -- Asignar la fecha de expiración en el formato "MM/YY" a 3 años a partir de la fecha actual
            SET expiration_date = DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 YEAR), '%m/%y');

            INSERT INTO accounts (account_number, user, balance, expiration_date, cvv, account_type, state)
            VALUES (new_account_number, p_cc, 0.00, expiration_date, new_cvv, 'Corriente', "Activa");

            SET p_message = 'Cuenta corriente generada exitosamente.';
        END IF;
    END IF;

    SET @p_message = p_message;
END $$

-- Procedimiento almacenado para hacer una transferencia
CREATE PROCEDURE sp_transaction (
	IN p_from_account CHAR(16),
    IN p_to_account CHAR(16),
    IN p_amount DECIMAL(10,2),
    OUT p_message VARCHAR(255)
)
BEGIN
	-- Verificar que exista la cuenta de origen
	IF NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = p_from_account) THEN
        SET p_message = 'No se encontró la cuenta de origen. Verifica los datos e inténtalo nuevamente.';
        
	-- Verificar que la cuenta de origen no sea la misma que la de destino
    ELSEIF (p_from_account = p_to_account) THEN
        SET p_message = 'No puedes realizar una transferencia a tu propia cuenta.';
	
    -- Verificar que exista la cuenta de destino
    ELSEIF NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = p_to_account) THEN
        SET p_message = 'La cuenta de destino no existe. Verifica el número de cuenta antes de proceder.';
    
    -- Verificar que la cuenta de origen tenga fondos suficientes   
	ELSEIF (SELECT balance FROM accounts WHERE account_number = p_from_account) < p_amount THEN
        SET p_message = 'Fondos insuficientes en la cuenta.';

	ELSE 
        -- Actualizar saldo de la cuenta de origen
        UPDATE accounts SET balance = balance - p_amount WHERE account_number = p_from_account;

        -- Actualizar saldo de la cuenta de destino
        UPDATE accounts SET balance = balance + p_amount WHERE account_number = p_to_account;
    
        -- Insertar la transacción en la tabla de transacciones
        INSERT INTO transactions (from_account, to_account, amount, date, state)
            VALUES (p_from_account, p_to_account, p_amount, NOW(), 'Exitoso');
            
		SET p_message = 'Transferencia realizada con éxito.';
	END IF;
    
    SET @p_message = p_message;
END $$

-- Procedimiento almacenado para hacer un deposito
CREATE PROCEDURE sp_deposit (
	IN p_account CHAR(16),
    IN p_amount DECIMAL(10,2),
    OUT p_message VARCHAR(255)
)
BEGIN
    -- Verificar que el número de cuenta exista
	IF NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = p_account) THEN
        SET p_message = 'El número de cuenta no existe.';
	ELSE 
        -- Verificar que la cuenta esté activa
        IF EXISTS (SELECT 1 FROM accounts WHERE account_number = p_account AND state = 'Inactiva') THEN
            SET p_message = 'La cuenta está inactiva.';
        ELSE
            -- Actualizar el saldo de la cuenta
            UPDATE accounts SET balance = (balance + p_amount) WHERE account_number = p_account;

            -- Insertar registro de depósito
            INSERT INTO deposits (account, amount, date, state)
            VALUES (p_account, p_amount, NOW(), 'Exitoso');
            
            SET p_message = 'Depósito realizado con éxito.';
        END IF;
	END IF;
    SET @p_message = p_message;
END $$

-- Procedimiento almacenado para generar un token de restablecimiento de contraseña
CREATE PROCEDURE sp_generate_reset_password_token (
    IN p_email VARCHAR(255),
    OUT p_token VARCHAR(255),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_cc CHAR(10);
    DECLARE token_exists INT DEFAULT 0;

    -- Buscar el cc del usuario basado en el email
    SELECT cc INTO v_cc
    FROM users
    WHERE email = p_email
    LIMIT 1;

    -- Verificar que el usuario exista
    IF v_cc IS NULL THEN
        SET p_message = 'El correo no existe.';
        SET p_token = NULL;
    ELSE
        -- Verificar si ya hay un token activo y no usado para este usuario (no expirado)
        SELECT COUNT(*) INTO token_exists
        FROM reset_password_tokens
        WHERE user_cc = v_cc AND used = FALSE AND expiration > NOW();

        IF token_exists > 0 THEN
            SET p_message = 'Ya existe un token activo para este usuario.';
            SET p_token = NULL;
        ELSE
            -- Generar token aleatorio de 64 caracteres hexadecimales (32 bytes)
            SET p_token = LOWER(CONCAT(
                LPAD(CONV(FLOOR(RAND() * POW(16,8)), 10, 16), 8, '0'),
                LPAD(CONV(FLOOR(RAND() * POW(16,8)), 10, 16), 8, '0'),
                LPAD(CONV(FLOOR(RAND() * POW(16,8)), 10, 16), 8, '0'),
                LPAD(CONV(FLOOR(RAND() * POW(16,8)), 10, 16), 8, '0')
            ));

            -- Insertar el token en la tabla con expiración a 1 hora
            INSERT INTO reset_password_tokens (user_cc, token, expiration, used, created_at)
            VALUES (v_cc, p_token, DATE_ADD(NOW(), INTERVAL 30 MINUTE), FALSE, NOW());

            SET p_message = 'Se ha generado un enlace de restablecimiento. Por favor, revisa tu correo para continuar con el proceso.';
        END IF;
    END IF;
END $$

-- Procedimiento almacenado para validar el token de restablecimiento de contraseña
CREATE PROCEDURE sp_validate_reset_password_token (
    IN p_token VARCHAR(255),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_cc CHAR(10);

    SET p_message = 'Token no válido.';

    -- Verificar si el token existe, no ha sido usado y no ha expirado
    SELECT user_cc INTO v_user_cc
    FROM reset_password_tokens
    WHERE token = p_token
    AND used = FALSE
    AND expiration > NOW()
    LIMIT 1;

    IF v_user_cc IS NOT NULL THEN
        SET p_message = 'Token válido.';
    ELSE
        IF NOT EXISTS (SELECT 1 FROM reset_password_tokens WHERE token = p_token) THEN
            SET p_message = 'Token no encontrado.';
        ELSEIF EXISTS (SELECT 1 FROM reset_password_tokens WHERE token = p_token AND used = TRUE) THEN
            SET p_message = 'Token ya utilizado.';
        ELSEIF EXISTS (SELECT 1 FROM reset_password_tokens WHERE token = p_token AND expiration <= NOW()) THEN
            SET p_message = 'Token expirado.';
        END IF;
    END IF;
END $$

-- Procedimiento almacenado para restablecer la contraseña
CREATE PROCEDURE sp_reset_password (
    IN p_token VARCHAR(255),
    IN p_new_password VARCHAR(255),
    OUT p_message VARCHAR(255)
)
BEGIN
    DECLARE v_user_cc CHAR(10);
    
    -- Verificar si el token es válido y no ha expirado ni ha sido usado
    SELECT user_cc INTO v_user_cc
    FROM reset_password_tokens
    WHERE token = p_token AND used = FALSE AND expiration > NOW()
    LIMIT 1;

    IF v_user_cc IS NOT NULL THEN
        -- Actualizar la contraseña del usuario
        UPDATE users
        SET password = p_new_password
        WHERE cc = v_user_cc;

        -- Marcar el token como usado
        UPDATE reset_password_tokens
        SET used = TRUE
        WHERE token = p_token;

        SET p_message = 'Contraseña actualizada correctamente.';
    ELSE
        -- Manejo de errores en caso de token inválido
        IF NOT EXISTS (SELECT 1 FROM reset_password_tokens WHERE token = p_token) THEN
            SET p_message = 'Token no encontrado.';
        ELSEIF EXISTS (SELECT 1 FROM reset_password_tokens WHERE token = p_token AND used = TRUE) THEN
            SET p_message = 'Token ya utilizado.';
        ELSEIF EXISTS (SELECT 1 FROM reset_password_tokens WHERE token = p_token AND expiration <= NOW()) THEN
            SET p_message = 'Token expirado.';
        ELSE
            SET p_message = 'Token no válido.';
        END IF;
    END IF;
END $$

-- Procedimiento almacenado para generar número de cuenta único
CREATE PROCEDURE sp_generate_unique_account_number(OUT new_account_number CHAR(16))
BEGIN
    DECLARE unique_number BOOLEAN DEFAULT FALSE;
    DECLARE i INT;
    DECLARE digit CHAR(1);
    SET new_account_number = '';
    
    WHILE unique_number = FALSE DO
        SET new_account_number = '';
        SET i = 1;

        WHILE i <= 16 DO
            SET digit = FLOOR(RAND() * 10);
            SET new_account_number = CONCAT(new_account_number, digit);
            SET i = i + 1;
        END WHILE;

        IF NOT EXISTS (SELECT 1 FROM accounts WHERE account_number = new_account_number) THEN
            SET unique_number = TRUE;
        END IF;
    END WHILE;
END $$

-- Vista para mostrar transacciones de una cuenta
CREATE VIEW vw_account_transactions AS
    SELECT
        id,
        'Gasto' AS type,
        from_account AS account,
        to_account AS related_account,
        amount,
        date,
        state
    FROM 
        transactions
    UNION ALL
    SELECT
        id,
        'Ingreso' AS type,
        to_account AS account,
        from_account AS related_account,
        amount,
        date,
        state
    FROM 
        transactions
    ORDER BY 
        date;

-- Ejemplo de uso de la vista
-- SELECT * FROM vw_account_transactions WHERE cuenta = '0532874707628856';

-- Trigger para generar detalles de cuenta automáticamente
CREATE TRIGGER create_bank_account_after_user_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    DECLARE new_account_number CHAR(16);
    DECLARE new_cvv CHAR(3);
    DECLARE expiration_date CHAR(5);
    
    -- Generar el número de cuenta aleatorio (16 dígitos)
    CALL sp_generate_unique_account_number(new_account_number);
    
    -- Generar el CVV aleatorio (3 dígitos)
    SET new_cvv = LPAD(FLOOR(RAND() * 1000), 3, '0');
    
    -- Asignar la fecha de expiración en el formato "MM/YY" a 3 años a partir de la fecha actual
    SET expiration_date = DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 3 YEAR), '%m/%y');

    INSERT INTO accounts (account_number, user, balance, expiration_date, cvv, state)
    VALUES (new_account_number, NEW.cc, 0.00, expiration_date, new_cvv, "Activa");
END $$

DELIMITER ;