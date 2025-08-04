-- Add the claims.requireEmail config option with default value true for global config
INSERT INTO system_config ("key", "value", "groupId")
SELECT 'claims.requireEmail', 'true', 'global'
WHERE NOT EXISTS (
    SELECT 1 FROM system_config
    WHERE "key" = 'claims.requireEmail' AND "groupId" = 'global'
);
