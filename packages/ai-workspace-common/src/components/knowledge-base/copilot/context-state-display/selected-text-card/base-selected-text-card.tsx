import { useBuildThreadAndRun } from '@refly-packages/ai-workspace-common/hooks/use-build-thread-and-run';
import { useCopilotContextState } from '@refly-packages/ai-workspace-common/hooks/use-copilot-context-state';
import { useKnowledgeBaseStore } from '@refly-packages/ai-workspace-common/stores/knowledge-base';
import { SearchTarget, useSearchStateStore } from '@refly-packages/ai-workspace-common/stores/search-state';
import { getQuickActionPrompt } from '@refly-packages/ai-workspace-common/utils/quickActionPrompt';
import { Button, Select, Switch, Tag, Tooltip } from '@arco-design/web-react';
import {
  IconCloseCircle,
  IconFile,
  IconFolder,
  IconFontColors,
  IconHighlight,
  IconLink,
  IconRefresh,
} from '@arco-design/web-react/icon';
import { useGetSkills } from '@refly-packages/ai-workspace-common/skills/main-logic/use-get-skills';
import { useDispatchAction } from '@refly-packages/ai-workspace-common/skills/main-logic/use-dispatch-action';
import { ContentSelectorBtn } from '@refly-packages/ai-workspace-common/modules/content-selector/components/content-selector-btn';
import { useContentSelectorStore } from '@refly-packages/ai-workspace-common/modules/content-selector/stores/content-selector';
import { useSelectedMark } from '@refly-packages/ai-workspace-common/modules/content-selector/hooks/use-selected-mark';
import { useTranslation } from 'react-i18next';
import {
  useContextPanelStore,
  selectedTextCardDomainWeb,
  selectedTextCardDomainExtension,
} from '@refly-packages/ai-workspace-common/stores/context-panel';
import { LOCALE, Mark, SelectedTextCardDomain } from '@refly/common-types';
import { getRuntime } from '@refly-packages/ai-workspace-common/utils/env';
import { PiNotepad, PiNotebookDuotone } from 'react-icons/pi';
import { useGetCurrentSelectedMark } from '@refly-packages/ai-workspace-common/components/knowledge-base/copilot/context-panel/hooks/use-get-current-selected-text';

interface BaseSelectedTextCardProps {
  title: string;
  skillContent: React.ReactNode;
}

const { Option } = Select;

const getIcon = (mark: Mark) => {
  if (mark.namespace === 'noteCursor') {
    return <IconFontColors />;
  }

  if (mark.namespace === 'note') {
    return <PiNotebookDuotone />;
  }

  if (mark.namespace === 'resource') {
    return <IconFile />;
  }

  if (mark.namespace === 'extension-weblink') {
    return <IconLink />;
  }
};

export const BaseSelectedTextCard = (props: BaseSelectedTextCardProps) => {
  const { title, skillContent } = props;
  const { t, i18n } = useTranslation();
  const contextPanelStore = useContextPanelStore((state) => ({
    enableMultiSelect: state.enableMultiSelect,
    currentSelectedMarks: state.currentSelectedMarks,
    currentSelectedMark: state.currentSelectedMark,
    resetSelectedTextCardState: state.resetSelectedTextCardState,
    updateCurrentSelectedMark: state.updateCurrentSelectedMark,
    setSelectedTextCardDomain: state.setSelectedTextCardDomain,
    selectedTextCardDomain: state.selectedTextCardDomain,
    updateEnableMultiSelect: state.updateEnableMultiSelect,
    updateCurrentSelectedMarks: state.updateCurrentSelectedMarks,
    setShowContextCard: state.setShowContextCard,
    beforeSelectionNoteContent: state.beforeSelectionNoteContent,
    afterSelectionNoteContent: state.afterSelectionNoteContent,
    currentSelectionContent: state.currentSelectionContent,
  }));
  const { enableMultiSelect, currentSelectedMark } = contextPanelStore;
  const { handleReset } = useSelectedMark();
  const { finalUsedMarks } = useGetCurrentSelectedMark();

  const locale = i18n?.language || LOCALE.EN;
  const runtime = getRuntime();
  const isWeb = runtime === 'web';

  console.log('currentSelectedMarks', finalUsedMarks, contextPanelStore);

  return (
    <div className="context-state-card context-state-current-page">
      <div className="context-state-card-header">
        <div className="context-state-card-header-left">
          <Tooltip content={t('copilot.selectedTextCard.title')}>
            <Select
              bordered={false}
              mode="multiple"
              maxTagCount={1}
              className="context-state-card-selector"
              value={contextPanelStore.selectedTextCardDomain}
              onChange={(val) => {
                contextPanelStore.setSelectedTextCardDomain(val);
              }}
              autoWidth={{ minWidth: 180, maxWidth: 200 }}
            >
              {(isWeb ? selectedTextCardDomainWeb : selectedTextCardDomainExtension).map((item, index) => (
                <Option key={item?.key} value={item?.key}>
                  <span style={{ fontSize: 12 }}>{item?.labelDict[locale]}</span>
                </Option>
              ))}
            </Select>
          </Tooltip>
        </div>
        <div className="context-state-card-header-right">
          <Button
            type="text"
            className="assist-action-item"
            style={{ marginRight: 4 }}
            icon={
              <IconRefresh
                onClick={() => {
                  contextPanelStore.resetSelectedTextCardState();
                  handleReset();
                }}
              />
            }
          ></Button>
          <ContentSelectorBtn />
          {/* <Tooltip content="多选">
            <Switch
              type="round"
              size="small"
              checked={enableMultiSelect}
              style={{ marginRight: 4 }}
              onChange={(value) => {
                contextPanelStore.updateEnableMultiSelect(value);
                if (currentSelectedMarks?.length === 0) {
                  contextPanelStore.updateCurrentSelectedMarks(currentSelectedMark ? [currentSelectedMark] : []);
                }
              }}
            />
          </Tooltip> */}
          <Button
            type="text"
            className="assist-action-item"
            icon={
              <IconCloseCircle
                onClick={() => {
                  contextPanelStore.setShowContextCard(false);
                }}
              />
            }
          ></Button>
        </div>
      </div>
      <div className="context-state-card-body">
        {enableMultiSelect ? (
          finalUsedMarks.map((item, index) => (
            <div className="context-state-resource-item" key={index}>
              <Tag icon={getIcon(item)} bordered className="context-state-resource-item-tag">
                {item?.data}
              </Tag>
            </div>
          ))
        ) : currentSelectedMark ? (
          <div className="context-state-resource-item">
            <Tag icon={getIcon(currentSelectedMark)} bordered className="context-state-resource-item-tag">
              {currentSelectedMark?.data}
            </Tag>
          </div>
        ) : null}
        {(enableMultiSelect && finalUsedMarks.length === 0) || (!enableMultiSelect && !currentSelectedMark) ? (
          <div className="context-state-resource-item">
            <span className="text-gray-500" style={{ fontSize: 12 }}>
              {t('copilot.selectedTextCard.placeholder')}
            </span>
          </div>
        ) : null}
      </div>
      <div className="context-state-card-footer">{skillContent}</div>
    </div>
  );
};
