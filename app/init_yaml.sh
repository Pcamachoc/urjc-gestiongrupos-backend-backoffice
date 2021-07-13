#!/bin/sh

# Execute this script as source ./init_yaml.sh for export variables to global environment outside the script scope

# Configuration Source
export NODE_CONFIG_SOURCE_APP="YAML_FILE"
env | grep '^NODE_CONFIG_SOURCE_APP='

# Spring Cloud Config Endpoint
export NODE_CONFIG_SPRINGCFG_ENDPOINT="NONE"
env | grep '^NODE_CONFIG_SPRINGCFG_ENDPOINT='

# Configuration File
export NODE_CONFIG_FILE="urjcgestiongrupos-backend-backoffice-dev.yml"
env | grep '^NODE_CONFIG_FILE='

# App Port
export NODE_CONFIG_PORT_APP="8080"
env | grep '^NODE_CONFIG_PORT_APP='
