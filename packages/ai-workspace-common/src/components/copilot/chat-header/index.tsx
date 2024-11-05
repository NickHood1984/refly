import { Button, Checkbox, Tooltip } from 'antd';

import { IconClose, IconEdit, IconFile, IconHistory, IconPlus } from '@arco-design/web-react/icon';
import { useSearchParams } from '@refly-packages/ai-workspace-common/utils/router';

// state
import { useChatStore, useChatStoreShallow } from '@refly-packages/ai-workspace-common/stores/chat';
import { useConversationStoreShallow } from '@refly-packages/ai-workspace-common/stores/conversation';
import { useKnowledgeBaseStoreShallow } from '../../../stores/knowledge-base';
// utils
import { useMessageStateStoreShallow } from '@refly-packages/ai-workspace-common/stores/message-state';
import classNames from 'classnames';

import { getRuntime } from '@refly-packages/ai-workspace-common/utils/env';

import { useCopilotStore, useCopilotStoreShallow } from '@refly-packages/ai-workspace-common/stores/copilot';
import { getClientOrigin } from '@refly-packages/utils/url';

import Logo from '@/assets/logo.svg';

// styles
import './index.scss';
import { useTranslation } from 'react-i18next';
import { getPopupContainer } from '@refly-packages/ai-workspace-common/utils/ui';
import { MessageIntentSource } from '@refly-packages/ai-workspace-common/types/copilot';
import { useJumpNewPath } from '@refly-packages/ai-workspace-common/hooks/use-jump-new-path';
import { useProjectContext } from '@refly-packages/ai-workspace-common/components/project-detail/context-provider';
import { useProjectStoreShallow } from '@refly-packages/ai-workspace-common/stores/project';
import { IconProject } from '@refly-packages/ai-workspace-common/components/common/icon';

interface CopilotChatHeaderProps {
  source: MessageIntentSource;
  disable?: boolean;
}

export const CopilotChatHeader = (props: CopilotChatHeaderProps) => {
  const { disable, source } = props;
  const { jumpToConv } = useJumpNewPath();

  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  // 所属的环境
  const runtime = getRuntime();
  const isWeb = runtime === 'web';

  const copilotStore = useCopilotStoreShallow((state) => ({
    setIsCopilotOpen: state.setIsCopilotOpen,
  }));

  const knowledgeBaseStore = useKnowledgeBaseStoreShallow((state) => ({
    updateConvModalVisible: state.updateConvModalVisible,
  }));
  const conversationStore = useConversationStoreShallow((state) => ({
    currentConversation: state.currentConversation,
    resetState: state.resetState,
    setCurrentConversation: state.setCurrentConversation,
  }));
  const messageStateStore = useMessageStateStoreShallow((state) => ({
    pending: state.pending,
    pendingFirstToken: state.pendingFirstToken,
    resetState: state.resetState,
  }));
  const chatStore = useChatStoreShallow((state) => ({
    messages: state.messages,
    resetState: state.resetState,
    setMessages: state.setMessages,
    setInvokeParams: state.setInvokeParams,
  }));
  const projectStore = useProjectStoreShallow((state) => ({
    project: state.project,
  }));

  const handleNewTempConv = () => {
    conversationStore.resetState();
    chatStore.resetState();
    messageStateStore.resetState();

    if ([MessageIntentSource.ConversationList, MessageIntentSource.ConversationDetail].includes(source)) {
      jumpToConv({
        convId: 'new',
        state: {
          navigationContext: {
            shouldFetchDetail: false,
            source,
          },
        },
      });
    } else {
      searchParams.delete('convId');
      setSearchParams(searchParams);
    }
  };

  const handleNewOpenConvList = () => {
    knowledgeBaseStore.updateConvModalVisible(true);
  };

  return (
    <div className="knowledge-base-detail-header">
      {!disable && (
        <>
          <div className="knowledge-base-detail-navigation-bar">
            {isWeb ? (
              <div className="text-gray-500 font-normal flex items-center gap-2 ml-3 max-w-[300px]">
                <IconProject className="text-gray-500 h-4 w-4" />
                <div className="truncate">{projectStore.project.data?.title}</div>
              </div>
            ) : null}
            {!isWeb ? (
              <div
                className="chat-header__brand"
                onClick={() => {
                  window.open(`${getClientOrigin()}/`, '_blank');
                }}
              >
                <>
                  <img src={Logo} alt="Refly" />
                  <span>Refly</span>
                </>
              </div>
            ) : null}
          </div>
          <div className="knowledge-base-detail-navigation-bar">
            <Tooltip
              key="threadHistory"
              title={t('knowledgeBase.header.openThreadHistory')}
              getPopupContainer={getPopupContainer}
            >
              <Button
                icon={<IconHistory className="text-green-600" />}
                type="text"
                onClick={() => {
                  handleNewOpenConvList();
                }}
              ></Button>
            </Tooltip>
            <Tooltip key="newThread" title={t('knowledgeBase.header.newThread')} getPopupContainer={getPopupContainer}>
              <Button
                icon={<IconPlus className="text-green-600" />}
                type="text"
                onClick={() => {
                  handleNewTempConv();
                }}
                className="mr-1"
              ></Button>
            </Tooltip>
            {runtime === 'extension-csui' ? (
              <Button
                icon={<IconClose />}
                type="text"
                onClick={(_) => {
                  if (runtime === 'extension-csui') {
                    copilotStore.setIsCopilotOpen(false);
                  }
                }}
                className="mr-1"
              ></Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
