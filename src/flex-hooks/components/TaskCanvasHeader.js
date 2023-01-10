import { TaskHelper } from "@twilio/flex-ui";
import ChatTransferButton from "../../custom-components/ChatTransferButton/ChatTransferButton";

export function addChatTransferButton(flex) {
  flex.TaskCanvasHeader.Content.add(
    <ChatTransferButton key="conversation-transfer-button" />,
    {
      sortOrder: 1,
      if: ({ task }) =>
        TaskHelper.isCBMTask(task) && task.taskStatus === "assigned",
    }
  );
}
