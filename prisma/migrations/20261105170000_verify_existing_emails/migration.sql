-- Contas já existentes entram sem o link novo. Só cadastros criados depois ficam pendentes.
UPDATE "User" SET "emailVerified" = NOW() WHERE "emailVerified" IS NULL;
