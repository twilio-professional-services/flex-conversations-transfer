# Flex Conversations Chat Transfer

This Plugin is a POC/Sample code on an implementation of cold transfer of Flex Conversation Chats to a new agent or queue.

## Disclaimer

**This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.**

# Overview

The plugin adds a transfer button to Chat tasks TaskCanvaasHeader if it is a Flex Conversations based chat. The button will open the native WorkerDirectory to allow the agent or queue to be selected.

The WorkerDirectory has the 'consult/warm transfer' icon removed using CSS and the cold transfer but will trigger the TransferTask Action. A beforeTransferTask listener will intercept the transfer action which natively only works for voice calls.
The action is replaced by an request to a Twilio function which performs the transfer of the task.

A new task is created with attributes indicating the target and a suitable TaskRouter workflow is required to ensure the task routes to the correct agent or queue.

All TaskRouter queues that can be transferred to will need to be referenced as a TaskRouter Filter.

# Flex Conversations Implementation

### TODO

# Possible Enhancements

### TODO

# Setup

## Create a new TaskRouter Workflow based on

Setup a workflow, similar to [this one](example-taskrouter-workflow.json). Note the first rule matches any worker selected then we have a rule for each queue.

## Deploy Serverless

Modify the .env-template in the conversationsTransferServerless root directory and copy to .env

```
TWILIO_FLEX_WORKSPACE_SID = WSxxx
TWILIO_FLEX_CHAT_TRANSFER_WORKFLOW_SID = WWWxxx
```

Deploy the serverless functions and note the domain that is created and will be referenced by the plugin

## Flex Plugin

Modify the .env-template file and copy to .env and reference the serverless domain created in the previous step

```
FLEX_APP_TWILIO_SERVERLESS_DOMAIN=conversationstransferserverless-xxxx-dev.twil.io
```
