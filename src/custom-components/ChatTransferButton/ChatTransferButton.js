import { IconButton, Actions, styled } from "@twilio/flex-ui";

const IconContainer = styled.div`
  margin: auto;
  padding-right: 0.8em;
`;

const ChatTransferButton = ({ task }) => {
  const onShowDirectory = () => {
    Actions.invokeAction("ShowDirectory");
  };

  return (
    <IconContainer>
      <IconButton
        icon="TransferLarge"
        key="worker-directory-open"
        onClick={onShowDirectory}
        variant="secondary"
        title="Transfer Chat"
      />
    </IconContainer>
  );
};

export default ChatTransferButton;
