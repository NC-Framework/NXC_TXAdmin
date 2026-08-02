-- Nexus Core — deployment bootstrap schema.
--
-- Creates ONLY the migration-tracking table.
--
-- Every other table belongs to exactly one resource domain, and each resource
-- owns and applies its own migrations. A deployment recipe that created domain
-- tables would be writing state it does not own — the same boundary violation
-- the framework prohibits between resources — and the recipe's schema and the
-- resource's migrations would drift with neither being authoritative.

CREATE TABLE IF NOT EXISTS `nxc_migrations` (
    `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `resource`   VARCHAR(64)  NOT NULL,
    `migration`  VARCHAR(128) NOT NULL,
    `checksum`   CHAR(64)     NOT NULL,
    `applied_at` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_resource_migration` (`resource`, `migration`),
    KEY `idx_resource` (`resource`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
