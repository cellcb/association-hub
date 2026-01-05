# Water Platform Backend Makefile
# 
# Usage:
#   make build     - Clean and compile project
#   make test      - Run all tests
#   make package   - Build JAR file
#   make deploy    - Deploy to remote server
#   make restart   - Restart remote container
#   make all       - Build, package and deploy
#   make clean     - Clean build artifacts

# Configuration
MAVEN_WRAPPER = ./mvnw
JAR_FILE = boot/target/wp.jar
REMOTE_HOST = 113.44.104.102
REMOTE_USER = root
REMOTE_PATH = /opt/water/apps
CONTAINER_NAME = water_wp_1
DB_CONTAINER_NAME = water-db-1
WP_DB_NAME ?= wp
WP_DB_USER ?= wp
WP_DB_PASSWORD ?= wp
DB_SUPERUSER ?= $(WP_DB_USER)
DB_SUPERUSER_PASSWORD ?= $(WP_DB_PASSWORD)
WP_DB_ROLE_FLAGS ?= SUPERUSER CREATEROLE CREATEDB REPLICATION BYPASSRLS
TMP_DB_SUPERUSER = __tmp_wp_admin__

# Default target
.DEFAULT_GOAL := help

# Help target
.PHONY: help
help:
	@echo "Water Platform Backend Build & Deploy"
	@echo ""
	@echo "Available targets:"
	@echo "  build     - Clean and compile project"
	@echo "  test      - Run all tests"
	@echo "  package   - Build JAR file"
	@echo "  deploy    - Deploy JAR to remote server"
	@echo "  restart   - Restart remote container"
	@echo "  all       - Build, package and deploy"
	@echo "  clean     - Clean build artifacts"
	@echo "  status    - Check remote container status"
	@echo "  logs      - Show remote container logs (last 100 lines)"
	@echo "  logs-tail - Follow remote container logs in real-time"
	@echo "  logs-recent - Show recent logs with timestamps"
	@echo "  logs-error - Show error logs only"
	@echo "  db-reset-wp-user - Drop and recreate the wp database role inside the container"
	@echo "  db-clear-wp-objects - Drop all tables and views owned by the wp user in the local db container"
	@echo ""
	@echo "Configuration:"
	@echo "  Remote Host: $(REMOTE_HOST)"
	@echo "  Remote Path: $(REMOTE_PATH)"
	@echo "  Container:   $(CONTAINER_NAME)"

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	$(MAVEN_WRAPPER) clean

# Compile project
.PHONY: build
build:
	@echo "Building project..."
	$(MAVEN_WRAPPER) clean compile

# Run tests
.PHONY: test
test:
	@echo "Running tests..."
	$(MAVEN_WRAPPER) clean test

# Package JAR file
.PHONY: package
package:
	@echo "Packaging application..."
	$(MAVEN_WRAPPER) clean package -DskipTests
	@if [ -f "$(JAR_FILE)" ]; then \
		echo "✓ JAR file created: $(JAR_FILE)"; \
		ls -lh $(JAR_FILE); \
	else \
		echo "✗ JAR file not found: $(JAR_FILE)"; \
		exit 1; \
	fi

# Check if JAR exists
.PHONY: check-jar
check-jar:
	@if [ ! -f "$(JAR_FILE)" ]; then \
		echo "✗ JAR file not found: $(JAR_FILE)"; \
		echo "Run 'make package' first"; \
		exit 1; \
	fi

# Deploy to remote server
.PHONY: deploy
deploy: check-jar
	@echo "Deploying to $(REMOTE_HOST)..."
	@echo "Creating remote directory if not exists..."
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "mkdir -p $(REMOTE_PATH)"
	@echo "Copying JAR file..."
	scp $(JAR_FILE) $(REMOTE_USER)@$(REMOTE_HOST):$(REMOTE_PATH)/
	@echo "✓ Deployment completed"

# Restart remote container
.PHONY: restart
restart:
	@echo "Restarting container $(CONTAINER_NAME)..."
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "docker restart $(CONTAINER_NAME)"
	@echo "✓ Container restarted"

# Check container status
.PHONY: status
status:
	@echo "Checking container status..."
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "docker ps | grep $(CONTAINER_NAME) || echo 'Container not running'"

# Show container logs
.PHONY: logs
logs:
	@echo "Showing logs for container $(CONTAINER_NAME)..."
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "docker logs --tail=100 $(CONTAINER_NAME)"

# Follow container logs in real-time
.PHONY: logs-tail
logs-tail:
	@echo "Following logs for container $(CONTAINER_NAME) (Ctrl+C to stop)..."
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "docker logs -f --tail=50 $(CONTAINER_NAME)"

# Show recent logs with timestamps
.PHONY: logs-recent
logs-recent:
	@echo "Showing recent logs with timestamps..."
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "docker logs --since=1h --timestamps $(CONTAINER_NAME)"

# Show error logs only
.PHONY: logs-error
logs-error:
	@echo "Showing error logs..."
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "docker logs $(CONTAINER_NAME) 2>&1 | grep -i error || echo 'No error logs found'"

# Full deployment pipeline
.PHONY: all
all: package deploy restart
	@echo "✓ Full deployment pipeline completed"

# Development targets
.PHONY: dev-run
dev-run:
	@echo "Starting development server..."
	cd boot && ../$(MAVEN_WRAPPER) spring-boot:run -Dspring-boot.run.profiles=dev

# Quick build without tests
.PHONY: quick-build
quick-build:
	@echo "Quick build (skipping tests)..."
	$(MAVEN_WRAPPER) clean package -DskipTests

# Backup current deployment
.PHONY: backup
backup:
	@echo "Creating backup of current deployment..."
	ssh $(REMOTE_USER)@$(REMOTE_HOST) "cp $(REMOTE_PATH)/wp.jar $(REMOTE_PATH)/wp.jar.backup.$(shell date +%Y%m%d_%H%M%S) 2>/dev/null || true"

# Safe deployment with backup
.PHONY: safe-deploy
safe-deploy: package backup deploy restart status
	@echo "✓ Safe deployment completed with backup"

# Database utilities
.PHONY: db-reset-wp-user
db-reset-wp-user:
	@echo "Resetting database role $(WP_DB_USER) in container $(DB_CONTAINER_NAME)..."
	docker exec -i $(DB_CONTAINER_NAME) env PGPASSWORD="$(DB_SUPERUSER_PASSWORD)" psql -v ON_ERROR_STOP=1 -U $(DB_SUPERUSER) postgres <<-'SQL'
	\set tmp_role '$(TMP_DB_SUPERUSER)'
	\set tmp_password '$(WP_DB_PASSWORD)'
	\set wp_user '$(WP_DB_USER)'
	\set wp_db '$(WP_DB_NAME)'
	\set wp_password '$(WP_DB_PASSWORD)'
	\set db_superuser '$(DB_SUPERUSER)'
	\set db_superuser_password '$(DB_SUPERUSER_PASSWORD)'
	DO $$$$
	BEGIN
	  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'tmp_role') THEN
	    EXECUTE format('DROP ROLE %I', :'tmp_role');
	  END IF;
	END;
	$$$$;
	CREATE ROLE :"tmp_role" WITH LOGIN SUPERUSER PASSWORD :'tmp_password';

	\setenv PGPASSWORD :'tmp_password'
	\connect postgres :"tmp_role"

	SELECT pg_terminate_backend(pid)
	FROM pg_stat_activity
	WHERE usename = :'wp_user';

	DO $$$$
	BEGIN
	  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'wp_user') THEN
	    EXECUTE format('REASSIGN OWNED BY %I TO CURRENT_USER', :'wp_user');
	    EXECUTE format('DROP OWNED BY %I', :'wp_user');
	    EXECUTE format('DROP ROLE %I', :'wp_user');
	  END IF;
	END;
	$$$$;

	CREATE ROLE :"wp_user" WITH LOGIN PASSWORD :'wp_password' $(WP_DB_ROLE_FLAGS);

	DO $$$$
	BEGIN
	  IF EXISTS (SELECT 1 FROM pg_database WHERE datname = :'wp_db') THEN
	    EXECUTE format('GRANT CONNECT ON DATABASE %I TO %I', :'wp_db', :'wp_user');
	    EXECUTE format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', :'wp_db', :'wp_user');
	  END IF;
	END;
	$$$$;

	DO $$$$
	BEGIN
	  EXECUTE format('REASSIGN OWNED BY %I TO %I', :'tmp_role', :'wp_user');
	END;
	$$$$;

	\connect :"wp_db" :"tmp_role"

	GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO :"wp_user";
	GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO :"wp_user";
	ALTER DATABASE :"wp_db" OWNER TO :"wp_user";

	\setenv PGPASSWORD :'wp_password'
	\connect :"wp_db" :"wp_user"

	ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO :"wp_user";
	ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO :"wp_user";

	\setenv PGPASSWORD :'db_superuser_password'
	\connect postgres :"db_superuser"

	DROP ROLE :"tmp_role";
	SQL
	@echo "✓ wp database role recreated successfully."

.PHONY: db-clear-wp-objects
db-clear-wp-objects:
	@echo "Clearing all views and tables owned by $(WP_DB_USER) in database $(WP_DB_NAME) (container $(DB_CONTAINER_NAME))..."
	docker exec -i $(DB_CONTAINER_NAME) env PGPASSWORD="$(DB_SUPERUSER_PASSWORD)" psql -v ON_ERROR_STOP=1 -U $(DB_SUPERUSER) $(WP_DB_NAME) < scripts/db/clear-wp-objects.sql
	@echo "✓ All wp-owned views and tables have been removed."
