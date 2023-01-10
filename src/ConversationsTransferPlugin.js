import { FlexPlugin } from "@twilio/flex-plugin";
import { addChatTransferButton } from "./flex-hooks/components/TaskCanvasHeader";
import { handleChatTransferShowDirectory } from "./flex-hooks/actions/ShowDirectory";
import { handleChatTransfer } from "./flex-hooks/actions/TransferTask";
import { registerCustomChatTransferAction } from "./custom-actions/chatTransferTask";

const PLUGIN_NAME = "ConversationsTransferPlugin";

export default class ConversationsTransferPlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   */
  async init(flex, manager) {
    addChatTransferButton(flex);
    handleChatTransferShowDirectory(manager);
    handleChatTransfer();
    registerCustomChatTransferAction();
  }
}
