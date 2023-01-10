import { Actions, TaskHelper } from "@twilio/flex-ui";

export function handleChatTransferShowDirectory(manager) {
  Actions.addListener("beforeShowDirectory", (payload, abortFunction) => {
    let display = "flex";
    const taskSid = manager.store.getState().flex.view.selectedTaskSid;

    if (!taskSid) return;

    // Hide consult transfer for CBM tasks only
    if (TaskHelper.isCBMTask(TaskHelper.getTaskByTaskSid(taskSid))) {
      display = "none";
    }

    manager.updateConfig({
      theme: {
        componentThemeOverrides: {
          WorkerDirectory: {
            Container: {
              ".Twilio-WorkerDirectory-ButtonContainer": {
                "&>:nth-child(1)": {
                  display,
                },
              },
            },
          },
        },
      },
    });
  });
}
