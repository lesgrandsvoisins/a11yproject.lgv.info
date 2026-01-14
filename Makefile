ifneq (,$(wildcard ./.env))
    include .env
    export
endif

help:
	@echo
	@echo "pnpm run ..."
	@echo
	pnpm run
	@echo
	@echo "make ..."
	@echo
	grep -E '^[-a-Z0-9_]+:.*' Makefile

tgz:
	pnpm run build
	tar -C dist -czf ./$(shell node workshop/name.mjs)-$(shell node workshop/version.mjs).tgz .

version:
	@echo $(shell node workshop/version.mjs)
