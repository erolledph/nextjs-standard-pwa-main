#!/bin/bash

# Firebase Deployment Script
# Deploys Firestore rules and indexes to Firebase

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Firebase Firestore Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}✗ Firebase CLI is not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✓ Firebase CLI found${NC}"

# Check if .firebaserc exists
if [ ! -f ".firebaserc" ]; then
    echo -e "${RED}✗ .firebaserc file not found${NC}"
    echo "Please create .firebaserc with your Firebase project ID"
    exit 1
fi

echo -e "${GREEN}✓ .firebaserc found${NC}"

# Check if firebase.rules exists
if [ ! -f "firebase.rules" ]; then
    echo -e "${RED}✗ firebase.rules file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ firebase.rules found${NC}"

# Check if firestore.indexes.json exists
if [ ! -f "firestore.indexes.json" ]; then
    echo -e "${RED}✗ firestore.indexes.json file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ firestore.indexes.json found${NC}"

echo ""
echo -e "${YELLOW}Deployment Options:${NC}"
echo "1. Deploy everything (rules + indexes)"
echo "2. Deploy only rules"
echo "3. Deploy only indexes"
echo ""

# Parse command line argument
if [ -z "$1" ]; then
    # Interactive mode
    read -p "Select option (1-3): " option
else
    option=$1
fi

case $option in
    1)
        echo ""
        echo -e "${BLUE}Deploying Firestore rules and indexes...${NC}"
        firebase deploy --only firestore
        echo -e "${GREEN}✓ Deployment completed successfully!${NC}"
        ;;
    2)
        echo ""
        echo -e "${BLUE}Deploying Firestore rules only...${NC}"
        firebase deploy --only firestore:rules
        echo -e "${GREEN}✓ Rules deployed successfully!${NC}"
        ;;
    3)
        echo ""
        echo -e "${BLUE}Deploying Firestore indexes only...${NC}"
        firebase deploy --only firestore:indexes
        echo -e "${GREEN}✓ Indexes deployment started!${NC}"
        echo -e "${YELLOW}⚠ Index creation may take 5-15 minutes${NC}"
        ;;
    *)
        echo -e "${RED}✗ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Monitor Firebase Console for index creation status"
echo "2. Verify all indexes show 'Enabled' status"
echo "3. Test your application with the new rules and indexes"
echo ""
echo "For more information, see FIREBASE_DEPLOYMENT_GUIDE.md"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
