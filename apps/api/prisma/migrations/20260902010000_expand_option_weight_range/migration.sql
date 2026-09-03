ALTER TABLE "Option"
ALTER COLUMN "weight" TYPE DECIMAL(7, 2);

UPDATE "Option"
SET "weight" = 1.00
WHERE "weight" < 1.00;
