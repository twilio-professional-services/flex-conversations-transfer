const TokenValidator = require("twilio-flex-token-validator").functionValidator;
const getRoutingParams = (
  context,
  jsonAttributes,
  transferTargetType,
  transferTargetSid,
  transferQueueName,
  ignoreWorkerContactUri
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
      task_channel_unique_name: "chat",
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
  response.setBody({ sucess: true });

  const Payload = JSON.parse(event.Payload);

  const {
    flexInteractionSid,
    flexInteractionChannelSid,
    flexInteractionParticipantSid,
  } = Payload.interactionDetails;

  const { transferTargetSid, transferQueueName, transferTargetType } =
    Payload.transferDetails;

  const { transferringWorkerSid, transferringTaskAttributes } = Payload;

  //remove agent from conversation but leave the conversation/interaction active
  await client.flexApi.v1
    .interaction(flexInteractionSid)
    .channels(flexInteractionChannelSid)
    .participants(flexInteractionParticipantSid)
    .update({ status: "closed" });

  // invite a new agent to the conversation/interaction
  const routingParams = getRoutingParams(
    context,
    transferringTaskAttributes,
    transferTargetType,
    transferTargetSid,
    transferQueueName,
    transferringWorkerSid
  );

  const participantInvite = await client.flexApi.v1
    .interaction(flexInteractionSid)
    .channels(flexInteractionChannelSid)
    .invites.create({
      routing: routingParams,
    });

  callback(null, response);
});
