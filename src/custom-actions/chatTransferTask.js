import { Actions, Manager } from "@twilio/flex-ui";

export const registerCustomChatTransferAction = () => {
  Actions.registerAction("ChatTransferTask", (payload) =>
    handleChatTransferAction(payload)
  );
};

const _getMyParticipantSid = (participants) => {
  const myParticipant = participants.find(
    (participant) =>
      participant.mediaProperties?.identity ===
      Manager.getInstance().conversationsClient?.user?.identity
  );

  return myParticipant ? myParticipant.participantSid : "";
};

const _queueNameFromSid = async (queueSid) => {
  const workspaceClient = Manager.getInstance().workspaceClient;
  try {
    const queue = await workspaceClient.fetchTaskQueue(queueSid);
    return queue.queueName;
  } catch (e) {
    console.error(e);
    return undefined;
  }
};

const handleChatTransferAction = async (payload) => {
  let queueName = undefined;

  const { task, targetSid } = payload;

  if (targetSid?.startsWith("WQ")) {
    queueName = await _queueNameFromSid(targetSid);
  }

  const { flexInteractionSid = "", flexInteractionChannelSid = "" } =
    task.attributes;

  const participants = await task.getParticipants(flexInteractionChannelSid);
  const flexInteractionParticipantSid = _getMyParticipantSid(participants);

  if (!flexInteractionParticipantSid) return null;

  const interactionDetails = {
    flexInteractionSid,
    flexInteractionChannelSid,
    flexInteractionParticipantSid,
  };

  const transferDetails = {
    transferTargetSid: targetSid,
    transferQueueName: queueName,
    transferTargetType: targetSid.startsWith("WK") ? "worker" : "queue",
  };

  const transferPayload = {
    interactionDetails,
    transferDetails,
    transferringWorkerSid: Manager.getInstance().workerClient.sid,
    transferringTaskAttributes: JSON.stringify(task.attributes),
  };

  try {
    await sendTransferRequest(transferPayload);
  } catch (e) {
    console.error(e);
  }
};

const sendTransferRequest = async (transferPayload) => {
  const body = {
    Payload: JSON.stringify(transferPayload),
    Token:
      Manager.getInstance().store.getState().flex.session.ssoTokenPayload.token,
  };

  console.log("DEBUG ***", body);

  const options = {
    method: "POST",
    body: new URLSearchParams(body),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
  };
  try {
    const resp = await fetch(
      `https://${process.env.FLEX_APP_TWILIO_SERVERLESS_DOMAIN}/transferConversation`,
      options
    );
    const data = await resp.json();
  } catch (e) {
    console.error(e);
  }
};
