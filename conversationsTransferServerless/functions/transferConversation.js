const TokenValidator = require("twilio-flex-token-validator").functionValidator;
const getRoutingParams = (
  context,
  jsonAttributes,
  transferTargetType,
  transferTargetSid,
  transferQueueName,
  ignoreWorkerContactUri,
  taskRouterChannel
) => {
  const originalTaskAttributes = JSON.parse(jsonAttributes);
  const newAttributes = {
    ...originalTaskAttributes,
    ignoreWorkerContactUri,
    transferTargetSid,
    transferQueueName,
    transferTargetType,
  };

  const routingParams = {
    properties: {
      task_channel_unique_name: taskRouterChannel,
      workspace_sid: context.TWILIO_FLEX_WORKSPACE_SID,
      workflow_sid: context.TWILIO_FLEX_CHAT_TRANSFER_WORKFLOW_SID,
      attributes: newAttributes,
    },
  };

  return routingParams;
};

exports.handler = TokenValidator(async function (context, event, callback) {
  const client = context.getTwilioClient();

  const response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST GET");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");
  response.appendHeader("Content-Type", "application/json");

  const {
    flexInteractionSid,
    flexInteractionChannelSid,
    flexInteractionParticipantSid,
  } = event.Payload.interactionDetails;

  const { transferTargetSid, transferQueueName, transferTargetType } =
    event.Payload.transferDetails;

  const {
    transferringWorkerSid,
    transferringTaskAttributes,
    taskRouterChannel,
  } = event.Payload;

  const updatedTaskAttributes = JSON.parse(transferringTaskAttributes);

  // Subsequent interactions invites will have a different sid
  // The interactions invite sid is automatically added to the task attibutes by Flex Conversations / Interactions orchestration
  if (updatedTaskAttributes?.flexChannelInviteSid) {
    delete updatedTaskAttributes.flexChannelInviteSid;
  }

  try {
    // //remove agent from conversation but leave the conversation/interaction active
    await client.flexApi.v1
      .interaction(flexInteractionSid)
      .channels(flexInteractionChannelSid)
      .participants(flexInteractionParticipantSid)
      .update({ status: "closed" });

    // invite a new agent to the conversation/interaction
    const routingParams = getRoutingParams(
      context,
      JSON.stringify(updatedTaskAttributes),
      transferTargetType,
      transferTargetSid,
      transferQueueName,
      transferringWorkerSid,
      taskRouterChannel
    );

    const participantInvite = await client.flexApi.v1
      .interaction(flexInteractionSid)
      .channels(flexInteractionChannelSid)
      .invites.create({
        routing: routingParams,
      });
    response.setBody({ success: true });
    return callback(null, response);
  } catch (error) {
    console.error("Error in transferConversation function:", error);
    response.setBody({ success: false, error });
    return callback(null, response);
  }
});
