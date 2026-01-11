# Waxberry Runtime - Multi-Environment Makefile
# ============================================

# Default environment
ENV ?= dev

# Available environments
ENVS := dev prod oss

BLENDER_CONVERTER_IMAGE ?= blender-converter:latest
BLENDER_BASE_IMAGE ?= lscr.io/linuxserver/blender:4.0.2
BLENDER_DRACO_URL ?= https://download.blender.org/release/Blender4.0/blender-4.0.2-linux-x64.tar.xz

# Docker compose command detection
DOCKER_COMPOSE := $(shell if command -v docker-compose >/dev/null 2>&1; then echo "docker-compose"; elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then echo "docker compose"; else echo ""; fi)



# Help target
.PHONY: help
help:
	@echo "Waxberry Runtime - Multi-Environment Build System"
	@echo "================================================"
	@echo ""
	@echo "Usage: make <target> [ENV=<environment>]"
	@echo ""
	@echo "Environments:"
	@echo "  dev  - Development environment (default)"
	@echo "  prod - Production environment"
	@echo "  oss  - OSS environment"
	@echo ""
	@echo "Package Targets:"
	@echo "  package      - Package application for specified environment"
	@echo ""
	@echo "Clean Targets:"
	@echo "  clean-package    - Clean previous packaging files for specified environment"
	@echo "  clean-images     - Clean exported Docker image files"
	@echo "  clean-all-packages - Clean all packaging files"
	@echo ""
	@echo "Docker Image Targets:"
	@echo "  blender-converter-image - Build Blender-based mesh converter image"
	@echo "      e.g. make blender-converter-image BLENDER_BASE_IMAGE=blender:latest"
	@echo ""
	@echo "  build-images       - Run 'docker compose build' (set SERVICE=name to limit)"
	@echo "  export-images     - Export all Docker images"
	@echo "  export-images-x64 - Export Docker images for x86_64 platform"
	@echo "  load-images       - Load Docker images from exports"
	@echo ""

	@echo "Environment Package Targets:"
	@echo "  package-dev       - Package for development environment"
	@echo "  package-prod      - Package for production environment"
	@echo "  package-oss       - Package for OSS environment"
	@echo "  package-all       - Package for all environments"
	@echo ""
	@echo "Examples:"
	@echo "  make package ENV=oss    # Package OSS environment"
	@echo "  make package-all        # Package all environments"



# Clean packaging artifacts
.PHONY: clean-package clean-images
clean-package:
	@echo "Cleaning previous packaging files for $(ENV) environment..."
	@rm -rf dist/$(ENV) 2>/dev/null || true
	@rm -f dist/waxberry-$(ENV)-*.tar.gz 2>/dev/null || true
	@echo "Previous packaging files cleaned."

clean-images:
	@echo "Cleaning exported Docker images..."
	@rm -rf images/*.tar 2>/dev/null || true
	@echo "Docker image files cleaned."

# Package target - improved error handling for TeamCity
.PHONY: package
package: clean-package
	@echo "Packaging $(ENV) environment..."
	@mkdir -p dist/$(ENV)
	
	@echo "Copying docker-compose file..."
	@if [ -f "docker-compose-$(ENV).yml" ]; then \
		cp docker-compose-$(ENV).yml dist/$(ENV)/docker-compose.yml; \
		echo "✓ Docker compose file copied"; \
	else \
		echo "✗ ERROR: docker-compose-$(ENV).yml not found"; \
		exit 1; \
	fi
	
	@echo "Copying environment-specific configuration..."
	@if [ -d "conf/$(ENV)" ]; then \
		mkdir -p dist/$(ENV)/conf; \
		cp -r conf/$(ENV)/* dist/$(ENV)/conf/; \
		echo "✓ Configuration files for $(ENV) environment copied."; \
	else \
		echo "✗ ERROR: No configuration directory found for $(ENV) environment."; \
		exit 1; \
	fi
	
	@echo "Copying application files..."
	@if [ -d "apps" ]; then \
		cp -r apps dist/$(ENV)/; \
		echo "✓ Apps directory copied (contents: $$(ls -1 apps | wc -l) items)"; \
	else \
		echo "⚠ WARNING: Apps directory not found, creating empty directory"; \
		mkdir -p dist/$(ENV)/apps; \
	fi
	
	@echo "Copying bin directory..."
	@if [ -d "bin" ]; then \
		cp -r bin dist/$(ENV)/; \
		chmod +x dist/$(ENV)/bin/*.sh 2>/dev/null || true; \
		echo "✓ Bin directory copied"; \
	else \
		echo "✗ ERROR: Bin directory not found"; \
		exit 1; \
	fi
	
	@echo "Copying docker directory..."
	@if [ -d "docker" ]; then \
		cp -r docker dist/$(ENV)/; \
		echo "✓ Docker directory copied"; \
	else \
		echo "⚠ WARNING: Docker directory not found"; \
	fi
	
	@echo "Copying images directory..."
	@if [ -d "images" ]; then \
		cp -r images dist/$(ENV)/; \
		echo "✓ Images directory copied (contents: $$(ls -1 images 2>/dev/null | wc -l) items)"; \
	else \
		echo "⚠ WARNING: Images directory not found, creating empty directory"; \
		mkdir -p dist/$(ENV)/images; \
	fi
	
	@echo "Copying documentation files..."
	@if [ -f "README-$(ENV).md" ]; then \
		cp README-$(ENV).md dist/$(ENV)/README.md; \
		echo "✓ Environment-specific README copied: README-$(ENV).md -> README.md"; \
	else \
		echo "⚠ WARNING: No environment-specific README found for $(ENV) environment."; \
	fi
	
	@if [ -f "README-$(ENV).en.md" ]; then \
		cp README-$(ENV).en.md dist/$(ENV)/README.en.md; \
		echo "✓ Environment-specific English README copied: README-$(ENV).en.md -> README.en.md"; \
	else \
		echo "⚠ WARNING: No environment-specific English README found for $(ENV) environment."; \
	fi
	
	@if [ -f "LICENSE" ]; then \
		cp LICENSE dist/$(ENV)/; \
		echo "✓ LICENSE file copied"; \
	else \
		echo "⚠ WARNING: LICENSE file not found"; \
	fi
	
	@echo ""
	@echo "📦 Package created successfully for $(ENV) environment!"
	@echo "📁 Package contents:"
	@ls -la dist/$(ENV)/
#	@echo "Creating package archive..."
#	@tar -czf dist/waxberry-$(ENV)-$$(date +%Y%m%d-%H%M%S).tar.gz -C dist/$(ENV) .
#	@echo "Package created: dist/waxberry-$(ENV)-$$(date +%Y%m%d-%H%M%S).tar.gz"

# Blender mesh converter

.PHONY: blender-converter-image
blender-converter-image:
	@echo "Building Blender converter image ($(BLENDER_CONVERTER_IMAGE)) from $(BLENDER_BASE_IMAGE)..."
	docker build \
	    --build-arg BLENDER_BASE_IMAGE=$(BLENDER_BASE_IMAGE) \
	    --build-arg BLENDER_DRACO_URL=$(BLENDER_DRACO_URL) \
	    -t $(BLENDER_CONVERTER_IMAGE) \
	    docker/blender-converter
	@echo "Blender converter image ready: $(BLENDER_CONVERTER_IMAGE)"

.PHONY: build-images
build-images:
	@if [ -z "$(DOCKER_COMPOSE)" ]; then \
		echo "✗ ERROR: docker-compose/docker compose not found. Please install Docker Compose."; \
		exit 1; \
	fi
	@echo "Building Docker images only (containers will not be started)..."
	@if [ -n "$(SERVICE)" ]; then \
		echo "→ Target service: $(SERVICE)"; \
		$(DOCKER_COMPOSE) build $(SERVICE); \
	else \
		$(DOCKER_COMPOSE) build; \
	fi

# Docker image management
.PHONY: export-images export-images-x64 load-images
export-images:
	@echo "Exporting Docker images for $(ENV) environment..."
	@COMPOSE_FILE=docker-compose-$(ENV).yml ./bin/service.sh export_images

export-images-x64:
	@echo "Exporting Docker images (x86_64) for $(ENV) environment..."
	@COMPOSE_FILE=docker-compose-$(ENV).yml ./bin/service.sh export_images_x8664

load-images:
	@echo "Loading Docker images..."
	@./bin/service.sh load_images



# Environment-specific package targets
.PHONY: package-dev package-prod package-oss package-all
package-dev:
	@$(MAKE) package ENV=dev

package-prod:
	@$(MAKE) package ENV=prod

package-oss:
	@$(MAKE) package ENV=oss

package-all: clean-all-packages package-dev package-prod package-oss
	@echo "All environments packaged successfully!"

# Clean all package artifacts
.PHONY: clean-all-packages
clean-all-packages:
	@echo "Cleaning all previous packaging files..."
	@rm -rf dist/ 2>/dev/null || true
	@echo "All packaging files cleaned."

# Default target
.DEFAULT_GOAL := help 
