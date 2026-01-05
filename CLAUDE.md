# Repository Guidelines

- YOU MUST: when the task is completed or when returning a message to the user, execute the command `play -q /Users/cell/ws/zelda.mp3` exactly once at the end as a notification.%

## Project Structure & Module Organization
- Maven aggregator with modules such as `boot/` (entrypoint), `common/` (shared libs), and business modules `iam/`, `tenant/`, `kb/`, `facility/`, `system/`, `rule/`.
- Each module follows `src/main/java` and `src/main/resources`; Flyway scripts live under `src/main/resources/db/migration/{module}`; tests sit in module-level `src/test/java` with H2 configs in `iam/src/test/resources/application-test.yml`.
- Keep cross-cutting utilities in `common/`; avoid duplicating configuration outside `boot/application*.yml`.

## Build, Test, and Development Commands
- `./mvnw clean compile` cleans the reactor and compiles all modules with Java 17.
- `./mvnw clean test` runs the full unit test suite; add `-pl module -am` to target a single module.
- `cd boot && ../mvnw spring-boot:run -Dspring-boot.run.profiles=dev` starts the API locally with the dev profile.
- `make build|test|package` wraps the common Maven flows, while `make dev-run` is a shortcut for the dev server.
- Package for deployment with `./mvnw clean package -DskipTests`; resulting jar lives in `boot/target/`.

## Coding Style & Naming Conventions
- Use four-space indentation, `com.assoc.<module>` packages, and Lombok for DTOs/entities when available.
- REST controllers return `com.assoc.common.result.Result<?>`; propagate business errors with the shared exception hierarchy in `common/`.
- Configuration stays conditional (`@ConditionalOnProperty`) and centralized in `boot`; modules expose auto-configuration only when necessary.

## Architecture
- Entity base class: `AuditableEntity` provides `createdTime`, `updatedTime`, `createdBy`, `updatedBy` fields.

## Testing Guidelines
- Tests rely on Spring Boot Test + JUnit 5, with H2 and Testcontainers available for database coverage.
- Name fast tests `*Test` and integration suites `*IntegrationTest`; place supporting SQL or YAML under the matching module `src/test/resources`.
- Typical flows: `./mvnw test -Dtest=AuthServiceTest` for a class, `./mvnw test -Dtest=*IntegrationTest` for integration coverage.

## Commit & Pull Request Guidelines
- Mirror existing history: short, imperative commits (`Add rule management module`, `Update default admin password`).
- Reference modules or features touched, squash noisy WIP commits locally, and ensure builds pass before pushing.
- Pull requests should describe scope, list validation (commands run, data seeded), attach API or UI evidence if behavior shifts, and link tracking issues.

## Database Setup
- PostgreSQL container ID: `11b02bdb5c8c`
- Database name: `assoc`
- Username: `assoc`
- Password: `assoc`
- Connection URL: `jdbc:postgresql://localhost:5432/assoc`
- Create user and database:
  ```bash
  docker exec -i 11b02bdb5c8c psql -U wp -c "CREATE USER assoc WITH PASSWORD 'assoc' CREATEDB;"
  docker exec -i 11b02bdb5c8c psql -U wp -c "CREATE DATABASE assoc OWNER assoc;"
  ```

## Security & Configuration Tips
- Set `SPRING_PROFILES_ACTIVE`, `DB_USERNAME`, `DB_PASSWORD`, and a 256-bit `JWT_SECRET` before running outside tests.
- Default admin credentials (`admin` / `123456`) exist for bootstrap only—rotate them in every deployed environment.
- Dockerised Postgres runs as `water-db-1`; align Flyway schema settings in `boot/application*.yml` when adding modules.
