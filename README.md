# Notice - Legacy Code

**This plugin is no longer maintained and has been migrated to the [Flex Plugin Library](https://www.twilio.com/docs/flex/developer/plugins/plugin-library) where it is available as an out-of-box feature. The plugin is also available as part of the customizable [Flex Project Template](https://github.com/twilio-professional-services/flex-project-template), where it is an optional feature.**

# Flex Conversations Chat Transfer

This Plugin is a POC/Sample code of an implementation of cold transfer of [Flex Conversations](https://www.twilio.com/docs/flex/conversations) to an agent or TaskRouter queue.

## Disclaimer

**This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.**

# Overview

The plugin adds a transfer button to Chat tasks TaskCanvaasHeader for Flex Conversations based chats. The button will open the native [WorkerDirectory](https://assets.flex.twilio.com/docs/releases/flex-ui/2.0.0-beta.1/programmable-components/components/WorkerDirectory) to allow the agent or queue to be selected.

The WorkerDirectory has the 'consult/warm transfer' icon removed using CSS and selecting transfer triggers the [TransferTask Action](https://assets.flex.twilio.com/docs/releases/flex-ui/2.0.0-beta.1/ui-actions/Actions#TransferTask). As the TransferTask action only natively works for voice the beforeTransferTask listener is used to intercept the transfer action and replace it with new logic described below.
The action is replaced by an request to a Twilio function which performs the transfer of the task.

A new task is created with attributes indicating the target and a suitable TaskRouter workflow is required to ensure the task routes to the correct agent or queue.

All TaskRouter queues that can be transferred to will need to be referenced as a TaskRouter Filter.

# Flex Conversations/Interactions Transfer Implementation

Flex Conversations makes use of the Twilio Conversations product and the [Interactions API](https://www.twilio.com/docs/flex/developer/conversations/interactions-api/interactions). The SendToFlex widget is used to create an Interaction to pass a Conversation to an agent. When an agent completes a chat Flex UI updates the [Interaction to 'closed'](https://www.twilio.com/docs/flex/developer/conversations/interactions-api/channels-subresource?code-sample=code-close-an-interaction-channel-and-wrap-agent-participants-1&code-language=curl&code-sdk-version=json). Closing the Interaction will close the underlying Conversation and move the task to a wrapping state.

To transfer a Flex Conversation rather than close the Interaction we need to mark the agents [Interaction Channel Participant as] closed and then [Invite](https://www.twilio.com/docs/flex/developer/conversations/interactions-api/invites-subresource) a new agent to the Interaction.

The two API requests required for this are made from the supporting serverless function.

# Possible Enhancements

This plugin is intentionally a minimal implementation for transfers that is intended as a starting point for your specific use case. Some points to consider:

- There is minimal error handling and in the case of an error (or a transfer being initiated) you could optionally consider adding a [Flex UI Notification](https://www.twilio.com/docs/flex/developer/ui/v1/notifications)
- All task attributes are copied from the original task to the transferring task. This could have reporting implications and you may want to consider using the [conversations.conversation_id](https://www.twilio.com/docs/flex/developer/insights/enhance-integration#link-tasks-to-a-conversation) in all tasks related to the Conversation.
- The Interactions Channel Participant API update moves the Status to closed rather than wrapping. You may want to consider if moving to a [wrapping state](https://www.twilio.com/docs/flex/developer/conversations/interactions-api/interaction-channel-participants?code-sample=code-wrap-up-agent-reservation&code-language=curl&code-sdk-version=json) if required.
- After initiating a transfer the expectation is that this will complete quickly and the task will be moved to completed and there we don't try and add logic for disabling the transfer button. In a production environment tracking which tasks have had a transfer initiated and disabling the button or replacing with a spinner if this task is selected would ensure that even if the API request takes several seconds the agent experience is as expected.
- Warm transfer or multiple agents in the same Conversation at the same time is not supported by this plugin. A POC of implementation for this is available [here](https://github.com/twilio-professional-services/flex-project-template/tree/main/plugin-flex-ts-template-v2/src/feature-library/conversation-transfer)

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
FLEX_APP_TWILIO_SERVERLESS_DOMAIN=https://conversationstransferserverless-xxxx-dev.twil.io
```
