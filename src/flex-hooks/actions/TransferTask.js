import { TaskHelper, Actions } from "@twilio/flex-ui";

export function handleChatTransfer() {
  Actions.addListener("beforeTransferTask", (payload, abortFunction) => {
    if (TaskHelper.isCBMTask(payload.task)) {
      abortFunction();
      Actions.invokeAction("ChatTransferTask", payload);
    }
  });
}
