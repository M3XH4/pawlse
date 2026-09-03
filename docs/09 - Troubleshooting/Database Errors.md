# 🗄️ Database Errors & Troubleshooting

Diagnostic guide for MySQL constraints, migrations, soft deletes, and foreign key anomalies.

---

# Problem: Foreign Key Constraint Violation on Deletion

## Symptoms
Deleting a record throws `SQLSTATE[23000]: Integrity constraint violation: 1451 Cannot delete or update a parent row: a foreign key constraint fails`.

## Cause
Attempting to hard-delete a record (`User`, `ShelterAnimal`, `PetReport`) that has child rows in related tables without cascading rules.

## Solution
1. Use **Soft Deletes** (`$model->delete()`) which populates `deleted_at` instead of removing the row from disk.
2. For permanent deletions, ensure child records are archived first, or use the Super Admin Archive force-delete workflow.

## Prevention
Always use soft deletes for primary entities and maintain foreign key cascade definitions in migrations.

## Related
* [[Database Overview]]
* [[Relationships]]
* [[Super Admin Features|Archive Management]]

---

# Problem: Migration Column Type Mismatch (e.g. `user_id` vs `id`)

## Symptoms
Running `php artisan migrate` fails with `Cannot add foreign key constraint (error 1215)`.

## Cause
Mismatch between `foreignId('user_id')` (which expects unsigned BIGINT) and an integer column on the referenced table.

## Solution
Ensure referenced primary keys use `$table->id()` and foreign keys use `$table->foreignId('user_id')->constrained()`.

## Prevention
Follow standard Laravel 13 migration conventions throughout `database/migrations/`.

## Related
* [[Migrations]]
* [[Schema]]

---

# Problem: Database Backup Timeout / Mysqldump Missing

## Symptoms
Manual or automated backups fail with `mysqldump: command not found` or command timeout error.

## Cause
`mysqldump` binary is not in the system `$PATH` or database size exceeds PHP script execution limits.

## Solution
1. Ensure MySQL bin directory is added to system environment variables.
2. In development with Laravel Herd / MySQL, configure the binary path in `config/database.php`.

## Prevention
Monitor backup execution status in the Super Admin Backup & Restore dashboard.

## Related
* [[Super Admin Features|Backup & Disaster Recovery]]
* [[Laravel Errors]]
