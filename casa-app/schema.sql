-- ============================================================
--  Organização da Casa — Schema MySQL
--  Execute este script no seu banco MySQL para criar as tabelas
-- ============================================================

CREATE DATABASE IF NOT EXISTS organizacao_casa
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE organizacao_casa;

-- Usuários
CREATE TABLE IF NOT EXISTS users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  criado_em  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- Casas (cada usuário pode ter várias)
CREATE TABLE IF NOT EXISTS casas (
  id        INT          AUTO_INCREMENT PRIMARY KEY,
  user_id   INT          NOT NULL,
  nome      VARCHAR(100) NOT NULL,
  descricao VARCHAR(255) DEFAULT '',
  criado_em TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Setores de cada casa
CREATE TABLE IF NOT EXISTS setores (
  id      INT         AUTO_INCREMENT PRIMARY KEY,
  casa_id INT         NOT NULL,
  nome    VARCHAR(100) NOT NULL,
  emoji   VARCHAR(10)  DEFAULT '📦',
  cor     VARCHAR(20)  DEFAULT '#6366F1',
  ordem   INT          DEFAULT 0,
  FOREIGN KEY (casa_id) REFERENCES casas(id) ON DELETE CASCADE
);

-- Intervalos de frequência de cada casa
CREATE TABLE IF NOT EXISTS intervalos (
  id      INT          AUTO_INCREMENT PRIMARY KEY,
  casa_id INT          NOT NULL,
  dias    INT          NOT NULL,
  label   VARCHAR(100) NOT NULL,
  FOREIGN KEY (casa_id) REFERENCES casas(id) ON DELETE CASCADE
);

-- Tarefas (vinculadas a setor + intervalo)
CREATE TABLE IF NOT EXISTS tarefas (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  setor_id     INT          NOT NULL,
  intervalo_id INT          NOT NULL,
  texto        VARCHAR(255) NOT NULL,
  criado_em    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (setor_id)     REFERENCES setores(id)   ON DELETE CASCADE,
  FOREIGN KEY (intervalo_id) REFERENCES intervalos(id) ON DELETE CASCADE
);

-- Tarefas concluídas (por usuário — persiste entre sessões)
CREATE TABLE IF NOT EXISTS concluidas (
  id             INT       AUTO_INCREMENT PRIMARY KEY,
  tarefa_id      INT       NOT NULL,
  user_id        INT       NOT NULL,
  data_conclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tarefa_user (tarefa_id, user_id),
  FOREIGN KEY (tarefa_id) REFERENCES tarefas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_casas_user     ON casas(user_id);
CREATE INDEX idx_setores_casa   ON setores(casa_id);
CREATE INDEX idx_intervalos_casa ON intervalos(casa_id);
CREATE INDEX idx_tarefas_setor  ON tarefas(setor_id);
CREATE INDEX idx_tarefas_int    ON tarefas(intervalo_id);
CREATE INDEX idx_conc_user      ON concluidas(user_id);
