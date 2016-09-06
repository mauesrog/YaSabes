#!/bin/bash
#
# cleardb.sh
#
# author: Mauricio Esquivel Rogel
# date: August 2016

if [ $# -lt 0 ]; then
	echo "./cleardb.sh: invalid number of arguments: $# (0 required)" 1>&2
	exit 1
else
	mongo --eval \
	"db=db.getSiblingDB('yasabes'); \
	db.users.remove({}); db.conversations.remove({}); db.matches.remove({}); \
	db.messages.remove({});db.conversationrefs.remove({});"
fi
